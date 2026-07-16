# BitLOGR

**BitLOGR** is a lightweight, bitwise logging library for JavaScript, designed for modular applications with no label dependencies between compilation units. It leverages bit flags for efficient, granular logging control, offering zero performance overhead in production through lazy evaluation (thunks) and build-time optimizations.

The idea behind BitLOGR is to label execution paths (i.e., not INFO, WARN, DEBUG, ERROR and CRITICAL). This means bits could be chosen that correlate to event processing, an execution path or the like.
## Key Features (USPs)

- **No Label Dependency**: Each compilation unit can independently define, ignore, inherit, overwrite, or rename labels from submodules.
- **Flexible Label Management**: Supports custom label sets with bitwise operations for combining and toggling logs.
- **Custom Logging Handler**: It is possible to specify your own handler (e.g., `console.log`, custom function) for output flexibility.
- **Minimal Performance Hit**: Use thunks, to defer argument evaluation ensuring minimal overhead when logging is disabled (in production).
## Overview

### Initializing BitLOGR

A BitLOGR instance is required in order to create a local logr. The local logr can be exported for further use. 

To use BitLOGR, initialize the singleton instance.  Create a local logr with labels and use the singleton instance to toggle labels:
1. Labels: Define categories as an object mapping names to bit values (powers of 2).
2. Toggled: Specify which labels are active using a key-value object with boolean values.
 
```javascript
import { LOGR, l_array } from '@knev/bitlogr';

const LOGR_= LOGR.get_instance();
const logr_ = LOGR_.create({
    labels: {
        CXNS : 0b1 << 2,    // connections
        EVENTS : 0b1 << 3,
        HANDLERS : 0b1 << 4,
    }
});
const l_= logr_.l;

// Enable specific logs
LOGR_.toggle(l_, {
        EVENTS : true
    })
```

### Label and Toggle Formats

**Labels**: An object where keys are strings and values are unique powers of 2 (e.g., 1, 2, 4, 8). These represent log categories and align with bits for efficient checking.
    - Example: `{ EVENT: 1, CXN: 2, HANDLERS: 4 }` → Bit positions 0, 1, 2.

**Toggled**: An object where keys match label names and values are booleans (true/false). Internally, this creates a bitmask.
    - Example: `{ EVENT: true, CXN: false, HANDLERS: true }` → Bitmask 0b101 (5).

The `toggled` bitmask is compared with the log statement’s bit value using bitwise AND (&) to determine if logging occurs.

### Log Statement Format

The `log` method takes two arguments:
1. **nr_logged**: A number (bitmask) representing the log categories (e.g., l_.EVENT | l_.CXN).
2. **argsFn**: A thunk (function returning an array) that lazily provides log arguments.

  ```javascript
logr_.log(l_.EVENT, () => ['Debug message']); // Logs if EVENT is toggled
```

- Logging occurs only if labels are toggled true; the log function returns true/false in development (i.e., LOGR_ENABLED is true).
- undefined: in production mode, the log function returns undefined.

### Using OR for Labels

Combine labels with the bitwise OR (|) operator to log under multiple categories:

```javascript
LOGR_.toggle(l_, {
        EVENTS : true,
        CXN: true
    }) // 0b101 (5)
    
logr_.log(l_.EVENT | l_.CXN, () => ['Debug or Info']);
// Logs because 0b101 & (0b001 | 0b100) = 0b101 & 0b101 = 0b101 !== 0
```

## Utility Functions

BitLOGR provides helper functions to manage labels:

### `l_array(labels, start = 1)`
Creates a label object from an array, assigning sequential bit values.
```javascript
const l_ = l_array(['A', 'B', 'C']); // { A: 1, B: 2, C: 4 }
const l_shifted_ = l_array(['X', 'Y'], 4); // { X: 4, Y: 8 }
```

### `l_length(obj)`
Returns the next power of 2 based on the maximum value in the object.
```javascript
const l_len_= l_length({ a: 1, b: 4 }); // 8 (next power of 2 after 4)
```

### `l_concat(base, additional)`
Combines label sets, appending new labels with next available bits.
```javascript
const l_ = l_array(['A', 'B']); // { A: 1, B: 2 }
const l_more_ = l_concat(l_, ['C', 'D']); // { A: 1, B: 2, C: 4, D: 8 }
```

