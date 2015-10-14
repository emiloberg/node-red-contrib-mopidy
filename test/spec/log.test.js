//const chai = require('chai');
//chai.should();
////const should = chai.should();
//chai.use(require('chai-things'));
//
//var rewire = require('rewire');
//
//var logRewired = rewire('../../lib/lib/utils/log');
//
//
//
////var rewire = require('rewire'),
////	foobar = rewire('./foobar'); // Bring your module in with rewire
////
////describe("private_foobar1", function() {
////
////	// Use the special '__get__' accessor to get your private function.
////	var private_foobar1 = foobar.__get__('private_foobar1');
////
////	it("should do stuff", function(done) {
////		var stuff = private_foobar1(filter);
////		should(stuff).be.ok;
////		should(stuff).....
//
//
//describe.only('log', () =>{
//
//		describe('When log folder already exists', () =>{
//
//			//logRewired.__set__('logDir', './logs');
//			var privateCreateLogDir = logRewired.__get__('createLogDir');
//
//			it('should not create a new log folder', () => {
//				var boll = privateCreateLogDir();
//				console.log('APA: ' + boll);
//				var apa = 1;
//				apa.should.eql(1);
//			});
//
//		});
//
//
//
//});
//
//
