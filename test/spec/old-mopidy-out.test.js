
const chai = require('chai');
//const should = chai.should();
chai.should();
chai.use(require('chai-things'));
var http = require('http');
var request = require('superagent');
var path = require('path');
var express = require('express');
var RED = require('node-red');

xdescribe('[MopidyConnected] mopidy-out', () =>{

	describe('routes', () =>{

		var server;

		before(function(done) {

			this.timeout((5*1000));

			var app = express();
			app.use('/', express.static('public'));
			server = http.createServer(app);
			var settings = {
				httpAdminRoot:'',
				httpNodeRoot: '',
				userDir: path.join(path.resolve(__dirname), '_resources', 'node-red-user-dir'),
				nodesDir: path.resolve(__dirname, '../'),
				flowFile: path.join(path.resolve(__dirname), '_resources') + path.sep + 'mopidy-out-flows.json',
				functionGlobalContext: {},
				verbose: false,
				logging: {
					console: {
						level: 'fatal'
					}
				}
			};

			RED.init(server, settings);
			app.use(settings.httpAdminRoot, RED.httpAdmin);
			app.use(settings.httpNodeRoot, RED.httpNode);
			server.listen(8001);
			RED.start();

			setTimeout(() => { // Allow some time for Node-RED to spin up
				done();
			}, 1000);

		});

		after(() => {
			server.close();
		});

		describe('When GET mopidy/{node-id}/methods', () =>{

			var methods;
			var statusCode;
			before(function(done) {
				request
					.get('http://local.dev:8001/mopidy/e3962905.1c69d8/methods')
					.end(function(err, res){
						methods = res.body;
						statusCode = res.statusCode;
						done(err);
					});
			});

			it('should get methods', () => {
				statusCode.should.eql(200);
				methods.should.be.an('array');
				methods.should.have.length.above(50);
				methods.should.all.have.property('method');
				methods.should.all.have.property('category');
				methods.should.all.have.property('description');
				methods.should.all.have.property('params');
			});

		});


		describe('When GET mopidy/{non-existing-node-id}/methods', () =>{

			var methods;
			var statusCode;
			before(function(done) {
				request
					.get('http://local.dev:8001/mopidy/does-not-exist/methods')
					.end((err, res) =>{
						methods = res.body;
						statusCode = res.statusCode;
						done();
					});
			});

			it('should get error', () => {
				statusCode.should.eql(404);
				methods.should.have.property('message', 'Could not connect to Mopidy. If new connection - deploy configuration before continuing');
			});

		});


	});

});


