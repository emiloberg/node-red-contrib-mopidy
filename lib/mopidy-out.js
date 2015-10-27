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


var objectAssign = require('object-assign');

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

        this.on('close', () => {
            servers.remove({ id: this.mopidyServer.id });
        });

        // TODO: Make sure an output node only can have 1 running server at any given moment

        // TODO: Change this so that it shows connected/non-connected based on events
        //setInterval(() => {
        //    if('mopidyServer' in this) {
        //        if (this.mopidyServer.readyState) {
        //            this.status({fill: 'green', shape: 'ring', text: 'connected to ' + this.mopidyServer.name });
        //        } else {
        //            this.status({fill: 'red', shape: 'ring', text: 'not connected'});
        //        }
        //    } else {
        //        this.status({fill: 'red', shape: 'ring', text: 'not connected'});
        //    }
        //}, 1000);

        this.invokeMethod = (incomingMsg = {}) => {
            // todo guard against calling without connected mopidy

            // todo merge with incoming msg
            let method = incomingMsg.method || this.method;
            let params = this.params || '{}';
            params = JSON.parse(params);
            let incomingParams = incomingMsg.params || {};

            // todo: check that incomingMsg is an object. Test.

            objectAssign(params, incomingParams);

            //Todo: check that method exists. Add tests for it.

            this.mopidyServer.invokeMethod({ method, params})
                .then((ret) => {
                    this.send({ status: 1, mopidy: ret });
                })
                .catch((err) => {
                    this.send({ status: 0, err: err });
                    // todo, add error logging
                });
        };

        this.on('input', (incomingMsg) => {
            this.invokeMethod(incomingMsg);
        });

        this.routeMethods = (req, res) => {
            // todo, add https://www.npmjs.com/package/connect-timeout
            //console.log('1');


            //console.log('req.params.nodeId', req.params.nodeId);

            let tempServerNode = RED.nodes.getNode(req.params.nodeId);
            //console.log('tempServerNode', tempServerNode);
            if (tempServerNode === undefined) {
                //console.log('2');
                res.status(404).json({
                    message: 'Could not connect to Mopidy. If new connection - deploy configuration before continuing'
                });
                return;
            }
            //console.log('3');
            let mopidyServer = servers.add({
                name: tempServerNode.name,
                host: tempServerNode.host,
                port: tempServerNode.port,
                addWithUniqueId: true
            });
            //console.log('4');
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
                    servers.remove({ id: mopidyServer.id })
                });
        };

        RED.httpAdmin.get('/mopidy/:nodeId/methods', (req, res) => {
            this.routeMethods(req, res);
        });
    }
    RED.nodes.registerType('mopidy-out', mopidyOutNode);
};
