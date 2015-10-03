'use strict';

const config = {
	showMopidyErrorsInConsole: true
};


if (process.env.NRMOPIDY_MOPIDY_ERRORS_IN_CONSOLE === 'false') {
	config.showMopidyErrorsInConsole = false;
}

export default config;
