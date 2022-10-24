
import { LOGR } from '../src/bitlogger.mjs';

var options= {
	logr : {
		CXNS : 1,
		MSGE : 1,
		DUPS : 1
	}
}

//-------------------------------------------------------------------------------------------------

const l_ = {
	CXNS : 0b1 << 0,	// connections
	REFL : 0b1 << 1,	// reflection
	DUPS : 0b1 << 2,	// duplicates
	MSGE : 0b1 << 3,	// MsgEnv
}

LOGR.tags= l_;

// ----

// LOGR_.put({CXNS}, 'XN');
// LOGR_.put({REFL}, 'FL');

LOGR.logr= options.logr;
console.log()

// LOGR.log(l_.CXNS, 'YES');
// console.log()

// LOGR.log(l_.REFL, 'NO');
// console.log()

// let bigInt = BigInt(0);
// console.log(bigInt);

// bigInt|= BigInt(l_.MSGE);
// console.log(bigInt);

function tagsToBigInt(obj) {
	let bigInt = BigInt(0);
	for (const [t,v] of Object.entries(obj)) {
		if (v)
			bigInt|= BigInt( l_[t] );			
		// console.log('0b'+ bigInt.toString(2) );
	}
	return bigInt;
}

let x= tagsToBigInt(options.logr);
console.log(x.toString(2));

//-------------------------------------------------------------------------------------------------

const ll_= {
	DEL : 0b1 << 0,		// removed
	CXNS : 0b1 << 3,	// connections
}

// LOGR.tags= ll_;

// LOGR.log(l_.DEL, 'YES');
// console.log()

// LOGR.log(l_.MSGE, 'NO');
// console.log()
