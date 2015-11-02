module.exports = function(RED) {
    'use strict';
    function mopidyInNode(n) {

        this.RED = RED;

        this.RED.nodes.createNode(this,n);
        this.name = n.name;
        this.server = n.server;
        this.serverNode = this.RED.nodes.getNode(n.server);
    }
    RED.nodes.registerType('mopidy-in', mopidyInNode);
};
