const chai = require('chai');
chai.should();
//const should = chai.should();
chai.use(require('chai-things'));

const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const Promise = require('promise');
//const rewire = require('rewire');

const helper = require('../helper.js');
//const proxyquire =  require('proxyquire');

const MOPIDY_OUT_NODE = require('../../src/mopidy-out.js');
const MOPIDY_CONFIG_NODE = require('../../src/mopidy-config.js');
const NODES = [MOPIDY_OUT_NODE, MOPIDY_CONFIG_NODE];


describe('mopidy-out', () => {

	before(function(done) {
		helper.startServer(done);
	});

	after(function(done) {
		helper.unload();
		helper.stopServer(done);
	});


	afterEach(function() {
		helper.unload();
	});

	describe('Given http call', () => {

		const FLOW = [
			{ host: 'localhost', id: 'mop-config', name: 'nonexist', port: '6680', type: 'mopidy-config' },
			{ id: 'mop-out', name: 'myname', server: 'mop-config', type: 'mopidy-out',
				'method': '',
				'params': '{}'
			}
		];

		it('should respond to http request on /mopidy/12345/methods', function (done) {
			helper.load(NODES, FLOW, function () {
				const currentNode      = helper.getNode('mop-out');
				const stubRouteMethods = sinon.stub(currentNode, 'routeMethods', function (req, res) {
					res.end();
				});

				helper.request()
					.get('/mopidy/12345/methods')
					.expect(200)
					.end(function (err) {
						stubRouteMethods.should.have.callCount(1);
						stubRouteMethods.restore();
						done(err)
					});
			});
		});

	});

	describe('Given node is loaded', () => {

		const FLOW = [
			{ host: 'localhost', id: 'mop-config', name: 'nonexist', port: '6680', type: 'mopidy-config' },
			{ id: 'mop-out', name: 'myname', server: 'mop-config', type: 'mopidy-out',
				'method': '',
				'params': '{}'
			}
		];

		it('should be registered', function(done) {
			helper.load(NODES, FLOW, function() {
				const currentNode = helper.getNode('mop-out');
				currentNode.should.have.property('name', 'myname');
				currentNode.should.have.property('type', 'mopidy-out');
				done();
			});
		});

		it('should be populated with data from config node', function(done) {
			helper.load(NODES, FLOW, function() {
				const currentNode = helper.getNode('mop-out');
				currentNode.should.have.deep.property('mopidyServer.host', 'localhost');
				currentNode.should.have.deep.property('mopidyServer.port', '6680');
				done();
			});
		});

		it('should listen to input', function(done) {
			helper.load(NODES, FLOW, function() {
				const currentNode = helper.getNode('mop-out');
				const stubInvokeMethod = sinon.stub(currentNode, 'invokeMethod', function() {});

				currentNode.emit('input', { something: 'else' });
				setTimeout(function() {
					stubInvokeMethod.should.have.callCount(1);
					stubInvokeMethod.should.have.been.calledWithExactly({ something: 'else' });
					done();
				}, 0);

				stubInvokeMethod.restore();
			});
		});

		it('should respond to http request for methods when server node is not available', function(done) {
			helper.load(NODES, FLOW, function() {
				const currentNode = helper.getNode('mop-out');
				const spyJson = sinon.spy();
				const stubGetNode = sinon.stub(currentNode.RED.nodes, 'getNode', function() { return undefined; });
				const mockaedReq = { params: { nodeId: '12345' } };
				const mockedRes = { status: function() { return { json: spyJson } } };
				const spyStatus = sinon.spy(mockedRes, 'status');

				currentNode.routeMethods(mockaedReq, mockedRes);

				stubGetNode.should.have.callCount(1);
				stubGetNode.should.have.been.calledWithExactly('12345');
				spyStatus.should.have.callCount(1);
				spyStatus.should.have.been.calledWithExactly(404);
				spyJson.should.have.callCount(1);
				spyJson.should.have.been.calledWithExactly({ message: 'Could not connect to Mopidy. If new connection - press deploy before continuing' });

				stubGetNode.restore();
				spyJson.reset();
				spyStatus.reset();

				done();
			});
		});

		it('should respond to http request for methods when server node is available', function(done) {
			helper.load(NODES, FLOW, function() {
				let currentNode = helper.getNode('mop-out');
				const spyJson = sinon.spy();
				const mockGetNode = function() { return { name: 'testServer1', host: '123.123.123.1', port: '11111' } };
				const stubGetNode = sinon.stub(currentNode.RED.nodes, 'getNode', mockGetNode);
				const mockedReq = { params: { nodeId: '12345' } };
				const mockedRes = { status: function() { return { json: spyJson } } };
				const spyStatus = sinon.spy(mockedRes, 'status');
				const spyRemove = sinon.spy();
				currentNode.servers = {
					add: function() {
						return {
							getMethods: function () {
								return new Promise.resolve(['a', 'list', 'of', 'methods']);
							},
							id: 'thisServerId'
						}
					},
					remove: spyRemove
				};

				currentNode.routeMethods(mockedReq, mockedRes);

				setTimeout(function() {
					stubGetNode.should.have.callCount(1);
					stubGetNode.should.have.been.calledWithExactly('12345');
					spyStatus.should.have.callCount(1);
					spyStatus.should.have.been.calledWithExactly(200);
					spyJson.should.have.callCount(1);
					spyJson.should.have.been.calledWithExactly(['a', 'list', 'of', 'methods']);
					spyRemove.should.have.callCount(1);
					spyRemove.should.have.been.calledWithExactly({ id: 'thisServerId' });

					stubGetNode.restore();
					spyJson.reset();
					spyStatus.reset();
					spyRemove.reset();

					done();
				}, 0);

			});
		});


		it('should respond to http request for methods when server node is available but gives error', function(done) {
			helper.load(NODES, FLOW, function() {
				let currentNode = helper.getNode('mop-out');
				const spyJson = sinon.spy();
				const mockGetNode = function() { return { name: 'testServer2', host: '123.123.123.2', port: '11112' } };
				const stubGetNode = sinon.stub(currentNode.RED.nodes, 'getNode', mockGetNode);
				const mockedReq = { params: { nodeId: '12345' } };
				const mockedRes = { status: function() { return { json: spyJson } } };
				const spyStatus = sinon.spy(mockedRes, 'status');
				const spyRemove = sinon.spy();
				currentNode.servers = {
					add: function() {
						return {
							getMethods: function () {
								return new Promise.reject({ message: 'Something went wrong' });
							},
							id: 'thisServerId2'
						}
					},
					remove: spyRemove
				};

				currentNode.routeMethods(mockedReq, mockedRes);

				setTimeout(function() {
					stubGetNode.should.have.callCount(1);
					stubGetNode.should.have.been.calledWithExactly('12345');
					spyStatus.should.have.callCount(1);
					spyStatus.should.have.been.calledWithExactly(500);
					spyJson.should.have.callCount(1);
					spyJson.should.have.been.calledWithExactly({ message: 'Something went wrong' });
					spyRemove.should.have.callCount(1);
					spyRemove.should.have.been.calledWithExactly({ id: 'thisServerId2' });

					stubGetNode.restore();

					done();
				}, 0);

			});
		});

	});

	describe('Given a mopidy-out node configured with method and params', () => {
		const FLOW = [
			{ host: 'localhost', id: 'mop-config', name: 'nonexist', port: '6680', type: 'mopidy-config' },
			{ id: 'mop-out', name: 'myname', server: 'mop-config', type: 'mopidy-out',
				'method': 'core.tracklist.shuffle',
				'params': '{"start":"","end":""}'
			}
		];

		it('should invoke the mopidy method when called', function(done) {
			helper.load(NODES, FLOW, function() {
				let currentNode = helper.getNode('mop-out');
				const stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.resolve('return value') });
				const spySend = sinon.spy(currentNode, 'send');
				const stubReadyState = sinon.stub(currentNode.mopidyServer, 'readyState', { get: function () { return true }});

				currentNode.invokeMethod();

				setTimeout(function(){
					stubInvokeMethod.should.have.been.calledWithExactly({ method: 'core.tracklist.shuffle', params: { end: '', start: '' } });
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ mopidy: 'return value' });

					spySend.reset();
					stubInvokeMethod.restore();
					stubReadyState.restore();
					done();
				}, 0);
			});
		});

		it('should invoke the mopidy method when called with a non-existing method, and return with error', function(done) {
			helper.load(NODES, FLOW, function() {
				let currentNode = helper.getNode('mop-out');
				const stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.reject('error value') });
				const spySend = sinon.spy(currentNode, 'send');
				const stubReadyState = sinon.stub(currentNode.mopidyServer, 'readyState', { get: function () { return true }});

				currentNode.invokeMethod();

				setTimeout(function(){
					stubInvokeMethod.should.have.been.calledWithExactly({ method: 'core.tracklist.shuffle', params: { end: '', start: '' } });
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ error: { message: 'error value' } });

					spySend.reset();
					stubInvokeMethod.restore();
					stubReadyState.restore();
					done();
				}, 0);
			});
		});

	});


	describe('Given a mopidy-out node configured with method', () => {
		const FLOW = [
			{ host: 'localhost', id: 'mop-config', name: 'nonexist', port: '6680', type: 'mopidy-config' },
			{ id: 'mop-out', name: 'myname', server: 'mop-config', type: 'mopidy-out',
				'method': 'core.tracklist.add',
				'params': ''
			}
		];

		it('should merge with params from message and invoke the mopidy method when called', function(done) {
			helper.load(NODES, FLOW, function() {
				let currentNode = helper.getNode('mop-out');
				const stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.resolve('return value') });
				const spySend = sinon.spy(currentNode, 'send');
				const stubReadyState = sinon.stub(currentNode.mopidyServer, 'readyState', { get: function () { return true }});

				currentNode.invokeMethod({ params: { uri: 'http://http-live.sr.se/p1-mp3-128' }});

				setTimeout(function(){
					stubInvokeMethod.should.have.callCount(1);
					stubInvokeMethod.should.have.been.calledWithExactly({ method: 'core.tracklist.add', params: { uri: 'http://http-live.sr.se/p1-mp3-128' } });
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ mopidy: 'return value' });

					spySend.reset();
					stubInvokeMethod.restore();
					stubReadyState.restore();
					done();
				}, 0);
			});
		});

	});


	describe('Given a mopidy-out node configured with params', () => {
		const FLOW = [
			{ host: 'localhost', id: 'mop-config', name: 'nonexist', port: '6680', type: 'mopidy-config' },
			{ id: 'mop-out', name: 'myname', server: 'mop-config', type: 'mopidy-out',
				'method': '',
				'params': '{"volume": 50}'
			}
		];

		it('should merge with method from message and invoke the mopidy method when called', function(done) {
			helper.load(NODES, FLOW, function() {
				let currentNode = helper.getNode('mop-out');
				const stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.resolve('return value') });
				const spySend = sinon.spy(currentNode, 'send');
				const stubReadyState = sinon.stub(currentNode.mopidyServer, 'readyState', { get: function () { return true }});

				currentNode.invokeMethod({ method: 'core.mixer.setVolume'});

				setTimeout(function(){
					stubInvokeMethod.should.have.been.calledWithExactly({ method: 'core.mixer.setVolume', params: { volume: 50 } });
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ mopidy: 'return value' });

					spySend.reset();
					stubInvokeMethod.restore();
					stubReadyState.restore();
					done();
				}, 0);
			});
		});

		it("should return an error if Mopidy isn't available", function(done) {
			helper.load(NODES, FLOW, function() {
				let currentNode = helper.getNode('mop-out');
				const stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.resolve('return value') });
				const spySend = sinon.spy(currentNode, 'send');
				const stubReadyState = sinon.stub(currentNode.mopidyServer, 'readyState', { get: function () { return false }});

				currentNode.invokeMethod({ method: 'core.mixer.setVolume'});

				setTimeout(function(){
					stubInvokeMethod.should.have.callCount(0);
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ error: { message: "The Mopidy Server isn't available" } });

					spySend.reset();
					stubInvokeMethod.restore();
					stubReadyState.restore();
					done();
				}, 0);
			});
		});

	});

	describe('Given a mopidy-out node not configured with method or params', () => {
		const FLOW = [
			{ host: 'localhost', id: 'mop-config', name: 'nonexist', port: '6680', type: 'mopidy-config' },
			{ id: 'mop-out', name: 'myname', server: 'mop-config', type: 'mopidy-out',
				'method': '',
				'params': ''
			}
		];

		it('should get method and params from message and invoke the mopidy method when called', function(done) {
			helper.load(NODES, FLOW, function() {
				let currentNode = helper.getNode('mop-out');
				const stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.resolve('return value') });
				const spySend = sinon.spy(currentNode, 'send');
				const stubReadyState = sinon.stub(currentNode.mopidyServer, 'readyState', { get: function () { return true }});

				currentNode.invokeMethod({ method: 'core.tracklist.slice', params: { start: 1, end: 2 }});

				setTimeout(function(){
					stubInvokeMethod.should.have.been.calledWithExactly({ method: 'core.tracklist.slice', params: { start: 1, end: 2 }});
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ mopidy: 'return value' });

					spySend.reset();
					stubInvokeMethod.restore();
					stubReadyState.restore();
					done();
				}, 0);
			});
		});

	});


	describe('Given a mopidy-out node configured with method or params and incoming message with method and params', () => {
		const FLOW = [
			{ host: 'localhost', id: 'mop-config', name: 'nonexist', port: '6680', type: 'mopidy-config' },
			{ id: 'mop-out', name: 'myname', server: 'mop-config', type: 'mopidy-out',
				'method': 'core.mixer.setMute',
				'params': '{"mute": true}'
			}
		];

		it('should use method and params from message and invoke the mopidy method when called', function(done) {
			helper.load(NODES, FLOW, function() {
				let currentNode = helper.getNode('mop-out');
				const stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.resolve('return value') });
				const spySend = sinon.spy(currentNode, 'send');
				const stubReadyState = sinon.stub(currentNode.mopidyServer, 'readyState', { get: function () { return true }});

				currentNode.invokeMethod({ method: 'core.playlist.save', params: { playlist: 'myplaylist' }});

				setTimeout(function(){
					stubInvokeMethod.should.have.been.calledWith(sinon.match({ method: 'core.playlist.save', params: { playlist: 'myplaylist' }}));
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ mopidy: 'return value' });

					spySend.reset();
					stubInvokeMethod.restore();
					stubReadyState.restore();
					done();
				}, 0);
			});
		});

	});


	describe('Given a mopidy-out node and incoming message with method and/or params', () => {
		const FLOW = [
			{ host: 'localhost', id: 'mop-config', name: 'nonexist', port: '6680', type: 'mopidy-config' },
			{ id: 'mop-out', name: 'myname', server: 'mop-config', type: 'mopidy-out',
				'method': 'core.mixer.setMute',
				'params': '{"mute": true}'
			}
		];

		let currentNode;
		let stubInvokeMethod;
		let spySend;
		let stubReadyState;

		beforeEach(function(done) {
			helper.load(NODES, FLOW, function() {
				currentNode = helper.getNode('mop-out');
				stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() {});
				stubReadyState = sinon.stub(currentNode.mopidyServer, 'readyState', { get: function () { return true }});
				spySend = sinon.spy(currentNode, 'send');
				done();
			});
		});

		afterEach(function() {
			spySend.reset();
			stubInvokeMethod.restore();
			stubReadyState.restore();
			helper.unload();
		});

		it('should send an error when incoming msg is a string', function(done) {
			const incomingMsg = 'A string and not an object';
			currentNode.invokeMethod(incomingMsg);
			setTimeout(function(){
				stubInvokeMethod.should.have.callCount(0);
				spySend.should.have.callCount(1);
				spySend.should.have.been.calledWithExactly({ error: { message: "If you send data to a Mopidy node, that data must an 'object'" } });
				done();
			}, 0);
		});

		it("should send an error when incoming msg contains the property 'error'", function(done) {
			const incomingMsg = { error: 'Has an error from previous node' };
			currentNode.invokeMethod(incomingMsg);
			setTimeout(function(){
				stubInvokeMethod.should.have.callCount(0);
				spySend.should.have.callCount(1);
				spySend.should.have.been.calledWithExactly({ error: { message: "Stopped. Incoming data has the property 'error'" } });
				done();
			}, 0);
		});

		it("should send an error when incoming msg's method isn't a string", function(done) {
			const incomingMsg = { method: { an: 'object' } };
			currentNode.invokeMethod(incomingMsg);
			setTimeout(function(){
				stubInvokeMethod.should.have.callCount(0);
				spySend.should.have.callCount(1);
				spySend.should.have.been.calledWithExactly({ error: { message: "'method' must be a 'string'" } });
				done();
			}, 0);
		});

		it("should send an error when incoming msg's params isn't an object", function(done) {
			const incomingMsg = { params: 'A string and not an object' };
			currentNode.invokeMethod(incomingMsg);
			setTimeout(function(){
				stubInvokeMethod.should.have.callCount(0);
				spySend.should.have.callCount(1);
				spySend.should.have.been.calledWithExactly({ error: { message: "'params' must be an 'object'" } });
				done();
			}, 0);
		});

	});


});
