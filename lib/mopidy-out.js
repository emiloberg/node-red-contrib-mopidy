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
        this.mopidyServer = {};

        if (this.serverNode) {
            this.mopidyServer = servers.add({
                name: this.serverNode.name,
                host: this.serverNode.host,
                port: this.serverNode.port
            });
        }

        // TODO: Make sure an output node only can have 1 running server at any given moment

        setInterval(() => {
            if (this.mopidyServer.readyState) {
                this.status({fill: 'green', shape: 'ring', text: 'connected'});
            } else {
                this.status({fill: 'red', shape: 'ring', text: 'not connected'});
            }
        }, 1000);


        this.on('input', (/* incomingMsg */) => {
            //console.log('INPUT!');
            //console.log(incomingMsg);
            //console.log();
            //console.log();
            // todo merge with incoming msg
            var method = this.method;
            var params = JSON.parse(this.params);

            this.mopidyServer.invokeMethod({ method, params})
                .then((ret) => {
                    this.send({ status: 1, mopidy: ret });
                })
                .catch((err) => {
                    this.send({ err: err });
                    // todo, add error logging
                });

            //todo guard against calling without connected mopidy

        });

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
