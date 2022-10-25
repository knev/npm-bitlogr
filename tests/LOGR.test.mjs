
import * as reflector from './reflector.mjs';
import * as msg_cache from './msg_cache.mjs';

var options_= {
	logr : {
		CXNS : 1,
		MSGE : 1,
		DUPS : 0,
		RELF : 1,
	}
}

reflector.exec(options_);
msg_cache.exec(options_);

//-------------------------------------------------------------------------------------------------

// let ignore;
// let v;

// ignore= 1;
// v= 0;
// console.log ( ignore || v );

// ignore= 1;
// v= 1;
// console.log ( ignore || v );

// ignore= 0;
// v= 0;
// console.log ( ignore || v );

// ignore= 0;
// v= 1;
// console.log ( ignore || v );

//-------------------------------------------------------------------------------------------------
// https://stackoverflow.com/questions/55611/javascript-private-methods/25172901#25172901

// var MyObject = (function () {
    
// 	// Constructor
// 	function MyObject(foo) {
// 	  this._foo = foo;
// 	}
  
// 	function privateFun(prefix) {
// 	  return prefix + this._foo;
// 	}
	  
// 	MyObject.prototype.publicFun = function () {
// 	  return privateFun.call(this, ">>");
// 	}
	  
// 	return MyObject;
  
//   }());

// var myObject = new MyObject("bar");
// var bar= myObject.publicFun();      // Returns ">>bar"
// // myObject.privateFun(">>"); // ReferenceError: private is not defined

// console.log(bar);