const chai = require('chai');
chai.should();
//const should = chai.should();
chai.use(require('chai-things'));
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const rewire = require('rewire');
const helper = require('../helper.js');

const REWIRED_MOPIDY_IN_NODE = rewire('../../src/mopidy-in.js');
const MOPIDY_CONFIG_NODE = require('../../src/mopidy-config.js');
const NODES = [REWIRED_MOPIDY_IN_NODE, MOPIDY_CONFIG_NODE];

describe('mopidy-in', () => {

	describe('Given node is loaded with server configuration', () => {
		before(function (done) {
			helper.startServer(done);
		});

		after(function (done) {
			helper.unload();
			helper.stopServer(done);
		});


		afterEach(function () {
			helper.unload();
		});

		it('should be registered', function (done) {
			const FLOW = [
				{ host: 'sample.server.dev', id: 'mop-config', name: 'test-server', port: '6680', type: 'mopidy-config' },
				{ id: 'mop-in', name: 'myname', server: 'mop-config', type: 'mopidy-in',  messagetype: 'all' }
			];

			helper.load(NODES, FLOW, function () {
				const currentNode = helper.getNode('mop-in');
				currentNode.should.have.property('name', 'myname');
				currentNode.should.have.property('type', 'mopidy-in');
				done();
			});
		});

		it('should relay event if listen-to-method set to "all"', function (done) {
			const FLOW = [
				{ host: 'sample.server.dev', id: 'mop-config', name: 'test-server', port: '6680', type: 'mopidy-config' },
				{ id: 'mop-in', name: 'myname', server: 'mop-config', type: 'mopidy-in',  messagetype: 'all' }
			];

			helper.load(NODES, FLOW, function () {
				const currentNode = helper.getNode('mop-in');
				const stubSend = sinon.stub(currentNode, 'send', function(){});

				currentNode.getEvent('made-up-event-name', { sample: 'event data'});

				stubSend.should.have.callCount(1);
				stubSend.should.have.been.calledWith({
					host: 'sample.server.dev',
					payload: { event: 'made-up-event-name', sample: 'event data' },
					port: '6680',
					serverName: 'test-server'
				});

				stubSend.restore();

				done();
			});
		});

		it('should relay event "websocket" if listen-to-method set to "websocket"', function (done) {
			const FLOW = [
				{ host: 'sample.server.dev', id: 'mop-config', name: 'test-server', port: '6680', type: 'mopidy-config' },
				{ id: 'mop-in', name: 'myname', server: 'mop-config', type: 'mopidy-in',  messagetype: 'websocket' }
			];

			helper.load(NODES, FLOW, function () {
				const currentNode = helper.getNode('mop-in');
				const stubSend = sinon.stub(currentNode, 'send', function(){});

				currentNode.getEvent('websocket', { sample: 'event data'});

				stubSend.should.have.callCount(1);
				stubSend.should.have.been.calledWith({
					host: 'sample.server.dev',
					payload: { event: 'websocket', sample: 'event data' },
					port: '6680',
					serverName: 'test-server'
				});
				done();
			});
		});

		it('should relay event "state" if listen-to-method set to "websocket"', function (done) {
			const FLOW = [
				{ host: 'sample.server.dev', id: 'mop-config', name: 'test-server', port: '6680', type: 'mopidy-config' },
				{ id: 'mop-in', name: 'myname', server: 'mop-config', type: 'mopidy-in',  messagetype: 'state' }
			];

			helper.load(NODES, FLOW, function () {
				const currentNode = helper.getNode('mop-in');
				const stubSend = sinon.stub(currentNode, 'send', function(){});

				currentNode.getEvent('websocket', { sample: 'event data'});

				stubSend.should.have.callCount(0);

				done();
			});
		});

		it('should not try to connect to unexisting server', function (done) {
			const FLOW = [
				{ id: 'mop-in', name: 'myname', server: '', type: 'mopidy-in',  messagetype: 'state' }
			];

			helper.load(NODES, FLOW, function () {
				const currentNode = helper.getNode('mop-in');
				currentNode.mopidyServer.should.eql({ readyState: false });
				done();
			});
		});

		it('should not try to connect to server with bad host/port', function (done) {
			const FLOW = [
				{ host: 'THIS IS A BAD HOSTNAME', id: 'mop-config', name: 'test-server', port: '6680', type: 'mopidy-config' },
				{ id: 'mop-in', name: 'myname', server: 'mop-config', type: 'mopidy-in',  messagetype: 'state' }
			];

			helper.load(NODES, FLOW, function () {
				const currentNode = helper.getNode('mop-in');
				currentNode.mopidyServer.should.eql({ readyState: false });
				done();
			});
		});

		it('should set node status to "connected"', function (done) {
			const FLOW = [
				{ host: 'sample.server.dev', id: 'mop-config', name: 'test-server', port: '6680', type: 'mopidy-config' },
				{ id: 'mop-in', name: 'myname', server: 'mop-config', type: 'mopidy-in',  messagetype: 'state' }
			];

			helper.load(NODES, FLOW, function () {
				const currentNode = helper.getNode('mop-in');
				const stubObjectPath = sinon.stub(currentNode.objectPath, 'get', function() { return true });
				const stubStatus = sinon.stub(currentNode, 'status', function() {});

				currentNode.updateStatus();

				stubStatus.should.have.callCount(1);
				stubStatus.should.have.been.calledWith({ fill: 'green', shape: 'dot', text: 'connected' });

				stubObjectPath.restore();
				stubStatus.restore();
				done();
			});
		});

		it('should set node status to "not connected"', function (done) {
			const FLOW = [
				{ host: 'sample.server.dev', id: 'mop-config', name: 'test-server', port: '6680', type: 'mopidy-config' },
				{ id: 'mop-in', name: 'myname', server: 'mop-config', type: 'mopidy-in',  messagetype: 'state' }
			];

			helper.load(NODES, FLOW, function () {
				const currentNode = helper.getNode('mop-in');
				const stubObjectPath = sinon.stub(currentNode.objectPath, 'get', function() { return false });
				const stubStatus = sinon.stub(currentNode, 'status', function() {});

				currentNode.updateStatus();

				stubStatus.should.have.callCount(1);
				stubStatus.should.have.been.calledWith({ fill: 'grey', shape: 'dot', text: 'not connected' });

				stubObjectPath.restore();
				stubStatus.restore();
				done();
			});
		});

	});

});
