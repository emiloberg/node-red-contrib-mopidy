//var Promise = require('promise');
var Mopidy = require('mopidy');
import {EventEmitter} from 'events';
//import {inspect, saveFile} from '../utils/debug';

export default class MopidyApi {
	constructor({ host, port, mockApi }) {
		this._MOPIDY_API = mockApi || {};
		this.events = new EventEmitter();

		if (mockApi) {
			this._MOPIDY_API = mockApi;
			return;
		}

		this._mopidy = new Mopidy({
			webSocketUrl:      `ws://${host}:${port}/mopidy/ws/`,
			callingConvention: 'by-position-or-by-name'
		});

		this._mopidy.on('state:online', () => {
			this._mopidy._send({method: 'core.describe'})
			.then(data => {
				this._MOPIDY_API = data;
				this.events.emit('loaded:loaded');
			})
			.catch(err => {
				throw new Error('Error when getting core.descibe from Mopidy Server ' + err);
			})
		});
	}

	getCategories() {
		let categories = {};
		Object.keys(this._MOPIDY_API).forEach(key => {
			categories[key.split('.')[1]] = true;
		});
		return Object.keys(categories).map(key => key)
	}

	getMethods({ category = null } = {}) {
		let methods = Object.keys(this._MOPIDY_API).map(key => {
			return {
				method: key,
				category: key.split('.')[1],
				description: this._MOPIDY_API[key].description,
				params: this._MOPIDY_API[key].params
			};
		});
		if (category) {
			methods = methods.filter(met => met.category === category);
		}
		return methods;
	}

	_wipeApi() {
		this._MOPIDY_API = {};
	}

	get mopidy() { return this._mopidy }

}
