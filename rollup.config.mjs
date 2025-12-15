
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

// Grok: Suggestion: Consider adding rollup-plugin-terser for production builds to ensure dead code elimination is maximized:
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

// Using Build-Time Replacement of LOGR_ENABLED

export default [
	{
		input: 'src/logr.ts',
		output: {
			name: "logr",
			file: 'dist/logr.cjs.js',
			format: 'cjs'
		},
		plugins: [
			typescript({ tsconfig: './tsconfig.json' }),
            isProduction && terser({
                compress: {
                    dead_code: true,
                    global_defs: {
                        'LOGR_ENABLED': false   // ← Terser understands this
                    }
                }
            })
		]		
	},
	{
		input: 'src/logr.ts',
		output: {
			name: "logr",
			file: 'dist/logr.es.mjs',
			format: 'es'
		},
		plugins: [
			typescript({ tsconfig: './tsconfig.json' }),
            isProduction && terser({
                compress: {
                    dead_code: true,
                    global_defs: {
                        'LOGR_ENABLED': false   // ← Terser understands this
                    }
                }
            })
		]		
	}
];
