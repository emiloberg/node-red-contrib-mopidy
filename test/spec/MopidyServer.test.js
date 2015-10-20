const chai = require('chai');
chai.should();
chai.use(require('chai-things'));
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const rewire = require('rewire');
const when = require('when');


const MOPIDY_SERVER = require('../../lib/lib/models/MopidyServer');



describe('MopidyAPI', () =>{

	describe('Given module loaded', () => {
		it('should execute function by name', function () {
			var spy              = sinon.spy();
			const nestedFunction = {
				some: {
					where: {
						deep: spy
					}
				}
			};
			MOPIDY_SERVER._executeFunctionByName('some.where.deep', nestedFunction);
			spy.should.have.callCount(1);
		});
	});

	describe('Given a MopidyServer connected to server 1', () =>{

		let REWIRED_SERVER;
		const REWIRED_MOPIDY_SERVER = rewire('../../lib/lib/models/MopidyServer');
		const MOCK_API = require('../_resources/mopidy-mock-api.json');
		const FAKE_SERVER_DATA = { host: 'fake.server', port: 1234, serverId: 'sampleId2' };

		before(function() {
			const mockedMopidy = function() {
				return {
					_send: function(params) {
						params.should.have.property('method', 'core.describe');
						return when.resolve(MOCK_API);
					},
					on: function(eventName, cb) {
						if (eventName === 'state:online') {
							cb();
						}

					},
					_webSocket: {
						readyState: 1
					},
					close: function(){},
					off: function(){}
				}
			};
			REWIRED_MOPIDY_SERVER.__set__('Mopidy', mockedMopidy);
			REWIRED_SERVER = new REWIRED_MOPIDY_SERVER(FAKE_SERVER_DATA);
		});

		after(() => {
			REWIRED_SERVER.close();
		});

		it('should get all methods', () => {
			return REWIRED_SERVER.getMethods()
				.should.eventually.be.an('array')
				.and.eventually.have.length.above(50)
				.and.eventually.all.have.property('method')
				.and.eventually.all.have.property('category')
				.and.eventually.all.have.property('description')
				.and.eventually.all.have.property('params');
		});

	});


	describe('Given a MopidyServer connected to server 2', () =>{

		let REWIRED_SERVER;
		const REWIRED_MOPIDY_SERVER = rewire('../../lib/lib/models/MopidyServer');
		const MOCK_API = require('../_resources/mopidy-mock-api.json');
		const FAKE_SERVER_DATA = { host: 'fake.server', port: 1234, serverId: 'sampleId2' };
		const spy = sinon.spy();

		before(function() {
			const mockedMopidy = function() {
				return {
					_send: function(params) {
						params.should.have.property('method', 'core.describe');
						return when.resolve(MOCK_API);
					},
					on: function(eventName, cb) {
						if (eventName === 'state:online') {
							cb();
						}

					},
					_webSocket: {
						readyState: 1
					},
					close: function(){},
					off: function(){}
				}
			};
			REWIRED_MOPIDY_SERVER.__set__('Mopidy', mockedMopidy);
			REWIRED_MOPIDY_SERVER._executeFunctionByName = spy;
			REWIRED_SERVER = new REWIRED_MOPIDY_SERVER(FAKE_SERVER_DATA);
		});

		after(() => {
			REWIRED_SERVER.close();
		});

		it('should invoke method', () => {
			REWIRED_SERVER.invokeMethod({
				method: 'core.tracklist.add',
				params: {
					uri: 'http://http-live.sr.se/p1-mp3-128'
				}
			});

			spy.should.have.callCount(1);
			spy.args[0][0].should.eql('tracklist.add');
			spy.args[0][2].should.eql({ uri: 'http://http-live.sr.se/p1-mp3-128' });

			spy.reset();

			REWIRED_SERVER.invokeMethod({
				method: 'core.history.getLength'
			});

			spy.should.have.callCount(1);
			spy.args[0][0].should.eql('history.getLength');
			spy.args[0][2].should.eql({});

		});

	});


	describe('Given a MopidyServer not connected to server', () =>{

		let REWIRED_SERVER;
		const REWIRED_MOPIDY_SERVER = rewire('../../lib/lib/models/MopidyServer');
		const MOCK_API = require('../_resources/mopidy-mock-api.json');
		const FAKE_SERVER_DATA = { host: 'fake.server', port: 1234, serverId: 'sampleId2' };

		before(function() {
			const mockedMopidy = function() {
				return {
					_send: function(params) {
						params.should.have.property('method', 'core.describe');
						return when.resolve(MOCK_API);
					},
					on: function() {}
				}
			};
			REWIRED_MOPIDY_SERVER.__set__('Mopidy', mockedMopidy);
			REWIRED_SERVER = new REWIRED_MOPIDY_SERVER(FAKE_SERVER_DATA);
		});

		it('should return readyState false', () => {
			REWIRED_SERVER.readyState.should.eql(false);
		});

	});

	describe('Given a non existing Mopidy server', () =>{

		const NON_EXISTING_SERVER_DATA = {
			host: 'localhost',
			port: 51234,
			serverId: 'sampleId4'
		};

		let NON_EXISTING_SERVER;

		before(function() {
			NON_EXISTING_SERVER = new MOPIDY_SERVER(NON_EXISTING_SERVER_DATA);
		});

		after(() => {
			NON_EXISTING_SERVER.close();
		});

		it('should rejected after 5000 ms when trying to get methods', function() {
			const clock = sinon.useFakeTimers();
			const res = NON_EXISTING_SERVER.getMethods();
			clock.tick(5000);
			clock.restore();
			return res.should.eventually.be.rejected;
		});

	});

});


