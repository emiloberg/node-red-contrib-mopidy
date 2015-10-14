const chai = require('chai');
chai.should();
//const should = chai.should();
chai.use(require('chai-things'));

var helper = require('../helper.js');

var mopidyOutNode = require('../../lib/mopidy-out.js');
var mopidyConfigNode = require('../../lib/mopidy-config.js');
var NODES = [mopidyOutNode, mopidyConfigNode];


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

	var FLOW = [
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



});
