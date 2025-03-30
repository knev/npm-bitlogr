
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

//-------------------------------------------------------------------------------------------------

function l_length_(obj_labels) {
    const labels = Object.values(obj_labels);
    if (labels.length === 0) 
		return 1; // Empty object case, start at 1

    const value_max = Math.max(...labels);
    const bit_highest = Math.floor(Math.log2(value_max));
    return 1 << (bit_highest + 1);
}

function l_array_(arr_labels, start = 1) {
    return Object.freeze(arr_labels.reduce((acc, key, index) => {
        acc[key] = start << index;
        return acc;
    }, {}));
}

function l_concat_(...objs_labels) {
    const result = {};
    for (const obj_labels of objs_labels)
        for (const [key, value] of Object.entries(obj_labels))
            if (!(key in result))
                result[key] = value;

	return Object.freeze(result);
}

function l_concat_array_(obj_labels, arr_labels) {
    const len = l_length_(obj_labels);
    const arr_labels_new = l_array_(arr_labels, len);
    return l_concat_(obj_labels, arr_labels_new);
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
	
class LOGR {
	constructor() {
		this._handler_log= handler_default_;
		this._Bint_labels= BigInt(0);
		this._Bint_toggled= BigInt(0);

        // Define a standalone NOP function
        this._nopLog = () => {};
        this._log_fxn = this._nopLog; // Default to standalone NOP
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

	getLogger(obj) {
		if (obj === undefined)
			return this._log_fxn.bind(this);

		this._Bint_toggled= l_toBigInt_(this._Bint_labels, obj);

		if (this._Bint_toggled === BigInt(0)) {
            this._log_fxn = () => {}; // Reset to lightweight NOP
			return this._log_fxn.bind(this);
		}

		const self = this; // Avoid repeated 'this' lookups
		this._log_fxn = function(nr_logged, /* ... */) {
			if ( (BigInt(nr_logged) & this._Bint_toggled) === BigInt(0))
				return false;
		
			var args = Array.prototype.slice.call(arguments);
			args.shift(); // remove first arg: nr_logged
			this._handler_log.apply(this, args);
	
			return true;
		}
		return this._log_fxn.bind(this);
	}

	get toggled() { return this._Bint_toggled; }

}

//-------------------------------------------------------------------------------------------------

export { 
	LOGR, 
	l_array_ as l_array,
	l_concat_ as l_concat,
	l_concat_array_  as l_concat_array,
	l_merge_ as l_merge,
	l_LL_ as l_LL, 
	l_RR_ as l_RR,
};