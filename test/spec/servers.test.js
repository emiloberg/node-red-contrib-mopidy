//var testTypeSlug = process.env.TEST_TYPE === 'coverage' ? 'lib' : 'mopidy';
var testTypeSlug = 'lib';
const chai = require('chai');
const should = chai.should();
chai.use(require('chai-things'));


const servers = require('../../' + testTypeSlug + '/lib/models/servers');
var utils = require('../../' + testTypeSlug + '/lib/utils/utils');

describe('Servers', () =>{

	describe('Given server details', () =>{

		const SERVER_ONE = {
			host: 'localhost',
			port: 6681,
			name: 'Local Server'
		};
		let SERVER_ONE_ID = utils.serverPropsToName({ host: SERVER_ONE.host, port: SERVER_ONE.port });

		const SERVER_TWO = {
			host: '192.168.1.125',
			port: 6681,
			name: 'Pi Server'
		};
		let SERVER_TWO_ID = utils.serverPropsToName({ host: SERVER_TWO.host, port: SERVER_TWO.port });
		let SERVER_TWO_RETURNED_ID = '';

		const SERVER_FAULTY = {
			host: '192.168.1.125',
			port: 6681,
			name: ''
		};

		before(() => {
			servers.removeAllServers();
		});


		after(() => {
			//api.add({});
		});

		it('should add a first server', () => {
			const server = servers.add(SERVER_ONE);
			server.should.be.an('object');
			server.should.have.property('host', SERVER_ONE.host);
			server.should.have.property('port', SERVER_ONE.port);
			server.should.have.property('name', SERVER_ONE.name);
			server.should.have.property('id', SERVER_ONE_ID);
			server.should.have.property('mopidy');
		});

		it('should check with id that first server exists', () => {
			const exist = servers.exists({ id: SERVER_ONE_ID });
			exist.should.equal(true);
		});

		it('should check with host and port that first server exists', () => {
			const exist = servers.exists({ host: SERVER_ONE.host, port: SERVER_ONE.port });
			exist.should.equal(true);
		});

		it('should check that non existing server does not exists', () => {
			const exist = servers.exists({ id: 'does.not.exist:1234' });
			exist.should.equal(false);
		});

		it('should not add a server with wrong data', () => {
			should.Throw(() => { servers.add(SERVER_FAULTY); });
		});

		it('should add a second server', () => {
			const server = servers.add(SERVER_TWO);
			SERVER_TWO_RETURNED_ID = server.id;
			server.should.be.an('object');
			server.should.have.property('host', SERVER_TWO.host);
			server.should.have.property('port', SERVER_TWO.port);
			server.should.have.property('name', SERVER_TWO.name);
			server.should.have.property('id', SERVER_TWO_ID);
			server.should.have.property('mopidy');
		});

		it('should get an existing server', () => {
			const server = servers.get({ id: SERVER_TWO_ID });
			server.should.be.an('object');
			server.should.have.property('host', SERVER_TWO.host);
			server.should.have.property('port', SERVER_TWO.port);
			server.should.have.property('name', SERVER_TWO.name);
			server.should.have.property('id', SERVER_TWO_ID);
			server.should.have.property('mopidy');
		});

		it('should not add an already existing server', () => {
			servers.add(SERVER_ONE);
			const listOfServers = servers.getAll();
			listOfServers.should.be.an('array');
			listOfServers.should.have.length(2);
			listOfServers.should.all.have.property('host');
			listOfServers.should.all.have.property('port');
			listOfServers.should.all.have.property('name');
			listOfServers.should.all.have.property('id');
			listOfServers.should.all.have.property('mopidy');
		});


		it('should remove the first server based on host+port', () => {
			var ret = servers.remove({ host: SERVER_ONE.host, port: SERVER_ONE.port });
			ret.should.eql(true);
		});

		it('should remove the second server based on id', () => {
			var ret = servers.remove({ id: SERVER_TWO_RETURNED_ID });
			ret.should.eql(true);
		});

		it('should not be any servers in list of servers', () => {
			const listOfServers = servers.getAll();
			listOfServers.should.be.an('array');
			listOfServers.should.have.length(0);
		});

	});

});


