'use strict';

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
	console.log(str_output);
}

//-------------------------------------------------------------------------------------------------

var LOGR_= (function() {
	let _handler_log= handler_default_;
	let _Bint_tags= BigInt(0);
	let _Bint_toggled= BigInt(0);

	function containsSubsetOf_empty(Bint_toggled, nr_logged, str_output) {
		// console.log('NOP')
	}
	
	function containsSubsetOf(nr_logged, str_output) {
		if (( BigInt(nr_logged) & _Bint_toggled) === BigInt(0))
			return false;
	
		_handler_log(str_output);
		return true;
	}
	
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
			this.log= containsSubsetOf;
		},
		log : containsSubsetOf_empty
	}
})();

exports.LOGR = LOGR_;
