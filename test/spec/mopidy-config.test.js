const chai = require('chai');
chai.should();
//const should = chai.should();
chai.use(require('chai-things'));

const helper = require('../helper.js');

const MOPIDY_CONFIG_NODE = require('../../lib/mopidy-config.js');

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

	describe('Given data', () => {
		it('should be loaded', function(done) {
			const FLOW = [
				{
					'host': 'localhost',
					'id': 'mop-config',
					'name': 'nonexist',
					'port': '6680',
					'type': 'mopidy-config'
				}
			];

			helper.load(MOPIDY_CONFIG_NODE, FLOW, function() {
				const currentNode = helper.getNode('mop-config');
				currentNode.should.have.property('name', 'nonexist');
				currentNode.should.have.property('host', 'localhost');
				currentNode.should.have.property('port', '6680');
				currentNode.should.have.property('type', 'mopidy-config');
				done();
			});
		});
	});

});
