
const chai = require("chai");
const should = chai.should();
chai.use(require('chai-things'));
const servers = require('../mopidy/lib/models/servers');
var utils = require('../mopidy/lib/utils/utils');

describe('mopidy-out', function(){

	describe('routes', function(){

		describe('methods', function(){

			it('should return all methods', function() {
				const methods = 'not implemented yet';
				methods.should.be.an('array');
				methods.should.have.length.above(50);
				methods.should.all.have.property('method');
				methods.should.all.have.property('category');
				methods.should.all.have.property('description');
				methods.should.all.have.property('params');
			});

		});

	});

});


