//import api from './lib/api';
//
//var fs = require('fs');
//
//api.mopidy.on("state:online", function () {
//	api.initApi()
//	.then((msg) => {
//		// Set green okay color here
//	})
//	.catch((err) => {
//		// Set red not okay color, and log err msg
//	});
//});


//console.dir(api.getCategories());
// console.dir(api.getMethods());
//console.dir(api.getMethods({category: 'get_version'}));
//console.log(require('util').inspect(api.getMethods({category: 'tracklist', method: 'filter'}), { showHidden: true, depth: null, colors: true }));



import servers from './lib/models/servers';

module.exports = function(RED) {
    'use strict';
    function mopidyOutNode(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.server = n.server;
        this.serverNode = RED.nodes.getNode(n.server);
        this.params = n.params;
        this.method = n.method;

        //if (this.serverNode) {
        //    this.mopidyServer = servers.add({
        //        name: this.serverNode.name,
        //        host: this.serverNode.host,
        //        port: this.serverNode.port
        //    });
        //}

        //if (this.serverNode !== undefined) {
        //    console.log(this.serverNode.host);
        //}

        // todo, add https://www.npmjs.com/package/connect-timeout
        RED.httpAdmin.get('/mopidy/:nodeId/methods', (req, res) => {

            this.serverNode = RED.nodes.getNode(req.params.nodeId);

            if (this.serverNode === undefined) {
                res.status(404).json({
                    message: 'Could not find server node'
                });
                return;
            }

            let mopidyServer = servers.add({
                name: this.serverNode.name,
                host: this.serverNode.host,
                port: this.serverNode.port
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

        });


    }
    RED.nodes.registerType('mopidy-out', mopidyOutNode);
};
