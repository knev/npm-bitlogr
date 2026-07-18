
import { LOGR, lRef, l_length, l_array, l_concat, l_merge, l_union, l_LL, l_RR, l_assert, _create_Referenced_l } from '../dist/logr.es.mjs';
import * as module_ from './module.mjs';

describe("LOGR(root);", () => {

	describe("helper Functions;", () => {

		describe('l_length_', () => {
			// Test empty input
			it('should return 0b1 << 0 for an empty object', () => {
				expect(l_length({})).toBe(0b1 << 0);  // 1
			});
		
			// Test single value cases (powers of 2)
			it('should return 0b1 << 1 for a single value of 0b1 << 0', () => {
				expect(l_length({ a: 0b1 << 0 })).toBe(0b1 << 1);  // 1 -> 2
			});
		
			it('should return 0b1 << 3 for a single value of 0b1 << 2', () => {
				expect(l_length({ a: 0b1 << 2 })).toBe(0b1 << 3);  // 4 -> 8
			});
		
			// Test multiple values (powers of 2)
			it('should return next power of 2 based on maximum value', () => {
				expect(l_length({ a: 0b1 << 0, b: 0b1 << 1, c: 0b1 << 2 })).toBe(0b1 << 3);  // 1, 2, 4 -> 8
				expect(l_length({ x: 0b1 << 1, y: 0b1 << 3, z: 0b1 << 2 })).toBe(0b1 << 4);  // 2, 8, 4 -> 16
			});
		
			// Test negative and zero values
			// it('should return 0b1 << 0 when all values are zero or negative', () => {
			// 	expect(l_length_({ a: 0 })).toBe(0b1 << 0);  // 0 -> 1
			// 	expect(l_length_({ a: -(0b1 << 0), b: -(0b1 << 1), c: -(0b1 << 2) })).toBe(0b1 << 0);  // -1, -2, -4 -> 1
			// });
		
			// it('should handle mixed positive and negative values', () => {
			// 	expect(l_length_({ a: 0b1 << 1, b: -(0b1 << 1), c: 0b1 << 0 })).toBe(0b1 << 2);  // 2, -2, 1 -> 4
			// 	expect(l_length_({ a: -(0b1 << 2), b: 0b1 << 3, c: -(0b1 << 0) })).toBe(0b1 << 4);  // -4, 8, -1 -> 16
			// });
		
			// Test exact powers of 2
			it('should handle exact powers of 2 correctly', () => {
				expect(l_length({ a: 0b1 << 1 })).toBe(0b1 << 2);  // 2 -> 4
				expect(l_length({ a: 0b1 << 2 })).toBe(0b1 << 3);  // 4 -> 8
				expect(l_length({ a: 0b1 << 3 })).toBe(0b1 << 4);  // 8 -> 16
			});
		
			// Test non-numeric values
			// it('should handle non-numeric values gracefully', () => {
			// 	expect(l_length_({ a: 0b1 << 1, b: 'hello', c: 0b1 << 0 })).toBe(0b1 << 2);  // 2, 'hello', 1 -> 4
			// 	expect(l_length_({ a: null, b: 0b1 << 2, c: undefined })).toBe(0b1 << 3);  // null, 4, undefined -> 8
			// });
		
			// Test large numbers (powers of 2)
			it('should handle large numbers correctly', () => {
				expect(l_length({ a: 0b1 << 9 })).toBe(0b1 << 10);  // 512 -> 1024
				expect(l_length({ a: 0b1 << 10 })).toBe(0b1 << 11);  // 1024 -> 2048
			});
		});

		describe('l_array;', () => {
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

		describe('l_concat (object);', () => {
			const l_ = l_array(['DEL', 'CXNS']); // DEL: 1, CXNS: 2
			const l_AB = {
				A: 0b1 << 3,  // 8
				B: 0b1 << 5   // 32
			};
		
			it('should concat label sets while preserving original values', () => {
				const l_concatd_ = l_concat(l_, l_AB);
				
				expect(l_concatd_).toEqual({
					DEL: 0b1 << 0,  // 1 (from l_)
					CXNS: 0b1 << 1, // 2 (from l_)
					A: 0b1 << 3,    // 8 (from l_AB, unchanged)
					B: 0b1 << 5     // 32 (from l_AB, unchanged)
				});
			});
		
			// it('IF duplicate keys they should have the same value,  ', () => {
			// 	const l1_ = l_array(['A'], 0b1 << 3); // A: 8
			// 	const l2_ = l_array(['A'], 0b1 << 1); // A: 2
			// 	const l_concatd_ = l_concat(l1_, l2_);
				
			// 	expect(l_concatd_.A).toBe(0b1 << 3); // 8 (first set wins)
			// });

		});

		describe('l_concat (array);', () => {
			it('should add new labels after existing ones', () => {
				const l_ = l_array(['DEL', 'CXNS']); // DEL: 1, CXNS: 2
				const l_concatd_ = l_concat(l_, ['READ', 'WRITE']);
				
				expect(l_concatd_).toEqual({
					DEL: 0b1 << 0,   // 1
					CXNS: 0b1 << 1,  // 2
					READ: 0b1 << 2,  // 4
					WRITE: 0b1 << 3  // 8
				});
			});
		
			it('should work with empty existing set', () => {
				const l_concatd_ = l_concat({}, ['DEL', 'CXNS']);
				
				expect(l_concatd_).toEqual({
					DEL: 0b1 << 0,  // 1
					CXNS: 0b1 << 1  // 2
				});
			});
		
			it('should handle single new label', () => {
				const l_ = l_array(['DEL']); // DEL: 1
				const l_concatd_ = l_concat(l_, ['NEXT']);
				
				expect(l_concatd_).toEqual({
					DEL: 0b1 << 0,  // 1
					NEXT: 0b1 << 1  // 2
				});
			});
		
			it('should preserve original values with no overlap', () => {
				const l_ = l_array(['DEL', 'CXNS'], 0b1 << 2); // DEL: 4, CXNS: 8
				const l_concatd_ = l_concat(l_, ['READ', 'WRITE']);
				
				expect(l_concatd_).toEqual({
					DEL: 0b1 << 2,   // 4
					CXNS: 0b1 << 3,  // 8
					READ: 0b1 << 4,  // 16
					WRITE: 0b1 << 5  // 32
				});
			});

			it('concat with a gap', () => {
				const l_ = l_array(['DEL', 'CXNS'], 0b1 << 2); // DEL: 4, CXNS: 8
				const l_concatd_ = l_concat(l_, {
					READ: 0b1 << 0,
					WRITE: 0b1 << 3
				});

				expect(l_concatd_).toEqual({
					DEL: 0b1 << 2,   // 4
					CXNS: 0b1 << 3,  // 8
					READ: 0b1 << 4,  // 16
					WRITE: 0b1 << 7
				});
			});

			it('direct concat of arrays', () => {
				const l_concatd_ = l_concat(l_array(['DEL', 'CXNS']), ['READ', 'WRITE']);
				expect(l_concatd_).toEqual({
					DEL: 0b1 << 0,   // 1
					CXNS: 0b1 << 1,  // 2
					READ: 0b1 << 2,  // 4
					WRITE: 0b1 << 3  // 8
				});
			});

		});

		describe('l_merge;', () => {
			it('should merge non-overlapping interspersed label sets', () => {
				const l1 = { A: 0b1 << 3, B: 0b1 << 1 }; // A: 8, B: 2
				const l2 = { C: 0b1 << 0, D: 0b1 << 4 }; // C: 1, D: 16
				const l_merged_ = l_merge(l1, l2);
				
				expect(l_merged_).toEqual({
					A: 0b1 << 3,  // 8
					B: 0b1 << 1,  // 2
					C: 0b1 << 0,  // 1
					D: 0b1 << 4   // 16
				});
			});

			it('should handle same keys with same values', () => {
				const l1 = { A: 0b1 << 3, B: 0b1 << 1 }; // A: 8, B: 2
				const l2 = { A: 0b1 << 3, C: 0b1 << 0 }; // A: 8 (same), C: 1
				const l_merged_ = l_merge(l1, l2);
				
				expect(l_merged_).toEqual({
					A: 0b1 << 3,  // 8 (from both, same value)
					B: 0b1 << 1,  // 2
					C: 0b1 << 0   // 1
				});
			});

			it('should shift values for different keys with same value', () => {
				const l1 = { A: 0b1 << 1, B: 0b1 << 4 }; // A: 2, B: 16
				const l2 = { C: 0b1 << 1, D: 0b1 << 3 }; // C: 2 (conflicts with A), D: 8
				const l_merged_ = l_merge(l1, l2);
				
				expect(l_merged_).toEqual({
					A: 0b1 << 1,  // 2 (from l1)
					B: 0b1 << 4,  // 16
					C: 0b1 << 5,  // 32 (C shifted from 2)
					D: 0b1 << 3   // 8
				});
			});

			it('should handle multiple interspersed values with shifts', () => {
				const l1 = { 
					A: 0b1 << 3,  // 8
					B: 0b1 << 1,  // 2
					C: 0b1 << 5   // 32
				};
				const l2 = { 
					D: 0b1 << 1,  // 2 (conflicts with B)
					E: 0b1 << 3,  // 8 (conflicts with A)
					F: 0b1 << 4   // 16
				};
				const l_merged_ = l_merge(l1, l2);
				
				expect(l_merged_).toEqual({
					A: 0b1 << 3,  // 8
					B: 0b1 << 1,  // 2
					C: 0b1 << 5,  // 32
					D: 0b1 << 6,  // 64 (D shifted from 2)
					E: 0b1 << 7,  // 128 (E shifted from 8)
					F: 0b1 << 4   // 16
				});
			});

			it('should handle sparse interspersed values', () => {
				const l1 = { 
					X: 0b1 << 0,  // 1
					Y: 0b1 << 10, // 1024
					Z: 0b1 << 5   // 32
				};
				const l2 = { 
					W: 0b1 << 0,  // 1 (conflicts with X)
					V: 0b1 << 5,  // 32 (conflicts with Z)
					U: 0b1 << 8   // 256
				};
				const l_merged_ = l_merge(l1, l2);
				
				expect(l_merged_).toEqual({
					X: 0b1 << 0,   // 1
					Y: 0b1 << 10,  // 1024
					Z: 0b1 << 5,   // 32
					W: 0b1 << 11,  // 2048 (W shifted from 1)
					V: 0b1 << 12,  // 4096 (V shifted from 32)
					U: 0b1 << 8    // 256
				});
			});

			it('should throw error for same keys with different values', () => {
				const l1 = { A: 0b1 << 3 }; // A: 8
				const l2 = { A: 0b1 << 4 }; // A: 16 (different value)
				expect(() => {
					l_merge(l1, l2);
				}).toThrowError(Error, "Key 'A' has conflicting values: 8 (obj_labels1) vs 16 (obj_labels2)");
			});

		});

		describe('l_union;', () => {
			it('should return a frozen empty object for no args', () => {
				const l_ = l_union();
				expect(l_).toEqual({});
				expect(Object.isFrozen(l_)).toBe(true);
			});

			it('should return an empty object for all-empty objects', () => {
				expect(l_union({}, {}, {})).toEqual({});
			});

			it('should renumber a single object contiguously from bit 0', () => {
				// incoming values are discarded, names are re-packed from bit 0
				expect(l_union({ A: 0b1 << 3, B: 0b1 << 1 })).toEqual({
					A: 0b1 << 0, // 1
					B: 0b1 << 1  // 2
				});
			});

			it('should assign contiguous bits across multiple objects in first-appearance order', () => {
				const l_ = l_union(
					{ CONNECTIONS: 1, REFLECTION: 2 },
					{ VALIDATION: 1 },
					{ HANDLERS: 8, DROPS: 16 }
				);
				expect(l_).toEqual({
					CONNECTIONS: 0b1 << 0, // 1
					REFLECTION:  0b1 << 1, // 2
					VALIDATION:  0b1 << 2, // 4
					HANDLERS:    0b1 << 3, // 8
					DROPS:       0b1 << 4  // 16
				});
			});

			it('should dedupe a shared name to ONE bit with no throw, even with different incoming values', () => {
				// l_merge throws here; l_union collapses by name
				const l_ = l_union({ VALIDATION: 1 }, { VALIDATION: 4 });
				expect(l_).toEqual({ VALIDATION: 0b1 << 0 });
				expect(Object.keys(l_).length).toBe(1);
			});

			it('should collapse VALIDATION across three submodule tables', () => {
				const l_json_msg_ = { VALIDATION: 1 };
				const l_twoPhW_   = { LOG_EVENTS: 1, TIMEOUTS: 2, VALIDATION: 4, HANDLERS: 8 };
				const l_subverse_ = { VALIDATION: 1 };
				const l_ = l_union(l_json_msg_, l_twoPhW_, l_subverse_);
				expect(l_).toEqual({
					VALIDATION: 0b1 << 0, // 1 (first seen in json_msg)
					LOG_EVENTS: 0b1 << 1, // 2
					TIMEOUTS:   0b1 << 2, // 4
					HANDLERS:   0b1 << 3  // 8
				});
			});

			it('should let list order decide which labels keep the low bits', () => {
				const l_pkg_ = { VALIDATION: 1, PARSE: 2 };
				const l_app_ = { CONNECTIONS: 1, REFLECTION: 2 };
				// app first -> app keeps bits 0,1; package pushed up
				expect(l_union(l_app_, l_pkg_)).toEqual({
					CONNECTIONS: 0b1 << 0,
					REFLECTION:  0b1 << 1,
					VALIDATION:  0b1 << 2,
					PARSE:       0b1 << 3
				});
			});

			it('should return a frozen object', () => {
				const l_ = l_union({ A: 1 }, { B: 2 });
				expect(Object.isFrozen(l_)).toBe(true);
			});

			it('should throw for a non-object arg', () => {
				expect(() => l_union({ A: 1 }, 42)).toThrowError(Error, 'obj_labels must be an object');
				expect(() => l_union(null)).toThrowError(Error, 'obj_labels must be an object');
			});

			it('should throw for an array arg (names go through l_array, not l_union)', () => {
				expect(() => l_union(['A', 'B'])).toThrowError(Error, 'obj_labels must be an object');
			});

			it('should skip __proto__ and constructor keys', () => {
				const l_ = l_union(JSON.parse('{ "__proto__": 1, "constructor": 2, "REAL": 4 }'));
				expect(l_).toEqual({ REAL: 0b1 << 0 });
			});

			it('should handle exactly 31 unique labels without overflow', () => {
				const arr_ = Array(31).fill().map((_, i) => `L${i}`);
				const l_ = l_union(l_array(arr_));
				expect(l_.L0).toBe(1);
				expect(l_.L30).toBe(1 << 30);
				expect(Object.keys(l_).length).toBe(31);
			});

			it('should throw at >31 unique labels', () => {
				const arr_ = Array(32).fill().map((_, i) => `L${i}`);
				expect(() => l_union(l_array(arr_))).toThrowError(Error, /exceed the 31-bit limit/);
			});
		});

		describe('bit Label Limits;', () => {
			// Helper to generate an array of labels
			const generateLabels = (count) => Array(count).fill().map((_, i) => `L${i}`);
		
			it('should handle exactly 31 bits without overflow', () => {
				const labels = generateLabels(31); // L0 to L30
				const l_ = l_array(labels, 1);
				
				expect(l_.L0).toBe(1);           // 2⁰
				expect(l_.L1).toBe(2);           // 2¹
				expect(l_.L29).toBe(1 << 29);    // 2²⁹ = 536,870,912
				expect(l_.L30).toBe(1 << 30);    // 2³⁰ = 1,073,741,824
				expect(Object.keys(l_).length).toBe(31);
			});
		
			it('should overflow at 32 bits in l_array', () => {
				const labels32 = generateLabels(32); // L0 to L31
				const l_32bit_ = l_array(labels32, 1);
				
				expect(l_32bit_.L0).toBe(1);           // 2⁰
				expect(l_32bit_.L30).toBe(1 << 30);    // 2³⁰ = 1,073,741,824
				expect(l_32bit_.L31).toBe(1 << 31);    // 2³¹ = -2147483648 (signed 32-bit max)
				expect(Object.keys(l_32bit_).length).toBe(32);
			
				// Test one more to see wraparound
				const labels33 = generateLabels(33); // L0 to L32
				const l_33bits_ = l_array(labels33, 1);
				
				expect(l_33bits_.L31).toBe(1 << 31);    // 2³¹ = -2147483648
				expect(l_33bits_.L32).toBe(1);          // 2³² wraps to 1 (32 & 0b11111 = 0)
				expect(Object.keys(l_33bits_).length).toBe(33);
			});
		
			it('should handle 31 bits in l_concat_array_ without overflow', () => {
				const l_ = l_array(generateLabels(29), 1); // L0 to L28 (2⁰ to 2²⁸)
				const l_concatd_ = l_concat(l_, ['L29', 'L30']);
				
				expect(l_.L0).toBe(1);         // 2⁰
				expect(l_.L28).toBe(1 << 28);  // 2²⁸ = 268,435,456
				expect(l_concatd_.L29).toBe(1 << 29);   // 2²⁹ = 536,870,912
				expect(l_concatd_.L30).toBe(1 << 30);   // 2³⁰ = 1,073,741,824
				expect(Object.keys(l_concatd_).length).toBe(31);
			});
		
			it('should overflow at 32 bits in l_concat_array_', () => {
				const l_ = l_array(generateLabels(30), 1); // L0 to L29 (2⁰ to 2²⁹)
				const l_concatd_ = l_concat(l_, ['L30', 'L31']);
				
				expect(l_.L0).toBe(1);          // 2⁰
				expect(l_.L29).toBe(1 << 29);   // 2²⁹ = 536,870,912
				expect(l_concatd_.L30).toBe(1 << 30);   // 2³⁰ = 1,073,741,824
				expect(l_concatd_.L31).toBe(1 << 31);   // 2³¹ = -2147483648 (not 0)
				expect(Object.keys(l_concatd_).length).toBe(32);
			});
				
			it('should overflow at 32 bits in merge_full_ with value conflict', () => {
				const l1_ = l_array(generateLabels(30), 1); // L0 to L29 (2⁰ to 2²⁹)
				const l2_ = { X: 1 << 1 }; // X: 2 (conflicts with L1)
				const l_merged_ = l_merge(l1_, l2_);
				
				expect(l_merged_.L0).toBe(1);          // 2⁰
				expect(l_merged_.L29).toBe(1 << 29);   // 2²⁹ = 536,870,912
				expect(l_merged_.X).toBe(1 << 30);     // 2³⁰ = 1,073,741,824 (shifted from 2)
				expect(Object.keys(l_merged_).length).toBe(31);
				
				// Adding one more should push to overflow
				const l3_ = { Y: 1 << 2 }; // Y: 4 (conflicts with L2)
				const l_final_ = l_merge(l_merged_, l3_);
				expect(l_final_.Y).toBe(1 << 31);      // 2³¹ = -2147483648 (not 0)
				expect(Object.keys(l_final_).length).toBe(32);
			});
		});

		describe("l_LL;", () => {
			const l_= {
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			}

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

		describe("l_RR;", () => {
			const l_= {
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			}
	
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

		describe("l_assert;", () => {
			const l_= {
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			}
	
			it("actual empty", () => {
				expect( l_assert({}, { 
					DEL : 0b1 << 0,		// removed
					CXNS : 0b1 << 2,	// connections
				}) ).toEqual(false);
			});

			it("expect nothing, all extra", () => {
				expect( l_assert(l_, { 
				}) ).toEqual(true);
			});

			it("assert true", () => {
				expect( l_assert(l_, { 
					DEL : 0b1 << 0,		// removed
					CXNS : 0b1 << 2,	// connections
				}) ).toEqual(true);
			});

			it("assert lRef true", () => {
				const lref_ = lRef(l_);			
				expect( l_assert(lref_.get(), { 
					DEL : 0b1 << 0,		// removed
					CXNS : 0b1 << 2,	// connections
				}) ).toEqual(true);
			});

			it("assert more true", () => {
				const l_AB= {
					A : 0b1 << 3,
					B : 0b1 << 5,
				};
				const l_new= {
					...l_,
					...l_RR(l_AB, 2)
				}
				expect( l_assert(l_new, { 
					DEL : 0b1 << 0,		// removed
					A : 0b1 << 1,
					B : 0b1 << 3,
					CXNS : 0b1 << 2,	// connections
				}) ).toEqual(true);
			});

			it("order doesn't matter", () => {
				expect( l_assert(l_, { 
					CXNS : 0b1 << 2,	// connections
					DEL : 0b1 << 0,		// removed
				}) ).toEqual(true);
			});

			it("DEL has wrong value", () => {
				expect( l_assert(l_, { 
					DEL : 0b1 << 1,		// removed
					CXNS : 0b1 << 2,	// connections
				}) ).toEqual(false);
			});

			it("require less ", () => {
				expect( l_assert(l_, { 
					DEL : 0b1 << 0,		// removed
				}) ).toEqual(true);
			});

			it("require MORE than exists", () => {
				expect( l_assert(l_, { 
					DEL : 0b1 << 0,		// removed
					MORE : 0b1 << 1,		
					CXNS : 0b1 << 2,	// connections
				}) ).toEqual(false);
			});

			it("conflicting values", () => {
				expect( l_assert(l_, { 
					DEL : 0b1 << 2,		// removed
					CXNS : 0b1 << 2,	// connections
				}) ).toEqual(false);
			});

		});

	});

	describe("LOGR;", () => {
		let LOGR_;

		beforeEach(() => {
			LOGR_= LOGR.get_instance();
			// const logr_ = LOGR_.create({ labels: module_l_ });

			LOGR_.toggle(module_.logr_.lref.get(), {}); // reset the labels back to that of submodule

			// Spy on console.log before each test
			spyOn(console, "log").and.callThrough(); // callThrough ensures the original console.log still executes
		});

		afterEach(() => {
			// Reset the spy after each test to avoid interference
			console.log.calls.reset();
		});
	
		it("lRef", () => {
			let options;

			const lref_undef = lRef(undefined);
			expect(lref_undef).toBe(undefined);

			options= {}
			expect( lRef(options.arr_labels) ?? undefined ).toEqual(undefined);	

			options= {
				labels: {}
			}
			expect( (lRef(options.labels) ?? undefined).get() ).toEqual({});	

			const lref = lRef({
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			});
			expect(lref.get()).toEqual({ 
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			});			

			let logr_;
			
			logr_= LOGR_.create();
			expect(logr_.lref).toBe(undefined);

			logr_= LOGR_.create({ 
				labels: {
					DEL : 0b1 << 0,		// removed
					CXNS : 0b1 << 2,	// connections
				} 
			});

			expect(logr_.lref.get()).toEqual({ 
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			});			

			expect(logr_.l.get()).toEqual({ 
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			});			

			const lref_orig= logr_.lref;
			logr_.lref.set({ 
				ADD : 0b1 << 0,		// removed
				DISCONNECT : 0b1 << 2,	// connections
			})

			expect(logr_.lref.get()).toEqual({ 
				ADD : 0b1 << 0,		// removed
				DISCONNECT : 0b1 << 2,	// connections
			});			

			expect(logr_.lref == lref_orig).toEqual(true);
		});

		it("_create_Referenced_l", () => {
			// const logr_ = LOGR_.create({ 
			// 	labels: {
			// 		CXNS : 0b1 << 2,	// connections
			// 		EVENTS : 0b1 << 3,
			// 		HANDLERS : 0b1 << 4,
			// 	}
			// });
			const lref_orig= module_.logr_.lref;

			expect(module_.logr_.lref.get()).toEqual({ 
				CXNS : 0b1 << 2,	// connections
				EVENTS : 0b1 << 3,
				HANDLERS : 0b1 << 4,
			});			
			const module_l_= module_.logr_.l;
			expect(module_l_.CXNS).toBe(4);
			expect(module_l_.EVENTS).toBe(8);
			expect(module_l_.HANDLERS).toBe(16);

			const labels_shift_= l_LL(module_.logr_.lref.get(), 2);
			expect(labels_shift_).toEqual({ 
				CXNS : 0b1 << 4,	// connections
				EVENTS : 0b1 << 5,
				HANDLERS : 0b1 << 6,
			});			
			const lref_shift_= lRef(labels_shift_);
			// const l_shift = _create_Referenced_l(lref_shift_)
			// expect(l_shift.get()).toEqual({ 
			// 	CXNS : 0b1 << 4,	// connections
			// 	EVENTS : 0b1 << 5,
			// 	HANDLERS : 0b1 << 6,
			// });			
			
			module_.logr_.lref= lref_shift_;
			expect(module_.logr_.lref.get()).toEqual({ 
				CXNS : 0b1 << 4,	// connections
				EVENTS : 0b1 << 5,
				HANDLERS : 0b1 << 6,
			});

			console.log('###############')
			module_.log_as_member();
			console.log('###############')

			// reset
			module_.logr_.lref= lref_orig;
		});

		it("should initialize with default values, toggle", () => {
			expect(LOGR_.toggled).toBe(0n);
			expect(() => {
				LOGR_.toggle(null, {
					DEL: true,
					// CXNS: true
				});
			}).toThrowError(Error, "obj_labels must be an object");

			const l_lots_ = { 
				CXNS : 0b1 << 2,	// connections
				MEMORY : 0b1 << 3,
				RUNTIME : 0b1 << 4,
				EVENTS : 0b1 << 5,
				HANDLERS : 0b1 << 6,
				MORE: 0b1 << 7, 
				EXTRA: 0b1 << 8 
			};

			// order shouldn't matter

			LOGR_.toggle(l_lots_, {
				CXNS:  true,
				EVENTS: true,
				MORE: true
			});
			expect(LOGR_.toggled).toBe(164n);

			LOGR_.toggle(l_lots_, {
				MORE: true,
				CXNS:  true,
				EVENTS: true
			});
			expect(LOGR_.toggled).toBe(164n);

			const lref_lots= lRef(l_lots_);
			LOGR_.toggle(lref_lots, {
				MORE: true,
				CXNS:  true,
				EVENTS: true
			});
			expect(LOGR_.toggled).toBe(164n);

		});

		it("should verify the handler changes when explicitly overridden", () => {
			const initial_handler = LOGR_.handler; // Capture initial handler
			const newHandler = jasmine.createSpy('newHandler');
	
			// Explicitly override the handler
			LOGR_.handler = newHandler;
	
			expect(LOGR_.handler).toBe(newHandler); // Should be the new handler
			expect(LOGR_.handler).not.toBe(initial_handler); // Should differ from initial
		});

		it('should reflect _log_fxn change when toggled is set', () => {
			// Spy on the handler to observe calls
			const handlerSpy = jasmine.createSpy('handlerSpy');
			LOGR_.handler = handlerSpy;
			const logr_= LOGR_.create({ 
				labels: {
					DEL : 0b1 << 0,		// removed
					CXNS : 0b1 << 2,	// connections
				} 
			});
			const l_= logr_.l;
			
			// Initial state: toggled is unset, _log_fxn should be NOP
			logr_.log(l_.DEL, 'Initial message');
			expect(handlerSpy).not.toHaveBeenCalled(); // NOP behavior
	
			LOGR_.toggle(l_, { 
				DEL : true,
				// CXNS : true
			});

			logr_.log(l_.DEL, () => ['DEL message']);
			expect(handlerSpy).toHaveBeenCalledWith('DEL message');
	
			handlerSpy.calls.reset();
			logr_.log(l_.CXNS, () => ['CXNS message']);
			expect(handlerSpy).not.toHaveBeenCalled(); // No match
	
			LOGR_.toggle(l_, { 
				// DEL : true,
				CXNS : true
			});
	
			logr_.log(l_.DEL, () => ['DEL message again']);
			expect(handlerSpy).not.toHaveBeenCalled(); // No match
	
			handlerSpy.calls.reset();
			logr_.log(l_.CXNS, () => ['CXNS message again']);
			expect(handlerSpy).toHaveBeenCalledWith('CXNS message again');

			// should log to console with default handler when toggled matches with OR
			handlerSpy.calls.reset();
			logr_.log(l_.DEL | l_.CXNS, () => ['CXNS message again']);
			expect(handlerSpy).toHaveBeenCalledWith('CXNS message again');

			// should reset _log_fxn to NOP when toggled is cleared
			LOGR_.toggle(l_, { 
			});
	
			handlerSpy.calls.reset();
			logr_.log(l_.DEL, () => ['NOP message']);
			expect(handlerSpy).not.toHaveBeenCalled(); // Back to NOP
		});
	
	});

	describe("two LOGRs;", () => {
		let consoleSpy;

		let local_logr_;
		
		const LOGR_= LOGR.get_instance();
		
		// Define the default handler explicitly if not exported
		const defaultHandler = function(...args) {
			console.log.apply(console, args);
		};
	
		beforeAll(() => {
		});
	
		beforeEach(() => {
			local_logr_ = LOGR_.create({ 
				labels: { 
					DEL : 0b1 << 0,		// removed
					CXNS : 0b1 << 2,	// connections
				}
			});
			LOGR_.handler = defaultHandler; // Ensure handler per test
			consoleSpy = spyOn(console, "log"); //.and.callThrough();
		});

		afterEach(() => {
			// Reset the spy after each test to avoid interference
			consoleSpy.calls.reset();
		});

		it('module.mjs', () => {
			LOGR_.toggle(module_.logr_.lref.get(), {
				EVENTS : true
			});

			module_.log_as_member(); // should fire, because module toggles EVENTS
			expect(consoleSpy).toHaveBeenCalledWith("module: log_as_member(): log of an EVENT, value of:", 8);
			expect(consoleSpy).not.toHaveBeenCalledWith("module: log_as_member(): log of an CXNS, value of:", 4);
		});

		it("local_LOGR_ should fire, module LOGR_ should NOT", () => {
			expect(local_logr_.lref.get()).toEqual({ 
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			});
			expect(module_.logr_.lref.get()).toEqual({ 
				CXNS : 0b1 << 2,	// connections
				EVENTS : 0b1 << 3,
				HANDLERS : 0b1 << 4,
			});
			const local_l_= local_logr_.l;
			const module_l_= module_.logr_.l;

			expect(local_l_.CXNS === module_l_.CXNS);

			LOGR_.toggle(local_logr_.lref.get(), {
				DEL : true,
				CXNS : true
			});

			local_logr_.log(local_l_.DEL, () => ["local_LOGR_: This should log"]);
			expect(consoleSpy).toHaveBeenCalledWith("local_LOGR_: This should log");

			module_.log_as_member(); 
			expect(consoleSpy).not.toHaveBeenCalledWith("module: log_as_member(): log of an EVENT");
			expect(consoleSpy).toHaveBeenCalledWith("module: log_as_member(): log of an CXNS, value of:", 4);
		});

		it("module LOGR_ should fire again", () => {
			LOGR_.toggle(module_.logr_.lref.get(), {
				EVENTS : true
			});

			module_.log_as_member();
			expect(consoleSpy).toHaveBeenCalledWith("module: log_as_member(): log of an EVENT, value of:", 8);
			expect(consoleSpy).not.toHaveBeenCalledWith("module: log_as_member(): log of an CXNS, value of:", 4);
		});

		it("forget to update labels", () => {
			LOGR_.toggle(module_.logr_.lref.get(), {
				DEL : true
			});
			const l_= local_logr_.l;

			local_logr_.log(l_.DEL, () => ["local module_LOGR_: This should NOT log"]);
			expect(consoleSpy).not.toHaveBeenCalledWith("local module_LOGR_: This should NOT log");
		});

		it("Borrow module_LOGR_", () => {
			expect(local_logr_.lref.get()).toEqual({ 
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			});
			const local_l_= local_logr_.l;
			expect(module_.logr_.lref.get()).toEqual({ 
				CXNS : 0b1 << 2,	// connections
				EVENTS : 0b1 << 3,
				HANDLERS : 0b1 << 4,
			});

			const labels_= l_merge(module_.logr_.lref.get(), local_logr_.lref.get());
			console.log(labels_);
			expect(labels_).toEqual({ 
				EVENTS : 0b1 << 3,
				HANDLERS : 0b1 << 4,
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			});
			LOGR_.toggle(labels_, {
				DEL : true,
				EVENTS :  true
			});

			local_logr_.log(local_l_.DEL, () => ["local module_LOGR_: This should log"]);
			expect(consoleSpy).toHaveBeenCalledWith("local module_LOGR_: This should log");

			module_.log_as_member();
			expect(consoleSpy).toHaveBeenCalledWith("module: log_as_member(): log of an EVENT, value of:", 8);
		});

		it("reassigning a new name to sub-module keys", () => {
			expect(local_logr_.lref.get()).toEqual({ 
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			});
			// const local_l_= local_logr_.l;
			expect(module_.logr_.lref.get()).toEqual({ 
				CXNS : 0b1 << 2,	// connections
				EVENTS : 0b1 << 3,
				HANDLERS : 0b1 << 4,
			});
			const module_l_= module_.logr_.l;

			LOGR_.toggle(module_l_, {
				EVENTS : true
			});
			expect(LOGR_.toggled).toEqual(BigInt(8));

			module_.log_as_member();
			expect(consoleSpy).toHaveBeenCalledWith("module: log_as_member(): log of an EVENT, value of:", 8);
			consoleSpy.calls.reset();

			const lref_module_orig= module_.lref;

			// ----

			const obj_labels_conflicting_= l_merge( l_array(['MEMORY', 'RUNTIME'],8), module_.logr_.lref.get());
			// console.warn('l_conflicting_', labels_conflicting_);
			expect(obj_labels_conflicting_).toEqual({ 
				CXNS : 0b1 << 2,	// 4, connections
				MEMORY : 0b1 << 3,	// 8
				RUNTIME : 0b1 << 4, // 16
				EVENTS : 0b1 << 5,	// 32
				HANDLERS : 0b1 << 6	// 64
			});

			// this should NOT cause EVENT to log in module, because the value of EVENTS 
			// changed here, but did not change in the module
			LOGR_.toggle(obj_labels_conflicting_, {
				EVENTS : true
			});
			expect(LOGR_.toggled).toEqual(BigInt(32));

			module_.log_as_member();
			expect(consoleSpy).not.toHaveBeenCalledWith("module: log_as_member(): log of an EVENT, value of:", 32);
			consoleSpy.calls.reset();

			// ----
			// reuse the module_l_ object ...

			const lref_conflicting= lRef(obj_labels_conflicting_);

			// reassign labels in submodule
			module_.logr_.lref= lref_conflicting;
			expect(module_.logr_.lref.get()).toEqual({  
				CXNS : 0b1 << 2,	// connections
				MEMORY : 0b1 << 3,
				RUNTIME : 0b1 << 4,
				EVENTS : 0b1 << 5,
				HANDLERS : 0b1 << 6,
			});

			LOGR_.toggle(obj_labels_conflicting_, {
				EVENTS : true
			});
			expect(LOGR_.toggled).toEqual(BigInt(32));

			module_.log_as_member();
			expect(consoleSpy).toHaveBeenCalledWith("module: log_as_member(): log of an EVENT, value of:", 32);
			expect(consoleSpy).not.toHaveBeenCalledWith("module: log_as_member(): log of an CXNS, value of:", 4);
			consoleSpy.calls.reset();

			// ----

			const obj_additional = l_array(['MORE', 'EXTRA'], 0b1 << 7);
			expect(obj_additional).toEqual({
				MORE: 0b1 << 7, 
				EXTRA: 0b1 << 8 
			});			

			const obj_merge= l_merge(module_.logr_.lref.get(), obj_additional);
			expect(obj_merge).toEqual({
				CXNS : 0b1 << 2,	// connections
				MEMORY : 0b1 << 3,
				RUNTIME : 0b1 << 4,
				EVENTS : 0b1 << 5,
				HANDLERS : 0b1 << 6,
				MORE: 0b1 << 7, 
				EXTRA: 0b1 << 8 
			});			

			module_.logr_.lref.set(obj_merge)
			expect(module_.logr_.lref.get()).toEqual({ 
				CXNS : 0b1 << 2,	// connections
				MEMORY : 0b1 << 3,
				RUNTIME : 0b1 << 4,
				EVENTS : 0b1 << 5,
				HANDLERS : 0b1 << 6,
				MORE: 0b1 << 7, 
				EXTRA: 0b1 << 8 
			});

			local_logr_ = LOGR_.create({ labels: obj_merge });
			const local_l_= local_logr_.l;

			LOGR_.toggle(obj_merge, {
				CXNS : true,
				MORE : true,
			});
			expect(LOGR_.toggled).toEqual(BigInt(132));

			local_logr_.log(local_l_.CXNS, () => ["local module_LOGR_: This should log"]);
			expect(consoleSpy).toHaveBeenCalledWith("local module_LOGR_: This should log");

			local_logr_.log(local_l_.MORE, () => ["local module_LOGR_: This should log MORE"]);
			expect(consoleSpy).toHaveBeenCalledWith("local module_LOGR_: This should log MORE");

			module_.log_as_member();
			expect(consoleSpy).not.toHaveBeenCalledWith("module: log_as_member(): log of an EVENT, value of:", 32);
			expect(consoleSpy).toHaveBeenCalledWith("module: log_as_member(): log of an CXNS, value of:", 4);
			consoleSpy.calls.reset();

			// reset
			module_.logr_.lref= lref_module_orig;			
		});

	});

	describe("wire;", () => {
		let LOGR_;
		let consoleSpy;

		beforeEach(() => {
			LOGR_ = LOGR.get_instance();
			consoleSpy = spyOn(console, "log").and.callThrough();
		});

		afterEach(() => {
			consoleSpy.calls.reset();
		});

		it("should point every submodule lref AND the main logr at ONE shared ref", () => {
			const logrA = LOGR_.create({ labels: l_array(['A', 'B']) });
			const logrB = LOGR_.create({ labels: l_array(['B', 'C']) }); // shares B
			const logr_ = LOGR_.wire([logrA, logrB]);

			// same LRef object shared by reference
			expect(logrA.lref).toBe(logrB.lref);
			expect(logrA.lref).toBe(logr_.lref);

			expect(logr_.lref.get()).toEqual({
				A: 0b1 << 0, // 1
				B: 0b1 << 1, // 2
				C: 0b1 << 2  // 4
			});
		});

		it("should collapse a shared name to the same bit across all wired logrs", () => {
			const logrA = LOGR_.create({ labels: l_array(['A', 'SHARED']) });
			const logrB = LOGR_.create({ labels: l_array(['SHARED', 'C']) });
			LOGR_.wire([logrA, logrB]);

			expect(logrA.l.SHARED).toBe(logrB.l.SHARED);
		});

		it("should make a renumbered submodule log correctly after wiring (the key insight)", () => {
			const handlerSpy = jasmine.createSpy('handler');
			LOGR_.handler = handlerSpy;

			// a "package" whose EVENTS sits at bit 0 in isolation
			const logr_pkg = LOGR_.create({ labels: l_array(['EVENTS']) });
			const l_pkg = logr_pkg.l; // captured BEFORE wiring, as a submodule does at load

			// app labels come first, so EVENTS is renumbered upward by the union
			const logr_app = LOGR_.create({ labels: l_array(['CONNECTIONS', 'REFLECTION']) });

			const logr_ = LOGR_.wire([logr_app, logr_pkg]);
			expect(logr_.lref.get()).toEqual({
				CONNECTIONS: 0b1 << 0, // 1
				REFLECTION:  0b1 << 1, // 2
				EVENTS:      0b1 << 2  // 4 (was bit 0 for the package)
			});

			// toggle by NAME; the package's pre-captured proxy resolves EVENTS live -> 4
			LOGR_.toggle(logr_.lref, { EVENTS: true });
			logr_pkg.log(l_pkg.EVENTS, () => ['pkg EVENTS fired']);
			expect(handlerSpy).toHaveBeenCalledWith('pkg EVENTS fired');

			// and it does NOT fire on its OLD bit (bit 0, now CONNECTIONS)
			handlerSpy.calls.reset();
			LOGR_.toggle(logr_.lref, { CONNECTIONS: true });
			logr_pkg.log(l_pkg.EVENTS, () => ['should not fire']);
			expect(handlerSpy).not.toHaveBeenCalled();
		});

		it("should return a working main logr whose l resolves merged bits", () => {
			const logrA = LOGR_.create({ labels: l_array(['A']) });
			const logrB = LOGR_.create({ labels: l_array(['B']) });
			const logr_ = LOGR_.wire([logrA, logrB]);
			const l_ = logr_.l;

			expect(l_.A).toBe(0b1 << 0);
			expect(l_.B).toBe(0b1 << 1);

			const handlerSpy = jasmine.createSpy('handler');
			LOGR_.handler = handlerSpy;
			LOGR_.toggle(l_, { B: true });
			logr_.log(l_.B, () => ['wired B message']);
			expect(handlerSpy).toHaveBeenCalledWith('wired B message');
		});

		it("should throw a clear indexed error when a submodule has no lref", () => {
			const logrA = LOGR_.create({ labels: l_array(['A']) });
			const logr_nolabels = LOGR_.create(); // lref === undefined
			expect(() => LOGR_.wire([logrA, logr_nolabels]))
				.toThrowError(Error, /logr at index 1 has no lref/);
		});

		it("should throw when the first argument is not an array", () => {
			expect(() => LOGR_.wire(LOGR_.create({ labels: l_array(['A']) })))
				.toThrowError(Error, /must be an array/);
		});

		it("optional pin: passes when layout matches", () => {
			const logrA = LOGR_.create({ labels: l_array(['A', 'B']) });
			const logr_ = LOGR_.wire([logrA], { A: 0b1 << 0, B: 0b1 << 1 });
			expect(logr_.lref.get()).toEqual({ A: 0b1 << 0, B: 0b1 << 1 });
		});

		it("optional pin: throws when layout does not match", () => {
			const logrA = LOGR_.create({ labels: l_array(['A', 'B']) });
			expect(() => LOGR_.wire([logrA], { A: 0b1 << 1 }))
				.toThrowError(Error, /do not match pinned positions/);
		});

		it("should leave every submodule lref untouched when a pin fails (atomicity)", () => {
			const logrA = LOGR_.create({ labels: l_array(['A']) });
			const logrB = LOGR_.create({ labels: l_array(['B']) });
			const lref_A_orig = logrA.lref;
			const lref_B_orig = logrB.lref;

			// validation happens before the reassignment loop, so a throw must not mutate
			expect(() => LOGR_.wire([logrA, logrB], { A: 0b1 << 5 }))
				.toThrowError(Error, /do not match pinned positions/);

			expect(logrA.lref).toBe(lref_A_orig);
			expect(logrB.lref).toBe(lref_B_orig);
		});

		it("should return a usable logr with an empty table for an empty array", () => {
			const logr_ = LOGR_.wire([]);
			expect(logr_.lref.get()).toEqual({});
			expect(logr_.l.get()).toEqual({});
		});

		it("should treat a bare leaf (no _arr_members) as one member and record members on the result", () => {
			const logr_leaf = LOGR_.create({ labels: l_array(['A']) });
			expect(logr_leaf._arr_members).toBeUndefined(); // a create() leaf carries none

			const logr_ = LOGR_.wire([logr_leaf]);
			expect(logr_._arr_members).toContain(logr_leaf); // the leaf ...
			expect(logr_._arr_members).toContain(logr_);     // ... and the main it produced
		});

		it("should compose across nesting levels: a sub-unit's hidden leaf follows a parent wire (transitive)", () => {
			const handlerSpy = jasmine.createSpy('handler');
			LOGR_.handler = handlerSpy;

			// mirrors the app: net_DiscoverySvc (leaf) -> orchestrator bridge -> orchestrator -> main
			const logr_1s = LOGR_.create({ labels: l_array(['VALIDATION']) });
			const logr_ds = LOGR_.create({ labels: l_array(['DISCOVERY']) });
			const l_ds = logr_ds.l; // captured at "load", before any wiring

			const logr_orchbridge = LOGR_.wire([logr_1s]);                     // level 1
			const logr_orch       = LOGR_.wire([logr_orchbridge, logr_ds]);    // level 2 (wraps the bridge)
			const logr_mainbridge = LOGR_.create({ labels: l_array(['CONNECTIONS', 'REFLECTION']) });
			const logr_main       = LOGR_.wire([logr_mainbridge, logr_orch]);  // level 3 (wraps the orchestrator)

			// the deepest leaves rode all the way up onto main's single shared ref
			expect(logr_ds.lref).toBe(logr_main.lref);
			expect(logr_1s.lref).toBe(logr_main.lref);

			// and net_DiscoverySvc fires by NAME against the top table's DISCOVERY bit
			LOGR_.toggle(logr_main.lref, { DISCOVERY: true });
			logr_ds.log(l_ds.DISCOVERY, () => ['net_DiscoverySvc fired']);
			expect(handlerSpy).toHaveBeenCalledWith('net_DiscoverySvc fired');
		});

		it("pin is per-level: a mid-level pin asserts a transient layout the parent renumbers away", () => {
			// mid level: DISCOVERY is bit 0 in the sub-union, so the mid pin PASSES (no throw)
			const logr_ds  = LOGR_.create({ labels: l_array(['DISCOVERY']) });
			const logr_mid = LOGR_.wire([logr_ds], { DISCOVERY: 0b1 << 0 });
			expect(logr_mid.lref.get()).toEqual({ DISCOVERY: 0b1 << 0 });

			// parent: its own labels come first, so DISCOVERY is renumbered upward (bit 0 -> bit 2)
			const logr_other = LOGR_.create({ labels: l_array(['CONNECTIONS', 'REFLECTION']) });
			const logr_top   = LOGR_.wire([logr_other, logr_mid]);
			expect(logr_top.lref.get().DISCOVERY).toBe(0b1 << 2); // the FINAL table
			expect(logr_mid.lref.get().DISCOVERY).toBe(0b1 << 2); // the mid unit follows; its pin did not survive

			// so the mid-level positions no longer describe the final table: they FAIL as a top-level pin
			const logr_ds2  = LOGR_.create({ labels: l_array(['DISCOVERY']) });
			const logr_mid2 = LOGR_.wire([logr_ds2]);
			const logr_oth2 = LOGR_.create({ labels: l_array(['CONNECTIONS', 'REFLECTION']) });
			expect(() => LOGR_.wire([logr_oth2, logr_mid2], { DISCOVERY: 0b1 << 0 }))
				.toThrowError(Error, /do not match pinned positions/);
		});

		describe("Production Mode (LOGR_ENABLED = false)", () => {
			let logrA, logrB, lref_A_orig, lref_B_orig;

			beforeEach(() => {
				// create while enabled, capture original lrefs
				logrA = LOGR_.create({ labels: l_array(['A']) });
				logrB = LOGR_.create({ labels: l_array(['B']) });
				lref_A_orig = logrA.lref;
				lref_B_orig = logrB.lref;

				Object.defineProperty(globalThis, 'LOGR_ENABLED', {
					value: false, writable: true, configurable: true
				});
			});

			afterEach(() => {
				delete globalThis.LOGR_ENABLED;
			});

			it("should early-return a no-op stub without touching any submodule lref", () => {
				const logr_ = LOGR_.wire([logrA, logrB]);

				// stub: log/raw are no-ops, no lref
				expect(typeof logr_.log).toBe('function');
				expect(logr_.log(1, () => ['nope'])).toBe(undefined);

				// submodule lrefs untouched
				expect(logrA.lref).toBe(lref_A_orig);
				expect(logrB.lref).toBe(lref_B_orig);
			});
		});
	});

	describe("trace;", () => {
		let LOGR_;
		let handlerSpy;

		beforeEach(() => {
			LOGR_ = LOGR.get_instance();
			handlerSpy = jasmine.createSpy('handler');
			LOGR_.handler = handlerSpy;
		});

		afterEach(() => {
			LOGR_.trace = false; // reset the global flags for other specs
			LOGR_.prefix();
			LOGR_.labeled = false;
		});

		it("is off by default -- no call-site prefix", () => {
			const logr_ = LOGR_.create({ labels: l_array(['A']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { A: true });
			logr_.log(l_.A, () => ['msg']);
			expect(handlerSpy).toHaveBeenCalledWith('msg'); // bare, no prefix
		});

		it("appends the caller's function name in parens after the message when on", () => {
			const logr_ = LOGR_.create({ labels: l_array(['A']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { A: true });
			LOGR_.trace = true;

			function my_named_site_() {
				logr_.log(l_.A, () => ['msg']);
			}
			my_named_site_();

			const args = handlerSpy.calls.mostRecent().args;
			expect(args[0]).toBe('msg');                        // the message comes first
			expect(args[args.length - 1]).toBe('(my_named_site_)'); // call site, appended in parens
		});

		it("accepts a formatter function (appended)", () => {
			const logr_ = LOGR_.create({ labels: l_array(['A']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { A: true });
			LOGR_.trace = (site) => `[${site}]`;

			function site_fmt_() {
				logr_.log(l_.A, () => ['msg']);
			}
			site_fmt_();

			const args = handlerSpy.calls.mostRecent().args;
			expect(args[0]).toBe('msg');
			expect(args[args.length - 1]).toBe('[site_fmt_]');
		});

		it("does not prefix (or fire) a log whose label is off", () => {
			const logr_ = LOGR_.create({ labels: l_array(['A', 'B']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { A: true }); // B stays off
			LOGR_.trace = true;

			logr_.log(l_.B, () => ['nope']);
			expect(handlerSpy).not.toHaveBeenCalled();
		});

		it("prefix() prepends a fixed string to fired logs", () => {
			const logr_ = LOGR_.create({ labels: l_array(['A']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { A: true });
			LOGR_.prefix('Orchestrator:');

			logr_.log(l_.A, () => ['msg']);
			const args = handlerSpy.calls.mostRecent().args;
			expect(args[0]).toBe('Orchestrator:'); // prepended
			expect(args[1]).toBe('msg');
		});

		it("prefix() with no/empty arg disables it", () => {
			const logr_ = LOGR_.create({ labels: l_array(['A']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { A: true });
			LOGR_.prefix('X:');
			LOGR_.prefix(); // disable

			logr_.log(l_.A, () => ['msg']);
			expect(handlerSpy).toHaveBeenCalledWith('msg'); // bare again
		});

		it("labeled prepends only the fired label name", () => {
			const logr_ = LOGR_.create({ labels: l_array(['DISCOVERY', 'CURATED_LISTS']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { DISCOVERY: true }); // CURATED_LISTS stays off
			LOGR_.labeled = true;

			logr_.log(l_.DISCOVERY | l_.CURATED_LISTS, () => ['msg']);
			const args = handlerSpy.calls.mostRecent().args;
			expect(args[0]).toBe('[DISCOVERY]'); // only the label that fired
			expect(args[1]).toBe('msg');
		});

		it("labeled joins multiple fired labels", () => {
			const logr_ = LOGR_.create({ labels: l_array(['DISCOVERY', 'CURATED_LISTS']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { DISCOVERY: true, CURATED_LISTS: true });
			LOGR_.labeled = true;

			logr_.log(l_.DISCOVERY | l_.CURATED_LISTS, () => ['msg']);
			expect(handlerSpy.calls.mostRecent().args[0]).toBe('[DISCOVERY|CURATED_LISTS]');
		});

		it("labeled combines with prefix -- label before prefix", () => {
			const logr_ = LOGR_.create({ labels: l_array(['DISCOVERY']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { DISCOVERY: true });
			LOGR_.labeled = true;
			LOGR_.prefix('Orchestrator:');

			logr_.log(l_.DISCOVERY, () => ['msg']);
			const args = handlerSpy.calls.mostRecent().args;
			expect(args[0]).toBe('[DISCOVERY]');   // label first
			expect(args[1]).toBe('Orchestrator:'); // then prefix
			expect(args[2]).toBe('msg');
		});

		it("labeled is off by default", () => {
			const logr_ = LOGR_.create({ labels: l_array(['A']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { A: true });
			logr_.log(l_.A, () => ['msg']);
			expect(handlerSpy).toHaveBeenCalledWith('msg'); // bare
		});

		it("labeled ignores inherited (proto) keys on the label table", () => {
			// INHERITED shares A's bit, so for..in WOULD report it; Object.keys must not
			const proto = { INHERITED: 0b1 << 0 };
			const own = Object.create(proto);
			own.A = 0b1 << 0;

			const logr_ = LOGR_.create({ labels: own });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { A: true });
			LOGR_.labeled = true;

			logr_.log(l_.A, () => ['msg']);
			const args = handlerSpy.calls.mostRecent().args;
			expect(args[0]).toBe('[A]'); // only the own key, not the inherited one
			expect(args[1]).toBe('msg');
		});

		it("labeled accepts a formatter that abbreviates the fired names", () => {
			const logr_ = LOGR_.create({ labels: l_array(['DISCOVERY', 'CURATED_LISTS']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { DISCOVERY: true, CURATED_LISTS: true });
			const ABBR = { DISCOVERY: 'DISC', CURATED_LISTS: 'CURL' };
			LOGR_.labeled = (names) => `[${names.map(n => ABBR[n] ?? n).join('|')}]`;

			logr_.log(l_.DISCOVERY | l_.CURATED_LISTS, () => ['msg']);
			const args = handlerSpy.calls.mostRecent().args;
			expect(args[0]).toBe('[DISC|CURL]');
			expect(args[1]).toBe('msg');
		});

		it("labeled formatter receives the names as an array; '' suppresses the tag", () => {
			const logr_ = LOGR_.create({ labels: l_array(['A']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { A: true });
			let received;
			LOGR_.labeled = (names) => { received = names; return ''; };

			logr_.log(l_.A, () => ['msg']);
			expect(received).toEqual(['A']);                // array of fired names
			expect(handlerSpy).toHaveBeenCalledWith('msg'); // empty string -> no tag
		});

		it("labeled composes with trace -- label first, message, trace last", () => {
			const logr_ = LOGR_.create({ labels: l_array(['DISCOVERY']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { DISCOVERY: true });
			LOGR_.labeled = true;
			LOGR_.trace = true;

			function site_lt_() { logr_.log(l_.DISCOVERY, () => ['msg']); }
			site_lt_();
			const args = handlerSpy.calls.mostRecent().args;
			expect(args[0]).toBe('[DISCOVERY]');              // label first
			expect(args[1]).toBe('msg');                      // then the message
			expect(args[args.length - 1]).toBe('(site_lt_)'); // trace appended last
		});

		it("labeled resolves names through a wired main's shared lref (no own labels)", () => {
			const logrA = LOGR_.create({ labels: l_array(['DISCOVERY']) });
			const logrB = LOGR_.create({ labels: l_array(['VALIDATION']) });
			const logr_ = LOGR_.wire([logrA, logrB]); // the main carries no own labels
			const l_ = logr_.l;
			LOGR_.toggle(l_, { DISCOVERY: true });
			LOGR_.labeled = true;

			logr_.log(l_.DISCOVERY, () => ['msg']);
			const args = handlerSpy.calls.mostRecent().args;
			expect(args[0]).toBe('[DISCOVERY]');
			expect(args[1]).toBe('msg');
		});

		it("trace is not fooled by a caller method also named 'log'", () => {
			const logr_ = LOGR_.create({ labels: l_array(['A']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { A: true });
			LOGR_.trace = true;

			class Widget {
				log() { logr_.log(l_.A, () => ['msg']); }
			}
			new Widget().log();

			// the user's Widget.log() is attributed, not skipped as if it were the logger's wrapper
			expect(handlerSpy.calls.mostRecent().args.pop()).toBe('(Widget.log)');
		});

		it("trace survives logr_.log being replaced (keys on the internal sentinel, not the public log)", () => {
			const logr_ = LOGR_.create({ labels: l_array(['A']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { A: true });
			LOGR_.trace = true;

			// user decorates the public log; the original still routes through _log_fxn
			const log_orig = logr_.log;
			logr_.log = function log_wrapper_(nr, fn) { return log_orig.call(logr_, nr, fn); };

			logr_.log(l_.A, () => ['msg']);

			// trace still emits a real call-site tag (not '' / not an internal frame): the sentinel
			// is _log_fxn, so swapping .log cannot break attribution. Here the caller of the original
			// log is the wrapper, so that is the reported site.
			expect(handlerSpy.calls.mostRecent().args.pop()).toBe('(log_wrapper_)');
		});

		it("trace and prefix are mutually exclusive", () => {
			const logr_ = LOGR_.create({ labels: l_array(['A']) });
			const l_ = logr_.l;
			LOGR_.toggle(l_, { A: true });

			// prefix set, then trace on -> prefix is cleared, trace wins
			LOGR_.prefix('P:');
			LOGR_.trace = true;
			function site_a_() { logr_.log(l_.A, () => ['m']); }
			site_a_();
			let args = handlerSpy.calls.mostRecent().args;
			expect(args[0]).toBe('m');                       // no prefix
			expect(args[args.length - 1]).toBe('(site_a_)'); // trace tag appended

			// prefix() again -> trace is cleared, prefix wins
			LOGR_.prefix('P:');
			logr_.log(l_.A, () => ['m2']);
			args = handlerSpy.calls.mostRecent().args;
			expect(args[0]).toBe('P:');                      // prefix prepended
			expect(args[args.length - 1]).toBe('m2');        // no trace tag
		});
	});

	describe('Object.defineProperty(global, \'LOGR_ENABLED\', {});', () => {
		let LOGR_;
		let logr_;
		let l_;
		let handlerSpy;

		beforeEach(() => {
			// Reset the singleton instance before each test
			l_= l_array(['A', 'B', 'C']); // { A: 1, B: 2, C: 4 }

			LOGR_ = LOGR.get_instance();
			logr_ = LOGR_.create({ labels: l_ });
			handlerSpy = jasmine.createSpy('handler');
			LOGR_.handler = handlerSpy;
		});

		describe('Development Mode (LOGR_ENABLED = true)', () => {
			// beforeEach(() => {
			// 	// Simulate dev mode by ensuring LOGR_ENABLED is true
			// 	// In a real build, this would be set by Webpack DefinePlugin/ rollup
			// 	if (typeof LOGR_ENABLED === 'undefined') {
			// 		global.LOGR_ENABLED = true; // Fallback for testing
			// 	}
			// });
			beforeEach(() => {
				Object.defineProperty(globalThis, 'LOGR_ENABLED', {
					value: true,
					writable: true,
					configurable: true
				});
			});

			afterEach(() => {
				// Clean up to avoid affecting other tests
				delete globalThis.LOGR_ENABLED;
			});
		
			it('should call the handler when toggled bits match', () => {
				LOGR_.toggle(l_, { A: true, B: true }); // toggled = 0b011 (3)
				
				logr_.log(l_.B, () => ['test message', 'extra arg']); // nr_logged = 2 (0b010)
				expect(handlerSpy).toHaveBeenCalledWith('test message', 'extra arg');
			});

			it('should not call the handler when toggled bits do not match', () => {
				LOGR_.toggle(l_, { A: true }); // toggled = 0b001 (1)
				
				logr_.log(l_.B, () => ['test message']); // nr_logged = 2 (0b010)
				expect(handlerSpy).not.toHaveBeenCalled();
			});

			it('should evaluate argsFn only when logging occurs', () => {
				const argsSpy = jasmine.createSpy('argsFn').and.returnValue(['computed message']);
				LOGR_.toggle(l_, { A: true, B: true }); // toggled = 0b011 (3)

				logr_.log(l_.A, argsSpy); // nr_logged = 1 (0b001)
				expect(argsSpy).toHaveBeenCalled(); // argsFn was evaluated
				expect(handlerSpy).toHaveBeenCalledWith('computed message');
			});

			it('should not evaluate argsFn when logging is skipped', () => {
				const argsSpy = jasmine.createSpy('argsFn').and.returnValue(['computed message']);
				LOGR_.toggle(l_, { A: true }); // toggled = 0b001 (1)
				
				logr_.log(l_.B, argsSpy); // nr_logged = 2 (0b010)
				expect(argsSpy).not.toHaveBeenCalled(); // argsFn was not evaluated
				expect(handlerSpy).not.toHaveBeenCalled();
			});
		});

		describe('Production Mode (LOGR_ENABLED = false)', () => {
			beforeEach(() => {
				// Forcefully set LOGR_ENABLED to false for these tests
				Object.defineProperty(globalThis, 'LOGR_ENABLED', {
					value: false,
					writable: true,
					configurable: true
				});
			});
		
			afterEach(() => {
				// Clean up to avoid affecting other tests
				delete globalThis.LOGR_ENABLED;
			});
		
			it('should not call the handler even when toggled bits match', () => {
				LOGR_.toggle(l_, { A: true, B: true }); // toggled = 0b011 (3)
				
				logr_.log(l_.B, () => ['test message', 'extra arg']); // nr_logged = 2 (0b010)
				expect(handlerSpy).not.toHaveBeenCalled();
			});

			it('should not evaluate argsFn at all', () => {
				const argsSpy = jasmine.createSpy('argsFn').and.returnValue(['expensive computation']);
				LOGR_.toggle(l_, { A: true, B: true }); // toggled = 0b011 (3)
				
				logr_.log(l_.B, argsSpy); // nr_logged = 2 (0b010)
				expect(argsSpy).not.toHaveBeenCalled(); // No evaluation in prod
				expect(handlerSpy).not.toHaveBeenCalled();
			});

			it('should return undefined from log method', () => {
				LOGR_.toggle(l_, { A: true, B: true }); // toggled = 0b011 (3)
				
				const result = logr_.log(l_.B, () => ['test message']);
				expect(result).toBe(undefined);
			});
		});
	});

	describe("performance;", () => {
		let logSpy;		

		beforeEach(() => {
			// Spy on console.log before each test
			logSpy= spyOn(console, "log").and.callThrough(); // callThrough ensures the original console.log still executes

			// Forcefully set LOGR_ENABLED to false for these tests
			Object.defineProperty(globalThis, 'LOGR_ENABLED', {
				value: false,
				writable: true,
				configurable: true
			});
		});
	
		afterEach(() => {
			// Reset the spy after each test to avoid interference
			logSpy.calls.reset();

			// Clean up to avoid affecting other tests
			delete global.LOGR_ENABLED;
		});		
	
		it("NOP", () => {
			const fxn_empty = function() {
				// Empty function (NOP)
			}
	
			const l_= {
				DEL : 0b1 << 0,		// removed
				CXNS : 0b1 << 2,	// connections
			}

			const LOGR_= LOGR.get_instance();
			const logr_ = LOGR_.create({ labels: l_ });

			// ----

			LOGR_.toggle(l_, {
				DEL : true
			});

			const fxn_log = function () {
				logr_.log(l_.DEL | l_.CXNS, () => ["this log message", JSON.stringify(l_)]);
			};

			fxn_log();
			expect(console.log).not.toHaveBeenCalledWith("this log message", jasmine.any(String)); // Verify no logging	
			logSpy.calls.reset();

			// ----

			LOGR_.toggle(l_, {
			});

			fxn_log();
			expect(console.log).not.toHaveBeenCalledWith("this log message", jasmine.any(String)); // Verify no logging	
			logSpy.calls.reset();

			// ----

			LOGR_.toggle(l_, {
				DEL : true
			});
			LOGR_.handler= undefined; // this shouldn't cause a throw, since the handler should never be called

			fxn_log();
			expect(console.log).not.toHaveBeenCalledWith("this log message", jasmine.any(String)); // Verify no logging	
			logSpy.calls.reset();

			// ----

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

	describe("Simulated Bundle Duplication", () => {
		it("should demonstrate the problem of bundled duplicates", async () => {
			// Forcefully set LOGR_ENABLED to false for these tests
			Object.defineProperty(globalThis, 'LOGR_USE_GLOBAL_KEY', {
				value: false,
				writable: true,
				configurable: true
			});

			const bundle1 = await import('../dist/logr.es.mjs');
			const bundle2 = await import('./logr-copy.es.mjs');
			
			const logr1 = bundle1.LOGR.get_instance();
			const logr2 = bundle2.LOGR.get_instance();
			
			// console.log('Bundle 1 instance ID:', logr1._id);
			// console.log('Bundle 2 instance ID:', logr2._id);
			
			// These should be different (demonstrating the problem)
			expect(logr1._id).not.toBe(logr2._id);
			
			// Toggle in bundle 1
			logr1.toggle({ TEST: 1 }, { TEST: true });
			
			// Bundle 2 doesn't see it
			expect(logr1.toggled).toBe(BigInt(1));
			expect(logr2.toggled).toBe(BigInt(0)); // Still zero!

			// Clean up to avoid affecting other tests
			delete globalThis.LOGR_USE_GLOBAL_KEY;
		});

		it("Default- use GLOBAL_KEY variable", async () => {
			const bundle1 = await import('../dist/logr.es.mjs');
			const bundle2 = await import('./logr-copy.es.mjs');
			
			const logr1 = bundle1.LOGR.get_instance();
			const logr2 = bundle2.LOGR.get_instance();
			
			// console.log('Bundle 1 instance ID:', logr1._id);
			// console.log('Bundle 2 instance ID:', logr2._id);
			
			expect(logr1._id).toBe(logr2._id);
			
			// Toggle in bundle 1
			logr1.toggle({ TEST: 1 }, { TEST: true });
			
			// Bundle 2 doesn't see it
			expect(logr1.toggled).toBe(BigInt(1));
			expect(logr2.toggled).toBe(BigInt(1));
		});
	});

});
