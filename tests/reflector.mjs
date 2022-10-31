
import { BitLogr, l_LL, l_RR } from '../src/logr.mjs';

let LOGR_= new BitLogr();

//-------------------------------------------------------------------------------------------------

const REFL= 0b1 << 1;	// reflection

const ll_= {
	DEL : 0b1 << 0,		// removed
	MsgCache : 0b1 << 2,	// connections
}
console.log(ll_);

const l_ = {
	CXNS : 0b1 << 0,	// connections
	DUPS : 0b1 << 2,	// duplicates
	MSGE : 0b1 << 3,	// MsgEnv
	... l_RR( l_LL(ll_, 8), 4)
}

// LOGR_.put({REFL}, 'FL');

LOGR_.labels= l_;
console.log('LOGR_.labels', LOGR_.labels);

LOGR_.log(l_.CXNS, 'NOP');


//-------------------------------------------------------------------------------------------------

function exec(options) {
	LOGR_.toggled= options.logr;
	console.log('LOGR_.toggled', LOGR_.toggled.toString(2) );
	console.log()

	console.log('LOGR_.labels', LOGR_.labels);

	LOGR_.log(l_.CXNS, 'YES');
	console.log()

	LOGR_.log(l_.DUPS, 'NO');
	console.log()
}

//-------------------------------------------------------------------------------------------------

export { exec };