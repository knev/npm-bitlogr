
import { LOGR, l_array } from '../dist/logr.es.mjs';

const LOGR_ = LOGR.get_instance();
const logr_ = LOGR_.create({ 
	labels: {
		CXNS : 0b1 << 2,	// connections
		EVENTS : 0b1 << 3,
		HANDLERS : 0b1 << 4,
	}
});
const l_= logr_.l;

// console.log(logr_.lref.get())

LOGR_.toggle(l_, {
		EVENTS : true
	})

function log_as_member() {
	// console.warn('logr_', logr_)
	// console.warn('LOGR.toggled', LOGR_.toggled)
	// console.warn('logr_.l', logr_.l.get())
	// console.warn('l_.CXNS', l_.CXNS)
	// console.warn('l_.EVENTS', l_.EVENTS)

	logr_.log(l_.CXNS, () => ["module: log_as_member(): log of an CXNS, value of:", l_.CXNS]);
	logr_.log(l_.EVENTS, () => ["module: log_as_member(): log of an EVENT, value of:", l_.EVENTS]);
}

export {
	log_as_member,
	logr_
}
