const EventEmitter = require('events').EventEmitter;
const ee = new EventEmitter();
ee.setMaxListeners(0);

const events = {
	ee
};

export default events;
