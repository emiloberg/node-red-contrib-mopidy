
const chai = require("chai");
const should = chai.should();
chai.use(require('chai-things'));

const servers = require('../mopidy/lib/models/servers');

var utils = require('../mopidy/lib/utils/utils');

describe('Server', function(){

	describe('When given data', function(){

		const SERVER_ONE = {
			host: 'localhost',
			port: 6680,
			name: 'Local Server'
		};
		let SERVER_ONE_ID = utils.serverPropsToName({ host: SERVER_ONE.host, port: SERVER_ONE.port });

		const SERVER_TWO = {
			host: '192.168.1.125',
			port: 6681,
			name: 'Pi Server'
		};
		let SERVER_TWO_ID = utils.serverPropsToName({ host: SERVER_TWO.host, port: SERVER_TWO.port });

		const SERVER_FAULTY = {
			host: '192.168.1.125',
			port: 6681,
			name: ''
		};

		before(function() {
			//api.add(TEST_API);
		});

		after(function() {
			//api.add({});
		});

		it('should add a first server', function() {
			const server = servers.add(SERVER_ONE);
			server.should.be.an('object');
			server.should.have.property('host', SERVER_ONE.host);
			server.should.have.property('port', SERVER_ONE.port);
			server.should.have.property('name', SERVER_ONE.name);
			server.should.have.property('id', SERVER_ONE_ID);
			server.should.have.property('mopidy');
		});

		it('should check with id that first server exists', function() {
			const exist = servers.exists({ id: SERVER_ONE_ID });
		});

		it('should check with host and port that first server exists', function() {
			const exist = servers.exists({ host: SERVER_ONE.host, port: SERVER_ONE.port });
		});

		it('should check that server does not exists', function() {
			const exist = servers.exists({ id: 'does.not.exist:1234' });
		});

		it('should not add a server with wrong data', function() {
			should.Throw(function() { servers.add(SERVER_FAULTY); });
		});

		it('should add a second server', function() {
			const server = servers.add(SERVER_TWO);
			server.should.be.an('object');
			server.should.have.property('host', SERVER_TWO.host);
			server.should.have.property('port', SERVER_TWO.port);
			server.should.have.property('name', SERVER_TWO.name);
			server.should.have.property('id', SERVER_TWO_ID);
			server.should.have.property('mopidy');
		});

		it('should get an existing server', function() {
			const server = servers.get({ id: SERVER_TWO_ID });
			server.should.be.an('object');
			server.should.have.property('host', SERVER_TWO.host);
			server.should.have.property('port', SERVER_TWO.port);
			server.should.have.property('name', SERVER_TWO.name);
			server.should.have.property('id', SERVER_TWO_ID);
			server.should.have.property('mopidy');
		});

		it('should not add an already existing server', function() {
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

	});

});


