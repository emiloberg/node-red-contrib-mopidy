var babel = require('babel');

module.exports = function (wallaby) {
	return {
		files: [
			'lib/*.js',
			'lib/**/*.js',
			'test/_resources/*',
			'test/*.js',
			'node_modules/node-red/*.js',
			'node_modules/node-red/**/*.js',
			'node_modules/node-red/*.json',
			'node_modules/node-red/**/*.json',
			'!node_modules/**/test/*.js',
			'!node_modules/**/test/**/*.js'
		],
		tests: [
			'test/spec/*.test.js',
			'!test/spec/*.server.test.js'
		],
		testFramework: 'mocha',
		debug: false,
		compilers: {
			'lib/*.js': wallaby.compilers.babel({ babel: babel, stage: 1 }),
			'lib/**/*.js': wallaby.compilers.babel({ babel: babel, stage: 1 }),
			'test/spec/*.js': wallaby.compilers.babel({ babel: babel, stage: 1 })
		},
		env: {
			type: 'node'
		},
		workers: {
			initial: 1,
			regular: 1
		}
	};
};
