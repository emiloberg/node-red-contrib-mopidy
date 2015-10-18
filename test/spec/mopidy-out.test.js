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

	const FLOW = [
		{
			'host': 'localhost',
			'id': 'mop-config',
			'name': 'nonexist',
			'port': '6680',
			'type': 'mopidy-config'
		},
		{
			'id': 'mop-out',
			'method': '',
			'name': 'myname',
			'params': '{}',
			'server': 'mop-config',
			'type': 'mopidy-out'
		}
	];

	describe('Given data', () => {
		it('should be loaded', function(done) {
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

	describe('Given a pre-configured mopidy-out node', () => {
		it('should invoke the mopidy method when called', function(done) {
			const FLOW_CONFIGURED_MOP_OUT = [
				{
					'host': 'localhost',
					'id': 'mop-config',
					'name': 'nonexist',
					'port': '6680',
					'type': 'mopidy-config'
				},
				{
					'id': 'mop-out',
					'method': 'core.tracklist.shuffle',
					'name': 'myname',
					'params': '{"start":"","end":""}',
					'server': 'mop-config',
					'type': 'mopidy-out'
				}
			];

			helper.load(NODES, FLOW_CONFIGURED_MOP_OUT, function() {
				var currentNode = helper.getNode('mop-out');
				var stubInvokeMethod = sinon.stub(currentNode.mopidyServer, 'invokeMethod', function() { return new Promise.resolve('return value') });
				var spySend = sinon.spy(currentNode, 'send');

				currentNode.invokeMethod();

				setTimeout(function(){
					stubInvokeMethod.should.have.been.calledWith({ method: 'core.tracklist.shuffle', params: { end: '', start: '' } });
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
