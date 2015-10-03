'use strict';

export function serverPropsToName({ host, port }) {
	return `${host}:${port}`;
}
