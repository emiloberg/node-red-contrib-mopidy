const chai = require('chai');
chai.should();
//const should = chai.should();
chai.use(require('chai-things'));

import {serverPropsToName, snakeToCamel, uuid} from '../../lib/lib/utils/utils';

describe('utils', () =>{

	describe('serverPropsToName', () =>{
		describe('Given host and port', () =>{
			it('should return a correct id', () => {
				serverPropsToName({ host: '192.168.0.1', port: '1234'})
					.should.eql('192.168.0.1:1234');
			});
		});
	});

	describe('snakeToCamel', () =>{
		describe('Given a snake_cased_string', () =>{
			it('should return a camelCasedString', () => {
				snakeToCamel({ name: 'was_snake_cased_string' })
					.should.eql('wasSnakeCasedString');
			});
		});
	});

	describe('uuid', () =>{
		describe('When called', () =>{
			it('should return a UUID', () => {
				let currentUuid = uuid();
				currentUuid.should.be.a('string');
				currentUuid.should.have.length(36);
				currentUuid.should.not.equal(uuid());
				currentUuid.should.not.equal(uuid());
			});
		});
	});

});


