"use strict";function e(e){const t=Object.values(e);if(0===t.length)return 1;const n=Math.max(...t);if(n<=0)return 1;return 1<<Math.floor(Math.log2(n))+1}function t(e,t=1){return Object.freeze(e.reduce(((e,n,r)=>(e[n]=t<<r,e)),{}))}function n(){var e=Array.prototype.slice.call(arguments);console.log.apply(console,e)}const r=function(){let e;function t(){let e,t=n,r=BigInt(0);return{set handler(e){t=e},get handler(){return t},get labels(){return e},set labels(t){e=t,r=BigInt(0)},get toggled(){return r},set toggled(t){r=function(e,t,n=!1){console.assert(void 0!==e,"no labels initialized");let r=BigInt(0);for(const[o,s]of Object.entries(t))(n||s)&&e[o]&&(r|=BigInt(e[o]));return r}(e,t)},log(e,t){}}}return{instance:()=>(e||(e=t()),e)}}();exports.LOGR=r,exports.l_LL=function(e,t){const n={};for(const[r,o]of Object.entries(e))n[r]=o<<t;return Object.freeze(n)},exports.l_RR=function(e,t){const n={};for(const[r,o]of Object.entries(e))n[r]=o>>t;return Object.freeze(n)},exports.l_array=t,exports.l_concat=function n(r,o){if(Array.isArray(o)){return n(r,t(o,e(r)))}const s=e(r),l={...r},c=Object.entries(o);let a=1/0;for(const[,e]of c)e>0&&e<a&&(a=e);const f=a===1/0||a>=s?0:Math.floor(Math.log2(s/a));for(const[e,t]of c)e in l||(l[e]=0===t?0:t<<f);return Object.freeze(l)},exports.l_length=e,exports.l_merge=function(e,t){const n={...e},r=new Set(Object.values(e)),o=Math.max(0,...r);let s=o?Math.floor(Math.log2(o))+1:0;for(const[e,o]of Object.entries(t))if(e in n)console.assert(n[e]===o,`Key '${e}' has conflicting values: ${n[e]} (obj_labels1) vs ${o} (obj_labels2)`);else{let t=o;for(;r.has(t);)t=1<<s++;n[e]=t,r.add(t)}return Object.freeze(n)};
