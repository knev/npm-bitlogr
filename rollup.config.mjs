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
	}
];
