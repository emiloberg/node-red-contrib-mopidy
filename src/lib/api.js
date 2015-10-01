'use strict';

var Promise = require('promise');
var Mopidy = require("mopidy");
var mopidy = new Mopidy({
	webSocketUrl: "ws://pi-speaker-one.local:6680/mopidy/ws/",
	callingConvention: "by-position-or-by-name"
});

let MOPIDY_API = {};



const api = {
	add(api) {
		MOPIDY_API = api;
		return MOPIDY_API;
	},

	get() {
		return MOPIDY_API;
	},

	mopidy: mopidy,

	initApi() {
		return new Promise((resolve, reject) => {
			mopidy._send({method: "core.describe"})
				.then(function (data) {
					MOPIDY_API = data;
					resolve(data);
				})
				.catch(err => {
					reject(err)
				});
		});
	},

	getCategories() {
		let categories = {};
		Object.keys(MOPIDY_API).forEach(key => {
			categories[key.split('.')[1]] = true;
		});
		return Object.keys(categories).map(key => key)
	},

	getMethods({ category = null } = {}) {
		let methods = Object.keys(MOPIDY_API).map(key => {
			return {
				method: key,
				category: key.split('.')[1],
				description: MOPIDY_API[key].description,
				params: MOPIDY_API[key].params
			};
		});

		if (category) {
			methods = methods.filter(met => met.category === category);
		}

		return methods;

	}
};

export default api;
