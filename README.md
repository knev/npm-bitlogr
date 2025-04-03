  
  # BitLOGR

**BitLOGR** is a lightweight, bitwise logging library for JavaScript, designed for modular applications with no label dependencies between compilation units. It leverages bit flags for efficient, granular logging control, offering zero performance overhead in production through lazy evaluation (thunks) and build-time optimizations.

The idea behind BitLOGR is to label execution paths, not INFO, WARN, DEBUG, ERROR, CRITICAL.

## Key Features (USPs)

- **No Label Dependency**: Each compilation unit can independently define, ignore, inherit, overwrite, or rename labels from submodules.
- **Flexible Label Management**: Supports custom label sets with bitwise operations for combining and toggling logs.
- **Custom Logging Handler**: It is possible to specify your own handler (e.g., `console.log`, custom function) for output flexibility.
- **Zero Performance Hit**: Use thunks, to defer argument evaluation, and static functions to, ensuring no overhead when logging is disabled.

## Installation

Install via npm:
```bash
npm install @knev/bitlogr
```

## Overview

### Singleton Class
BitLOGR is implemented as a singleton, meaning there is only one instance of the LOGR class across your application. This ensures consistent logging behavior but requires careful label management when shared across modules.

```javascript
import { LOGR } from '@knev/bitlogr';

const LOGR1_ = LOGR.instance();
const LOGR2_ = LOGR.instance();
console.log(LOGR1_ === LOGR2_); // true (same instance)
```

### Initializing BitLOGR
To use BitLOGR, initialize the singleton instance with labels and toggle settings:
1. Labels: Define categories as an object mapping names to bit values (powers of 2).
2. Toggled: Specify which labels are active using a key-value object with boolean values.

```javascript
import { LOGR, l_array } from '@knev/bitlogr';

// Define labels
const l_ = l_array(['EVENT', 'CXN', 'HANDLERS']); // { EVENT: 1, CXN: 2, HANDLERS: 4 }

// Get the logger instance
const LOGR_ = LOGR.instance();
LOGR_.labels = l_;

// Enable specific logs
LOGR_.toggled = { EVENT: true, CXN: true }; // Bitmask: 0b101 (5)
```

### Label and Toggle Formats

- **Labels**: An object where keys are strings and values are unique powers of 2 (e.g., 1, 2, 4, 8). These represent log categories and align with bits for efficient checking.
    - Example: `{ EVENT: 1, CXN: 2, HANDLERS: 4 }` → Bit positions 0, 1, 2.

- **Toggled**: An object where keys match label names and values are booleans (true/false). Internally, this creates a bitmask.
    - Example: `{ EVENT: true, CXN: false, HANDLERS: true }` → Bitmask 0b101 (5).

The `toggled` bitmask is compared with the log statement’s bit value using bitwise AND (&) to determine if logging occurs.

### Log Statement Format

The `log` method takes two arguments:

1. **nr_logged**: A number (bitmask) representing the log categories (e.g., l_.EVENT | l_.CXN).

2. **argsFn**: A thunk (function returning an array) that lazily provides log arguments.


```javascript
LOGR_.log(l_.EVENT, () => ['Debug message']); // Logs if EVENT is toggled
```

*Return Value*:
- Logging occurs only if labels are toggled true; the log function returns true/false in development (i.e., LOGR_ENABLED is true).
- undefined: in production mode, the log function returns undefined.

### Using OR for Labels
Combine labels with the bitwise OR (|) operator to log under multiple categories:

```javascript
LOGR_.toggled = { EVENT: true, CXN: true }; // 0b101 (5)
LOGR_.log(l_.EVENT | l_.CXN, () => ['Debug or Info']);
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

Merges label sets, shifting conflicting values to unique bits.
```javascript
const l1_ = { A: 1, B: 4 };
const l2_ = { C: 1, D: 8 };
const l_merged_ = l_merge(l1_, l2_); // { A: 1, B: 4, C: 16, D: 8 }
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

## Examples

### Importing Labels from Submodules
```javascript
import { l as l_subm_ } from './submodule.mjs'; // e.g., { EVENTS: 8, HANDLERS: 16 }
// Merge with local labels
const l_local_ = l_array(['EVENT', 'CXNS']); // { EVENT: 1, CXNS: 2 }
const l_= l_merge(l_subm_, l_local_); // { EVENTS: 8, HANDLERS: 16, EVENT: 1, CXNS: 2 }

LOGR_.labels = l_;
```

### Label Reassignment and Toggling Example

This section demonstrates the proper way to reassign labels and manage toggled states in the module.

```javascript
import { l as module_l_, log_as_member } from './module.mjs';

// Reassign label values in submodule
Object.assign(module_l_, l_array(['EVENTS', 'HANDLERS']));

// Update the local labels to include the reassignment
const l_ = l_concat(module_l_, ['DEL', 'MORE_EVENTS']);

// Updating the labels; ZEROS OUT TOGGLED!
local_LOGR_.labels = l_;

// Set the desired toggled states
local_LOGR_.toggled = {
    // EVENTS: 0b1 << 0,
    MORE_EVENTS: 0b1 << 3,  // connections
};

// This should NOT fire, because EVENTS is not toggled
log_as_member();

// Set different toggled states
local_LOGR_.toggled = {
    EVENTS: 0b1 << 0,
    // MORE_EVENTS: 0b1 << 3,  // connections
};

// This should now fire with EVENTS toggled
log_as_member();
```

### Custom Handler
```javascript
LOGR_.handler = (...args) => console.warn('WARN:', ...args);
LOGR_.toggled = { EVENT: true };
LOGR_.log(l_.EVENT, () => ['Debug warning']); // "WARN: Debug warning"
```


## Development vs. Production

### Development Mode

Set `LOGR_ENABLED = true` (default or via build config) to enable logging:
```javascript
LOGR_.toggled = { EVENT: true };
LOGR_.log(l_.EVENT, () => ['Dev log']); // Logs "Dev log"
LOGR_.log(l_.CXNS, () => ['No log']); // Skipped
```

### Production Mode
Set `LOGR_ENABLED = false `(e.g., via Webpack `DefinePlugin`) to disable logging with no performance cost:
```javascript
// In production with LOGR_ENABLED = false
LOGR_.log(l_.EVENT, () => ['Expensive computation']); // No-op, thunk not evaluated
```

Use a build tool to replace LOGR_ENABLED at compile time:
```javascript
// webpack.config.js
const webpack = require('webpack');
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      LOGR_ENABLED: JSON.stringify(false),
    }),
  ],
};
```

## Performance Optimization with Static Functions
For critical paths, bind the log method to a static function to avoid repeated property lookups:
```javascript
const log_ = LOGR_.log.bind(LOGR);
function criticalPath() {
  log_(l_.EVENT, () => ['Fast log']); // Slightly faster than logger.log
}
```


## Limitations
- **32-Bit Limit**: Supports up to 31 labels before overflow (JavaScript’s 32-bit integer limit).
- **Singleton Scope**: Shared instance requires label consistency across modules.


