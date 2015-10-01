
var chai = require("chai");
var should = chai.should();
chai.use(require('chai-things'));

var api = require('../../mopidy/lib/api');
var TEST_API = require('../_resources/mopidy.json');

describe('API', function(){

	describe('When given a mock API', function(){

		before(function() {
			api.add(TEST_API);
		});

		after(function() {
			api.add({});
		});

		it('should get all categories', function() {
			var categories = api.getCategories();
			categories.should.be.an('array');
			categories.should.eql([	'tracklist',
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
			var methods = api.getMethods();
			methods.should.be.an('array');
			methods.should.have.length(68);
			methods.should.all.have.property('method');
			methods.should.all.have.property('category');
			methods.should.all.have.property('description');
			methods.should.all.have.property('params');
		});

		it('should get all methods of specific category', function() {
			var methods = api.getMethods({ category: 'tracklist' });
			methods.should.be.an('array');
			methods.should.have.length(26);
			methods.should.all.have.property('method');
			methods.should.all.have.property('category');
			methods.should.all.have.property('description');
			methods.should.all.have.property('params');
		});

	});

	describe('MopidyConnected: When given a connected Mopidy', function(){

		before(function() {
			this.timeout(10000);
			return api.initApi();
		});

		after(function() {
			api.add({});
		});

		it('should get categories', function() {
			var categories = api.getCategories();
			categories.should.be.an('array');
			categories.should.include('playlists');
		});

		it('should get all methods', function() {
			var methods = api.getMethods();
			methods.should.be.an('array');
			methods.should.have.length.above(50);
			methods.should.all.have.property('method');
			methods.should.all.have.property('category');
			methods.should.all.have.property('description');
			methods.should.all.have.property('params');
		});

		it('should get all methods of specific category', function() {
			var methods = api.getMethods({ category: 'tracklist' });
			methods.should.be.an('array');
			methods.should.have.length.above(10);
			methods.should.all.have.property('method');
			methods.should.all.have.property('category');
			methods.should.all.have.property('description');
			methods.should.all.have.property('params');
		});

	});

});


