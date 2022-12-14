
import dts from "rollup-plugin-dts";

export default [
	{
		input: 'src/logr.mjs',
		output: {
			name: "logr",
			file: 'dist/logr.cjs.js',
			format: 'cjs'
		}
	},
	{
		input: 'src/logr.mjs',
		output: {
			name: "logr",
			file: 'dist/logr.es.mjs',
			format: 'es'
		}
	},
	{
		input: "src/logr.mjs.d.ts",
		output: [{ file: "dist/logr.es.d.ts", format: "es" }],
		plugins: [dts()],
	},
	{
		input: "src/logr.mjs.d.ts",
		output: [{ file: "dist/logr.cjs.d.ts", format: "cjs" }],
		plugins: [dts()],
	}
];
