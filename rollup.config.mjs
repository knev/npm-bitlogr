
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
		input: "src/logr.d.ts",
		output: [{ file: "dist/logr.d.ts", format: "es" }],
		plugins: [dts()],
	}
];
