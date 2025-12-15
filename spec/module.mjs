
import { LOGR } from '../dist/logr.es.mjs';

const l_= {
	CXNS : 0b1 << 2,	// connections
	EVENTS : 0b1 << 3,
	HANDLERS : 0b1 << 4,
}

const LOGR_ = LOGR.get_instance();
const logr_ = LOGR_.create({ labels: l_ });

LOGR_.toggle(l_, {
		EVENTS : true
	})

function log_as_member() {
	// console.warn('LOGR.toggled', LOGR_.toggled)
	// console.warn('logr_', logr_)

	logr_.log(l_.CXNS, () => ["module: log_as_member(): log of an CXNS"]);
	logr_.log(l_.EVENTS, () => ["module: log_as_member(): log of an EVENT"]);
}

export {
	l_ as l,
	log_as_member
}

