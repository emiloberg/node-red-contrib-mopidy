import servers from './lib/models/servers';
import config from './lib/utils/config';
var objectAssign = require('object-assign');
var objectPath = require('object-path');
import {isURL, isInt, isLength} from 'validator';

// TODO: Figure out why Node-RED says "Missing node modules: node-red-contrib-advanced-mopidy"

module.exports = function(RED) {
    'use strict';
    function mopidyOutNode(n) {

        this.RED = RED;
        this.servers = servers;

        this.RED.nodes.createNode(this,n);
        this.name = n.name;
        this.server = n.server;
        this.serverNode = this.RED.nodes.getNode(n.server);
        this.params = n.params;
        this.method = n.method;
        this.mopidyServer = {
            readyState: false
        };

        config.setup({ settings: objectPath.get(RED, 'settings.functionGlobalContext') });

        this.updateStatus = () => {
            if (objectPath.get(this, 'mopidyServer.readyState', false) === true) {
                this.status({ fill: 'green', shape: 'dot', text: 'connected' });
            } else {
                this.status({ fill: 'grey', shape: 'dot', text: 'not connected' });
            }
        };

        if (this.serverNode) {
            this.mopidyServer = this.servers.add({
                host: this.serverNode.host,
                port: this.serverNode.port,
                name: this.serverNode.name
            });

            this.mopidyServer.events.on('ready:ready', this.updateStatus);
            this.mopidyServer.mopidy.on('websocket:error', this.updateStatus);
        }

        this.updateStatus();

        this.on('close', () => {
            // TODO: Change this so that it only removes it if it's the only node using the server
            this.servers.remove({ id: this.mopidyServer.id });
        });


        this.invokeMethod = (incomingMsg = {}) => {
            if (typeof incomingMsg !== 'object') {
                this.send({ error: { message: "If you send data to a Mopidy node, that data must an 'object'" } });
                return;
            }
            if (incomingMsg.hasOwnProperty('error')) {
                this.send({ error: { message: "Stopped. Incoming data has the property 'error'" } });
                return;
            }
            if (incomingMsg.hasOwnProperty('method')) {
                if (typeof incomingMsg.method !== 'string') {
                    this.send({ error: { message: "'method' must be a 'string'" } });
                    return;
                }
            }
            if (incomingMsg.hasOwnProperty('params')) {
                if (typeof incomingMsg.params !== 'object') {
                    this.send({ error: { message: "'params' must be an 'object'" } });
                    return;
                }
            }

            // Method and Params
            let method = incomingMsg.method || this.method;
            let params = this.params || '{}';
            params = JSON.parse(params);
            let incomingParams = incomingMsg.params || {};
            objectAssign(params, incomingParams);

            // Host and Port
            let host = '';
            let port = '';
            let serverName = 'temporaryServerConnection';
            if (this.serverNode) {
                host = this.mopidyServer.host;
                port = this.mopidyServer.port;
                serverName = this.mopidyServer.name;
            }

            const carryOnHostPort = {
                serverName
            };
            if (incomingMsg.hasOwnProperty('host')) {
                host = incomingMsg.host;
                carryOnHostPort.host = incomingMsg.host;
            }
            if (incomingMsg.hasOwnProperty('port')) {
                port = incomingMsg.port;
                carryOnHostPort.port = incomingMsg.port;
            }

            if(!isURL(host, { require_tld: false, require_valid_protocol: false })) {
                this.send({ error: { message: `'${host}' is not a host` } });
                return;
            }
            if(!isInt(port, { min: 1, max: 65535 })) {
                this.send({ error: { message: `'${port}' is not a valid port number` } });
                return;
            }
            if(!isLength(method, 1, 100)) {
                this.send({ error: { message: "No 'method' is supplied" } });
                return;
            }

            const curServerId = this.servers.getId({ host, port });
            let openNewServerConnection = true;

            // Server connection already exist
            if (curServerId) {
                const curServer = this.servers.get({ id: curServerId });
                // If server doesn't have a good readyState, then we continue and try to spawn a new server instead
                if (curServer.readyState === true) {
                    openNewServerConnection = false;
                    curServer.invokeMethod({method, params})
                        .then((ret) => { this.send(objectAssign({payload: ret}, carryOnHostPort)); })
                        .catch((err) => { this.send({error: {message: err}}); });
                }
            }

            // No server connection exists
            if (openNewServerConnection) {
                const curServer = this.servers.add({
                    host,
                    port,
                    addWithUniqueId: true
                });

                let isCalled = false;
                const listener = () => {
                    isCalled = true;
                    curServer.invokeMethod({method, params})
                        .then((ret) => { this.send(objectAssign({payload: ret}, carryOnHostPort)); })
                        .catch((err) => { this.send({error: {message: err}}); })
                        .then(() => { this.servers.remove({ id: curServer.id }) });
                };

                setTimeout(() => {
                    if (isCalled === false) {
                        curServer.events.removeListener('ready:ready', listener);
                        // Todo: attach host/port/name to error message for easier debugging.
                        this.send({ error: { message: `Could not connect to server within ${config.fetch('mopidyConnectTimeout')} seconds` }});
                        this.servers.remove({ id: curServer.id });
                    }
                }, (config.fetch('mopidyConnectTimeout') * 1000));

                curServer.events.once('ready:ready', listener);
            }
        };


        this.on('input', (incomingMsg) => {
            this.invokeMethod(incomingMsg);
        });

        this.routeMethods = (req, res) => {
            let tempServerNode = this.RED.nodes.getNode(req.params.nodeId);

            if (tempServerNode === undefined) {
                res.status(404).json({
                    message: 'Could not connect to Mopidy. If new connection - press deploy before continuing'
                });
                return;
            }

            let mopidyServer = this.servers.add({
                host: tempServerNode.host,
                port: tempServerNode.port,
                addWithUniqueId: true
            });

            mopidyServer.getMethods()
                .then(methods => {
                    res.status(200).json(methods);
                })
                .catch(err => {
                    res.status(500).json({
                        message: err.message
                    });
                })
                .then(() => {
                    this.servers.remove({ id: mopidyServer.id })
                });
        };

        this.RED.httpAdmin.get('/mopidy/:nodeId/methods', (req, res) => {
            this.routeMethods(req, res);
        });
    }
    RED.nodes.registerType('mopidy-out', mopidyOutNode);
};
