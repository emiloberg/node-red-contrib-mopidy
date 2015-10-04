'use strict';

const config = {
	showMopidyErrorsInConsole: false
};


if (process.env.NRMOPIDY_MOPIDY_ERRORS_IN_CONSOLE === 'true') {
	config.showMopidyErrorsInConsole = true;
}

export default config;
