
var chai = require("chai");
chai.should();
chai.use(require('chai-things'));

var expect = chai.expect;

var apiViewModel = require('../../mopidy/lib/apiViewModel');
var TESTAPI = require('../_resources/mopidy.json');

describe('With mock data', function(){

	beforeEach(function() {
		apiViewModel.add(TESTAPI);
	});

	it('should get categories', function() {
		var categories = apiViewModel.getCategories();
		expect(categories).to.be.an('array');
		expect(categories).to.eql([	'tracklist',
			'mixer',
			'playback',
			'library',
			'playlists',
			'history',
			'get_uri_schemes',
			'get_version'
		]);
	});

	it('should get all methods', function() {
		var methods = apiViewModel.getMethods();
		expect(methods).to.be.an('array'); //68
		expect(methods).to.have.length(68); //68
		methods.should.all.have.property('method');
		methods.should.all.have.property('categoryName');
		methods.should.all.have.property('methodName');
		methods.should.all.have.property('description');
		methods.should.all.have.property('params');
	});

	it('should get all methods of category', function() {
		var methods = apiViewModel.getMethods({ categoryName: 'tracklist' });
		expect(methods).to.be.an('array');
		expect(methods).to.have.length(26);
		methods.should.all.have.property('method');
		methods.should.all.have.property('categoryName');
		methods.should.all.have.property('methodName');
		methods.should.all.have.property('description');
		methods.should.all.have.property('params');
	});

	it('should get all methods of method', function() {
		var methods = apiViewModel.getMethods({ methodName: 'previous' });
		expect(methods).to.be.an('array');
		expect(methods).to.have.length(1);
		methods.should.all.have.property('method');
		methods.should.all.have.property('categoryName');
		methods.should.all.have.property('methodName');
		methods.should.all.have.property('description');
		methods.should.all.have.property('params');
	});

	it('should get all methods of category and method', function() {
		var methods = apiViewModel.getMethods({ categoryName: 'tracklist', methodName: 'eot_track' });
		expect(methods).to.be.an('array');
		expect(methods).to.have.length(1);
		methods.should.all.have.property('method');
		methods.should.all.have.property('categoryName');
		methods.should.all.have.property('methodName');
		methods.should.all.have.property('description');
		methods.should.all.have.property('params');
	});

});


