
import { BitLogr } from '../src/logr.mjs';

let LOGR_= new BitLogr();

//-------------------------------------------------------------------------------------------------

const l_= {
	DEL : 0b1 << 0,		// removed
	CXNS : 0b1 << 2,	// connections
}

LOGR_.labels= l_;
console.log('LOGR_.labels', LOGR_.labels);

//-------------------------------------------------------------------------------------------------

function exec(options) {
	LOGR_.toggled= options.logr;
	console.log('LOGR_.toggled', LOGR_.toggled.toString(2) );
	console.log()

	console.log('LOGR_.labels', LOGR_.labels);

	LOGR_.log(l_.DEL, 'NO');
	console.log()

	LOGR_.log(l_.CXNS, 'YES');
	console.log()
}

//-------------------------------------------------------------------------------------------------

export { exec };