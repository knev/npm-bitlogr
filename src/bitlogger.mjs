

// https://stackoverflow.com/questions/4602141/variable-name-as-a-string-in-javascript
const __name = obj => Object.keys(obj)[0];
// console.log('OUT', __name({variableName}) );

//-------------------------------------------------------------------------------------------------

var LOGR_= (function() {
	let _tags= {};
	let _toggled= {};

	return {
		set tags(obj) {
			_tags= obj;
			console.log(_tags);
		},
		put : function(tag, label) {
			let name= __name(tag);
			_tags[name]= tag[name];
			console.log(_tags);
		},
		set toggled(obj) {
			_toggled= obj;
			console.log(_toggled);
		},
		log : function(logged, output) {
			console.log('tags', logged)
			for (const [t,v] of Object.entries(_tags)) {
				console.log('e', t, v);
				if ( (logged&v) && (_toggled[t] !== undefined) )
					console.log(output)
			}
		}
	}
})();

//-------------------------------------------------------------------------------------------------

export { LOGR_ as LOGR };