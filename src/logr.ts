
// https://stackoverflow.com/questions/4602141/variable-name-as-a-string-in-javascript
const __name = obj => Object.keys(obj)[0];
// console.log('OUT', __name({variableName}) );

// The single-shared-space label ceiling: bits 0..30 are usable, bit 31 is the sign bit in JS
// 32-bit bitwise ops. One authoritative representation of the limit (OAOO).
const k_LABELS_MAX_ = 31;

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

function l_union_(...objs_labels) {
    const arr_key = [];
    for (const obj_labels of objs_labels) {
        // reject arrays too: an array of names is l_array_'s job, not a label table
        if (! obj_labels || typeof obj_labels !== 'object' || Array.isArray(obj_labels))
            throw new Error('obj_labels must be an object');
        // only the names matter; incoming bit values are discarded and renumbered.
        // filtering the proto keys here means the plain-object result of l_array_ is safe.
        for (const key of Object.keys(obj_labels)) {
            if (key === '__proto__' || key === 'constructor')
                continue;
            if (! arr_key.includes(key))
                arr_key.push(key); // first-appearance order fixes the bit position
        }
    }
    if (arr_key.length > k_LABELS_MAX_)
        throw new Error(`l_union: ${arr_key.length} labels exceed the ${k_LABELS_MAX_}-bit limit`);
    return l_array_(arr_key); // { name: 1 << index }, frozen
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

function l_assert_(actual: Record<string, number>, required: Record<string, number>): boolean {
	if (!actual || typeof actual !== 'object') return false;
	if (!required || typeof required !== 'object') return false;

	const actualEntries = Object.entries(actual);
	const requiredEntries = Object.entries(required);

	// if (actualEntries.length === 0 && expectedEntries.length > 0)
	// 	return false;

	const actualValues = new Set<number>();
	for (const [, v] of actualEntries) {
		if (typeof v !== 'number' || !Number.isFinite(v)) return false;
		actualValues.add(v);
	}

	const usedRequiredValues = new Set<number>();

	for (const [k, v] of requiredEntries) {
		if (typeof v !== 'number' || !Number.isFinite(v)) return false;

		if (k in actual) {
			if (actual[k] !== v) return false;
		} else {
			if (!actualValues.has(v)) return false;
		}

		if (usedRequiredValues.has(v)) return false;
		usedRequiredValues.add(v);
	}

	return true;
}

//-------------------------------------------------------------------------------------------------

function handler_default_( /* ... */ ) {
	// https://stackoverflow.com/questions/18746440/passing-multiple-arguments-to-console-log
	var args = Array.prototype.slice.call(arguments);
	console.log.apply(console, args);
}

// Defaults for the always-on severity channel (warn/error). Separate from the label/toggle system
// on purpose: a warning must surface regardless of what is toggled.
function handler_warn_( /* ... */ ) {
	console.warn.apply(console, Array.prototype.slice.call(arguments));
}
function handler_error_( /* ... */ ) {
	console.error.apply(console, Array.prototype.slice.call(arguments));
}

// Best-effort "where did this log happen" tag, the JS analogue of C++ __FUNC__.
// Uses V8's structured stack (Error.captureStackTrace + a prepareStackTrace hook) to read the
// caller's Class.method WITHOUT string-parsing. fn_sentinel is the STABLE internal _log_fxn (not the
// replaceable public log method): captureStackTrace cuts it and every frame above it, so:
//   - normal case: stack[0] is the log() wrapper (named _logr_log_), stack[1] is the user's call site;
//   - if the JIT INLINES the wrapper, there is no wrapper frame and stack[0] IS the user.
// So we skip stack[0] ONLY when it's the wrapper, identified by its distinctive internal name
// _logr_log_ -- which handles inlining (no skip when absent) AND is immune to a user method named
// 'log' (its name isn't _logr_log_). Names survive tsc + unminified (dev) bundling; the file:line
// does NOT (bundle-relative), so only the name is used. Returns '' on non-V8 / unnamed frames.
//
// NOTE: swapping Error.prepareStackTrace is a process-global mutation. It is safe only because this
// runs fully synchronously (no await) on JS's single thread and is restored in finally -- do not make
// the log path async without revisiting this.
function _trace_site_(fn_sentinel) {
	const _cap = (Error as any).captureStackTrace;
	if (typeof _cap !== 'function')
		return ''; // non-V8: no structured stack available

	const _prep = (Error as any).prepareStackTrace;
	try {
		(Error as any).prepareStackTrace = (_err, stack) => stack; // hand back raw CallSite[]
		const holder: any = {};
		_cap(holder, fn_sentinel); // omit fn_sentinel (_log_fxn) and every frame above it
		const stack = holder.stack;
		if (! stack || ! stack.length)
			return '';

		// skip the internal log() wrapper frame when present (not inlined), identified by its
		// distinctive name; if inlined, stack[0] is already the user's frame.
		let idx = 0;
		if (stack[0].getFunctionName && stack[0].getFunctionName() === '_logr_log_')
			idx = 1;
		const frame = stack[idx];
		if (! frame)
			return '';

		const type = frame.getTypeName ? frame.getTypeName() : null;
		const fn = frame.getFunctionName ? frame.getFunctionName() : null;
		if (fn && type && type !== 'Object')
			return type + '.' + fn; // e.g. Orchestrator._on_curated_query
		if (fn)
			return fn;             // plain function / object-literal method
		return frame.getFileName ? frame.getFileName() : '';
	}
	catch (e) {
		return '';
	}
	finally {
		(Error as any).prepareStackTrace = _prep;
	}
}

// The label name(s) that actually FIRED this log, as an ARRAY: the bits present in BOTH the
// statement's nr_logged and the toggled mask, resolved back to names via the logr's own label
// table. e.g. log(l_.DISCOVERY | l_.CURATED_LISTS, ...) with only DISCOVERY toggled -> ['DISCOVERY'].
function _matched_names_(lref, nr_logged, bigint_toggled) {
	const names = [];
	if (! lref || typeof lref.get !== 'function')
		return names;
	const obj_labels = lref.get();
	if (! obj_labels)
		return names;

	const bigint_matched = BigInt(nr_logged) & bigint_toggled;
	if (bigint_matched === BigInt(0))
		return names;

	// Assumes the normal one-bit-per-name table (what l_array_/l_union_ produce). A hand-built
	// table where two names share a bit will report both here -- intended, but worth knowing.
	// Object.keys (own-enumerable) not for..in, to match the codebase's proto-key hygiene.
	for (const k of Object.keys(obj_labels)) {
		const v = obj_labels[k];
		if ((typeof v === 'number' || typeof v === 'bigint') && (BigInt(v) & bigint_matched) !== BigInt(0))
			names.push(k);
	}
	return names;
}

//-------------------------------------------------------------------------------------------------

type LabelsRecord = Record<string, number>;

function l_toBigInt_(obj_labels : LabelsRecord, obj : Record<string, boolean>, ignore= false) : bigint {
    if (! obj_labels || typeof obj_labels !== 'object') 
		throw new Error('obj_labels must be an object');
    if (! obj || typeof obj !== 'object') 
		throw new Error('obj must be an object');

	let bigint_l = BigInt(0);
	for (const [k,v] of Object.entries(obj)) {
		if ( ( ignore || v ) && obj_labels[k] !== undefined && typeof obj_labels[k] === 'number')
			bigint_l|= BigInt( obj_labels[k] );			
		// console.log('0b'+ bigInt.toString(2) );
	}
	return bigint_l;
}

// console.log(l_toBigInt_({},{}))

/*
const lRef = (initial = null) => {
  let value = initial;
  return {
    get: () => value,
    set: (newVal) => { value = newVal; }
  };
};
*/

type LRef<T> = {
    get: () => T;
    set: (v: T) => void;
};

function lRef<T>(initial: T): LRef<T>;
function lRef<T>(initial?: T): LRef<T> | undefined;
function lRef<T>(initial?: T) {
	if (arguments.length === 0 || initial === undefined) {
		return undefined as any;
	}

	let value = initial;
	return {
		get: () => value,
		set: (newVal: T) => { value = newVal; }
	};
}

/*
const l_ = {
	get VALIDATION() { return logr_.lref.get().VALIDATION; }
}

function createBitFlags(ref) {
	// Create a proxy so that any property access computes the current bit
	return new Proxy({}, {
		get(target, prop, receiver) {
			const positions = ref.get();           // get current { VALIDATION: n, ... }
			const position = positions[prop];      // e.g., positions['VALIDATION']

			if (position === undefined) {
				// Optional: warn or return 0 for unknown keys
				console.warn(`Unknown bitflag key: ${String(prop)}`);
				return 0;
			}

			return 0b1 << position;  // or 1 << position
		},

		// Optional: make Object.keys(l_) show the actual keys
		ownKeys(target) {
			return Object.keys(ref.get());
		},

		getOwnPropertyDescriptor(target, prop) {
			return {
				enumerable: true,
				configurable: true,
			};
		}
	});
}

type BitPositions = Record<string, number>;

function createBitFlags<T extends BitPositions>(ref: { get: () => T }) {
	return new Proxy({} as { [K in keyof T]: number }, {
		get(target, prop: string | symbol) {
			if (typeof prop !== 'string') return undefined;
			const positions = ref.get();
			const position = positions[prop as keyof T];
			if (position === undefined) return 0;
			return 1 << position;
		},
		ownKeys() {
			return Object.keys(ref.get());
		},
		getOwnPropertyDescriptor() {
			return { enumerable: true, configurable: true };
		}
	});
}
*/

function create_Referenced_l_<T extends LabelsRecord>(ref: { get: () => T }) {
	type Flags = { [K in keyof T]: number } & { get(): Record<keyof T, number> };

	return new Proxy({} as Flags, {
		get(target, prop: string | symbol) {
			if (typeof prop !== 'string') return undefined;

			// if (prop === 'get') {
			// 	return () => {
			// 		const positions = ref.get();
			// 		const result: Partial<Record<keyof T, number>> = {};
			// 		for (const key in positions) {
			// 			result[key as keyof T] = positions[key];
			// 		}
			// 		return result as Record<keyof T, number>;
			// 	};
			// }
			if (prop === 'get')
				return () => ref.get();

			const positions = ref.get();
			const value = positions[prop as keyof T];
			if (value === undefined) return 0;
			return value;
		},
		ownKeys() {
			return Object.keys(ref.get());
		},
		getOwnPropertyDescriptor() {
			return { enumerable: true, configurable: true };
		}
	});
}

type LogrOptions = {
	name?: string;   // the unit's identity: display prefix + mute/toggle-by-name handle
	labels?: LabelsRecord;
	// arr_labels? : Array<string>;
	log_handler?: ((...args: any[]) => void);
};

const LOGR = (function () {
	let _instance; // Private variable to hold the single instance

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

		// Private state (replacing constructor properties).
		let _Bint_toggled: bigint = BigInt(0);
		let _handler_log = handler_default_;
		let _handler_warn = handler_warn_;   // always-on severity channel, independent of _Bint_toggled
		let _handler_error = handler_error_;
		let _trace: boolean | ((site: string) => string) = false;
		let _labeled: boolean | ((names: string[]) => string) = false;
		// per-unit scope, keyed by each logr's own name (create({ name })):
		const _muted_names = new Set<string>();    // named units silenced (log suppressed)
		const _verbose_names = new Set<string>();  // named units forced fully verbose (fire regardless of toggle)

		function _log_fxn(nr_logged, argsFn /* args */) {
			// per-unit scope (by this logr's name): a muted unit is silent; a forced-verbose unit
			// fires regardless of the toggle mask.
			if (this._name && _muted_names.has(this._name))
				return;
			const matched = (BigInt(nr_logged) & _Bint_toggled) !== BigInt(0);
			if (! matched && ! (this._name && _verbose_names.has(this._name)))
				return;

			const args = argsFn();

			// output shape:  [label?] name: ...message [trace?]
			// label (which label fired) and the unit name are prepended; trace is appended.
			// All dev-only; trace pays a stack read on FIRED logs only.
			const lead = [];
			if (_labeled) {
				const names = _matched_names_(this._lref_labels, nr_logged, _Bint_toggled);
				if (names.length) {
					// true -> "[DISCOVERY]"; a function -> your policy over the names array
					const tag = (typeof _labeled === 'function') ? _labeled(names) : '[' + names.join('|') + ']';
					if (tag)
						lead.push(tag); // BEFORE the name
				}
			}
			if (this._name)
				lead.push(this._name + ':'); // the ':' is implicit -- the name itself doesn't carry it

			let tail = args;
			if (_trace) {
				const site = _trace_site_(_log_fxn); // stable internal sentinel (not the public log)
				if (site) {
					const tag = (typeof _trace === 'function') ? _trace(site) : `(${site})`;
					tail = [...args, tag]; // call site APPENDED after the message
				}
			}

			if (lead.length)
				_handler_log.apply(this, [...lead, ...tail]);
			else
				_handler_log.apply(this, tail);
		}

		return {
			_id, // for testing

			get handler() { return _handler_log; },
			set handler(fx) {
				_handler_log = fx;
			},

			// Handlers for the always-on severity channel (logr_.warn / logr_.error), default
			// console.warn / console.error. Overridable like handler.
			get handler_warn() { return _handler_warn; },
			set handler_warn(fx) {
				_handler_warn = fx;
			},
			get handler_error() { return _handler_error; },
			set handler_error(fx) {
				_handler_error = fx;
			},

			// Append each FIRED log with its call site (Class.method), the JS analogue of __FUNC__.
			// false (default) = off; true = append the site as "(site)"; a function = format it, e.g.
			// LOGR_.trace = (site) => `[${site}]`. Only costs a stack read on logs that fire (dev only).
			get trace() { return _trace; },
			set trace(v) {
				_trace = v;
			},

			// Prepend each FIRED log with the label name(s) that fired it (the bits present in
			// BOTH the statement and the toggled mask). false = off; true = "[NAME|NAME]"; a
			// function (names: string[]) => string owns the whole tag (abbreviate, re-order,
			// bracket, or return '' to suppress). Independent of trace/name -- the label goes first.
			get labeled() { return _labeled; },
			set labeled(v) {
				_labeled = v;
			},

			// Per-unit scope, addressed by a logr's own name (create({ name })) -- so it reaches a
			// unit buried under wire() without holding its logr. Two axes, both keyed by name:
			//   mute    -- silence a unit's log output (warn/error exempt);
			//   verbose -- force a unit to fire ALL its logs regardless of the label mask (scoped to it).
			// Each takes one name, several, or an array, plus an optional trailing on/off (default true):
			//   mute('a'), mute('a','b'), mute(['a','b']), mute('a', false) to un-mute.
			mute(...args: (string | string[] | boolean)[]): void {
				const on = (typeof args[args.length - 1] === 'boolean') ? args.pop() as boolean : true;
				for (const n of (args as (string | string[])[]).flat())
					if (on) _muted_names.add(n); else _muted_names.delete(n);
			},
			verbose(...args: (string | string[] | boolean)[]): void {
				const on = (typeof args[args.length - 1] === 'boolean') ? args.pop() as boolean : true;
				for (const n of (args as (string | string[])[]).flat())
					if (on) _verbose_names.add(n); else _verbose_names.delete(n);
			},

			get toggled() : bigint { return _Bint_toggled; },

			// toggle the global label mask (which categories fire). For per-unit control use
			// mute/verbose above -- not this.
			toggle(labels: LRef<LabelsRecord> | LabelsRecord, obj_toggled: Record<string, boolean>): void {
				const obj_labels = typeof labels?.get === 'function'
					? (labels as LRef<LabelsRecord>).get()
					: labels as LabelsRecord;

				_Bint_toggled = l_toBigInt_(obj_labels, obj_toggled);
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
						// severity is NOT stripped in production -- warnings/errors must still surface
						warn(...args) { _handler_warn.apply(this, args); },
						error(...args) { _handler_error.apply(this, args); },
					};
				}

				const _logger = {
					// the unit's name (create({ name })): its display prefix AND its mute/toggle identity.
					_name: options.name,
					get name() { return this._name; },

					// _lref_labels: (options.arr_labels === undefined) ? undefined : lRef( l_array_(options.arr_labels) ),
					_lref_labels: (options.labels === undefined)
						? undefined
						: lRef( options.labels ) as undefined | LRef<LabelsRecord>,

					get l() {
						// Always create a fresh proxy pointing to the current labels
						return create_Referenced_l_({
							get: () => this._lref_labels?.get() || {}
						});
					},					

					get lref(): undefined | LRef<LabelsRecord> { return this._lref_labels; },
					set lref(lref_labels_new: LRef<LabelsRecord>) {
						this._lref_labels = lref_labels_new;
					},

					// named _logr_log_ (a distinctive internal name, not the collision-prone 'log') so
					// _trace_site_ can identify this wrapper frame without mistaking a user method
					// that happens to be named 'log'. Public property is still 'log'.
					log: function _logr_log_(nr_logged, argsFn) {
						// This constant will be replaced at build time
            			if (!((globalThis as any).LOGR_ENABLED ?? true))
							return;

						_log_fxn.call(this, nr_logged, argsFn);
					},

					// Optional shorthand for common cases
                    raw(...args) {
                        _handler_log.apply(this, args);
                    },

					// Always-on severity channel: fires regardless of the toggle mask (a warning must
					// not be silenceable by forgetting to toggle a label). Orthogonal to the label system.
					warn(...args) {
						_handler_warn.apply(this, args);
					},
					error(...args) {
						_handler_error.apply(this, args);
					}
				}

				return _logger;
			},

			// Union every submodule's labels into one shared table, point every
			// submodule AND a new main logr at it, and return the main logr.
			// Driven off the single arr_logr array so union-inputs and reassign-
			// targets can't drift. Optional obj_pin locks the resulting positions.
			//
			// A wired main remembers its members (_arr_members: every logr sharing
			// its lref). wire() EXPANDS each passed logr to its members -- a bare
			// leaf is just itself -- so a nested wire() re-points a sub-unit's hidden
			// leaves through its exported main WITHOUT the caller naming them. That
			// is what lets wire() compose instead of orphaning the inner leaves.
			wire(arr_logr, obj_pin?) {
				// production short-circuit: the disabled stub has no lref, so bail
				// before touching any (This constant is replaced at build time.)
				if (!((globalThis as any).LOGR_ENABLED ?? true))
					return this.create();

				if (! Array.isArray(arr_logr))
					throw new Error('wire: first argument must be an array of logr objects');

				// validate each passed logr, then expand it to its members
				const set_members = new Set<any>();
				arr_logr.forEach((logr_, i) => {
					if (! logr_ || typeof logr_.lref?.get !== 'function')
						throw new Error(`wire: logr at index ${i} has no lref (created without labels?)`);
					for (const member of (logr_._arr_members ?? [logr_]))
						set_members.add(member);
				});
				const arr_members = [...set_members];

				const obj_labels_ = l_union_(...arr_members.map((m) => m.lref.get()));

				if (obj_pin !== undefined && ! l_assert_(obj_labels_, obj_pin))
					throw new Error('wire: unioned labels do not match pinned positions\n'
						+ JSON.stringify(obj_labels_, null, 2));

				const lref_ = lRef(obj_labels_);

				// Build the main logr FIRST -- create() is the last fallible step; do it before
				// mutating any member .lref, so a throw can't leave members half-repointed.
				const logr_ = this.create(); // no labels -> _lref_labels undefined
				logr_.lref = lref_;          // main logr on the same shared ref
				(logr_ as any)._arr_members = [...arr_members, logr_]; // remember, so a parent wire() can follow

				for (const member of arr_members)
					member.lref = lref_; // re-point every member (leaves included) at the shared ref -- MUTATION LAST
				return logr_;
			},

		}
	}

	// Public interface
    return {
        get_instance() {
			if (! ((globalThis as any).LOGR_USE_GLOBAL_KEY ?? true)) {
				if (!_instance)
					_instance = _create_instance(); // Lazy initialization
				return _instance;
			}

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
	lRef,
	create_Referenced_l_ as _create_Referenced_l,
	l_length_ as l_length,
	l_array_ as l_array,
	l_concat_ as l_concat,
	l_merge_ as l_merge,
	l_union_ as l_union,
	l_LL_ as l_LL,
	l_RR_ as l_RR,
	l_assert_ as l_assert
};