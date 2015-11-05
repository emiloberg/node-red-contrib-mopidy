'use strict';
require('string.prototype.startswith');
import {isURL, isInt} from 'validator';

export function serverPropsToName({ host, port }) {
	return `${host}:${port}`;
}
export function snakeToCamel({ name }) {
	return name.replace(/(_[a-z])/g, function (match) {
		return match.toUpperCase().replace('_', '');
	});
}

export function uuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
}

export function betterIsInt(value) {
	return !isNaN(value) && parseInt(Number(value), 10) == value && !isNaN(parseInt(value, 10));
}

export function convertToInt(possibleInt) {
	return betterIsInt(possibleInt) ? parseInt(possibleInt, 10) : possibleInt;
}

export function cutCore(methodName) {
	if (methodName.startsWith('core.')) {
		return methodName.substring(5);
	}
	return methodName;
}

export function validateHostPort({ host, port }) {
	return isURL(host, { require_tld: false, require_valid_protocol: false }) && isInt(port, { min: 1, max: 65535 });
}

