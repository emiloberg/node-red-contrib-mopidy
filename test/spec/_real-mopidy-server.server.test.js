var chai = require('chai');
chai.should();
//var should = chai.should();
chai.use(require('chai-things'));
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const MOPIDY_SERVER = require('../../lib/lib/models/MopidyServer');

describe('[MopidyConnected] Real Mopidy server', () =>{

	describe('MopidyAPI', () =>{

		describe('Given a real Mopidy server, should connect to it and', () =>{

			const REAL_SERVER_DATA = {
				host: 'localhost', // TODO: Fetch fron env var
				port: 6680,
				serverId: 'sampleId3'
			};

			let REAL_SERVER;

			before(function(done) {
				this.timeout(3000);
				REAL_SERVER = new MOPIDY_SERVER(REAL_SERVER_DATA);
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

	});

});
