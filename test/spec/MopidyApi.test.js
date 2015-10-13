//var testTypeSlug = process.env.TEST_TYPE === 'coverage' ? 'lib' : 'mopidy';
var testTypeSlug = 'lib';
var chai = require('chai');
chai.should();
//var should = chai.should();
chai.use(require('chai-things'));
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const MopidyServer = require('../../' + testTypeSlug + '/lib/models/MopidyServer');
const utils = require('../../' + testTypeSlug + '/lib/utils/utils');

describe('MopidyAPI', () =>{

	describe('When given a mock API', () =>{

		const MOCK_SERVER_DATA = {
			host: 'not-used.local',
			port: 6680,
			mockApi: require('../_resources/mopidy-mock-api.json')
		};
		MOCK_SERVER_DATA.serverId = utils.serverPropsToName({ host: MOCK_SERVER_DATA.host, id: MOCK_SERVER_DATA.id });
		let MOCK_SERVER;

		before(() => {
			MOCK_SERVER = new MopidyServer(MOCK_SERVER_DATA);
		});

		after(() => {
			MOCK_SERVER.close();
		});

		it('should get all methods', function() {
			return MOCK_SERVER.getMethods()
				.should.eventually.be.an('array')
				.and.eventually.have.length(68)
				.and.eventually.all.have.property('method')
				.and.eventually.all.have.property('category')
				.and.eventually.all.have.property('description')
				.and.eventually.all.have.property('params');
		});

	});

	describe('[MopidyConnected] When given a real Mopidy server, should connect to it and', () =>{

		const REAL_SERVER_DATA = {
			host: 'localhost', // TODO: Fetch fron env var
			port: 6680
		};
		REAL_SERVER_DATA.serverId = utils.serverPropsToName({ host: REAL_SERVER_DATA.host, id: REAL_SERVER_DATA.id });
		let REAL_SERVER;

		before(function(done) {
			this.timeout(10000);
			REAL_SERVER = new MopidyServer(REAL_SERVER_DATA);
			REAL_SERVER.events.on('ready:ready', () => {
				done()
			});
		});

		after(() => {
			REAL_SERVER.close();
		});

		it('should get all methods', () => {
			return REAL_SERVER.getMethods()
				.should.eventually.be.an('array')
				.and.eventually.have.length.above(50)
				.and.eventually.all.have.property('method')
				.and.eventually.all.have.property('category')
				.and.eventually.all.have.property('description')
				.and.eventually.all.have.property('params');
		});

	});


	describe('[TakesTime] When given a non existing Mopidy server', () =>{

		const NON_EXISTING_SERVER_DATA = {
			host: 'localhost',
			port: 51234
		};
		NON_EXISTING_SERVER_DATA.serverId = utils.serverPropsToName({ host: NON_EXISTING_SERVER_DATA.host, id: NON_EXISTING_SERVER_DATA.id });
		let NON_EXISTING_SERVER;

		before(function() {
			NON_EXISTING_SERVER = new MopidyServer(NON_EXISTING_SERVER_DATA);
		});

		after(() => {
			NON_EXISTING_SERVER.close();
		});

		it('getMethods should be rejected after some time', function() {
			this.timeout(6000);
			return NON_EXISTING_SERVER.getMethods().should.eventually.be.rejected;
		});

	});

});


