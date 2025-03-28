
import { BitLogr, l_LL, l_RR } from '../src/logr.mjs';

describe("BitLogr and Helper Functions", () => {
	let LOGR_;
	const l_= {
		DEL : 0b1 << 0,		// removed
		CXNS : 0b1 << 2,	// connections
	}

	beforeEach(() => {
		LOGR_ = new BitLogr();
		LOGR_.labels= l_;
		// Spy on console.log before each test
		spyOn(console, "log");
		// spyOn(console, "log").and.callThrough(); // callThrough ensures the original console.log still executes
	});

	afterEach(() => {
		// Reset the spy after each test to avoid interference
		console.log.calls.reset();
	});

	describe("l_LL", () => {

		it("should handle zero shift correctly", () => {
			const result = l_LL(l_, 0);
			expect(result).toEqual(l_);
		});

		it("should left shift all values in the object", () => {
			const l_new= {
				A : 0b1 << 0,
				B : 0b1 << 1,
				...l_LL(l_, 2)
			};
			expect(l_new).toEqual({ 
				A : 0b1 << 0,
				B : 0b1 << 1,
				DEL : 0b1 << 2,		// removed
				CXNS : 0b1 << 4,	// connections
			});
		});

	});

	describe("l_RR", () => {

		it("should handle zero shift correctly", () => {
			const result = l_RR(l_, 0);
			expect(result).toEqual(l_);
		});

		it("should right shift all values in the object", () => {
			const l_AB= {
				A : 0b1 << 3,
				B : 0b1 << 5,
			};
			const l_new= {
				...l_,
				...l_RR(l_AB, 2)
			}
			expect(l_new).toEqual({ 
				DEL : 0b1 << 0,		// removed
				A : 0b1 << 1,
				B : 0b1 << 3,
				CXNS : 0b1 << 2,	// connections
			});
		});

	});

	// Test for BitLogr class
	describe("BitLogr", () => {

		it("should initialize with default values", () => {
			const LOGR = new BitLogr();
			expect(LOGR.labels).toBe(0n);
			expect(LOGR.toggled).toBe(0n);
			expect(typeof BitLogr.prototype.log).toBe("function");
			expect(typeof LOGR._handler_log).toBe("function");

			spyOn(console, "assert");
			LOGR.toggled = {};
			expect(console.assert).toHaveBeenCalledWith(false, 'no labels initialized')
			expect(LOGR.toggled).toBe(0n);		
		});

		it("log should be NOP ", () => {
			spyOn(LOGR_, "_handler_log");
			let result;

			result = LOGR_.log(l_.DEL, "test message");
			expect(result).toBeUndefined();
			expect(console.log).not.toHaveBeenCalled();					
			expect(LOGR_._handler_log).not.toHaveBeenCalled();	

			LOGR_.toggled = { 
				// DEL : 1,
				// CXNS : 1
			};
			result = LOGR_.log(l_.DEL | l_.CXNS, "test message");
			expect(result).toBeUndefined();
			expect(console.log).not.toHaveBeenCalled();					
			expect(LOGR_._handler_log).not.toHaveBeenCalled();	
		});

		it("verify the initial prototype log function overridden", () => {
			const initialLog = BitLogr.prototype.log;
			// This overrides the log function
			LOGR_.toggled = { 
				DEL : 1,
				CXNS : 1
			};
			expect(BitLogr.prototype.log).not.toBe(initialLog); // Should now be different			
		});

		it("should set and get handler correctly", () => {
			const customHandler = jasmine.createSpy("customHandler");
			LOGR_.handler = customHandler;
			expect(LOGR_._handler_log).toBe(customHandler);
		});

		it("should log to console with default handler when toggled matches", () => {
			LOGR_.toggled = { 
					DEL : 1,
					CXNS : 1
				};
			const result = LOGR_.log(l_.DEL, "test message");
			expect(result).toBeTrue(); // Log should return true when toggled matches
			expect(console.log).toHaveBeenCalledWith("test message");
			expect(console.log).toHaveBeenCalledTimes(1);
		});

		it("should log to console with default handler when toggled matches with OR", () => {
			LOGR_.toggled = { 
				// DEL : 1,
				CXNS : 1
			};
			const result = LOGR_.log(l_.DEL | l_.CXNS, "test message");
			expect(result).toBeTrue(); // Log should return true when toggled matches
			expect(console.log).toHaveBeenCalledWith("test message");
			expect(console.log).toHaveBeenCalledTimes(1);
		});

		it("should not log to console when toggled does not match", () => {
			LOGR_.toggled = { 
				// DEL : 1,
				CXNS : 1
			};
			const result = LOGR_.log(l_.DEL, "test message");
			expect(result).toBeFalse(); // Log should return false when no match
			expect(console.log).not.toHaveBeenCalled();
		});
  
		it("should log multiple arguments to console with default handler", () => {
			LOGR_.toggled = { 
				DEL : 1,
				// CXNS : 1
			};
			LOGR_.log(l_.DEL, "test", 42, { foo: "bar" });
			expect(console.log).toHaveBeenCalledWith("test", 42, { foo: "bar" });
			expect(console.log).toHaveBeenCalledTimes(1);
		});
  
	});


});

describe("BitLogr performance;", () => {
	let LOGR_;
	const l_= {
		DEL : 0b1 << 0,		// removed
		CXNS : 0b1 << 2,	// connections
	}

	beforeEach(() => {
		LOGR_ = new BitLogr();
		LOGR_.labels= l_;
		// Spy on console.log before each test
		spyOn(console, "log").and.callThrough(); // callThrough ensures the original console.log still executes
	});

	afterEach(() => {
		// Reset the spy after each test to avoid interference
		console.log.calls.reset();
	});


	fit("NOP", () => {
		const fxn_empty = function() {
			// Empty function (NOP)
		}

		// Store log function locally
		const logFn = LOGR_.log;
		const fxn_log = function() {
			logFn(l_.DEL | l_.CXNS, "this message should not log");
			// LOGR_.log(l_.DEL | l_.CXNS, "this message should not log");
		}

		// Warm-up runs to avoid JIT compilation skewing results
		for (let i = 0; i < 1000; i++) {
			fxn_empty();
			fxn_log();
		}

		// Measure empty function performance
		const start_empty = performance.now();
		for (let i = 0; i < 1000000000; i++) {
			fxn_empty();
		}
		const end_empty = performance.now();
		const t_empty = end_empty - start_empty;

		// Measure logging function performance
		const start_log = performance.now();
		for (let i = 0; i < 1000000000; i++) {
			fxn_log();
		}
		const end_log = performance.now();
		const t_log = end_log - start_log;

		// Calculate and log results
		const difference = t_log - t_empty;
		const percentSlower = ((t_log - t_empty) / t_empty * 100).toFixed(2);

		console.log(`Empty function time: ${t_empty.toFixed(2)}ms`);
		console.log(`Logging function time: ${t_log.toFixed(2)}ms`);
		console.log(`Difference: ${difference.toFixed(2)}ms`);
		console.log(`Logging function is ${percentSlower}% slower`);

		// Basic assertion to ensure test passes
		expect(true).toBe(true);
	});

});
