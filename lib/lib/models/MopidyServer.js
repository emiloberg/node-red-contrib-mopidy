var Promise = require('promise');
var Mopidy = require('mopidy');
import {EventEmitter} from 'events';
//import {inspect, saveFile} from '../utils/debug';
import {serverPropsToName} from '../utils/utils';
import log from '../utils/log';
import {snakeToCamel} from '../utils/utils';

export default class MopidyServer {
	constructor({ host, port, name, mockApi }) {
		this._host = host;
		this._port = port;
		this._name = name;
		this.mopidyApi = mockApi || {};

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
			//console.log('Got websocket error');
			// TODO, send this info to the front end, eg when trying to configure a new out node
		});

		this._mopidy.on('state:online', () => {
			this._mopidy._send({method: 'core.describe'})
			.then(data => {
				this.mopidyApi = data;
				this.events.emit('ready:ready');
			})
			.catch(err => {
				throw new Error('Error when getting core.descibe from Mopidy Server ' + err);
			})
		});

	}

	set mopidyApi(api) {
		var newApi = {};

		// Translate snake_method_names to camelCase
		Object.keys(api).forEach(function(key) {
			newApi[snakeToCamel({ name: key })] = api[key];
		});

		// Translate params default value to human readable
		Object.keys(newApi).forEach(function(key) {
			newApi[key].params = newApi[key].params.map((param) => {
				if (param.hasOwnProperty('default')) {
					if (param.default === null) {
						param.friendlyDefault = 'null';
					} else if (param.default === true) {
						param.friendlyDefault = 'true';
					} else if (param.default === false) {
						param.friendlyDefault = 'false';
					}
				}
				return param;
			});
		});

		this._MOPIDY_API = newApi;
	}

	get host() { return this._host; }
	get port() { return this._port; }
	get name() { return this._name; }
	get readyState() {
		return this._mopidy._webSocket.readyState === 1;
	}
	get id() { return serverPropsToName({ host: this._host, port: this._port}); }

	close() {
		this._mopidy.close();
		this._mopidy.off();
		this._mopidy = null;
	}

	_getMethods() {
		return Object.keys(this._MOPIDY_API).map(key => {
			return {
				method: key,
				category: key.split('.')[1],
				description: this._MOPIDY_API[key].description,
				params: this._MOPIDY_API[key].params
			};
		});
	}

	getMethods() {
		return new Promise((resolve, reject) => {
			if (this.readyState) {
				resolve(this._getMethods());
			} else {
				setTimeout(() => {
					reject({ message: 'Could not connect to Mopidy Server' })
				}, 5000);

				this.events.once('ready:ready', () => {
					resolve(this._getMethods());
				});
			}
		});
	}



	_wipeApi() {
		this._MOPIDY_API = {};
	}

	get mopidy() { return this._mopidy }

}
