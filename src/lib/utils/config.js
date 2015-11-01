'use strict';

var deepmerge = require('deepmerge');

let CONFIG = {};

const configDefaults = {
	mopidyConnectTimeout: 5
};

const config = {
	setup: function({ settings = {} } = {}) {
		CONFIG = deepmerge(configDefaults, settings);
	},
	
	fetch: function(setting) {
		return CONFIG[setting];	
	}
};

export default config;
