'use strict';

import {serverPropsToName, uuid} from './../utils/utils';
import MopidyServer from './MopidyServer'
import {isInt, isLength} from 'validator';

var SERVERS = {};

//setInterval(function () {
//	Object.keys(SERVERS).forEach((serverKey) => {
//		console.log(SERVERS[serverKey].name);
//	});
//	console.log('------------');
//}, 1000);

const servers = {
	/**
	 *
	 * @param name
	 * @param host
	 * @param port
	 * @param {boolean} addWithUniqueId Will add a server even though a server with same host/port exists.
	 * @returns {*}
	 */
	add: function({ name, host, port, addWithUniqueId = false }) {

		if (
			!isInt(port, { min: 1, max: 65535 }) ||
			!isLength(host, 1, 100) ||
			!isLength(name, 1, 100)
		) {
			throw new Error('Not valid name/host/port');
		}

		let serverId = addWithUniqueId ? uuid() : serverPropsToName({ host, port });
		if(servers.exists({ id: serverId })) {
			return SERVERS[serverId]
		} else {
			SERVERS[serverId] = new MopidyServer({ host, port, name, serverId });
			return SERVERS[serverId];
		}
	},

	remove({ host, port, id }) {
		let serverId = id || serverPropsToName({ host, port });
		if (SERVERS.hasOwnProperty(serverId)) {
			SERVERS[serverId].close();
			delete SERVERS[serverId];
			return true;
		} else {
			return false;
		}
	},

	removeAll() {
		Object.keys(SERVERS).forEach(id => {
			servers.remove({ id });
		});
	},

	exists: function({ host, port, id }) {
		if (id) {
			return SERVERS.hasOwnProperty(id);
		} else if (host && port) {
			return SERVERS.hasOwnProperty(serverPropsToName({ host, port }));
		}
	},

	get: function({ id }) {
		return SERVERS[id];
	},

	getAll: function() {
		return Object.keys(SERVERS).map((key) => SERVERS[key]);
	}
};

export default servers;
