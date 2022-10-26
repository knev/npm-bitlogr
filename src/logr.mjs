
// https://stackoverflow.com/questions/4602141/variable-name-as-a-string-in-javascript
const __name = obj => Object.keys(obj)[0];
// console.log('OUT', __name({variableName}) );

function tagsToBigInt_(ref, obj, ignore= false) {
	let bigInt = BigInt(0);
	for (const [t,v] of Object.entries(obj)) {
		if ( ( ignore || v ) && ref[t])
			bigInt|= BigInt( ref[t] );			
		// console.log('0b'+ bigInt.toString(2) );
	}
	return bigInt;
}

//-------------------------------------------------------------------------------------------------

function handler_default_( /* ... */ ) {
	// https://stackoverflow.com/questions/18746440/passing-multiple-arguments-to-console-log
	var args = Array.prototype.slice.call(arguments);
	console.log.apply(console, args);
}

//-------------------------------------------------------------------------------------------------
	
class BitFlagLogger {
	constructor() {
		this._handler_log= handler_default_;
		this._Bint_tags= BigInt(0);
		this._Bint_toggled= BigInt(0);

		BitFlagLogger.prototype['log']= function (nr_logged, /* ... */ ) {
			// console.log('NOP')
		}
	}

	set handler(fx) {
		this._handler_log= fx;
	}

	get tags() { return this._Bint_tags; }
	set tags(obj) {
		this._Bint_tags= obj;
		this._Bint_toggled= BigInt(0);
	}

	// put= function(tag, label) {
	// 	let name= __name(tag);
	// 	_tags[name]= tag[name];
	// 	console.log(_tags);
	// }

	get toggled() { return this._Bint_toggled; }
	set toggled(obj) {
		this._Bint_toggled= tagsToBigInt_(this._Bint_tags, obj);

		BitFlagLogger.prototype['log']= function (nr_logged, /* ... */ ) {
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

export { BitFlagLogger };