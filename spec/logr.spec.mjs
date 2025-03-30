
import { LOGR, l_array, l_concat, l_concat_array, l_LL, l_RR } from '../src/logr.mjs';

describe("LOGR and Helper Functions", () => {
	let LOGR_;
	const l_= {
		DEL : 0b1 << 0,		// removed
		CXNS : 0b1 << 2,	// connections
	}

	beforeEach(() => {
		LOGR_ = new LOGR();
		LOGR_.labels= l_;
	});

	describe("functionality;", () => {
		let consoleSpy;

		beforeEach(() => {
			// Spy on console.log before each test
			consoleSpy = spyOn(console, "log");
		});

		afterEach(() => {
			// Reset the spy after each test to avoid interference
			console.log.calls.reset();
		});

		describe('l_array', () => {
			it('should assign correct bit values sequentially', () => {
				const l_ = l_array(['DEL', 'CXNS', 'ACTIVE']);
				
				expect(l_.DEL).toBe(1);    // 2⁰
				expect(l_.CXNS).toBe(2);   // 2¹
				expect(l_.ACTIVE).toBe(4); // 2²
			});
		
			it('should work with a single label', () => {
				const l_ = l_array(['ONLY']);
				expect(l_.ONLY).toBe(1);
				expect(Object.keys(l_).length).toBe(1);
			});
		
			it('should create an empty object with empty array', () => {
				const l_ = l_array([]);
				expect(l_).toEqual({});
				expect(Object.keys(l_).length).toBe(0);
			});
		
			it('should return a frozen object', () => {
				const l_ = l_array(['DEL', 'CXNS']);
				
				expect(Object.isFrozen(l_)).toBe(true);
        
				// In strict mode, attempting to modify a frozen object throws
				expect(() => {
					l_.DEL = 100;
				}).toThrowError(TypeError, /Cannot assign to read only property 'DEL'/);
				
				// Verify the value remains unchanged
				expect(l_.DEL).toBe(1);
			});
		
			it('should support bitwise operations', () => {
				const l_ = l_array(['READ', 'WRITE']);
				const combined = l_.READ | l_.WRITE; // 1 | 2 = 3
				
				expect(combined).toBe(3);
				expect((combined & l_.READ) !== 0).toBe(true);
				expect((combined & l_.WRITE) !== 0).toBe(true);
			});
		
			it('should handle different label sets independently', () => {
				const l1_ = l_array(['A', 'B']);
				const l2_ = l_array(['X', 'Y', 'Z']);
				
				expect(l1_.A).toBe(1);
				expect(l1_.B).toBe(2);
				expect(l2_.X).toBe(1);
				expect(l2_.Y).toBe(2);
				expect(l2_.Z).toBe(4);
			});

			it('should create flags starting at specified index', () => {
				const l_ = l_array(['DEL', 'CXNS'], 0b1 << 2);
				expect(l_).toEqual({
					DEL: 0b1 << 2,  // 4
					CXNS: 0b1 << 3  // 8
				});
			});
		
		});

		describe('l_concat', () => {
			const l_ = l_array(['DEL', 'CXNS']); // DEL: 1, CXNS: 2
			const l_AB = {
				A: 0b1 << 3,  // 8
				B: 0b1 << 5   // 32
			};
		
			it('should merge flag sets while preserving original values', () => {
				const l_concatd_ = l_concat(l_, l_AB);
				
				expect(l_concatd_).toEqual({
					DEL: 0b1 << 0,  // 1 (from l_)
					CXNS: 0b1 << 1, // 2 (from l_)
					A: 0b1 << 3,    // 8 (from l_AB, unchanged)
					B: 0b1 << 5     // 32 (from l_AB, unchanged)
				});
			});
		
			it('values when keys overlap', () => {
				const l1_ = l_array(['A'], 0b1 << 3); // A: 8
				const l2_ = l_array(['A'], 0b1 << 1); // A: 2
				const l_concatd_ = l_concat(l1_, l2_);
				
				expect(l_concatd_.A).toBe(0b1 << 3); // 8 (first set wins)
			});

		});

		describe('l_concat_array', () => {
			it('should add new labels after existing ones', () => {
				const l_ = l_array(['DEL', 'CXNS']); // DEL: 1, CXNS: 2
				const l_concatd_ = l_concat_array(l_, ['READ', 'WRITE']);
				
				expect(l_concatd_).toEqual({
					DEL: 0b1 << 0,   // 1
					CXNS: 0b1 << 1,  // 2
					READ: 0b1 << 2,  // 4
					WRITE: 0b1 << 3  // 8
				});
			});
		
			it('should preserve higher existing values', () => {
				const l_AB_ = { A: 0b1 << 3, B: 0b1 << 5 }; // A: 8, B: 32
				const l_concatd_ = l_concat_array(l_AB_, ['X', 'Y']);
				
				expect(l_concatd_).toEqual({
					A: 0b1 << 3,    // 8
					B: 0b1 << 5,    // 32
					X: 0b1 << 6,    // 64
					Y: 0b1 << 7     // 128
				});
			});
		
			it('should work with empty existing set', () => {
				const l_concatd_ = l_concat_array({}, ['DEL', 'CXNS']);
				
				expect(l_concatd_).toEqual({
					DEL: 0b1 << 0,  // 1
					CXNS: 0b1 << 1  // 2
				});
			});
		
			it('should handle single new label', () => {
				const l_ = l_array(['DEL']); // DEL: 1
				const l_concatd_ = l_concat_array(l_, ['NEXT']);
				
				expect(l_concatd_).toEqual({
					DEL: 0b1 << 0,  // 1
					NEXT: 0b1 << 1  // 2
				});
			});
		
			it('should preserve original values with no overlap', () => {
				const l_ = l_array(['DEL', 'CXNS'], 0b1 << 2); // DEL: 4, CXNS: 8
				const l_concatd_ = l_concat_array(l_, ['READ', 'WRITE']);
				
				expect(l_concatd_).toEqual({
					DEL: 0b1 << 2,   // 4
					CXNS: 0b1 << 3,  // 8
					READ: 0b1 << 4,  // 16
					WRITE: 0b1 << 5  // 32
				});
			});

			it('direct concat of arrays', () => {
				const l_concatd_ = l_concat_array(l_array(['DEL', 'CXNS']), ['READ', 'WRITE']);
				expect(l_concatd_).toEqual({
					DEL: 0b1 << 0,   // 1
					CXNS: 0b1 << 1,  // 2
					READ: 0b1 << 2,  // 4
					WRITE: 0b1 << 3  // 8
				});
			});

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
		describe("LOGR;", () => {

			it("should initialize with default values", () => {
				const LOGR_ = new LOGR();
				expect(LOGR_.labels).toBe(0n);
				expect(LOGR_.toggled).toBe(0n);
				expect(typeof LOGR_._log_fxn).toBe("function");
				expect(typeof LOGR_._handler_log).toBe("function");

				spyOn(console, "assert");
				LOGR_.getLogger({});
				expect(console.assert).toHaveBeenCalledWith(false, 'no labels initialized')
				expect(LOGR_.toggled).toBe(0n);		
			});

			it("log should be NOP ", () => {
				spyOn(LOGR_, "_handler_log");
				let result;

				let log_;

				log_ = LOGR_.getLogger();
				result = log_(l_.DEL, "test message");
				expect(result).toBeUndefined();
				expect(console.log).not.toHaveBeenCalled();					
				expect(LOGR_._handler_log).not.toHaveBeenCalled();	

				log_ = LOGR_.getLogger({ 
						// DEL : 1,
						// CXNS : 1
					});
				result = log_(l_.DEL | l_.CXNS, "test message");
				expect(result).toBeUndefined();
				expect(console.log).not.toHaveBeenCalled();					
				expect(LOGR_._handler_log).not.toHaveBeenCalled();	
			});

			it("verify the initial prototype log function overridden", () => {
				const initialLog = LOGR_._log_fxn;
				// This overrides the log function
				LOGR_.getLogger({ 
						DEL : 1,
						CXNS : 1
					});
				expect(LOGR_._log_fxn).not.toBe(initialLog); // Should now be different			
			});

			it("should set and get handler correctly", () => {
				const customHandler = jasmine.createSpy("customHandler");
				LOGR_.handler = customHandler;
				expect(LOGR_._handler_log).toBe(customHandler);
			});

			it("should not update the logger after toggling", () => {
				let log_;
				
				log_ = LOGR_.getLogger({});
				log_(l_.DEL, "Initial test");
				expect(consoleSpy).not.toHaveBeenCalled();
	
				log_ = LOGR_.getLogger({ 
						DEL : 1,
						// CXNS : 1
					});
				log_(l_.DEL, "Should log");
				expect(consoleSpy).toHaveBeenCalled();
	
				// Fetching a new logger works
				const log_new_ = LOGR_.getLogger();
				log_new_(l_.DEL, "This should log");
				expect(consoleSpy).toHaveBeenCalledWith("This should log");
			});			

			it("should log to console with default handler when toggled matches", () => {
				const log_ = LOGR_.getLogger({ 
						DEL : 1,
						CXNS : 1
					});
				const result = log_(l_.DEL, "test message");
				expect(result).toBeTrue(); // Log should return true when toggled matches
				expect(console.log).toHaveBeenCalledWith("test message");
				expect(console.log).toHaveBeenCalledTimes(1);
			});

			it("should log to console with default handler when toggled matches with OR", () => {
				const log_ = LOGR_.getLogger({ 
						// DEL : 1,
						CXNS : 1
					});
				const result = log_(l_.DEL | l_.CXNS, "test message");
				expect(result).toBeTrue(); // Log should return true when toggled matches
				expect(console.log).toHaveBeenCalledWith("test message");
				expect(console.log).toHaveBeenCalledTimes(1);
			});

			it("should not log to console when toggled does not match", () => {
				const log_ = LOGR_.getLogger({ 
						// DEL : 1,
						CXNS : 1
					});
				const result = log_(l_.DEL, "test message");
				expect(result).toBeFalse(); // Log should return false when no match
				expect(console.log).not.toHaveBeenCalled();
			});
	
			it("should log multiple arguments to console with default handler", () => {
				const log_ = LOGR_.getLogger({ 
						DEL : 1,
						// CXNS : 1
					});
				log_(l_.DEL, "test", 42, { foo: "bar" });
				expect(console.log).toHaveBeenCalledWith("test", 42, { foo: "bar" });
				expect(console.log).toHaveBeenCalledTimes(1);
			});
	
		});

	});

	describe("performance;", () => {
		beforeEach(() => {
			// Spy on console.log before each test
			spyOn(console, "log").and.callThrough(); // callThrough ensures the original console.log still executes
		});
	
		afterEach(() => {
			// Reset the spy after each test to avoid interference
			console.log.calls.reset();
		});
	
		it("NOP", () => {
			const fxn_empty = function() {
				// Empty function (NOP)
			}
	
			// Store log function locally
			const log_ = LOGR_.getLogger();
			const fxn_log = function() {
				log_(l_.DEL | l_.CXNS, "this message should not log");
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
		
});

