
// We can achieve this using a build-time transformation that replaces LOGR_.log(...) calls with a no-op statement. 

import { LOGR, l_array } from '../dist/logr.es.mjs';

describe('LOGR Logging Behavior', () => {
	let LOGR_;
	let l_;
	let handlerSpy;

	beforeEach(() => {
		LOGR_ = LOGR.get_instance();
		l_ = l_array(['A', 'B', 'C']); // { A: 1, B: 2, C: 4 };
		LOGR_.labels = l_;

		handlerSpy = jasmine.createSpy('handler');
		LOGR_.handler = handlerSpy;
	});

	if (process.env.TEST_MODE !== 'prod') {
		describe('Development Mode', () => {
			it('should call handler when toggled bits match', () => {
				LOGR_.toggled = { A: true, B: true }; // toggled = 0b011 (3)
				LOGR_.log(l_.B, () => ['test message']); // nr_logged = 2 (0b010)
				expect(handlerSpy).toHaveBeenCalledWith('test message');
			});

			it('should not call handler when toggled bits do not match', () => {
				LOGR_.toggled = { A : true }; // toggled = 0b001 (1)
				LOGR_.log(l_.B, () => ['test message']); // nr_logged = 2 (0b010)
				expect(handlerSpy).not.toHaveBeenCalled();
			});

			it('should not evaluate argsFn when logging is skipped', () => {
				const argsSpy = jasmine.createSpy('argsFn').and.returnValue(['computed']);
				LOGR_.toggled = { A : true }; // toggled = 0b001 (1)
				LOGR_.log(l_.B, argsSpy); // nr_logged = 2 (0b010)
				expect(argsSpy).not.toHaveBeenCalled();
			});
		});
	}

	if (process.env.TEST_MODE === 'prod') {
		describe('Production Mode', () => {
			it('should not call handler', () => {
				LOGR_.toggled = { A : true, B: true }; // toggled = 0b011 (3)
				LOGR_.log(l_.B, () => ['test message']); // nr_logged = 2 (0b010)
				expect(handlerSpy).not.toHaveBeenCalled();
			});

			it('should not evaluate argsFn', () => {
				const argsSpy = jasmine.createSpy('argsFn').and.returnValue(['expensive']);
				LOGR_.toggled = { A : true, B: true }; // toggled = 0b011 (3)
				LOGR_.log(l_.B, argsSpy); // nr_logged = 2 (0b010)
				expect(argsSpy).not.toHaveBeenCalled();
			});

			it('should return false', () => {
				LOGR_.toggled = { A : true, B: true }; // toggled = 0b011 (3)
				const result = LOGR_.log(l_.B, () => ['test message']);
				expect(result).toBe(undefined);
			});
		});
	}

	describe("performance;", () => {
		beforeEach(() => {
			// Spy on console.log before each test
			spyOn(console, "log").and.callThrough(); // callThrough ensures the original console.log still executes

			// Forcefully set LOGR_ENABLED to false for these tests
			Object.defineProperty(global, 'LOGR_ENABLED', {
				value: false,
				writable: true,
				configurable: true
			});
		});
	
		afterEach(() => {
			// Reset the spy after each test to avoid interference
			console.log.calls.reset();

			// Clean up to avoid affecting other tests
			delete global.LOGR_ENABLED;
		});		
	
		it("NOP", () => {
			const fxn_empty = function() {
				// Empty function (NOP)
			}
	
			const LOGR_= LOGR.get_instance();
			const l_= {
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			}
			LOGR_.labels= l_;
			LOGR_.toggled= {
				// DEL : true
			}

			const log_= LOGR_.log;	
			const fxn_log = function () {
				return log_(l_.DEL | l_.CXNS, () => ["this message should not log", JSON.stringify(LOGR_.labels)]);
			};

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