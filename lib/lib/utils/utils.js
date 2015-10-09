'use strict';

export function serverPropsToName({ host, port }) {
	return `${host}:${port}`;
}
export function snakeToCamel({ name }) {
	return name.replace(/(_[a-z])/g, function (match) {
		return match.toUpperCase().replace('_', '');
	});
}
