'use strict';

import {serverPropsToName} from '../utils/utils';
import MopidyApi from './MopidyApi';

export default class MopidyServer {
	constructor({ host, port, name, mockApi }) {
		this._host = host;
		this._port = port;
		this._name = name;
		this._mopidy = new MopidyApi({ host, port, mockApi });
	}

	get host() { return this._host; }
	get port() { return this._port; }
	get name() { return this._name; }
	get mopidy() { return this._mopidy; }
	get id() {
		return serverPropsToName({ host: this._host, port: this._port});
	}
}
