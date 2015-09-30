'use strict';

let API;

const apiViewModel = {
	add(api) {
		API = api;
	},

	get() {
		return API;
	},

	getCategories() {
		let categories = {};
		Object.keys(API).forEach(key => {
			categories[key.split('.')[1]] = true;
		});
		return Object.keys(categories).map(key => key)
	},

	getMethods({ categoryName = null, methodName = null } = {}) {
		let methods = Object.keys(API).map(key => {
			const categoryName = key.split('.')[1];
			const methodName = key.split('.')[2];
			return {
				method: key,
				categoryName: categoryName,
				methodName: methodName,
				description: API[key].description,
				params: API[key].params
			};
		});

		if (categoryName) {
			methods = methods.filter(met => met.categoryName === categoryName);
		}

		if (methodName) {
			methods = methods.filter(met => met.methodName === methodName);
		}

		return methods;

	}
};

export default apiViewModel;
