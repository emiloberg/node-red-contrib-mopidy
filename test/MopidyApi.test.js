
var chai = require("chai");
var should = chai.should();
chai.use(require('chai-things'));



import MopidyApi from '../mopidy/lib/models/MopidyApi'

describe('API', function(){

	describe('When given a mock API', function(){

		const MOCK_SERVER_DATA = {
			host: 'not-used.local',
			port: 6680,
			mockApi: require('./_resources/mopidy.json')
		};
		let MOCK_SERVER;

		before(function() {
			MOCK_SERVER = new MopidyApi(MOCK_SERVER_DATA);
		});

		after(function() {
			MOCK_SERVER._wipeApi();
		});

		it('should get all categories', function() {
			var categories = MOCK_SERVER.getCategories();
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
			var methods = MOCK_SERVER.getMethods();
			methods.should.be.an('array');
			methods.should.have.length(68);
			methods.should.all.have.property('method');
			methods.should.all.have.property('category');
			methods.should.all.have.property('description');
			methods.should.all.have.property('params');
		});

		it('should get all methods of specific category', function() {
			var methods = MOCK_SERVER.getMethods({ category: 'tracklist' });
			methods.should.be.an('array');
			methods.should.have.length(26);
			methods.should.all.have.property('method');
			methods.should.all.have.property('category');
			methods.should.all.have.property('description');
			methods.should.all.have.property('params');
		});

	});

	describe('MopidyConnected: When given a real Mopidy server, should connect to it and', function(){

		var allMethodsLength = 0;

		const REAL_SERVER_DATA = {
			host: 'localhost', // TODO: Fetch fron env var
			port: 6680
		};
		let REAL_SERVER;

		before(function(done) {
			this.timeout(10000);
			REAL_SERVER = new MopidyApi(REAL_SERVER_DATA);
			REAL_SERVER.events.on('ready:ready', () => {
				done()
			});
		});

		after(function() {
			REAL_SERVER._wipeApi();
		});

		it('should get categories', function() {
			var categories = REAL_SERVER.getCategories();
			categories.should.be.an('array');
			categories.should.include('playlists');
		});

		it('should get all methods', function() {
			var methods = REAL_SERVER.getMethods();
			allMethodsLength = methods.length;
			methods.should.be.an('array');
			methods.should.have.length.above(50);
			methods.should.all.have.property('method');
			methods.should.all.have.property('category');
			methods.should.all.have.property('description');
			methods.should.all.have.property('params');
		});

		it('should get all methods of specific category', function() {
			var methods = REAL_SERVER.getMethods({ category: 'tracklist' });
			methods.should.be.an('array');
			methods.should.have.length.above(10);
			methods.should.have.length.below(allMethodsLength);
			methods.should.all.have.property('method');
			methods.should.all.have.property('category');
			methods.should.all.have.property('description');
			methods.should.all.have.property('params');
		});

	});

});


