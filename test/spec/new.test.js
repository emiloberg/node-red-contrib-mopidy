const chai = require('chai');
chai.should();
//const should = chai.should();
chai.use(require('chai-things'));


var helper = require('../helper.js');

//const servers = require('../' + testTypeSlug + '/lib/models/servers');
//const utils = require('../lib/lib/utils/utils');

var mopidyOutNode = require('../../lib/mopidy-out.js');
var mopidyConfigNode = require('../../lib/mopidy-config.js');
var NODES = [mopidyOutNode, mopidyConfigNode];


describe('This mopidy node', () => {

	beforeEach(function(done) {
		helper.startServer(done);
	});

	afterEach(function(done) {
		helper.unload();
		helper.stopServer(done);
	});

	describe('nodes', () => {

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

		describe('config node', () => {
			it('should be loaded', function(done) {
				helper.load(NODES, FLOW, function() {
					var placedConfigNode = helper.getNode('mop-config');
					placedConfigNode.should.have.property('name', 'nonexist');
					done();
				});
			});
		});

		describe('out node', () => {
			it('should be loaded', function(done) {
				helper.load(NODES, FLOW, function() {
					var placedConfigNode = helper.getNode('mop-out');
					placedConfigNode.should.have.property('name', 'myname');
					done();
				});
			});
		});

	});

});
