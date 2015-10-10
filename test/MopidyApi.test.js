
var chai = require("chai");
//var should = chai.should();
chai.use(require('chai-things'));
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

import MopidyServer from '../mopidy/lib/models/MopidyServer'

describe('MopidyAPI', () =>{

	describe('When given a mock API', () =>{

		const MOCK_SERVER_DATA = {
			host: 'not-used.local',
			port: 6680,
			mockApi: require('./_resources/mopidy-mock-api.json')
		};
		let MOCK_SERVER;

		before(() => {
			MOCK_SERVER = new MopidyServer(MOCK_SERVER_DATA);
		});

		after(() => {
			MOCK_SERVER._wipeApi();
		});

		it('should get all methods', () => {
			var methods = MOCK_SERVER.getMethods();
			methods.should.eventually.be.an('array');
			methods.should.eventually.have.length(68);
			methods.should.eventually.all.have.property('method');
			methods.should.eventually.all.have.property('category');
			methods.should.eventually.all.have.property('description');
			methods.should.eventually.all.have.property('params');
		});

	});

	describe('[MopidyConnected] When given a real Mopidy server, should connect to it and', () =>{

		const REAL_SERVER_DATA = {
			host: 'localhost', // TODO: Fetch fron env var
			port: 6680
		};
		let REAL_SERVER;

		before(function(done) {
			this.timeout(10000);
			REAL_SERVER = new MopidyServer(REAL_SERVER_DATA);
			REAL_SERVER.events.on('ready:ready', () => {
				done()
			});
		});

		after(() => {
			REAL_SERVER._wipeApi();
		});

		it('should get all methods', () => {
			var methods = REAL_SERVER.getMethods();
			methods.should.eventually.be.an('array');
			methods.should.eventually.have.length.above(50);
			methods.should.eventually.all.have.property('method');
			methods.should.eventually.all.have.property('category');
			methods.should.eventually.all.have.property('description');
			methods.should.eventually.all.have.property('params');
		});

	});


	describe('[TakesTime] When given a non existing Mopidy server', () =>{

		const NON_EXISTING_SERVER_DATA = {
			host: 'localhost',
			port: 51234
		};
		let NON_EXISTING_SERVER;

		before(function() {
			NON_EXISTING_SERVER = new MopidyServer(NON_EXISTING_SERVER_DATA);
		});

		after(() => {
			NON_EXISTING_SERVER._wipeApi();
		});

		it('getMethods should be rejected after some time', function() {
			this.timeout(6000);
			var methods = NON_EXISTING_SERVER.getMethods();
			return methods.should.be.rejected;
		});

	});

});


