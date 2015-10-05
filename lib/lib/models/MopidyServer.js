//var Promise = require('promise');
var Mopidy = require('mopidy');
import {EventEmitter} from 'events';
import {inspect, saveFile} from '../utils/debug';
import {serverPropsToName} from '../utils/utils';
import log from '../utils/log';

export default class MopidyServer {
	constructor({ host, port, name, mockApi }) {
		this._host = host;
		this._port = port;
		this._name = name;
		this._MOPIDY_API = mockApi || {};
		this.events = new EventEmitter();

		if (mockApi) {
			this._MOPIDY_API = mockApi;
			this._mopidy = {
				on: function() {}
			};
			return;
		} else {
			this._mopidy = new Mopidy({
				webSocketUrl:      `ws://${host}:${port}/mopidy/ws/`,
				callingConvention: 'by-position-or-by-name',
				console:           {
					warn: log.debug
				}
			});
		}

		this._mopidy.on('websocket:error', () => {
			console.log('Got websocket error');
		});

		this._mopidy.on('state:online', () => {
			this._mopidy._send({method: 'core.describe'})
			.then(data => {
				this._MOPIDY_API = data;
				this.events.emit('ready:ready');
			})
			.catch(err => {
				throw new Error('Error when getting core.descibe from Mopidy Server ' + err);
			})
		});

	}

	get host() { return this._host; }
	get port() { return this._port; }
	get name() { return this._name; }
	get readyState() { return this._mopidy._webSocket.readyState; }
	get id() { return serverPropsToName({ host: this._host, port: this._port}); }

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
