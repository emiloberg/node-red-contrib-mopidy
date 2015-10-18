const chai = require('chai');
chai.should();
//const should = chai.should();
chai.use(require('chai-things'));

const sinon = require('sinon');

var sinonChai = require('sinon-chai');
chai.use(sinonChai);

const Promise = require('promise');

const helper = require('../helper.js');
const MOPIDY_OUT_NODE = require('../../lib/mopidy-out.js');
const MOPIDY_CONFIG_NODE = require('../../lib/mopidy-config.js');
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
				var currentNode = helper.getNode('mop-out');
				currentNode.should.have.property('name', 'myname');
				currentNode.should.have.property('type', 'mopidy-out');
				done();
			});
		});

		it('should be populated with data from config node', function(done) {
			helper.load(NODES, FLOW, function() {
				var currentNode = helper.getNode('mop-out');
				currentNode.should.have.deep.property('mopidyServer.host', 'localhost');
				currentNode.should.have.deep.property('mopidyServer.port', '6680');
				done();
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
				var currentNode = helper.getNode('mop-out');
				var stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.resolve('return value') });
				var spySend = sinon.spy(currentNode, 'send');

				currentNode.invokeMethod();

				setTimeout(function(){
					stubInvokeMethod.should.have.been.calledWithExactly({ method: 'core.tracklist.shuffle', params: { end: '', start: '' } });
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ status: 1, mopidy: 'return value' });

					spySend.reset();
					stubInvokeMethod.restore();
					done();
				}, 0);
			});
		});

		it('should invoke the mopidy method when called with a non-existing method, and return with error', function(done) {
			helper.load(NODES, FLOW, function() {
				var currentNode = helper.getNode('mop-out');
				var stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.reject('error value') });
				var spySend = sinon.spy(currentNode, 'send');

				currentNode.invokeMethod();

				setTimeout(function(){
					stubInvokeMethod.should.have.been.calledWithExactly({ method: 'core.tracklist.shuffle', params: { end: '', start: '' } });
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ status: 0, err: 'error value' });

					spySend.reset();
					stubInvokeMethod.restore();
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
				var currentNode = helper.getNode('mop-out');
				var stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.resolve('return value') });
				var spySend = sinon.spy(currentNode, 'send');

				currentNode.invokeMethod({ params: { uri: 'http://http-live.sr.se/p1-mp3-128' }});

				setTimeout(function(){
					stubInvokeMethod.should.have.been.calledWithExactly({ method: 'core.tracklist.add', params: { uri: 'http://http-live.sr.se/p1-mp3-128' } });
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ status: 1, mopidy: 'return value' });

					spySend.reset();
					stubInvokeMethod.restore();
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
				var currentNode = helper.getNode('mop-out');
				var stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.resolve('return value') });
				var spySend = sinon.spy(currentNode, 'send');

				currentNode.invokeMethod({ method: 'core.mixer.setVolume'});

				setTimeout(function(){
					stubInvokeMethod.should.have.been.calledWithExactly({ method: 'core.mixer.setVolume', params: { volume: 50 } });
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ status: 1, mopidy: 'return value' });

					spySend.reset();
					stubInvokeMethod.restore();
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
				var currentNode = helper.getNode('mop-out');
				var stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.resolve('return value') });
				var spySend = sinon.spy(currentNode, 'send');

				currentNode.invokeMethod({ method: 'core.tracklist.slice', params: { start: 1, end: 2 }});

				setTimeout(function(){
					stubInvokeMethod.should.have.been.calledWithExactly({ method: 'core.tracklist.slice', params: { start: 1, end: 2 }});
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ status: 1, mopidy: 'return value' });

					spySend.reset();
					stubInvokeMethod.restore();
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
				var currentNode = helper.getNode('mop-out');
				var stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.resolve('return value') });
				var spySend = sinon.spy(currentNode, 'send');

				currentNode.invokeMethod({ method: 'core.playlist.save', params: { playlist: 'myplaylist' }});

				setTimeout(function(){
					stubInvokeMethod.should.have.been.calledWith(sinon.match({ method: 'core.playlist.save', params: { playlist: 'myplaylist' }}));
					spySend.should.have.callCount(1);
					spySend.should.have.been.calledWithExactly({ status: 1, mopidy: 'return value' });

					spySend.reset();
					stubInvokeMethod.restore();
					done();
				}, 0);
			});
		});

	});


});
