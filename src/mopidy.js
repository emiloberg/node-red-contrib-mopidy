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





module.exports = function(RED) {
    "use strict";
    function mopidyOutNode(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
    }
    RED.nodes.registerType("mopidy-out", mopidyOutNode);


	function mopidyServerNode(n) {
		RED.nodes.createNode(this,n);
		this.host = n.host;
		this.port = n.port;
	}
	RED.nodes.registerType("mopidy-server", mopidyServerNode);
};
