
// https://stackoverflow.com/questions/4602141/variable-name-as-a-string-in-javascript
const __name = obj => Object.keys(obj)[0];
// console.log('OUT', __name({variableName}) );

//-------------------------------------------------------------------------------------------------

function l_length_(obj_labels) {
    if (! obj_labels || typeof obj_labels !== 'object') 
		throw new Error('obj_labels must be an object');
    const obj_1label = Object.values(obj_labels);
    if (! obj_1label.every(v => typeof v === 'number' && Number.isFinite(v))) 
		throw new Error('All values must be finite numbers');

    const labels = Object.values(obj_labels);
    if (labels.length === 0) 
		return 1; // Empty object case, start at 1

    const value_max = Math.max(...labels as number[]);
		if (value_max <= 0) return 1

    const bit_highest = Math.floor(Math.log2(value_max));
    return 1 << (bit_highest + 1);
}

function l_array_(arr_labels, start = 1) {
	if (! Array.isArray(arr_labels)) 
		throw new Error('arr_labels must be an array');
    if (! Number.isSafeInteger(start) || start < 0) 
		throw new Error('start must be a safe, non-negative integer');

    return Object.freeze(arr_labels.reduce((acc, key, index) => {
        acc[key] = start << index;
        return acc;
    }, {}));
}

function l_concat_(obj_labels, arg) {
    if (! obj_labels || typeof obj_labels !== 'object') 
		throw new Error('obj_labels must be an object');
    const obj_1label = Object.values(obj_labels);
    if (! obj_1label.every(v => typeof v === 'number' && Number.isFinite(v))) 
		throw new Error('All values must be finite numbers');
    if (! arg || (typeof arg !== 'object' && ! Array.isArray(arg))) 
		throw new Error('arg must be an object or array');

	if (Array.isArray(arg)) {
		const len = l_length_(obj_labels);
		const arr_labels_new = l_array_(arg, len);
		return l_concat_(obj_labels, arr_labels_new);
	}

	const next_pos = l_length_(obj_labels);
	const arg_entries = Object.entries(arg);
    const result = Object.create(null);
    Object.entries(obj_labels).forEach(([k, v]) => {
        if (k !== '__proto__' && k !== 'constructor') 
			result[k] = v;
    });

	let min_arg = Infinity;
	for (const [, value] of arg_entries) {
		if (typeof value !== 'number' || ! Number.isFinite(value)) 
			continue; // Skip non-numeric

		if (value > 0 && value < min_arg) 
			min_arg = value;
	}
    // Shift only if min_arg is less than next_pos
    const shift = min_arg === Infinity || min_arg >= next_pos 
        ? 0 
        : Math.floor(Math.log2(next_pos / min_arg));

	for (const [key, value] of arg_entries) {
		if (!(key in result)) {
			result[key] = value === 0 ? 0 : (value as number) << shift;
		}
	}

	return Object.freeze(result);
}

function l_merge_(obj_labels1, obj_labels2) {
    if (! obj_labels1 || typeof obj_labels1 !== 'object') 
		throw new Error('obj_labels must be an object');
    const obj_1label1 = Object.values(obj_labels1);
    if (! obj_1label1.every(v => typeof v === 'number' && Number.isFinite(v))) 
		throw new Error('All values must be finite numbers');

	if (! obj_labels2 || typeof obj_labels2 !== 'object') 
		throw new Error('obj_labels must be an object');
    const obj_1label2 = Object.values(obj_labels2);
    if (! obj_1label2.every(v => typeof v === 'number' && Number.isFinite(v))) 
		throw new Error('All values must be finite numbers');

    const result = Object.create(null);
    Object.entries(obj_labels1).forEach(([k, v]) => {
        if (k !== '__proto__' && k !== 'constructor') result[k] = v;
    });	
    const set_values = new Set(Object.values(obj_labels1)); // Track all used bit values
    
    // Find the highest bit position to start shifting from if needed
    const value_highest = Math.max(0, ...Array.from(set_values) as number[]);
    let next_shift = value_highest ? Math.floor(Math.log2(value_highest)) + 1 : 0;

    // Process second set
    for (const [key, value] of Object.entries(obj_labels2)) {
        if (key in result) {
            // Same key: Values must match
            if (result[key] !== value) {
                throw new Error(`Key '${key}' has conflicting values: ${result[key]} (obj_labels1) vs ${value} (obj_labels2)`);
            }
            // No action needed if values match, already in result
        } else {
			let maxIterations = 1000;
            // New key: Add if value is unique, otherwise shift
            let value_new = value;
            while (set_values.has(value_new) && maxIterations--) {
                value_new = 1 << next_shift++;
            }
			if (maxIterations <= 0) 
				throw new Error('Too many collisions in l_merge_');
            
			result[key] = value_new;
            set_values.add(value_new);
        }
    }
    
    return Object.freeze(result);
}

