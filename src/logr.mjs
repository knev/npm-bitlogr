
// https://stackoverflow.com/questions/4602141/variable-name-as-a-string-in-javascript
const __name = obj => Object.keys(obj)[0];
// console.log('OUT', __name({variableName}) );

//-------------------------------------------------------------------------------------------------

function l_length_(obj_labels) {
    const labels = Object.values(obj_labels);
    if (labels.length === 0) 
		return 1; // Empty object case, start at 1

    const value_max = Math.max(...labels);
		if (value_max <= 0) return 1

    const bit_highest = Math.floor(Math.log2(value_max));
    return 1 << (bit_highest + 1);
}

function l_array_(arr_labels, start = 1) {
    return Object.freeze(arr_labels.reduce((acc, key, index) => {
        acc[key] = start << index;
        return acc;
    }, {}));
}

function l_concat_(obj_labels, arg) {
	if (Array.isArray(arg)) {
		const len = l_length_(obj_labels);
		const arr_labels_new = l_array_(arg, len);
		return l_concat_(obj_labels, arr_labels_new);
	}

	const next_pos = l_length_(obj_labels);
	const result = { ...obj_labels };
	const arg_entries = Object.entries(arg);

	let min_arg = Infinity;
	for (const [, value] of arg_entries) {
		if (value > 0 && value < min_arg) min_arg = value;
	}
    // Shift only if min_arg is less than next_pos
    const shift = min_arg === Infinity || min_arg >= next_pos 
        ? 0 
        : Math.floor(Math.log2(next_pos / min_arg));

	for (const [key, value] of arg_entries) {
		if (!(key in result)) {
			result[key] = value === 0 ? 0 : value << shift;
		}
	}

	return Object.freeze(result);
}

function l_merge_(obj_labels1, obj_labels2) {
    const result = { ...obj_labels1 }; // Start with first set unchanged
    const set_values = new Set(Object.values(obj_labels1)); // Track all used bit values
    
    // Find the highest bit position to start shifting from if needed
    const value_highest = Math.max(0, ...set_values);
    let next_shift = value_highest ? Math.floor(Math.log2(value_highest)) + 1 : 0;

    // Process second set
    for (const [key, value] of Object.entries(obj_labels2)) {
        if (key in result) {
            // Same key: Values must match
            console.assert(
                result[key] === value,
                `Key '${key}' has conflicting values: ${result[key]} (obj_labels1) vs ${value} (obj_labels2)`
            );
            // No action needed if values match, already in result
        } else {
            // New key: Add if value is unique, otherwise shift
            let value_new = value;
            while (set_values.has(value_new)) {
                value_new = 1 << next_shift++;
            }
            result[key] = value_new;
            set_values.add(value_new);
        }
    }
    
    return Object.freeze(result);
}

function l_LL_(obj, x) {
	const obj_new= {}
	for (const [k,v] of Object.entries(obj))
		obj_new[k]= v<<x;
	return Object.freeze(obj_new);
}

function l_RR_(obj, x) {
	const obj_new= {}
	for (const [k,v] of Object.entries(obj))
		obj_new[k]= v>>x;
	return Object.freeze(obj_new);
}

//-------------------------------------------------------------------------------------------------

function handler_default_( /* ... */ ) {
	// https://stackoverflow.com/questions/18746440/passing-multiple-arguments-to-console-log
	var args = Array.prototype.slice.call(arguments);
	console.log.apply(console, args);
}

//-------------------------------------------------------------------------------------------------
	
function l_toBigInt_(obj_labels, obj, ignore= false) {
	console.assert(obj_labels !== undefined, 'no labels initialized');
	let bigInt = BigInt(0);
	for (const [k,v] of Object.entries(obj)) {
		if ( ( ignore || v ) && obj_labels[k])
			bigInt|= BigInt( obj_labels[k] );			
		// console.log('0b'+ bigInt.toString(2) );
	}
	return bigInt;
}

// console.log(l_toBigInt_({},{}))

const LOGR = (function () {
	let _instance; // Private variable to hold the single instance

	function _create_instance() {
		// Private state (replacing constructor properties)
		let _handler_log = handler_default_;
		let _obj_labels = undefined;
		let _Bint_toggled = BigInt(0);

		function _log_fxn(nr_logged, argsFn /* args */) {
			if ((BigInt(nr_logged) & _Bint_toggled) === BigInt(0))
				return false;

			const args = argsFn();
			_handler_log.apply(this, args);
			// _handler_log.apply(this, args);
			return true;
		}

		return {
			set handler(fx) {
				_handler_log = fx;
			},
			get handler() {
				return _handler_log;
			},

			get labels() { return _obj_labels; },
			set labels(obj) {
				_obj_labels = obj;
				_Bint_toggled = BigInt(0);
			},

			// put= function(label, abbrv) {
			// 	let name= __name(label);
			// 	_labels[name]= label[name];
			// 	console.log(_labels);
			// }

			get toggled() { return _Bint_toggled; },
			set toggled(obj_toggled) {
				_Bint_toggled= l_toBigInt_(_obj_labels, obj_toggled);
			},

			log(nr_logged, argsFn) {
				// Ensure LOGR_ENABLED is defined (for testing purposes)
				if (typeof LOGR_ENABLED === 'undefined') {
					console.warn('LOGR_ENABLED not defined, defaulting to true');
					global.LOGR_ENABLED = true;
				}
				if (! LOGR_ENABLED) 
					return undefined;
				
                return _log_fxn.call(this, nr_logged, argsFn); // Pass the thunk
            }
		};
	}

	// Public interface
	return {
		instance() {
			if (!_instance) {
				_instance = _create_instance(); // Lazy initialization
			}
			return _instance;
		}
	};

})();

// Usage example:
// const logr = LOGR.instance();
// logr.labels = BigInt(42);
// console.log(logr.labels); // BigInt(42)
// console.log(logr.toggled); // BigInt(0)

// const logr2 = LOGR.instance();
// console.log(logr === logr2);

//-------------------------------------------------------------------------------------------------

export { 
	LOGR, 
	l_length_ as l_length,
	l_array_ as l_array,
	l_concat_ as l_concat,
	l_merge_ as l_merge,
	l_LL_ as l_LL, 
	l_RR_ as l_RR,
};