module.exports = function(RED) {
    'use strict';


	function mopidyServerNode(n) {
		RED.nodes.createNode(this,n);
		this.host = n.host;
		this.port = n.port;
	}
	RED.nodes.registerType('mopidy-config', mopidyServerNode);
};
