var Promise = require('promise');
var Mopidy = require('mopidy');
import {EventEmitter} from 'events';
//import {inspect, saveFile} from '../utils/debug';
import log from '../utils/log';
import {snakeToCamel, convertToInt, cutCore} from '../utils/utils';
var objectPath = require('object-path');

export default class MopidyServer {
	constructor({ host, port, serverId, name = '' }) {
		this._host = host;
		this._port = port;
		this._name = name;
		this._id = serverId;
		this.events = new EventEmitter();
		this._mopidy = new Mopidy({
			webSocketUrl:      `ws://${host}:${port}/mopidy/ws/`,
			callingConvention: 'by-position-or-by-name',
			console:           {
				warn: log.debug
			}
		});

		this.events.setMaxListeners(0);

		this._mopidy.on('state:online', () => {
			this._mopidy._send({method: 'core.describe'})
			.then(data => {
				this.mopidyApi = data;
				this.events.emit('ready:ready');
			});
		});

	}

	invokeMethod({ method, params = {} }) {

		if (this.methodExist(method) === false) {
			return Promise.reject(`Method '${method}' does not exist`);
		}

		// Remove empty params
		var newParams = {};
		Object.keys(params).forEach((key) => {
			if (params[key] !== '') {
				newParams[key] = convertToInt(params[key]);
			}
		});

		return MopidyServer._executeFunctionByName(method, this._mopidy, newParams);
	}

	/**
	 * Run a function from it's name in a string. String may be namedspaced,
	 * e.g. 'My.Deeply.Nested.Func'
	 *
	 * @param functionName
	 * @param context Which namespace to look for functionName in
	 * @param {...} arguments Arguments which will be applied to function
	 * @returns {*}
	 * @private
	 */
	static _executeFunctionByName(functionName, context /*, args */) {
		var args = [].slice.call(arguments).splice(2);
		var namespaces = functionName.split('.');
		var func = namespaces.pop();
		for(var i = 0; i < namespaces.length; i++) {
			context = context[namespaces[i]];
		}
		return context[func].apply(this, args);
	}

	methodExist(method) {
		return this._MOPIDY_API[method] !== undefined;
	}

	set mopidyApi(api) {
		var newApi = {};

		// Translate snake_method_names to camelCase
		Object.keys(api).forEach(function(key) {
			newApi[snakeToCamel({ name: cutCore(key) })] = api[key];
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

	get name() { return this._name; }
	get host() { return this._host; }
	get port() { return this._port; }
	get readyState() {
		return objectPath.get(this, '_mopidy._webSocket.readyState', 0) === 1;
	}
	get id() { return this._id; }

	close() {
		if ('_mopidy' in this) {
			if ('close' in this._mopidy) {
				this._mopidy.close();
			}
			if ('off' in this._mopidy) {
				this._mopidy.off();
			}
		}
		this._mopidy = null;
		this._MOPIDY_API = {};
	}

	_getMethods() {
		return Object.keys(this._MOPIDY_API).map(key => {
			return {
				method: key,
				category: key.split('.')[0],
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
					reject({ message: 'Could not connect to Mopidy Server, incorrect host/port?' })
				}, 5000);

				this.events.once('ready:ready', () => {
					resolve(this._getMethods());
				});
			}
		});
	}

	get mopidy() { return this._mopidy }

}
