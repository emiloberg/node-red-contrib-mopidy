const chai = require('chai');
chai.should();
//const should = chai.should();
chai.use(require('chai-things'));

import {serverPropsToName} from '../../lib/lib/utils/utils';

describe('Utils', () =>{

	describe('serverPropsToName', () =>{

		describe('When given host and port', () =>{

			it('should return a correct id', () => {
				serverPropsToName({ host: '192.168.0.1', port: '1234'})
					.should.eql('192.168.0.1:1234');
			});

		});

	});

});


