
// https://stackoverflow.com/questions/4602141/variable-name-as-a-string-in-javascript
const __name = obj => Object.keys(obj)[0];
// console.log('OUT', __name({variableName}) );

function l_toBigInt_(ref, obj, ignore= false) {
	console.assert(ref !== BigInt(0), 'no labels initialized');
	let bigInt = BigInt(0);
	for (const [k,v] of Object.entries(obj)) {
		if ( ( ignore || v ) && ref[k])
			bigInt|= BigInt( ref[k] );			
		// console.log('0b'+ bigInt.toString(2) );
	}
	return bigInt;
}

function l_LL_(obj, x) {
	const obj_new= {}
	for (const [k,v] of Object.entries(obj))
		obj_new[k]= v<<x;
	return obj_new;
}

function l_RR_(obj, x) {
	const obj_new= {}
	for (const [k,v] of Object.entries(obj))
		obj_new[k]= v>>x;
	return obj_new;
}

//-------------------------------------------------------------------------------------------------

function handler_default_( /* ... */ ) {
	// https://stackoverflow.com/questions/18746440/passing-multiple-arguments-to-console-log
	var args = Array.prototype.slice.call(arguments);
	console.log.apply(console, args);
}

//-------------------------------------------------------------------------------------------------
	
class BitLogr {
	constructor() {
		this._handler_log= handler_default_;
		this._Bint_labels= BigInt(0);
		this._Bint_toggled= BigInt(0);

        // Define a standalone NOP function
        this._nopLog = () => false;
        this.log = this._nopLog; // Default to standalone NOP
	}

	set handler(fx) {
		this._handler_log= fx;
	}

	get labels() { return this._Bint_labels; }
	set labels(obj) {
		this._Bint_labels= obj;
		this._Bint_toggled= BigInt(0);
	}

	// put= function(label, abbrv) {
	// 	let name= __name(label);
	// 	_labels[name]= label[name];
	// 	console.log(_labels);
	// }

	get toggled() { return this._Bint_toggled; }
	set toggled(obj) {
		this._Bint_toggled= l_toBigInt_(this._Bint_labels, obj);

        if (this._Bint_toggled === BigInt(0)) {
            this.log = () => false; // Reset to lightweight NOP
        } 
		else {
            const self = this; // Avoid repeated 'this' lookups
            this.log = function(nr_logged, /* ... */) {
				if ( (BigInt(nr_logged) & this._Bint_toggled) === BigInt(0))
					return false;
			
				var args = Array.prototype.slice.call(arguments);
				args.shift(); // remove first arg: nr_logged
				this._handler_log.apply(this, args);
		
				return true;
			}
		}
	}

	// log= function (nr_logged, /* ... */ ) {}
}

//-------------------------------------------------------------------------------------------------

export { 
	BitLogr, 
	l_LL_ as l_LL, 
	l_RR_ as l_RR,
};