

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

function handler_default_(str_output) {
	console.log(str_output)
}

var LOGR_= (function() {
	let _handler_log= undefined;
	let _Bint_tags= BigInt(0);
	let _Bint_toggled= BigInt(0);

	return {
		set handler(fx) {
			_handler_log= fx;
		},
		get tags() { return _Bint_tags; },
		set tags(obj) {
			_Bint_tags= obj;
		},
		// put : function(tag, label) {
		// 	let name= __name(tag);
		// 	_tags[name]= tag[name];
		// 	console.log(_tags);
		// },
		get toggled() { return _Bint_toggled; },
		set toggled(obj) {
			_Bint_toggled= tagsToBigInt_(_Bint_tags, obj);
			if (! _handler_log)
				_handler_log= handler_default_;
		},
		log : function(nr_logged, str_output) {
			if (! _handler_log)
				return false;
			
			let Bint_logged= BigInt(nr_logged)
			if ((Bint_logged & _Bint_toggled) === BigInt(0))
				return false;

			_handler_log(str_output);
			return true;
		}
	}
})();

//-------------------------------------------------------------------------------------------------

export { LOGR_ as LOGR, handler_default_ as console_logr };