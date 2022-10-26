
import { BitFlagLogger } from '../src/logr.mjs';

let LOGR_= new BitFlagLogger();

//-------------------------------------------------------------------------------------------------

const REFL= 0b1 << 1;	// reflection

const l_ = {
	CXNS : 0b1 << 0,	// connections
	DUPS : 0b1 << 2,	// duplicates
	MSGE : 0b1 << 3,	// MsgEnv
}

// LOGR_.put({REFL}, 'FL');

LOGR_.tags= l_;
console.log('LOGR_.tags', LOGR_.tags);

LOGR_.log(l_.CXNS, 'NOP');


//-------------------------------------------------------------------------------------------------

function exec(options) {
	LOGR_.toggled= options.logr;
	console.log('LOGR_.toggled', LOGR_.toggled.toString(2) );
	console.log()

	console.log('LOGR_.tags', LOGR_.tags);

	LOGR_.log(l_.CXNS, 'YES');
	console.log()

	LOGR_.log(l_.DUPS, 'NO');
	console.log()
}

//-------------------------------------------------------------------------------------------------

export { exec };