const chai = require('chai');
const should = chai.should();
//const should = chai.should();
chai.use(require('chai-things'));


import {serverPropsToName, snakeToCamel, uuid, convertToInt} from '../../src/lib/utils/utils';

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

	describe('convertToInt', () =>{
		describe('When called', () =>{
			it('should return int if possible, else should return what is sent in', () => {
				convertToInt(42).should.equal(42);
				convertToInt('42').should.equal(42);
				convertToInt(4e2).should.equal(400);
				convertToInt('4e2').should.equal(4);
				convertToInt(' 1 ').should.equal(1);
				convertToInt('').should.equal('');
				convertToInt('  ').should.equal('  ');
				convertToInt(42.1).should.equal(42.1);
				convertToInt('1a').should.equal('1a');
				convertToInt('4e2a').should.equal('4e2a');
				convertToInt({ my: 'object' }).should.deep.equal({ my: 'object' });
				should.equal(convertToInt(null), null);
				should.equal(convertToInt(undefined), undefined);
				should.equal(isNaN(convertToInt(NaN)), true);
			});
		});
	});

});


