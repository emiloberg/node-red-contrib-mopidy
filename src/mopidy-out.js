import servers from './lib/models/servers';
import config from './lib/utils/config';
import {isLength} from 'validator';
import {validateHostPort} from './lib/utils/utils';

var objectAssign = require('object-assign');
var objectPath = require('object-path');

// TODO: Change all send.error to plain strings as they will not continue the flow anyways
// TODO: Remove the check for error property as it's not needed now when we're sending this.error (which will stop the flow from continuing). Also change README.
// TODO: Update locales for the GUI/HTML files. Also see https://github.com/node-red/node-red/wiki/Design%3A-i18n
// TODO: Add GUI help (right bar in editor)

module.exports = function(RED) {
    'use strict';
    function mopidyOutNode(n) {

        this.RED = RED;
        this.servers = servers;
        this.objectPath = objectPath;

        this.RED.nodes.createNode(this,n);
        this.name = n.name;
        this.server = n.server;
        this.serverNode = this.RED.nodes.getNode(n.server);
        this.params = n.params;
        this.method = n.method;
        this.mopidyServer = {
            readyState: false
        };

        config.setup({ settings: this.objectPath.get(RED, 'settings.functionGlobalContext') });

        this.updateStatus = () => {
            if (this.objectPath.get(this, 'mopidyServer.readyState', false) === true) {
                this.status({ fill: 'green', shape: 'dot', text: this.RED._('mopidy-out.status.connected') });
            } else {
                this.status({ fill: 'grey', shape: 'dot', text: this.RED._('mopidy-out.status.not-connected') });
            }
        };

        if (this.serverNode) {
            if (validateHostPort({ host: this.serverNode.host, port: this.serverNode.port })) {
                this.mopidyServer = this.servers.add({
                    host: this.serverNode.host,
                    port: this.serverNode.port,
                    name: this.serverNode.name
                });
                this.mopidyServer.events.on('ready:ready', this.updateStatus);
                this.mopidyServer.mopidy.on('websocket:error', this.updateStatus);
            }
        }

        this.updateStatus();

        this.on('close', () => {
            this.servers.remove({ id: this.mopidyServer.id });
        });


        this.invokeMethod = (incomingMsg = {}) => {
            if (typeof incomingMsg !== 'object') {
                this.error(this.RED._('mopidy-out.validation.data-must-be-object'));
                return;
            }
            if (incomingMsg.hasOwnProperty('error')) {
                this.error(this.RED._('mopidy-out.validation.incoming-data-has-error-property'));
                return;
            }
            if (incomingMsg.hasOwnProperty('method')) {
                if (typeof incomingMsg.method !== 'string') {
                    this.error(this.RED._('mopidy-out.validation.method-must-be-string'));
                    return;
                }
            }
            if (incomingMsg.hasOwnProperty('params')) {
                if (typeof incomingMsg.params !== 'object') {
                    this.error(this.RED._('mopidy-out.validation.params-must-be-object'));
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

            if (!validateHostPort({ host, port })) {
                this.error(this.RED._('mopidy-out.validation.no-valid-host-port'));
                return;
            }

            if(!isLength(method, 1, 100)) {
                this.error(this.RED._('mopidy-out.validation.no-method'));
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
                        .catch((err) => { this.error(this.RED._(err.msg, err.params)); });
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
						.catch(() => { this.error(this.RED._('mopidy-out.errors.method-does-not-exist', { method }) ); })
                        .then(() => { this.servers.remove({ id: curServer.id }) });
                };

                setTimeout(() => {
                    if (isCalled === false) {
                        curServer.events.removeListener('ready:ready', listener);
                        this.error(this.RED._('mopidy-out.errors.could-not-connect-to-server-within-time', { seconds: config.fetch('mopidyConnectTimeout') }) );
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
                    // TODO, Catch this 404 and display a friendly "Please deploy before configuring this node."
                    message: this.RED._('mopidy-out.errors.route-methods-undefined-server')
                });
                return;
            }

            if (!validateHostPort({ host: tempServerNode.host, port: tempServerNode.port })) {
                res.status(500).json({ message: this.RED._('mopidy-out.validation.no-valid-host-port') });
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
                        message: this.RED._(err.msg)
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