function l_LL_(obj, x) {
	if (! obj || typeof obj !== 'object') 
		throw new Error('obj must be an object');
	if (! Number.isSafeInteger(x) || x < 0) 
		throw new Error('Shift value must be a safe, non-negative integer');

	const obj_new= {}
	for (const [k,v] of Object.entries(obj)) {
		if (typeof v !== 'number' || ! Number.isFinite(v)) 
			continue; // Skip non-numeric
		obj_new[k] = v<<x;
	}
	return Object.freeze(obj_new);
}

function l_RR_(obj, x) {
	if (! obj || typeof obj !== 'object') 
		throw new Error('obj must be an object');
	if (! Number.isSafeInteger(x) || x < 0) 
		throw new Error('Shift value must be a safe, non-negative integer');

	const obj_new= {}
	for (const [k,v] of Object.entries(obj)) {
		if (typeof v !== 'number' || ! Number.isFinite(v)) 
			continue; // Skip non-numeric
        obj_new[k] = v>>x;
	}
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
    if (! obj_labels || typeof obj_labels !== 'object') 
		throw new Error('obj_labels must be an object');
    if (! obj || typeof obj !== 'object') 
		throw new Error('obj must be an object');

	let bigInt = BigInt(0);
	for (const [k,v] of Object.entries(obj)) {
		if ( ( ignore || v ) && obj_labels[k] !== undefined && typeof obj_labels[k] === 'number')
			bigInt|= BigInt( obj_labels[k] );			
		// console.log('0b'+ bigInt.toString(2) );
	}
	return bigInt;
}

// console.log(l_toBigInt_({},{}))

type LogrOptions = {
  labels?: Record<string, number>;
  log_handler?: ((...args: any[]) => void);
};

const LOGR = (function () {
	// let _instance; // Private variable to hold the single instance

	// Module-level state would work - but only when the module is loaded once. 
	// Your bundler is currently bundling @knev/bitlogr into your distribution file, 
	// creating a second copy. The Global Symbol approach would work around this, 
	// but it's treating the symptom, not the cause. 
	const GLOBAL_KEY = Symbol.for('@knev/bitlogr/LOGR');
	// The real issue is your build configuration bundling dependencies that should remain external.
	// rollup.config.mjs: external: ['@knev/bitlogr', 'uuid'], // Don't bundle these

	function _create_instance() {
		const _id = Math.random();
		if ( (globalThis as any).LOGR_ENABLED ?? true)
			console.log('creating LOGR instance:', _id);

		// Private state (replacing constructor properties)
		let _Bint_toggled = BigInt(0);
		let _handler_log = handler_default_;

		function _log_fxn(nr_logged, argsFn /* args */) {
			if ((BigInt(nr_logged) & _Bint_toggled) === BigInt(0))
				return;

			const args = argsFn();
			_handler_log.apply(this, args);
		}

		return {
			_id, // for testing

			get handler() { return _handler_log; },
			set handler(fx) {
				_handler_log = fx;
			},

			get toggled() { return _Bint_toggled; },
			toggle(obj_labels, obj_toggled) {
				_Bint_toggled= l_toBigInt_(obj_labels, obj_toggled);
			},

			 // Core internal log function (exposed only to created loggers)
			_log_fxn,

			create(options: LogrOptions = {}) {
				// This constant will be replaced at build time
				if (!((globalThis as any).LOGR_ENABLED ?? true)) {
					return {
						_obj_labels: undefined,  // optional: keep shape compatible if needed
						log: () => {},     // does nothing
						raw: () => {},     // does nothing
					};
				}

				const _logger = {
					_obj_labels: options.labels ?? undefined,

					log(nr_logged, argsFn) {
						// This constant will be replaced at build time
            			if (!((globalThis as any).LOGR_ENABLED ?? true))
							return;

						_log_fxn.call(this, nr_logged, argsFn);
					},

					// Optional shorthand for common cases
                    raw(...args) {
                        _handler_log.apply(this, args);
                    }
				}

				return _logger;
			},

		}
	}

	// Public interface
    return {
        get_instance() {
			// if (!_instance)
			// 	_instance = _create_instance(); // Lazy initialization
			// return _instance;

			if (!globalThis[GLOBAL_KEY])
                globalThis[GLOBAL_KEY] = _create_instance();

			return globalThis[GLOBAL_KEY];
        },

        // For testing only - reset the singleton
        _reset_for_testing() {
            delete globalThis[GLOBAL_KEY];
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