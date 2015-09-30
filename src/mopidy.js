/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import apiViewModel from './lib/apiViewModel';

var Mopidy = require("mopidy");

var fs = require('fs');

var mopidy = new Mopidy({
	webSocketUrl: "ws://pi-speaker-one.local:6680/mopidy/ws/",
	callingConvention: "by-position-or-by-name"
});

var api;


const redmopidy = {

} ;

mopidy.on("state:online", function () {

	console.log('IZ ONLINE');

	mopidy._send({method: "core.describe"})
		.then(function (data) {
			//fs.writeFile('mopidy.json', JSON.stringify(data), function (err) {
			//	if (err) throw err;
			//	console.log('It\'s saved!');
			//});

			apiViewModel.add(data);


			//console.dir(apiViewModel.getCategories());
			console.dir(apiViewModel.getMethods());
			//console.dir(apiViewModel.getMethods({category: 'get_version'}));
			//console.log(require('util').inspect(apiViewModel.getMethods({category: 'tracklist', method: 'filter'}), { showHidden: true, depth: null, colors: true }));



	});



});




module.exports = function(RED) {
    "use strict";

	let apa = 12;

    var spawn = require('child_process').spawn;
    var plat = require('os').platform();

    function PingNode(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
        var node = this;

		this.on("input", function (msg) {
			var host = msg.host || node.host;
			
			if(msg.hasOwnProperty('payload')) {
				msg._payload = msg.payload;
			}
			if(msg.hasOwnProperty('topic')) {
				msg._topic = msg.topic;
			}
			msg.payload = false;
			msg.topic = host;

			if (!host) {
				node.warn('No host is specificed. Either specify in node configuration or by passing in msg.host');
			}

			var ex;
			if (plat == "linux") { ex = spawn('ping', ['-n', '-w', '5', '-c', '1', host]); }
			else if (plat.match(/^win/)) { ex = spawn('ping', ['-n', '1', '-w', '5000', host]); }
			else if (plat == "darwin") { ex = spawn('ping', ['-n', '-t', '5', '-c', '1', host]); }
			else { node.error("Sorry - your platform - "+plat+" - is not recognised."); }
			var res = false;
			var line = "";
			//var regex = /from.*time.(.*)ms/;
			var regex = /=.*[<|=]([0-9]*).*TTL|ttl..*=([0-9\.]*)/;
			ex.stdout.on('data', function (data) {
				line += data.toString();
			});
			ex.stderr.on('data', function (data) {
				//console.log('[ping] stderr: ' + data);
			});
			ex.on('close', function (code) {
				var m = regex.exec(line)||"";
				if (m !== '') {
					if (m[1]) { res = Number(m[1]); }
					if (m[2]) { res = Number(m[2]); }
				}

				if (code === 0) {
					msg.payload = res;
				}
				
				node.send(msg);
			});

		});

    }
    RED.nodes.registerType("mopidy",PingNode);
}
