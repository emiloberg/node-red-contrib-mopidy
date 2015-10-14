const chai = require('chai');
chai.should();
//const should = chai.should();
chai.use(require('chai-things'));

var helper = require('../helper.js');

var MOPIDY_CONFIG_NODE = require('../../lib/mopidy-config.js');

describe('mopidy-config', () => {

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
		}
	];

	describe('Given data', () => {
		it('should be loaded', function(done) {
			helper.load(MOPIDY_CONFIG_NODE, FLOW, function() {
				var currentNode = helper.getNode('mop-config');
				currentNode.should.have.property('name', 'nonexist');
				currentNode.should.have.property('host', 'localhost');
				currentNode.should.have.property('port', '6680');
				currentNode.should.have.property('type', 'mopidy-config');
				done();
			});
		});
	});

});
