'use strict';

import {serverPropsToName} from './../utils/utils';
import MopidyServer from './MopidyServer'
import {isInt, isLength} from 'validator';

var SERVERS = {};

const servers = {
	add: function({ name, host, port, mockApi }) {

		if (
			!isInt(port, { min: 1, max: 65535 }) ||
			!isLength(host, 1, 100) ||
			!isLength(name, 1, 100)
		) {
			throw new Error('Not valid name/host/port');
		}

		let serverId = serverPropsToName({ host, port });
		if(servers.exists({ id: serverId })) {
			return SERVERS[serverId]
		} else {
			SERVERS[serverId] = new MopidyServer({ host, port, name, mockApi });
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

	removeAllServers() {
		Object.keys(SERVERS).forEach(id => {
			servers.remove({ id });
		});
	},

	exists: function({ host, port, id }) {
		if (id) {
			return SERVERS.hasOwnProperty(id);
		} else if (host && port) {
			return SERVERS.hasOwnProperty(serverPropsToName({ host, port }));
		} else {
			throw new Error('Exists must be called with host and port, or id')
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