### `l_merge(obj1, obj2)`
Merges two label sets, shifting conflicting values to unique bits. Same name with a **different**
value throws.
```javascript
const l1_ = { A: 1, B: 4 };
const l2_ = { C: 1, D: 8 };
const l_merged_ = l_merge(l1_, l2_); // { A: 1, B: 4, C: 16, D: 8 }
```

### `l_union(...objs)`
Variadic merge **by name**. Collects the unique label names across all arguments in
first-appearance order, **discards the incoming bit values**, and renumbers them contiguously from
bit 0. Unlike `l_merge` it takes any number of sets, dedupes a shared name to one bit silently (no
throw), and never needs `l_LL`/`l_RR` alignment. First-appearance order decides the bit position, so
the first set keeps the low bits. Throws if the union would exceed 31 labels.
```javascript
const l_ = l_union(
    { CONNECTIONS: 1, REFLECTION: 2 },
    { VALIDATION: 1 },              // collides with CONNECTIONS by value, but is a distinct name
    { VALIDATION: 4, HANDLERS: 8 }, // VALIDATION already seen -> deduped
);
// { CONNECTIONS: 1, REFLECTION: 2, VALIDATION: 4, HANDLERS: 8 }
```

### `l_LL(obj, shift)`
Left-shifts all values in a label object.
```javascript
const l_ = { A: 1, B: 2 };
const l_shifted_ = l_LL(l_, 2); // { A: 4, B: 8 }
```

### `l_RR(obj, shift)`
Right-shifts all values in a label object.
```javascript
const l_ = { A: 4, B: 8 };
const l_shifted_ = l_RR(l_, 2); // { A: 1, B: 2 }
```

### `l_assert(obj_actual, obj_required)`
```javascript
const b_res= l_assert(l_, { 
		DEL : 0b1 << 0,
		CXNS : 0b1 << 2,
	});
```

## Examples

### Importing Labels from Submodules

```javascript
import { ..., logr as logr_ } from '@rootintf/json-msg';

console.log('logr_.lref', logr_.lref.get());

const LOGR_= LOGR.get_instance();
const l_= logr_.l;

LOGR_.toggle(l_, {
    EVENT : true
});

logr_.log(l_.EVENT, () => ['Debug warning']); // "WARN: Debug warning"
```

**\-- OR --**

```javascript
const obj_labels_= l_concat(
		logr_ipsme_.lref.get(), l_array(['DISCOVERY', 'WARP']) 
	);

let LOGR_ = LOGR.get_instance();
const logr_ = LOGR_.create({ labels : obj_labels_ });
const l_= logr_.l;

// doesn't use DISCOVERY AND WARP flags, so don't have to change it
// logr_ipsme_.lref= lref_; 

console.log('l_', l_.get());
LOGR_.toggle(l_, {
    // VALIDATION : true,
    // DISCOVERY : true,
    // WARP : true,
});
```
Note above that if the local the logr does not use altered labels such that the labels don't coincide with those of `logr_ipsme_`. That means if the alter labels are toggled, it won't affect the imported module anyways. If the labels were locally alter such that they didn't coincide with `logr_ipsme_`, then it is required to reassign the imported labels to be equal to the locally altered ones.

### Reassigning Labels from Submodules

```javascript
import { ..., logr as logr_json_msg_ } from '@rootintf/json-msg'
import { ..., logr as logr_evtlog_ } from './EventLog-mem.mjs'

const obj_labels_merge_= 
	l_merge(logr_evtlog_.lref.get(), logr_json_msg_.lref.get());

const obj_labels_concat_= l_concat(
		obj_labels_merge_, 
		l_array(['HANDLERS', 'DROPS', 'PROTOCOL_STATE', 'RECVER', 'SENDER']) 
	);

// create a new label ref
const lref_= lRef(obj_labels_concat_);

// change the label refs of the imported modules to reflect the changes
logr_json_msg_.lref= lref_;
logr_evtlog_.lref= lref_;

const LOGR_= LOGR.get_instance();

// don't let create() make a new ref
const logr_= LOGR_.create(); 
// assign lref_ from here
logr_.lref= lref_;

const l_= logr_.l;
```

This is the manual approach, and it still works — reach for it when you need the intermediate
`l_merge`/`l_concat` steps (e.g. adding brand-new labels like `HANDLERS`/`DROPS` while merging).
For the common case of "just share one table across submodules," `wire()` below does it in one call.

