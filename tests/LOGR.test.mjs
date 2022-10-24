
import { LOGR as LOGR_, console_logr as console_logr_ } from '../src/bitlogger.mjs';

var options= {
	logr : {
		CXNS : 1,
		MSGE : 1,
		DUPS : 0,
		RELF : 1,
	}
}

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

LOGR_.toggled= options.logr;
console.log('LOGR_.toggled', LOGR_.toggled.toString(2) );
console.log()

// ----

LOGR_.log(l_.CXNS, 'YES');
console.log()

LOGR_.log(l_.DUPS, 'NO');
console.log()

//-------------------------------------------------------------------------------------------------

const ll_= {
	DEL : 0b1 << 0,		// removed
	CXNS : 0b1 << 2,	// connections
}

LOGR_.tags= ll_;
console.log('LOGR_.tags', LOGR_.tags);

LOGR_.toggled= options.logr;
console.log('LOGR_.toggled', LOGR_.toggled.toString(2) );
console.log()

// ----

LOGR_.log(ll_.DEL, 'NO');
console.log()

LOGR_.log(ll_.CXNS, 'YES');
console.log()

//-------------------------------------------------------------------------------------------------

// let ignore;
// let v;

// ignore= 1;
// v= 0;
// console.log ( ignore || v );

// ignore= 1;
// v= 1;
// console.log ( ignore || v );

// ignore= 0;
// v= 0;
// console.log ( ignore || v );

// ignore= 0;
// v= 1;
// console.log ( ignore || v );

//-------------------------------------------------------------------------------------------------
