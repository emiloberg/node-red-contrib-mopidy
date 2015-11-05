import servers from './lib/models/servers';
import {validateHostPort} from './lib/utils/utils';
var objectPath = require('object-path');
require('string.prototype.startswith');

module.exports = function(RED) {
    'use strict';
    function mopidyInNode(n) {

        this.RED = RED;
        this.servers = servers;
		this.objectPath = objectPath;

        this.RED.nodes.createNode(this,n);
        this.name = n.name;
        this.server = n.server;
        this.messageType = n.messagetype;
        this.serverNode = this.RED.nodes.getNode(n.server);
		this.mopidyServer = {
			readyState: false
		};

		if (!this.serverNode) {
			return;
		}

		if (!validateHostPort({ host: this.serverNode.host, port: this.serverNode.port })) {
			return;
		}

		this.mopidyServer = this.servers.add({
			host: this.serverNode.host,
			port: this.serverNode.port
		});

		this.getEvent = (fullEventName, eventData = {}) => {
			if(fullEventName.startsWith(this.messageType) || this.messageType === 'all') {
				eventData.event = fullEventName;
				this.send({
					payload: eventData,
					serverName: this.serverNode.name,
					host: this.serverNode.host,
					port: this.serverNode.port
				});
			}
		};
		this.mopidyServer.mopidy.on(this.getEvent);

		this.updateStatus = () => {
			if (this.objectPath.get(this, 'mopidyServer.readyState', false) === true) {
				this.status({ fill: 'green', shape: 'dot', text: 'connected' });
			} else {
				this.status({ fill: 'grey', shape: 'dot', text: 'not connected' });
			}
		};
		this.mopidyServer.events.on('ready:ready', this.updateStatus);
		this.mopidyServer.mopidy.on('websocket:error', this.updateStatus);
		this.updateStatus();
    }
    RED.nodes.registerType('mopidy-in', mopidyInNode);
};