### Reassigning Labels from Submodules — `wire()`

`LOGR_.wire(arr_logr)` collapses the whole workflow into one call. It reads every submodule's
labels, `l_union`s them into one shared table, points every submodule **and** a new main logr at
that single `lref`, and returns the main logr. Because logging and `toggle` resolve labels **by
name** (through the live `l` proxy), the union can renumber bits freely — no `l_merge` chains, no
`l_LL`/`l_RR` alignment, no per-submodule reassignment to keep in sync.

```javascript
import { LOGR } from '@knev/bitlogr';
import { ..., logr as logr_json_msg_ } from '@rootintf/json-msg'
import { ..., logr as logr_twoPhW_ }   from '@rootintf/protocol-2phw'
import { ..., logr as logr_discovery_ } from './Responder_Discovery.js'

const logr_ = LOGR.get_instance().wire([
    logr_json_msg_,
    logr_twoPhW_,
    logr_discovery_,
]);

const l_ = logr_.l;
```

The array is the single source of truth for which submodules participate — you cannot union a
submodule and forget to reassign it. First-appearance order decides the bit layout (first logr keeps
the low bits). A submodule created without labels (no `lref`) throws with its index. In production
(`LOGR_ENABLED = false`), `wire` returns the same no-op stub as `create()`.

**Optional position lock.** Pass an expected table as the second argument to pin the layout; `wire`
runs `l_assert` on the union and throws on mismatch (otherwise omit it):

```javascript
const logr_ = LOGR.get_instance().wire(
    [ logr_json_msg_, logr_twoPhW_, logr_discovery_ ],
    { VALIDATION: 0b1 << 0, LOG_EVENTS: 0b1 << 1, /* ... */ } // optional
);
```

You can always inspect the resulting table with `logr_.lref.get()`.

**By hand.** `wire` is sugar over `l_union` + `lRef` + the `.lref` setter (it also adds the
missing-`lref` guard, the optional pin, and the production short-circuit). The core is:

```javascript
const arr_logr_ = [ logr_json_msg_, logr_twoPhW_, logr_discovery_ ];

const lref_ = lRef( l_union(...arr_logr_.map(g => g.lref.get())) );
arr_logr_.forEach(g => g.lref = lref_);

const logr_ = LOGR.get_instance().create(); // don't let create() make a new ref
logr_.lref = lref_;
const l_ = logr_.l;
```


### Custom Handler

```javascript
LOGR_.handler = (...args) => console.warn('WARN:', ...args);
LOGR_.toggle(l_, {
        EVENTS : true
    })
    
logr_.log(l_.EVENT, () => ['Debug warning']); // "WARN: Debug warning"
```

### Raw logging
Don't use labels, just log.
```javascript
logr_.raw('const l_ ', l_.get())
```

### spec/logr.spec.mjs
See `spec/logr.spec.mjs` in the source for more examples.
 
## Development vs. Production

### Development Mode

Set `LOGR_ENABLED = true` (default or via build config) to enable logging:

```javascript
LOGR_.toggle(l_, {
        EVENTS : true
    })
    
logr_.log(l_.EVENT, () => ['Dev log']); // Logs "Dev log"
logr_.log(l_.CXNS, () => ['No log']); // Skipped
```

### Production Mode

Set `LOGR_ENABLED = false `(e.g., via Webpack `DefinePlugin`) to disable logging with no performance cost:

```javascript
// In production with LOGR_ENABLED = false
logr_.log(l_.EVENT, () => ['Expensive computation']); // No-op, thunk not evaluated
```

  
Use a build tool to replace LOGR_ENABLED at compile time:
```javascript
Object.defineProperty(globalThis, 'LOGR_ENABLED', {
	value: true,
	writable: true,
	configurable: true
});
```

```javascript
// rollup.config.mjs

import terser from '@rollup/plugin-terser';
const isProduction = process.env.NODE_ENV === 'production';

export default [
	// ...
	{
		plugins: [
			// ...
			isProduction && terser({
				compress: {
					dead_code: true,
					global_defs: {
						'LOGR_ENABLED': false   // ← Terser understands this
					}
				}
			})
		]
	}
};
```

  
## Limitations

- **32-Bit Limit**: Supports up to 31 labels before overflow (JavaScript’s 32-bit integer limit).
