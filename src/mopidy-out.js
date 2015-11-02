import servers from './lib/models/servers';
import config from './lib/utils/config';
var objectAssign = require('object-assign');
var objectPath = require('object-path');
import {isURL, isInt, isLength} from 'validator';
import events from './lib/utils/events';

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

        if (this.serverNode) {
            this.mopidyServer = this.servers.add({
                host: this.serverNode.host,
                port: this.serverNode.port
            });
        }

        this.on('close', () => {
            this.servers.remove({ id: this.mopidyServer.id });
        });

		// TODO: Figure out why Node-RED says "Missing node modules: node-red-contrib-advanced-mopidy"

		// TODO: Remove Listener before adding it to avoild memory leak.
		events.ee.on('serverStatusChanged', () => { this.updateStatus(); });
		this.updateStatus = () => {
			if (objectPath.get(this, 'mopidyServer.readyState', false) === true) {
					this.status({ fill: 'green', shape: 'dot', text: 'connected' });
				} else {
					this.status({ fill: 'grey', shape: 'dot', text: 'not connected' });
				}
		};
		this.updateStatus();

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
            if (this.serverNode) {
                host = this.mopidyServer.host;
                port = this.mopidyServer.port;
            }
			// TODO: If an incoming message has host/port, then pass it on to the positive outgoing message so that nodes can be chained.
            if (incomingMsg.hasOwnProperty('host')) { host = incomingMsg.host; }
            if (incomingMsg.hasOwnProperty('port')) { port = incomingMsg.port; }

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
                        .then((ret) => { this.send({mopidy: ret}); })
                        .catch((err) => { this.send({error: {message: err}}); });
                }
            }

            // No server conneciton exists
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
                        .then((ret) => { this.send({mopidy: ret}); })
                        .catch((err) => { this.send({error: {message: err}}); })
                        .then(() => { this.servers.remove({ id: curServer.id }) });
                };

                setTimeout(() => {
                    if (isCalled === false) {
                        curServer.events.removeListener('ready:ready', listener);
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
