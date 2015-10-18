const chai = require('chai');
chai.should();
chai.use(require('chai-things'));

const rewire = require('rewire');
const REWIRED_LOG = rewire('../../lib/lib/utils/log');

const createLogFolder = REWIRED_LOG.__get__('createLogFolder');

describe('log', () =>{

	describe('createLogFolder', () =>{

		describe('Given that log folder exists', () =>{
			let mkdirSyncCalled = false;
			const fsMock = {
				existsSync: function () { return true; },
				mkdirSync: function() { mkdirSyncCalled = true; }
			};
			REWIRED_LOG.__set__('fs', fsMock);

			it('should not create log folder', () => {
				createLogFolder();
				mkdirSyncCalled.should.eql(false);
			});
		});

		describe('Given that log folder does not exists', () =>{
			let mkdirSyncCalled = false;
			const fsMock = {
				existsSync: function () { return false; },
				mkdirSync: function() { mkdirSyncCalled = true; }
			};
			REWIRED_LOG.__set__('fs', fsMock);

			it('should create log folder', () => {
				createLogFolder();
				mkdirSyncCalled.should.eql(true);
			});
		});

	});

});


