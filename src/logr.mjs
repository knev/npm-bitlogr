
// https://stackoverflow.com/questions/4602141/variable-name-as-a-string-in-javascript
const __name = obj => Object.keys(obj)[0];
// console.log('OUT', __name({variableName}) );

function labelsToBigInt_(ref, obj, ignore= false) {
	let bigInt = BigInt(0);
	for (const [t,v] of Object.entries(obj)) {
		if ( ( ignore || v ) && ref[t])
			bigInt|= BigInt( ref[t] );			
		// console.log('0b'+ bigInt.toString(2) );
	}
	return bigInt;
}

function l_LL(obj, x) {
	let obj_new= {}
	for (var [k,v] of Object.entries(obj))
		obj_new[k]= v<<x;
	return obj_new;
}

function l_RR(obj, x) {
	let obj_new= {}
	for (var [k,v] of Object.entries(obj))
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

		BitLogr.prototype['log']= function (nr_logged, /* ... */ ) {
			// console.log('NOP')
		}
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
		this._Bint_toggled= labelsToBigInt_(this._Bint_labels, obj);

		BitLogr.prototype['log']= function (nr_logged, /* ... */ ) {
			if ( (BigInt(nr_logged) & this._Bint_toggled) === BigInt(0))
				return false;
		
			var args = Array.prototype.slice.call(arguments);
			args.shift(); // remove first arg: nr_logged
			this._handler_log.apply(this, args);
	
			return true;
		}
	}

	// log= function (nr_logged, /* ... */ ) {}
}

//-------------------------------------------------------------------------------------------------

export { BitLogr, l_LL, l_RR };