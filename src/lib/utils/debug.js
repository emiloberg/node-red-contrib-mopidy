'use strict';

import * as eyes from 'eyes';
var fs = require('fs');

export function inspect(something) {
	console.log(eyes.inspect(something));
}

export function saveFile(fileName, fileContent) {
	fs.writeFile(fileName, fileContent, 'utf-8', function(err) {
		if(err) {
			throw new Error('Could not write file ' + fileName);
		}
	});
}
