const fs = require('fs');
const path = require('path');
const winston = require('winston');
winston.emitErrs = true;

const logDir = path.join(__dirname, '../../../logs');



function createLogFolder() {
	if ( !fs.existsSync(logDir) ) {
		fs.mkdirSync(logDir);
	}
}
createLogFolder();

var log = new winston.Logger({
	levels: {
		emerg:   0,
		alert:   1,
		crit:    2,
		error:   3,
		warning: 4,
		notice:  5,
		info:    6,
		debug:   7
	},
	transports: [
		new winston.transports.File({
			level: 'debug',
			filename: path.join(logDir, 'debug-NRCAM.log'),
			handleExceptions: true,
			json: true,
			maxsize: 5242880, //5MB
			maxFiles: 5,
			colorize: false
		})
		//new winston.transports.Console({
		//	level: 'debug',
		//	handleExceptions: true,
		//	json: false,
		//	colorize: true
		//})
	],
	exitOnError: false
});

module.exports = log;
