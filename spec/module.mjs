
// import { LOGR } from '@knev/bitlogr';
import { LOGR } from '../src/logr.mjs';

let LOGR_ = LOGR.instance();
const l_= {
	EVENTS : 0b1 << 3,
	HANDLERS : 0b1 << 4,
}
LOGR_.labels= l_;

const local_log_ = LOGR_.log;

function log_as_member() {
	local_log_(l_.EVENTS, () => ["module: log_as_member(): log of an EVENT"]);
}

export {
	LOGR_ as LOGR,
	l_ as l,
	log_as_member
}

