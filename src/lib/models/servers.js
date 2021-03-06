'use strict';

import {serverPropsToName, uuid} from './../utils/utils';
import MopidyServer from './MopidyServer'

var SERVERS = {};

const servers = {
	/**
	 *
	 * @param host
	 * @param name
	 * @param port
	 * @param {boolean} addWithUniqueId Will add a server even though a server with same host/port exists.
	 * @returns {*}
	 */
	add: function({ host, port, name = '', addWithUniqueId = false }) {
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

	getId: function({ host, port }) {
		if (servers.exists({ host, port })) {
			return serverPropsToName({ host, port });
		} else {
			return null;
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
