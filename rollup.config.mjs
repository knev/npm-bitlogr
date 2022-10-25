export default [
	{
		input: 'src/bitlogger.mjs',
		output: {
			name: "bitlogger",
			file: 'dist/bitlogger.cjs.js',
			format: 'cjs'
		}
	},
	{
		input: 'src/bitlogger.mjs',
		output: {
			name: "bitlogger",
			file: 'dist/bitlogger.es.mjs',
			format: 'es'
		}
	}
];
