/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Registry = function Registry() {
    _classCallCheck(this, Registry);
};

Registry.classes = {};
Registry.objs = {};
Registry.debug = true;
Registry.super_debug = false;
Registry.console = {
    debug: function debug(func_name) {
        // arguments.callee.caller.__name = func_name;
        if (Registry.debug) {
            console.debug(func_name);
        }
    },
    superDebug: function superDebug(func_name) {
        // arguments.callee.caller.__name = func_name;
        if (Registry.super_debug) {
            console.debug(func_name);
        }
    }
};
exports.default = Registry;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9idWlsZGVyL1JlZ2lzdHJ5LmVzNiJdLCJuYW1lcyI6WyJSZWdpc3RyeSIsImNsYXNzZXMiLCJvYmpzIiwiZGVidWciLCJzdXBlcl9kZWJ1ZyIsImNvbnNvbGUiLCJmdW5jX25hbWUiLCJzdXBlckRlYnVnIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUFNQSxROzs7O0FBQUFBLFEsQ0FDS0MsTyxHQUFVLEU7QUFEZkQsUSxDQUdLRSxJLEdBQU8sRTtBQUhaRixRLENBS0tHLEssR0FBUSxJO0FBTGJILFEsQ0FPS0ksVyxHQUFjLEs7QUFQbkJKLFEsQ0FTS0ssTyxHQUFVO0FBQ2JGLFdBQU8sZUFBU0csU0FBVCxFQUFtQjtBQUN0QjtBQUNBLFlBQUdOLFNBQVNHLEtBQVosRUFBa0I7QUFDZEUsb0JBQVFGLEtBQVIsQ0FBY0csU0FBZDtBQUNIO0FBQ0osS0FOWTtBQU9iQyxnQkFBWSxvQkFBU0QsU0FBVCxFQUFtQjtBQUMzQjtBQUNBLFlBQUdOLFNBQVNJLFdBQVosRUFBd0I7QUFDcEJDLG9CQUFRRixLQUFSLENBQWNHLFNBQWQ7QUFDSDtBQUNKO0FBWlksQztrQkFnQk5OLFEiLCJmaWxlIjoiUmVnaXN0cnkuZXM2Iiwic291cmNlUm9vdCI6Ii9Vc2Vycy9yaWNod2FuZGVsbC9QaHBzdG9ybVByb2plY3RzL2dyaWQtYnVpbGRlciIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJlZ2lzdHJ5e1xuICAgIHN0YXRpYyBjbGFzc2VzID0ge307XG5cbiAgICBzdGF0aWMgb2JqcyA9IHt9O1xuXG4gICAgc3RhdGljIGRlYnVnID0gdHJ1ZTtcblxuICAgIHN0YXRpYyBzdXBlcl9kZWJ1ZyA9IGZhbHNlO1xuXG4gICAgc3RhdGljIGNvbnNvbGUgPSB7XG4gICAgICAgIGRlYnVnOiBmdW5jdGlvbihmdW5jX25hbWUpe1xuICAgICAgICAgICAgLy8gYXJndW1lbnRzLmNhbGxlZS5jYWxsZXIuX19uYW1lID0gZnVuY19uYW1lO1xuICAgICAgICAgICAgaWYoUmVnaXN0cnkuZGVidWcpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoZnVuY19uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc3VwZXJEZWJ1ZzogZnVuY3Rpb24oZnVuY19uYW1lKXtcbiAgICAgICAgICAgIC8vIGFyZ3VtZW50cy5jYWxsZWUuY2FsbGVyLl9fbmFtZSA9IGZ1bmNfbmFtZTtcbiAgICAgICAgICAgIGlmKFJlZ2lzdHJ5LnN1cGVyX2RlYnVnKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKGZ1bmNfbmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlZ2lzdHJ5Il19

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery JavaScript Library v3.1.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2016-09-22T22:30Z
 */
( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var document = window.document;

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};



	function DOMEval( code, doc ) {
		doc = doc || document;

		var script = doc.createElement( "script" );

		script.text = code;
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var
	version = "3.1.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android <=4.0 only
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {

		// As of jQuery 3.0, isNumeric is limited to
		// strings and numbers (primitives or objects)
		// that can be coerced to finite numbers (gh-2662)
		var type = jQuery.type( obj );
		return ( type === "number" || type === "string" ) &&

			// parseFloat NaNs numeric-cast false positives ("")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			!isNaN( obj - parseFloat( obj ) );
	},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {

		/* eslint-disable no-unused-vars */
		// See https://github.com/eslint/eslint/issues/6125
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android <=2.3 only (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		DOMEval( code );
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE <=9 - 11, Edge 12 - 13
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android <=4.0 only
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.3.3
 * https://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-08-08
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	},

	disabledAncestor = addCombinator(
		function( elem ) {
			return elem.disabled === true && ("form" in elem || "label" in elem);
		},
		{ dir: "parentNode", next: "legend" }
	);

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rcssescape, fcssescape );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[i] = "#" + nid + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement("fieldset");

	try {
		return !!fn( el );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}
		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					/* jshint -W018 */
					elem.isDisabled !== !disabled &&
						disabledAncestor( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( preferredDoc !== document &&
		(subWindow = document.defaultView) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( el ) {
		el.className = "i";
		return !el.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( el ) {
		el.appendChild( document.createComment("") );
		return !el.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID filter and find
	if ( support.getById ) {
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode("id");
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( (elem = elems[i++]) ) {
						node = elem.getAttributeNode("id");
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( el ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll(":enabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll(":disabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( el ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.escape = function( sel ) {
	return (sel + "").replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": createDisabledPseudo( false ),
		"disabled": createDisabledPseudo( true ),

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( (oldCache = uniqueCache[ key ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( el ) {
	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( el ) {
	return el.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
jQuery.escapeSelector = Sizzle.escape;




var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Simple selector that can be filtered directly, removing non-Elements
	if ( risSimple.test( qualifier ) ) {
		return jQuery.filter( qualifier, elements, not );
	}

	// Complex selector, compare the two sets, removing non-Elements
	qualifier = jQuery.filter( qualifier, elements );
	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) > -1 ) !== not && elem.nodeType === 1;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && jQuery.isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && jQuery.isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Support: Android 4.0 only
			// Strict mode functions invoked without .call/.apply get global-object context
			resolve.call( undefined, value );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.call( undefined, value );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = jQuery.isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( jQuery.isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.stackTrace );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the stack, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getStackHook ) {
									process.stackTrace = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								jQuery.isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								jQuery.isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								jQuery.isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the master Deferred
			master = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						master.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( master.state() === "pending" ||
				jQuery.isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return master.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
		}

		return master.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

jQuery.Deferred.exceptionHook = function( error, stack ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ jQuery.camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ jQuery.camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ jQuery.camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( jQuery.camelCase );
			} else {
				key = jQuery.camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			jQuery.contains( elem.ownerDocument, elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};




function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]+)/i );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// Support: IE <=9 only
	option: [ 1, "<select multiple='multiple'>", "</select>" ],

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

// Support: IE <=9 only
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && jQuery.nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, contains, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
} )();
var documentElement = document.documentElement;



var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 only
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		// Make a writable jQuery.Event from the native event object
		var event = jQuery.event.fix( nativeEvent );

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: jQuery.isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
							return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
							return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (#504, #13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,

	which: function( event ) {
		var button = event.button;

		// Add which for key events
		if ( event.which == null && rkeyEvent.test( event.type ) ) {
			return event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
			if ( button & 1 ) {
				return 1;
			}

			if ( button & 2 ) {
				return 3;
			}

			if ( button & 4 ) {
				return 2;
			}

			return 0;
		}

		return event.which;
	}
}, jQuery.event.addProp );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	/* eslint-disable max-len */

	// See https://github.com/eslint/eslint/issues/3229
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,

	/* eslint-enable */

	// Support: IE <=10 - 11, Edge 12 - 13
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

function manipulationTarget( elem, content ) {
	if ( jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return elem.getElementsByTagName( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							DOMEval( node.textContent.replace( rcleanScript, "" ), doc );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		div.style.cssText =
			"box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";
		div.innerHTML = "";
		documentElement.appendChild( container );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = divStyle.marginLeft === "2px";
		boxSizingReliableVal = divStyle.width === "4px";

		// Support: Android 4.0 - 4.3 only
		// Some styles come back with percentage values, even though they shouldn't
		div.style.marginRight = "50%";
		pixelMarginRightVal = divStyle.marginRight === "4px";

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	container.appendChild( div );

	jQuery.extend( support, {
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelMarginRight: function() {
			computeStyleTests();
			return pixelMarginRightVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );

	// Support: IE <=9 only
	// getPropertyValue is only needed for .css('filter') (#12537)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i,
		val = 0;

	// If we already have the right measurement, avoid augmentation
	if ( extra === ( isBorderBox ? "border" : "content" ) ) {
		i = 4;

	// Otherwise initialize for horizontal or vertical properties
	} else {
		i = name === "width" ? 1 : 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// At this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// At this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// At this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var val,
		valueIsBorderBox = true,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// Support: IE <=11 only
	// Running getBoundingClientRect on a disconnected node
	// in IE throws an error.
	if ( elem.getClientRects().length ) {
		val = elem.getBoundingClientRect()[ name ];
	}

	// Some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// Check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// Use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				style[ name ] = value;
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = extra && getStyles( elem ),
				subtract = extra && augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				);

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ name ] = value;
				value = jQuery.css( elem, name );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function raf() {
	if ( timerId ) {
		window.requestAnimationFrame( raf );
		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 13
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

			/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	// Go to the end state if fx are off or if document is hidden
	if ( jQuery.fx.off || document.hidden ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.requestAnimationFrame ?
			window.requestAnimationFrame( raf ) :
			window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	if ( window.cancelAnimationFrame ) {
		window.cancelAnimationFrame( timerId );
	} else {
		window.clearInterval( timerId );
	}

	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://html.spec.whatwg.org/multipage/infrastructure.html#strip-and-collapse-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnothtmlwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnothtmlwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnothtmlwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
					return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );




support.focusin = "onfocusin" in window;


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = jQuery.isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( jQuery.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 13
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( jQuery.isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" ).prop( {
					charset: s.scriptCharset,
					src: s.url
				} ).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win, rect, doc,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		rect = elem.getBoundingClientRect();

		// Make sure element is not hidden (display: none)
		if ( rect.width || rect.height ) {
			doc = elem.ownerDocument;
			win = getWindow( doc );
			docElem = doc.documentElement;

			return {
				top: rect.top + win.pageYOffset - docElem.clientTop,
				left: rect.left + win.pageXOffset - docElem.clientLeft
			};
		}

		// Return zeros for disconnected and hidden elements (gh-2310)
		return rect;
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume getBoundingClientRect is there when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset = {
				top: parentOffset.top + jQuery.css( offsetParent[ 0 ], "borderTopWidth", true ),
				left: parentOffset.left + jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true )
			};
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

jQuery.parseJSON = JSON.parse;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( true ) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
		return jQuery;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}





return jQuery;
} );


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InvalidArgumentException = function InvalidArgumentException(message) {
    _classCallCheck(this, InvalidArgumentException);

    this.message = message;
    if (typeof arguments.callee.caller.caller.__name != "undefined") {
        this.caller = arguments.callee.caller.caller.__name;
    }
};

exports.InvalidArgumentException = InvalidArgumentException;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9idWlsZGVyL0N1c3RvbUV4Y2VwdGlvbnMuZXM2Il0sIm5hbWVzIjpbIkludmFsaWRBcmd1bWVudEV4Y2VwdGlvbiIsIm1lc3NhZ2UiLCJhcmd1bWVudHMiLCJjYWxsZWUiLCJjYWxsZXIiLCJfX25hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQU1BLHdCLEdBQ0Ysa0NBQVlDLE9BQVosRUFBcUI7QUFBQTs7QUFDakIsU0FBS0EsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsUUFBRyxPQUFPQyxVQUFVQyxNQUFWLENBQWlCQyxNQUFqQixDQUF3QkEsTUFBeEIsQ0FBK0JDLE1BQXRDLElBQWlELFdBQXBELEVBQWdFO0FBQzVELGFBQUtELE1BQUwsR0FBY0YsVUFBVUMsTUFBVixDQUFpQkMsTUFBakIsQ0FBd0JBLE1BQXhCLENBQStCQyxNQUE3QztBQUVIO0FBQ0osQzs7UUFHR0wsd0IsR0FBQUEsd0IiLCJmaWxlIjoiQ3VzdG9tRXhjZXB0aW9ucy5lczYiLCJzb3VyY2VSb290IjoiL1VzZXJzL3JpY2h3YW5kZWxsL1BocHN0b3JtUHJvamVjdHMvZ3JpZC1idWlsZGVyIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgSW52YWxpZEFyZ3VtZW50RXhjZXB0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgIGlmKHR5cGVvZihhcmd1bWVudHMuY2FsbGVlLmNhbGxlci5jYWxsZXIuX19uYW1lKSAhPSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHRoaXMuY2FsbGVyID0gYXJndW1lbnRzLmNhbGxlZS5jYWxsZXIuY2FsbGVyLl9fbmFtZTtcblxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQge0ludmFsaWRBcmd1bWVudEV4Y2VwdGlvbn07Il19

/***/ }),
/* 3 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = __webpack_require__(1);

var _jquery2 = _interopRequireDefault(_jquery);

var _Registry = __webpack_require__(0);

var _Registry2 = _interopRequireDefault(_Registry);

var _Grid = __webpack_require__(7);

var _Grid2 = _interopRequireDefault(_Grid);

var _Db = __webpack_require__(6);

var _Db2 = _interopRequireDefault(_Db);

var _LayoutManager = __webpack_require__(8);

var _LayoutManager2 = _interopRequireDefault(_LayoutManager);

var _ContextMenu = __webpack_require__(5);

var _ContextMenu2 = _interopRequireDefault(_ContextMenu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var classes = _Registry2.default.classes;
var debug = _Registry2.default.console.debug;

var Main = function () {
    /**
     *
     */
    function Main() {
        _classCallCheck(this, Main);

        debug("Main.constructor");
        this.android = typeof Android != "undefined";

        this.grid = new _Grid2.default(this);
        this.db = new _Db2.default(this);
        this.layout = new _LayoutManager2.default(this);
        this.contextMenu = new _ContextMenu2.default(this);
        this.setupEvents();
        if (typeof process != "undefined") {
            if (process.mainModule) {
                process.mainModule.exports.register(this);
            }
        }
    }

    /**
     * Creates event handlers
     */


    _createClass(Main, [{
        key: 'setupEvents',
        value: function setupEvents() {
            var _this = this;

            debug("Main.setupEvents");

            //First setup layout events
            (0, _jquery2.default)("#builder_image_input").change(function (event) {
                _this.layout.imageChanged(event);
            });
            (0, _jquery2.default)("#builder_select_existing").change(function (event) {
                _this.layout.selectChanged(event);
            });
            (0, _jquery2.default)("#builder_vgrid_spaces, #builder_hgrid_spaces").change(function (event) {
                _this.layout.spacesChanged(event);
            });
            var bngs = (0, _jquery2.default)("#builder_named_grid_spaces");
            bngs.on("click", "tr", function (event) {
                _this.layout.selectGridFromList(event);
            });
            bngs.on("mouseenter", "tr", function (event) {
                _this.layout.hoverGridFromList(event);
            });
            bngs.on("mouseleave", "tr", function (event) {
                _this.layout.removeHoverGridFromList(event);
            });
            bngs.on("click", "tr ul", function (event) {
                _this.layout.toggleSpaceDisplay(event);
            });
            (0, _jquery2.default)("#save_floorplan").click(function (event) {
                _this.layout.saveFloorplan(event);
            });
            (0, _jquery2.default)("#builder_add_spaces").click(function (event) {
                _this.layout.addSpace(event);
            });

            //Next setup grid events
            (0, _jquery2.default)(".builder_zoom_in").click(function (event) {
                _this.grid.zoomIn(event);
            });
            (0, _jquery2.default)(".builder_zoom_out").click(function (event) {
                _this.grid.zoomOut(event);
            });
            (0, _jquery2.default)("#builder_grid_color").change(function (event) {
                _this.grid.setGridVars({ "grid_color": (0, _jquery2.default)("#builder_grid_color").val() });
                _this.grid.redraw(event);
            });

            (0, _jquery2.default)(this.grid.getOverlay()).off();
            (0, _jquery2.default)(this.grid.getOverlay()).on({
                "mousedown": function mousedown(event) {
                    _this.grid.overlayMouseDown(event);
                },
                "mouseup": function mouseup(event) {
                    _this.grid.overlayMouseUp(event);
                },
                "mousemove": function mousemove(event) {
                    _this.grid.overlayMouseMove(event);
                },
                "click": function click(event) {
                    _this.grid.overlayClicked(event);
                },
                "touchstart": function touchstart(event) {
                    _this.grid.overlayTouchStart(event);
                },
                "touchmove": function touchmove(event) {
                    _this.grid.overlayTouchMove(event);
                },
                "touchend": function touchend(event) {
                    _this.grid.overlayTouchEnd(event);
                }
            });

            (0, _jquery2.default)("#builder_clear_selection").click(function (event) {
                _this.grid.clearMultiSelection(event);
            });

            (0, _jquery2.default)("#builder_delete_existing").click(function (event) {
                _this.db.deleteExisting(event);
            });

            (0, _jquery2.default)("#builder_download").click(function (event) {
                _this.downloadFloorplan(event);
            });
        }

        /**
         * Downloads the floorplan to a .json file
         * @param event
         */

    }, {
        key: 'downloadFloorplan',
        value: function downloadFloorplan(event) {
            debug("Main.downloadFloorplan");

            var id = parseInt((0, _jquery2.default)("#builder_select_existing").val());
            this.db.loadFloorplan(id, function (event) {
                var data = event.target.result;
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
                element.setAttribute('download', "fplan-" + data.id + ".json");

                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            });
        }

        /**
         *
         * @param {Object} fp The floorplan coming from android
         */

    }, {
        key: 'loadFloorPlan',
        value: function loadFloorPlan(fp) {
            debug("Main.loadFloorPlan");
            if (this.android) {
                this.floorPlan = JSON.parse(Android.getData2(Number(fp)));
                this.db.addFloorPlan(this.floorPlan);
                this.layout.displayFloorplan(this.floorPlan.id);
            }
        }
    }]);

    return Main;
}();

var m = new Main();
window.loadFloorPlan = function (fp) {
    m.loadFloorPlan(fp);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9idWlsZGVyL01haW4uZXM2Il0sIm5hbWVzIjpbImNsYXNzZXMiLCJkZWJ1ZyIsImNvbnNvbGUiLCJNYWluIiwiYW5kcm9pZCIsIkFuZHJvaWQiLCJncmlkIiwiZGIiLCJsYXlvdXQiLCJjb250ZXh0TWVudSIsInNldHVwRXZlbnRzIiwicHJvY2VzcyIsIm1haW5Nb2R1bGUiLCJleHBvcnRzIiwicmVnaXN0ZXIiLCJjaGFuZ2UiLCJldmVudCIsImltYWdlQ2hhbmdlZCIsInNlbGVjdENoYW5nZWQiLCJzcGFjZXNDaGFuZ2VkIiwiYm5ncyIsIm9uIiwic2VsZWN0R3JpZEZyb21MaXN0IiwiaG92ZXJHcmlkRnJvbUxpc3QiLCJyZW1vdmVIb3ZlckdyaWRGcm9tTGlzdCIsInRvZ2dsZVNwYWNlRGlzcGxheSIsImNsaWNrIiwic2F2ZUZsb29ycGxhbiIsImFkZFNwYWNlIiwiem9vbUluIiwiem9vbU91dCIsInNldEdyaWRWYXJzIiwidmFsIiwicmVkcmF3IiwiZ2V0T3ZlcmxheSIsIm9mZiIsIm92ZXJsYXlNb3VzZURvd24iLCJvdmVybGF5TW91c2VVcCIsIm92ZXJsYXlNb3VzZU1vdmUiLCJvdmVybGF5Q2xpY2tlZCIsIm92ZXJsYXlUb3VjaFN0YXJ0Iiwib3ZlcmxheVRvdWNoTW92ZSIsIm92ZXJsYXlUb3VjaEVuZCIsImNsZWFyTXVsdGlTZWxlY3Rpb24iLCJkZWxldGVFeGlzdGluZyIsImRvd25sb2FkRmxvb3JwbGFuIiwiaWQiLCJwYXJzZUludCIsImxvYWRGbG9vcnBsYW4iLCJkYXRhIiwidGFyZ2V0IiwicmVzdWx0IiwiZWxlbWVudCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsImVuY29kZVVSSUNvbXBvbmVudCIsIkpTT04iLCJzdHJpbmdpZnkiLCJzdHlsZSIsImRpc3BsYXkiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJyZW1vdmVDaGlsZCIsImZwIiwiZmxvb3JQbGFuIiwicGFyc2UiLCJnZXREYXRhMiIsIk51bWJlciIsImFkZEZsb29yUGxhbiIsImRpc3BsYXlGbG9vcnBsYW4iLCJtIiwid2luZG93IiwibG9hZEZsb29yUGxhbiJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFJQSxVQUFVLG1CQUFTQSxPQUF2QjtBQUNBLElBQUlDLFFBQVEsbUJBQVNDLE9BQVQsQ0FBaUJELEtBQTdCOztJQUVNRSxJO0FBQ0Y7OztBQUdBLG9CQUFhO0FBQUE7O0FBQ1RGLGNBQU0sa0JBQU47QUFDQSxhQUFLRyxPQUFMLEdBQWUsT0FBT0MsT0FBUCxJQUFtQixXQUFsQzs7QUFFQSxhQUFLQyxJQUFMLEdBQVksbUJBQVMsSUFBVCxDQUFaO0FBQ0EsYUFBS0MsRUFBTCxHQUFVLGlCQUFPLElBQVAsQ0FBVjtBQUNBLGFBQUtDLE1BQUwsR0FBYyw0QkFBa0IsSUFBbEIsQ0FBZDtBQUNBLGFBQUtDLFdBQUwsR0FBbUIsMEJBQWdCLElBQWhCLENBQW5CO0FBQ0EsYUFBS0MsV0FBTDtBQUNBLFlBQUcsT0FBT0MsT0FBUCxJQUFrQixXQUFyQixFQUFpQztBQUM3QixnQkFBR0EsUUFBUUMsVUFBWCxFQUFzQjtBQUNsQkQsd0JBQVFDLFVBQVIsQ0FBbUJDLE9BQW5CLENBQTJCQyxRQUEzQixDQUFvQyxJQUFwQztBQUNIO0FBQ0o7QUFDSjs7QUFFRDs7Ozs7OztzQ0FHYTtBQUFBOztBQUNUYixrQkFBTSxrQkFBTjs7QUFFQTtBQUNBLGtDQUFFLHNCQUFGLEVBQTBCYyxNQUExQixDQUFpQyxVQUFDQyxLQUFELEVBQVc7QUFDeEMsc0JBQUtSLE1BQUwsQ0FBWVMsWUFBWixDQUF5QkQsS0FBekI7QUFDSCxhQUZEO0FBR0Esa0NBQUUsMEJBQUYsRUFBOEJELE1BQTlCLENBQXFDLFVBQUNDLEtBQUQsRUFBVztBQUM1QyxzQkFBS1IsTUFBTCxDQUFZVSxhQUFaLENBQTBCRixLQUExQjtBQUNILGFBRkQ7QUFHQSxrQ0FBRSw4Q0FBRixFQUFrREQsTUFBbEQs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QyxXQUFkLENBQTBCVixPQUExQjtBQUNBQSx3QkFBUTFCLEtBQVI7QUFDQTJCLHlCQUFTUSxJQUFULENBQWNFLFdBQWQsQ0FBMEJYLE9BQTFCO0FBQ0gsYUFWRDtBQVdIOztBQUVEOzs7Ozs7O3NDQUljWSxFLEVBQUk7QUFDZC9ELGtCQUFNLG9CQUFOO0FBQ0EsZ0JBQUcsS0FBS0csT0FBUixFQUFnQjtBQUNaLHFCQUFLNkQsU0FBTCxHQUFpQlIsS0FBS1MsS0FBTCxDQUFXN0QsUUFBUThELFFBQVIsQ0FBaUJDLE9BQU9KLEVBQVAsQ0FBakIsQ0FBWCxDQUFqQjtBQUNBLHFCQUFLekQsRUFBTCxDQUFROEQsWUFBUixDQUFxQixLQUFLSixTQUExQjtBQUNBLHFCQUFLekQsTUFBTCxDQUFZOEQsZ0JBQVosQ0FBNkIsS0FBS0wsU0FBTCxDQUFlbkIsRUFBNUM7QUFDSDtBQUNKOzs7Ozs7QUFJTCxJQUFNeUIsSUFBSSxJQUFJcEUsSUFBSixFQUFWO0FBQ0FxRSxPQUFPQyxhQUFQLEdBQXVCLFVBQVNULEVBQVQsRUFBWTtBQUMvQk8sTUFBRUUsYUFBRixDQUFnQlQsRUFBaEI7QUFDSCxDQUZEIiwiZmlsZSI6Ik1haW4uZXM2Iiwic291cmNlUm9vdCI6Ii9Vc2Vycy9yaWNod2FuZGVsbC9QaHBzdG9ybVByb2plY3RzL2dyaWQtYnVpbGRlciIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgUmVnaXN0cnkgZnJvbSAnLi9SZWdpc3RyeSc7XG5pbXBvcnQgR3JpZCBmcm9tICcuL0dyaWQnO1xuaW1wb3J0IERiIGZyb20gJy4vRGInO1xuaW1wb3J0IExheW91dE1hbmFnZXIgZnJvbSAnLi9MYXlvdXRNYW5hZ2VyJztcbmltcG9ydCBDb250ZXh0TWVudSBmcm9tICcuL0NvbnRleHRNZW51JztcblxubGV0IGNsYXNzZXMgPSBSZWdpc3RyeS5jbGFzc2VzO1xubGV0IGRlYnVnID0gUmVnaXN0cnkuY29uc29sZS5kZWJ1ZztcblxuY2xhc3MgTWFpbntcbiAgICAvKipcbiAgICAgKlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIGRlYnVnKFwiTWFpbi5jb25zdHJ1Y3RvclwiKTtcbiAgICAgICAgdGhpcy5hbmRyb2lkID0gdHlwZW9mKEFuZHJvaWQpICE9IFwidW5kZWZpbmVkXCI7XG5cbiAgICAgICAgdGhpcy5ncmlkID0gbmV3IEdyaWQodGhpcyk7XG4gICAgICAgIHRoaXMuZGIgPSBuZXcgRGIodGhpcyk7XG4gICAgICAgIHRoaXMubGF5b3V0ID0gbmV3IExheW91dE1hbmFnZXIodGhpcyk7XG4gICAgICAgIHRoaXMuY29udGV4dE1lbnUgPSBuZXcgQ29udGV4dE1lbnUodGhpcyk7XG4gICAgICAgIHRoaXMuc2V0dXBFdmVudHMoKTtcbiAgICAgICAgaWYodHlwZW9mIHByb2Nlc3MgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICBpZihwcm9jZXNzLm1haW5Nb2R1bGUpe1xuICAgICAgICAgICAgICAgIHByb2Nlc3MubWFpbk1vZHVsZS5leHBvcnRzLnJlZ2lzdGVyKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBldmVudCBoYW5kbGVyc1xuICAgICAqL1xuICAgIHNldHVwRXZlbnRzKCl7XG4gICAgICAgIGRlYnVnKFwiTWFpbi5zZXR1cEV2ZW50c1wiKTtcblxuICAgICAgICAvL0ZpcnN0IHNldHVwIGxheW91dCBldmVudHNcbiAgICAgICAgJChcIiNidWlsZGVyX2ltYWdlX2lucHV0XCIpLmNoYW5nZSgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0LmltYWdlQ2hhbmdlZChldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKFwiI2J1aWxkZXJfc2VsZWN0X2V4aXN0aW5nXCIpLmNoYW5nZSgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0LnNlbGVjdENoYW5nZWQoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgJChcIiNidWlsZGVyX3ZncmlkX3NwYWNlcywgI2J1aWxkZXJfaGdyaWRfc3BhY2VzXCIpLmNoYW5nZSgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0LnNwYWNlc0NoYW5nZWQoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGJuZ3MgPSAkKFwiI2J1aWxkZXJfbmFtZWRfZ3JpZF9zcGFjZXNcIik7XG4gICAgICAgIGJuZ3Mub24oXCJjbGlja1wiLCBcInRyXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXlvdXQuc2VsZWN0R3JpZEZyb21MaXN0KGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJuZ3Mub24oXCJtb3VzZWVudGVyXCIsIFwidHJcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxheW91dC5ob3ZlckdyaWRGcm9tTGlzdChldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICBibmdzLm9uKFwibW91c2VsZWF2ZVwiLCBcInRyXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXlvdXQucmVtb3ZlSG92ZXJHcmlkRnJvbUxpc3QoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgYm5ncy5vbihcImNsaWNrXCIsIFwidHIgdWxcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxheW91dC50b2dnbGVTcGFjZURpc3BsYXkoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgJChcIiNzYXZlX2Zsb29ycGxhblwiKS5jbGljaygoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0LnNhdmVGbG9vcnBsYW4oZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgJChcIiNidWlsZGVyX2FkZF9zcGFjZXNcIikuY2xpY2soKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxheW91dC5hZGRTcGFjZShldmVudCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vTmV4dCBzZXR1cCBncmlkIGV2ZW50c1xuICAgICAgICAkKFwiLmJ1aWxkZXJfem9vbV9pblwiKS5jbGljaygoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ3JpZC56b29tSW4oZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgJChcIi5idWlsZGVyX3pvb21fb3V0XCIpLmNsaWNrKChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5ncmlkLnpvb21PdXQoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgJChcIiNidWlsZGVyX2dyaWRfY29sb3JcIikuY2hhbmdlKChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5ncmlkLnNldEdyaWRWYXJzKHtcImdyaWRfY29sb3JcIjogJChcIiNidWlsZGVyX2dyaWRfY29sb3JcIikudmFsKCl9KTtcbiAgICAgICAgICAgIHRoaXMuZ3JpZC5yZWRyYXcoZXZlbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKHRoaXMuZ3JpZC5nZXRPdmVybGF5KCkpLm9mZigpO1xuICAgICAgICAkKHRoaXMuZ3JpZC5nZXRPdmVybGF5KCkpLm9uKHtcbiAgICAgICAgICAgIFwibW91c2Vkb3duXCI6IChldmVudCkgPT57XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkLm92ZXJsYXlNb3VzZURvd24oZXZlbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwibW91c2V1cFwiOiAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWQub3ZlcmxheU1vdXNlVXAoZXZlbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwibW91c2Vtb3ZlXCI6IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZC5vdmVybGF5TW91c2VNb3ZlKGV2ZW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImNsaWNrXCI6IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZC5vdmVybGF5Q2xpY2tlZChldmVudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0b3VjaHN0YXJ0XCI6IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZC5vdmVybGF5VG91Y2hTdGFydChldmVudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0b3VjaG1vdmVcIjogKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkLm92ZXJsYXlUb3VjaE1vdmUoZXZlbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidG91Y2hlbmRcIjogKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkLm92ZXJsYXlUb3VjaEVuZChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoXCIjYnVpbGRlcl9jbGVhcl9zZWxlY3Rpb25cIikuY2xpY2soKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdyaWQuY2xlYXJNdWx0aVNlbGVjdGlvbihldmVudCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoXCIjYnVpbGRlcl9kZWxldGVfZXhpc3RpbmdcIikuY2xpY2soKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRiLmRlbGV0ZUV4aXN0aW5nKGV2ZW50KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJChcIiNidWlsZGVyX2Rvd25sb2FkXCIpLmNsaWNrKChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kb3dubG9hZEZsb29ycGxhbihldmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERvd25sb2FkcyB0aGUgZmxvb3JwbGFuIHRvIGEgLmpzb24gZmlsZVxuICAgICAqIEBwYXJhbSBldmVudFxuICAgICAqL1xuICAgIGRvd25sb2FkRmxvb3JwbGFuKGV2ZW50KSB7XG4gICAgICAgIGRlYnVnKFwiTWFpbi5kb3dubG9hZEZsb29ycGxhblwiKTtcblxuICAgICAgICBsZXQgaWQgPSBwYXJzZUludCgkKFwiI2J1aWxkZXJfc2VsZWN0X2V4aXN0aW5nXCIpLnZhbCgpKTtcbiAgICAgICAgdGhpcy5kYi5sb2FkRmxvb3JwbGFuKGlkLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnZGF0YTp0ZXh0L3BsYWluO2NoYXJzZXQ9dXRmLTgsJyArIGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShkYXRhKSkpO1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2Rvd25sb2FkJywgXCJmcGxhbi1cIiArIGRhdGEuaWQgKyBcIi5qc29uXCIpO1xuXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICAgICAgZWxlbWVudC5jbGljaygpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZnAgVGhlIGZsb29ycGxhbiBjb21pbmcgZnJvbSBhbmRyb2lkXG4gICAgICovXG4gICAgbG9hZEZsb29yUGxhbihmcCkge1xuICAgICAgICBkZWJ1ZyhcIk1haW4ubG9hZEZsb29yUGxhblwiKTtcbiAgICAgICAgaWYodGhpcy5hbmRyb2lkKXtcbiAgICAgICAgICAgIHRoaXMuZmxvb3JQbGFuID0gSlNPTi5wYXJzZShBbmRyb2lkLmdldERhdGEyKE51bWJlcihmcCkpKTtcbiAgICAgICAgICAgIHRoaXMuZGIuYWRkRmxvb3JQbGFuKHRoaXMuZmxvb3JQbGFuKTtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0LmRpc3BsYXlGbG9vcnBsYW4odGhpcy5mbG9vclBsYW4uaWQpO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5cbmNvbnN0IG0gPSBuZXcgTWFpbigpO1xud2luZG93LmxvYWRGbG9vclBsYW4gPSBmdW5jdGlvbihmcCl7XG4gICAgbS5sb2FkRmxvb3JQbGFuKGZwKTtcbn07Il19
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = __webpack_require__(1);

var _jquery2 = _interopRequireDefault(_jquery);

var _Registry = __webpack_require__(0);

var _Registry2 = _interopRequireDefault(_Registry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = _Registry2.default.console.debug;
var superDebug = _Registry2.default.console.superDebug;

var ContextMenu = function () {
    function ContextMenu(container) {
        _classCallCheck(this, ContextMenu);

        debug("ContextMenu");
        this.container = container;
        var isNode = typeof process !== "undefined" && "function" !== "undefined";
        var isNodeWebkit = false;

        //Is this Node.js?
        if (isNode) {
            //If so, test for Node-Webkit
            try {
                isNodeWebkit = typeof __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"nw.gui\""); e.code = 'MODULE_NOT_FOUND';; throw e; }())) !== "undefined";
            } catch (e) {
                isNodeWebkit = false;
            }
            if (isNodeWebkit) {
                // this.gui = require('nw.gui');
                this.setupMenu();
            }
        }
    }

    _createClass(ContextMenu, [{
        key: 'setupMenu',
        value: function setupMenu() {
            // Create an empty menu
            var gui = this.gui;
            var win = gui.Window.get();
            var that = this;

            //Setup menubar
            var menubar = new gui.Menu({
                type: 'menubar'
            });

            var sub1 = new gui.Menu();
            sub1.append(new gui.MenuItem({
                label: 'Import Floorplan',
                click: function click() {
                    alert("import floorplan");
                }
            }));

            sub1.append(new gui.MenuItem({
                label: 'Export Floorplan',
                click: function click() {
                    alert("export floorplan");
                }
            }));

            menubar.createMacBuiltin("your-app-name", {
                hideEdit: true,
                hideWindow: true
            });
            menubar.append(new gui.MenuItem({
                label: 'File',
                submenu: sub1
            }));
            win.menu = menubar;

            //Setup context menu
            var menu = new gui.Menu();
            // Add a item and bind a callback to item
            menu.append(new gui.MenuItem({
                label: 'Clear Selection',
                click: function click(event) {
                    that.container.grid.clearMultiSelection(event);
                }
            }));

            // Popup as context menu
            (0, _jquery2.default)("#builder_canvas_overlay").on('contextmenu', function (ev) {
                ev.preventDefault();
                // Popup at place you click
                menu.popup(ev.clientX, ev.clientY);
                return false;
            });

            //
            // // add a click event to an existing menuItem
            // menu.items[0].click = function () {
            //     console.log("CLICK");
            // };
            this.menu = menu;
            this.win = win;
            this.menubar = menubar;
        }
    }]);

    return ContextMenu;
}();

exports.default = ContextMenu;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9idWlsZGVyL0NvbnRleHRNZW51LmVzNiJdLCJuYW1lcyI6WyJkZWJ1ZyIsImNvbnNvbGUiLCJzdXBlckRlYnVnIiwiQ29udGV4dE1lbnUiLCJjb250YWluZXIiLCJpc05vZGUiLCJwcm9jZXNzIiwicmVxdWlyZSIsImlzTm9kZVdlYmtpdCIsImUiLCJzZXR1cE1lbnUiLCJndWkiLCJ3aW4iLCJXaW5kb3ciLCJnZXQiLCJ0aGF0IiwibWVudWJhciIsIk1lbnUiLCJ0eXBlIiwic3ViMSIsImFwcGVuZCIsIk1lbnVJdGVtIiwibGFiZWwiLCJjbGljayIsImFsZXJ0IiwiY3JlYXRlTWFjQnVpbHRpbiIsImhpZGVFZGl0IiwiaGlkZVdpbmRvdyIsInN1Ym1lbnUiLCJtZW51IiwiZXZlbnQiLCJncmlkIiwiY2xlYXJNdWx0aVNlbGVjdGlvbiIsIm9uIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsInBvcHVwIiwiY2xpZW50WCIsImNsaWVudFkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7Ozs7QUFHQSxJQUFJQSxRQUFRLG1CQUFTQyxPQUFULENBQWlCRCxLQUE3QjtBQUNBLElBQUlFLGFBQWEsbUJBQVNELE9BQVQsQ0FBaUJDLFVBQWxDOztJQUVNQyxXO0FBQ0YseUJBQVlDLFNBQVosRUFBdUI7QUFBQTs7QUFDbkJKLGNBQU0sYUFBTjtBQUNBLGFBQUtJLFNBQUwsR0FBaUJBLFNBQWpCO0FBQ0EsWUFBSUMsU0FBVSxPQUFPQyxPQUFQLEtBQW1CLFdBQW5CLElBQWtDLE9BQU9DLE9BQVAsS0FBbUIsV0FBbkU7QUFDQSxZQUFJQyxlQUFlLEtBQW5COztBQUVBO0FBQ0EsWUFBR0gsTUFBSCxFQUFXO0FBQ1A7QUFDQSxnQkFBSTtBQUNBRywrQkFBZ0IsT0FBT0QsUUFBUSxRQUFSLENBQVAsS0FBNkIsV0FBN0M7QUFDSCxhQUZELENBRUUsT0FBTUUsQ0FBTixFQUFTO0FBQ1BELCtCQUFlLEtBQWY7QUFDSDtBQUNELGdCQUFHQSxZQUFILEVBQWdCO0FBQ1o7QUFDQSxxQkFBS0UsU0FBTDtBQUNIO0FBQ0o7QUFDSjs7OztvQ0FFVTtBQUNQO0FBQ0EsZ0JBQUlDLE1BQU0sS0FBS0EsR0FBZjtBQUNBLGdCQUFJQyxNQUFNRCxJQUFJRSxNQUFKLENBQVdDLEdBQVgsRUFBVjtBQUNBLGdCQUFJQyxPQUFPLElBQVg7O0FBR0E7QUFDQSxnQkFBSUMsVUFBVSxJQUFJTCxJQUFJTSxJQUFSLENBQWE7QUFDdkJDLHNCQUFNO0FBRGlCLGFBQWIsQ0FBZDs7QUFJQSxnQkFBSUMsT0FBTyxJQUFJUixJQUFJTSxJQUFSLEVBQVg7QUFDQUUsaUJBQUtDLE1BQUwsQ0FBWSxJQUFJVCxJQUFJVSxRQUFSLENBQWlCO0FBQ3pCQyx1QkFBTyxrQkFEa0I7QUFFekJDLHVCQUFPLGlCQUFZO0FBQ2ZDLDBCQUFNLGtCQUFOO0FBQ0g7QUFKd0IsYUFBakIsQ0FBWjs7QUFPQUwsaUJBQUtDLE1BQUwsQ0FBWSxJQUFJVCxJQUFJVSxRQUFSLENBQWlCO0FBQ3pCQyx1QkFBTyxrQkFEa0I7QUFFekJDLHVCQUFPLGlCQUFZO0FBQ2ZDLDBCQUFNLGtCQUFOO0FBQ0g7QUFKd0IsYUFBakIsQ0FBWjs7QUFTQVIsb0JBQVFTLGdCQUFSLENBQXlCLGVBQXpCLEVBQTBDO0FBQ3RDQywwQkFBVSxJQUQ0QjtBQUV0Q0MsNEJBQVk7QUFGMEIsYUFBMUM7QUFJQVgsb0JBQVFJLE1BQVIsQ0FBZSxJQUFJVCxJQUFJVSxRQUFSLENBQWlCO0FBQzVCQyx1QkFBTyxNQURxQjtBQUU1Qk0seUJBQVNUO0FBRm1CLGFBQWpCLENBQWY7QUFJQVAsZ0JBQUlpQixJQUFKLEdBQVdiLE9BQVg7O0FBR0E7QUFDQSxnQkFBSWEsT0FBTyxJQUFJbEIsSUFBSU0sSUFBUixFQUFYO0FBQ0E7QUFDQVksaUJBQUtULE1BQUwsQ0FBWSxJQUFJVCxJQUFJVSxRQUFSLENBQWlCO0FBQ3pCQyx1QkFBTyxpQkFEa0I7QUFFekJDLHVCQUFPLGVBQVVPLEtBQVYsRUFBaUI7QUFDcEJmLHlCQUFLWCxTQUFMLENBQWUyQixJQUFmLENBQW9CQyxtQkFBcEIsQ0FBd0NGLEtBQXhDO0FBQ0g7QUFKd0IsYUFBakIsQ0FBWjs7QUFPQTtBQUNBLGtDQUFFLHlCQUFGLEVBQTZCRyxFQUE3QixDQUFnQyxhQUFoQyxFQUErQyxVQUFVQyxFQUFWLEVBQWM7QUFDekRBLG1CQUFHQyxjQUFIO0FBQ0E7QUFDQU4scUJBQUtPLEtBQUwsQ0FBV0YsR0FBR0csT0FBZCxFQUF1QkgsR0FBR0ksT0FBMUI7QUFDQSx1QkFBTyxLQUFQO0FBQ0gsYUFMRDs7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQUtULElBQUwsR0FBWUEsSUFBWjtBQUNBLGlCQUFLakIsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsaUJBQUtJLE9BQUwsR0FBZUEsT0FBZjtBQUNIOzs7Ozs7a0JBR1ViLFciLCJmaWxlIjoiQ29udGV4dE1lbnUuZXM2Iiwic291cmNlUm9vdCI6Ii9Vc2Vycy9yaWNod2FuZGVsbC9QaHBzdG9ybVByb2plY3RzL2dyaWQtYnVpbGRlciIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgUmVnaXN0cnkgZnJvbSAnLi9SZWdpc3RyeSc7XG5cblxubGV0IGRlYnVnID0gUmVnaXN0cnkuY29uc29sZS5kZWJ1ZztcbmxldCBzdXBlckRlYnVnID0gUmVnaXN0cnkuY29uc29sZS5zdXBlckRlYnVnO1xuXG5jbGFzcyBDb250ZXh0TWVudSB7XG4gICAgY29uc3RydWN0b3IoY29udGFpbmVyKSB7XG4gICAgICAgIGRlYnVnKFwiQ29udGV4dE1lbnVcIik7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgICAgICBsZXQgaXNOb2RlID0gKHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiByZXF1aXJlICE9PSBcInVuZGVmaW5lZFwiKTtcbiAgICAgICAgbGV0IGlzTm9kZVdlYmtpdCA9IGZhbHNlO1xuXG4gICAgICAgIC8vSXMgdGhpcyBOb2RlLmpzP1xuICAgICAgICBpZihpc05vZGUpIHtcbiAgICAgICAgICAgIC8vSWYgc28sIHRlc3QgZm9yIE5vZGUtV2Via2l0XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlzTm9kZVdlYmtpdCA9ICh0eXBlb2YgcmVxdWlyZSgnbncuZ3VpJykgIT09IFwidW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgaXNOb2RlV2Via2l0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihpc05vZGVXZWJraXQpe1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuZ3VpID0gcmVxdWlyZSgnbncuZ3VpJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXR1cE1lbnUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldHVwTWVudSgpe1xuICAgICAgICAvLyBDcmVhdGUgYW4gZW1wdHkgbWVudVxuICAgICAgICBsZXQgZ3VpID0gdGhpcy5ndWk7XG4gICAgICAgIGxldCB3aW4gPSBndWkuV2luZG93LmdldCgpO1xuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG5cblxuICAgICAgICAvL1NldHVwIG1lbnViYXJcbiAgICAgICAgbGV0IG1lbnViYXIgPSBuZXcgZ3VpLk1lbnUoe1xuICAgICAgICAgICAgdHlwZTogJ21lbnViYXInXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBzdWIxID0gbmV3IGd1aS5NZW51KCk7XG4gICAgICAgIHN1YjEuYXBwZW5kKG5ldyBndWkuTWVudUl0ZW0oe1xuICAgICAgICAgICAgbGFiZWw6ICdJbXBvcnQgRmxvb3JwbGFuJyxcbiAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoXCJpbXBvcnQgZmxvb3JwbGFuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgc3ViMS5hcHBlbmQobmV3IGd1aS5NZW51SXRlbSh7XG4gICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBGbG9vcnBsYW4nLFxuICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBhbGVydChcImV4cG9ydCBmbG9vcnBsYW5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuXG5cbiAgICAgICAgbWVudWJhci5jcmVhdGVNYWNCdWlsdGluKFwieW91ci1hcHAtbmFtZVwiLCB7XG4gICAgICAgICAgICBoaWRlRWRpdDogdHJ1ZSxcbiAgICAgICAgICAgIGhpZGVXaW5kb3c6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIG1lbnViYXIuYXBwZW5kKG5ldyBndWkuTWVudUl0ZW0oe1xuICAgICAgICAgICAgbGFiZWw6ICdGaWxlJyxcbiAgICAgICAgICAgIHN1Ym1lbnU6IHN1YjFcbiAgICAgICAgfSkpO1xuICAgICAgICB3aW4ubWVudSA9IG1lbnViYXI7XG5cblxuICAgICAgICAvL1NldHVwIGNvbnRleHQgbWVudVxuICAgICAgICBsZXQgbWVudSA9IG5ldyBndWkuTWVudSgpO1xuICAgICAgICAvLyBBZGQgYSBpdGVtIGFuZCBiaW5kIGEgY2FsbGJhY2sgdG8gaXRlbVxuICAgICAgICBtZW51LmFwcGVuZChuZXcgZ3VpLk1lbnVJdGVtKHtcbiAgICAgICAgICAgIGxhYmVsOiAnQ2xlYXIgU2VsZWN0aW9uJyxcbiAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmNvbnRhaW5lci5ncmlkLmNsZWFyTXVsdGlTZWxlY3Rpb24oZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gUG9wdXAgYXMgY29udGV4dCBtZW51XG4gICAgICAgICQoXCIjYnVpbGRlcl9jYW52YXNfb3ZlcmxheVwiKS5vbignY29udGV4dG1lbnUnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAvLyBQb3B1cCBhdCBwbGFjZSB5b3UgY2xpY2tcbiAgICAgICAgICAgIG1lbnUucG9wdXAoZXYuY2xpZW50WCwgZXYuY2xpZW50WSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gLy8gYWRkIGEgY2xpY2sgZXZlbnQgdG8gYW4gZXhpc3RpbmcgbWVudUl0ZW1cbiAgICAgICAgLy8gbWVudS5pdGVtc1swXS5jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiQ0xJQ0tcIik7XG4gICAgICAgIC8vIH07XG4gICAgICAgIHRoaXMubWVudSA9IG1lbnU7XG4gICAgICAgIHRoaXMud2luID0gd2luO1xuICAgICAgICB0aGlzLm1lbnViYXIgPSBtZW51YmFyO1xuICAgIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbnRleHRNZW51OyJdfQ==
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = __webpack_require__(1);

var _jquery2 = _interopRequireDefault(_jquery);

var _Registry = __webpack_require__(0);

var _Registry2 = _interopRequireDefault(_Registry);

var _CustomExceptions = __webpack_require__(2);

var _CustomExceptions2 = _interopRequireDefault(_CustomExceptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = _Registry2.default.console.debug;
var superDebug = _Registry2.default.console.superDebug;

var Db = function () {
    /**
     * Db class handles all database transactions for IndexedDB
     *
     * @constructor
     * @param {Main} container
     */
    function Db(container) {
        _classCallCheck(this, Db);

        debug("Db.constructor");
        this.container = container;
        this.databaseVersion = 11;
        this.database_version = 0;
        this.needsSettings = false;
        this.androidFpDatabase = [];
        this.allFpIds = [];
        if (!this.container.android) {
            this.requestDatabase();
        }
    }

    _createClass(Db, [{
        key: 'addFloorPlan',
        value: function addFloorPlan(fp) {
            debug("Db.addFloorPlan");
            if (typeof fp.id == "undefined") return false;
            if (this.allFpIds.indexOf(fp.id) > -1) {
                this.androidFpDatabase[this.allFpIds.indexOf(fp.id)] = fp;
            } else {
                this.androidFpDatabase.push(fp);
                this.allFpIds.push(fp.id);
            }
        }
    }, {
        key: 'updateDatabaseVersion',
        value: function updateDatabaseVersion(version) {
            var _this = this;

            var os = that.database.transaction(["settings"], "readwrite").objectStore("settings");

            var req = os.get(1);

            req.onsuccess = function (event) {
                var settings = event.target.result;
                settings.database_version = version;
                _this.database_version = version;
                os.put(settings);
            };
        }
    }, {
        key: 'requestDatabase',
        value: function requestDatabase(version) {
            var _this2 = this;

            debug("Db.requestDatabase");
            //Request our db and set event handlers
            var dbrequest = window.indexedDB.open("BuilderDatabase", this.databaseVersion);
            dbrequest.onupgradeneeded = function (event) {
                debug("Db.onupgradeneeded");

                _this2.database = event.target.result;

                if (!_this2.database.objectStoreNames.contains("layout_images")) {
                    _this2.database.createObjectStore("layout_images", { keyPath: "id" });
                }

                if (!_this2.database.objectStoreNames.contains("settings")) {
                    _this2.database.createObjectStore("settings", { keyPath: "id", autoIncrement: true });
                    _this2.needsSettings = true;
                }
            };
            dbrequest.onsuccess = function (event) {
                debug("Db.onsuccess");
                _this2.database = event.target.result;

                if (_this2.needsSettings) {
                    var t = _this2.database.transaction(["settings"], "readwrite").objectStore("settings").add({
                        "database_version": _this2.database_version
                    });
                    t.onsuccess = function (event) {
                        _this2.syncWithServer();
                    };
                } else {
                    _this2.syncWithServer();
                }
            };
        }
    }, {
        key: 'syncWithServer',
        value: function syncWithServer() {
            var _this3 = this;

            debug("Db.syncWithServer");
            this.getServerVersion(function (res) {
                var os = _this3.database.transaction(["settings"], "readwrite").objectStore("settings");
                var req = os.get(1);
                req.onsuccess = function (event) {
                    var dbv = event.target.result.database_version + _this3.databaseVersion;
                    _this3.database_version = event.target.result.database_version;
                    var resdb = typeof res.databaseVersion != "undefined" ? parseInt(res.databaseVersion) : dbv;

                    if (dbv == resdb) {
                        _this3.reloadFromDb();
                    } else if (resdb < dbv) {
                        _this3.sendUpdates();
                    } else {
                        _this3.updateDatabaseVersion(resdb - _this3.databaseVersion);
                        _this3.getUpdates();
                    }
                };
            });
        }
    }, {
        key: 'getUpdates',
        value: function getUpdates() {
            var _this4 = this;

            debug("Db.getUpdates");
            _jquery2.default.ajax({
                url: "http://localhost:8888/rest/floorplans",
                method: "get",
                dataType: "json",
                success: function success(res) {
                    var count = res.length;
                    var done = 0;
                    var that = _this4;
                    _jquery2.default.each(res, function (key, val) {
                        var data = val.layout_image;
                        data.id = String(data.id);
                        data.hgrid_spaces = parseInt(data.hgrid_spaces);
                        data.vgrid_spaces = parseInt(data.vgrid_spaces);
                        _jquery2.default.each(data.grid, function (key, val) {
                            if (val === "") {
                                delete data.grid[key];
                            }
                            _jquery2.default.each(val, function (_key, _val) {
                                if (_val === "") {
                                    delete data.grid[key][_key];
                                }
                            });
                        });
                        var t = that.database.transaction(["layout_images"], "readwrite").objectStore("layout_images").add(data);
                        t.onsuccess = function () {
                            done++;
                            if (done >= count) {
                                that.reloadFromDb();
                            }
                        };
                        t.onerror = function () {
                            done++;
                            if (done >= count) {
                                that.reloadFromDb();
                            }
                        };
                    });
                }
            });
        }
    }, {
        key: 'getServerVersion',
        value: function getServerVersion(cb) {
            var _this5 = this,
                _arguments = arguments;

            debug("Db.getServerVersion");
            _jquery2.default.ajax({
                "url": "http://localhost:8888/rest/databaseVersion",
                "method": "get",
                "dataType": "json",
                success: function success(res) {
                    cb.apply(_this5, _arguments);
                },
                error: function error(res) {
                    _this5.reloadFromDb();
                }
            });
        }
    }, {
        key: 'sendUpdates',
        value: function sendUpdates() {
            debug("Db.sendUpdates");
            var that = this;
            var req = that.database.transaction(["layout_images"], "readwrite").objectStore("layout_images").getAll();
            req.onsuccess = function (event) {
                _jquery2.default.ajax({
                    url: "http://localhost:8888/rest/updateDatabase",
                    method: "post",
                    dataType: "json",
                    data: {
                        databaseVersion: that.databaseVersion + that.database_version,
                        layout_images: event.target.result
                    },
                    success: function success(res) {
                        if (res.success) {
                            that.reloadFromDb();
                        }
                    }
                });
            };
        }
    }, {
        key: 'sendOneUpdate',
        value: function sendOneUpdate(layout_image) {
            var that = this;
            _jquery2.default.ajax({
                url: "http://localhost:8888/rest/updateDatabase",
                method: "post",
                dataType: "json",
                data: {
                    databaseVersion: that.databaseVersion + that.database_version,
                    layout_images: [layout_image]
                },
                success: function success(res) {
                    if (res.success) {
                        console.log(res);
                    }
                }
            });
        }
    }, {
        key: 'addLayoutImage',
        value: function addLayoutImage(data, cb) {
            debug("Db.addLayoutImage");
            var t = this.database.transaction(["layout_images"], "readwrite").objectStore("layout_images").add(data);
            var that = this;
            t.onsuccess = function (event) {
                cb.apply(that, arguments);
            };
        }

        /**
         * Reads all images from the IndexedDB database and calls the LayoutManager resetFromDb method
         * @param {Number|Event} [id]
         */

    }, {
        key: 'reloadFromDb',
        value: function reloadFromDb(id) {
            debug("Db.reloadFromDb");
            if (isNaN(id)) {
                id = null;
            }
            var that = this;
            (0, _jquery2.default)("#builder_select_existing").html("");
            var req = this.database.transaction(["layout_images"], "readwrite").objectStore("layout_images").getAll();
            req.onsuccess = function (event) {
                that.container.layout.resetFromDb(event, id);
            };
        }

        /**
         *
         * @param {Number} id
         * @param {function} cb
         */

    }, {
        key: 'loadFloorplan',
        value: function loadFloorplan(id, cb) {
            debug("Db.loadFloorplan");
            var that = this;
            if (this.container.android) {
                var index = this.allFpIds.indexOf(id);
                if (index > -1) {
                    var fp = this.androidFpDatabase[index].layout_image;
                    var event = {
                        target: {
                            result: fp
                        }
                    };
                    return cb.apply(that, [event]);
                }
            } else {
                var t = this.database.transaction(["layout_images"], "readwrite").objectStore("layout_images").get(String(id));

                t.onsuccess = function (event) {
                    cb.apply(that, arguments);
                };
            }
        }

        /**
         *
         * @param event
         */

    }, {
        key: 'deleteExisting',
        value: function deleteExisting(event) {
            debug("Db.deleteExisting");
            var id = (0, _jquery2.default)("#builder_select_existing").val();
            var t = this.database.transaction(["layout_images"], "readwrite").objectStore("layout_images").delete(id);
            var that = this;
            t.onsuccess = function (event) {
                that.reloadFromDb();
            };
        }
    }, {
        key: 'saveFloorplan',
        value: function saveFloorplan(vars) {
            debug("Db.saveFloorplan");
            if ((typeof vars === 'undefined' ? 'undefined' : _typeof(vars)) != "object") {
                throw new _CustomExceptions2.default("saveFloorplan requires an object parameter");
            }
            if (typeof vars["id"] != "string") {
                throw new _CustomExceptions2.default("saveFloorplan missing id");
            }
            var os = this.database.transaction(["layout_images"], "readwrite").objectStore("layout_images");
            var req = os.get(vars["id"]);
            var that = this;

            req.onsuccess = function (event) {
                var data = event.target.result;
                _jquery2.default.each(vars, function (key, value) {
                    data[key] = value;
                });
                var requp = os.put(data);
                requp.onsuccess = function (event) {
                    var os = that.database.transaction(["settings"], "readwrite").objectStore("settings");
                    var req = os.get(1);
                    req.onsuccess = function (event) {
                        var settings = event.target.result;
                        settings.database_version++;
                        that.database_version++;
                        os.put(settings);
                        that.sendOneUpdate(data);
                    };
                };
            };
        }
    }]);

    return Db;
}();

exports.default = Db;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9idWlsZGVyL0RiLmVzNiJdLCJuYW1lcyI6WyJkZWJ1ZyIsImNvbnNvbGUiLCJzdXBlckRlYnVnIiwiRGIiLCJjb250YWluZXIiLCJkYXRhYmFzZVZlcnNpb24iLCJkYXRhYmFzZV92ZXJzaW9uIiwibmVlZHNTZXR0aW5ncyIsImFuZHJvaWRGcERhdGFiYXNlIiwiYWxsRnBJZHMiLCJhbmRyb2lkIiwicmVxdWVzdERhdGFiYXNlIiwiZnAiLCJpZCIsImluZGV4T2YiLCJwdXNoIiwidmVyc2lvbiIsIm9zIiwidGhhdCIsImRhdGFiYXNlIiwidHJhbnNhY3Rpb24iLCJvYmplY3RTdG9yZSIsInJlcSIsImdldCIsIm9uc3VjY2VzcyIsImV2ZW50Iiwic2V0dGluZ3MiLCJ0YXJnZXQiLCJyZXN1bHQiLCJwdXQiLCJkYnJlcXVlc3QiLCJ3aW5kb3ciLCJpbmRleGVkREIiLCJvcGVuIiwib251cGdyYWRlbmVlZGVkIiwib2JqZWN0U3RvcmVOYW1lcyIsImNvbnRhaW5zIiwiY3JlYXRlT2JqZWN0U3RvcmUiLCJrZXlQYXRoIiwiYXV0b0luY3JlbWVudCIsInQiLCJhZGQiLCJzeW5jV2l0aFNlcnZlciIsImdldFNlcnZlclZlcnNpb24iLCJyZXMiLCJkYnYiLCJyZXNkYiIsInBhcnNlSW50IiwicmVsb2FkRnJvbURiIiwic2VuZFVwZGF0ZXMiLCJ1cGRhdGVEYXRhYmFzZVZlcnNpb24iLCJnZXRVcGRhdGVzIiwiYWpheCIsInVybCIsIm1ldGhvZCIsImRhdGFUeXBlIiwic3VjY2VzcyIsImNvdW50IiwibGVuZ3RoIiwiZG9uZSIsImVhY2giLCJrZXkiLCJ2YWwiLCJkYXRhIiwibGF5b3V0X2ltYWdlIiwiU3RyaW5nIiwiaGdyaWRfc3BhY2VzIiwidmdyaWRfc3BhY2VzIiwiZ3JpZCIsIl9rZXkiLCJfdmFsIiwib25lcnJvciIsImNiIiwiYXBwbHkiLCJlcnJvciIsImdldEFsbCIsImxheW91dF9pbWFnZXMiLCJsb2ciLCJhcmd1bWVudHMiLCJpc05hTiIsImh0bWwiLCJsYXlvdXQiLCJyZXNldEZyb21EYiIsImluZGV4IiwiZGVsZXRlIiwidmFycyIsInZhbHVlIiwicmVxdXAiLCJzZW5kT25lVXBkYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQUVBLElBQUlBLFFBQVEsbUJBQVNDLE9BQVQsQ0FBaUJELEtBQTdCO0FBQ0EsSUFBSUUsYUFBYSxtQkFBU0QsT0FBVCxDQUFpQkMsVUFBbEM7O0lBRU1DLEU7QUFDRjs7Ozs7O0FBTUEsZ0JBQVlDLFNBQVosRUFBc0I7QUFBQTs7QUFDbEJKLGNBQU0sZ0JBQU47QUFDQSxhQUFLSSxTQUFMLEdBQWlCQSxTQUFqQjtBQUNBLGFBQUtDLGVBQUwsR0FBdUIsRUFBdkI7QUFDQSxhQUFLQyxnQkFBTCxHQUF3QixDQUF4QjtBQUNBLGFBQUtDLGFBQUwsR0FBcUIsS0FBckI7QUFDQSxhQUFLQyxpQkFBTCxHQUF5QixFQUF6QjtBQUNBLGFBQUtDLFFBQUwsR0FBZ0IsRUFBaEI7QUFDQSxZQUFHLENBQUMsS0FBS0wsU0FBTCxDQUFlTSxPQUFuQixFQUEyQjtBQUN2QixpQkFBS0MsZUFBTDtBQUNIO0FBQ0o7Ozs7cUNBRVlDLEUsRUFBSTtBQUNiWixrQkFBTSxpQkFBTjtBQUNBLGdCQUFHLE9BQU9ZLEdBQUdDLEVBQVYsSUFBaUIsV0FBcEIsRUFBaUMsT0FBTyxLQUFQO0FBQ2pDLGdCQUFHLEtBQUtKLFFBQUwsQ0FBY0ssT0FBZCxDQUFzQkYsR0FBR0MsRUFBekIsSUFBK0IsQ0FBQyxDQUFuQyxFQUFxQztBQUNqQyxxQkFBS0wsaUJBQUwsQ0FBdUIsS0FBS0MsUUFBTCxDQUFjSyxPQUFkLENBQXNCRixHQUFHQyxFQUF6QixDQUF2QixJQUF1REQsRUFBdkQ7QUFDSCxhQUZELE1BRUs7QUFDRCxxQkFBS0osaUJBQUwsQ0FBdUJPLElBQXZCLENBQTRCSCxFQUE1QjtBQUNBLHFCQUFLSCxRQUFMLENBQWNNLElBQWQsQ0FBbUJILEdBQUdDLEVBQXRCO0FBQ0g7QUFDSjs7OzhDQUVx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QUFWO0FBQ0EsZ0JBQUluRSxPQUFPLElBQVg7O0FBRUFJLGdCQUFJRSxTQUFKLEdBQWdCLFVBQVNDLEtBQVQsRUFBZTtBQUMzQixvQkFBSXNDLE9BQU90QyxNQUFNRSxNQUFOLENBQWFDLE1BQXhCO0FBQ0EsaUNBQUVnQyxJQUFGLENBQU95QixJQUFQLEVBQWEsVUFBU3hCLEdBQVQsRUFBY3lCLEtBQWQsRUFBb0I7QUFDN0J2Qix5QkFBS0YsR0FBTCxJQUFZeUIsS0FBWjtBQUNILGlCQUZEO0FBR0Esb0JBQUlDLFFBQVF0RSxHQUFHWSxHQUFILENBQU9rQyxJQUFQLENBQVo7QUFDQXdCLHNCQUFNL0QsU0FBTixHQUFrQixVQUFTQyxLQUFULEVBQWU7QUFDN0Isd0JBQUlSLEtBQUtDLEtBQUtDLFFBQUwsQ0FBY0MsV0FBZCxDQUEwQixDQUFDLFVBQUQsQ0FBMUIsRUFBd0MsV0FBeEMsRUFDSkMsV0FESSxDQUNRLFVBRFIsQ0FBVDtBQUVBLHdCQUFJQyxNQUFNTCxHQUFHTSxHQUFILENBQU8sQ0FBUCxDQUFWO0FBQ0FELHdCQUFJRSxTQUFKLEdBQWdCLFVBQVNDLEtBQVQsRUFBZTtBQUMzQiw0QkFBSUMsV0FBV0QsTUFBTUUsTUFBTixDQUFhQyxNQUE1QjtBQUNBRixpQ0FBU3BCLGdCQUFUO0FBQ0FZLDZCQUFLWixnQkFBTDtBQUNBVywyQkFBR1ksR0FBSCxDQUFPSCxRQUFQO0FBQ0FSLDZCQUFLc0UsYUFBTCxDQUFtQnpCLElBQW5CO0FBQ0gscUJBTkQ7QUFPSCxpQkFYRDtBQVlILGFBbEJEO0FBbUJIOzs7Ozs7a0JBR1U1RCxFIiwiZmlsZSI6IkRiLmVzNiIsInNvdXJjZVJvb3QiOiIvVXNlcnMvcmljaHdhbmRlbGwvUGhwc3Rvcm1Qcm9qZWN0cy9ncmlkLWJ1aWxkZXIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJCBmcm9tICdqcXVlcnknO1xuaW1wb3J0IFJlZ2lzdHJ5IGZyb20gJy4vUmVnaXN0cnknO1xuaW1wb3J0IEludmFsaWRBcmd1bWVudEV4Y2VwdGlvbiBmcm9tICcuL0N1c3RvbUV4Y2VwdGlvbnMnO1xuXG5sZXQgZGVidWcgPSBSZWdpc3RyeS5jb25zb2xlLmRlYnVnO1xubGV0IHN1cGVyRGVidWcgPSBSZWdpc3RyeS5jb25zb2xlLnN1cGVyRGVidWc7XG5cbmNsYXNzIERiIHtcbiAgICAvKipcbiAgICAgKiBEYiBjbGFzcyBoYW5kbGVzIGFsbCBkYXRhYmFzZSB0cmFuc2FjdGlvbnMgZm9yIEluZGV4ZWREQlxuICAgICAqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtNYWlufSBjb250YWluZXJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihjb250YWluZXIpe1xuICAgICAgICBkZWJ1ZyhcIkRiLmNvbnN0cnVjdG9yXCIpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICAgICAgdGhpcy5kYXRhYmFzZVZlcnNpb24gPSAxMTtcbiAgICAgICAgdGhpcy5kYXRhYmFzZV92ZXJzaW9uID0gMDtcbiAgICAgICAgdGhpcy5uZWVkc1NldHRpbmdzID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYW5kcm9pZEZwRGF0YWJhc2UgPSBbXTtcbiAgICAgICAgdGhpcy5hbGxGcElkcyA9IFtdO1xuICAgICAgICBpZighdGhpcy5jb250YWluZXIuYW5kcm9pZCl7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3REYXRhYmFzZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkRmxvb3JQbGFuKGZwKSB7XG4gICAgICAgIGRlYnVnKFwiRGIuYWRkRmxvb3JQbGFuXCIpO1xuICAgICAgICBpZih0eXBlb2YoZnAuaWQpID09IFwidW5kZWZpbmVkXCIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYodGhpcy5hbGxGcElkcy5pbmRleE9mKGZwLmlkKSA+IC0xKXtcbiAgICAgICAgICAgIHRoaXMuYW5kcm9pZEZwRGF0YWJhc2VbdGhpcy5hbGxGcElkcy5pbmRleE9mKGZwLmlkKV0gPSBmcDtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLmFuZHJvaWRGcERhdGFiYXNlLnB1c2goZnApO1xuICAgICAgICAgICAgdGhpcy5hbGxGcElkcy5wdXNoKGZwLmlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZURhdGFiYXNlVmVyc2lvbih2ZXJzaW9uKSB7XG4gICAgICAgIGxldCBvcyA9IHRoYXQuZGF0YWJhc2UudHJhbnNhY3Rpb24oW1wic2V0dGluZ3NcIl0sIFwicmVhZHdyaXRlXCIpXG4gICAgICAgICAgICAub2JqZWN0U3RvcmUoXCJzZXR0aW5nc1wiKTtcblxuICAgICAgICBsZXQgcmVxID0gb3MuZ2V0KDEpO1xuXG4gICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBzZXR0aW5ncyA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICBzZXR0aW5ncy5kYXRhYmFzZV92ZXJzaW9uID0gdmVyc2lvbjtcbiAgICAgICAgICAgIHRoaXMuZGF0YWJhc2VfdmVyc2lvbiA9IHZlcnNpb247XG4gICAgICAgICAgICBvcy5wdXQoc2V0dGluZ3MpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJlcXVlc3REYXRhYmFzZSh2ZXJzaW9uKSB7XG4gICAgICAgIGRlYnVnKFwiRGIucmVxdWVzdERhdGFiYXNlXCIpO1xuICAgICAgICAvL1JlcXVlc3Qgb3VyIGRiIGFuZCBzZXQgZXZlbnQgaGFuZGxlcnNcbiAgICAgICAgbGV0IGRicmVxdWVzdCA9IHdpbmRvdy5pbmRleGVkREIub3BlbihcIkJ1aWxkZXJEYXRhYmFzZVwiLCB0aGlzLmRhdGFiYXNlVmVyc2lvbik7XG4gICAgICAgIGRicmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGRlYnVnKFwiRGIub251cGdyYWRlbmVlZGVkXCIpO1xuXG4gICAgICAgICAgICB0aGlzLmRhdGFiYXNlID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcblxuICAgICAgICAgICAgaWYoIXRoaXMuZGF0YWJhc2Uub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhcImxheW91dF9pbWFnZXNcIikpe1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YWJhc2UuY3JlYXRlT2JqZWN0U3RvcmUoXCJsYXlvdXRfaW1hZ2VzXCIsIHtrZXlQYXRoOiBcImlkXCJ9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIXRoaXMuZGF0YWJhc2Uub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhcInNldHRpbmdzXCIpKXtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFiYXNlLmNyZWF0ZU9iamVjdFN0b3JlKFwic2V0dGluZ3NcIiwge2tleVBhdGg6IFwiaWRcIiwgYXV0b0luY3JlbWVudDogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgIHRoaXMubmVlZHNTZXR0aW5ncyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGRicmVxdWVzdC5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGRlYnVnKFwiRGIub25zdWNjZXNzXCIpO1xuICAgICAgICAgICAgdGhpcy5kYXRhYmFzZSA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG5cbiAgICAgICAgICAgIGlmKHRoaXMubmVlZHNTZXR0aW5ncyl7XG4gICAgICAgICAgICAgICAgbGV0IHQgPSB0aGlzLmRhdGFiYXNlLnRyYW5zYWN0aW9uKFtcInNldHRpbmdzXCJdLCBcInJlYWR3cml0ZVwiKVxuICAgICAgICAgICAgICAgICAgICAub2JqZWN0U3RvcmUoXCJzZXR0aW5nc1wiKVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YWJhc2VfdmVyc2lvblwiOiB0aGlzLmRhdGFiYXNlX3ZlcnNpb25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdC5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zeW5jV2l0aFNlcnZlcigpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB0aGlzLnN5bmNXaXRoU2VydmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzeW5jV2l0aFNlcnZlcigpIHtcbiAgICAgICAgZGVidWcoXCJEYi5zeW5jV2l0aFNlcnZlclwiKTtcbiAgICAgICAgdGhpcy5nZXRTZXJ2ZXJWZXJzaW9uKChyZXMpID0+IHtcbiAgICAgICAgICAgIGxldCBvcyA9IHRoaXMuZGF0YWJhc2UudHJhbnNhY3Rpb24oW1wic2V0dGluZ3NcIl0sIFwicmVhZHdyaXRlXCIpXG4gICAgICAgICAgICAgICAgLm9iamVjdFN0b3JlKFwic2V0dGluZ3NcIik7XG4gICAgICAgICAgICBsZXQgcmVxID0gb3MuZ2V0KDEpO1xuICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBkYnYgPSBldmVudC50YXJnZXQucmVzdWx0LmRhdGFiYXNlX3ZlcnNpb24gKyB0aGlzLmRhdGFiYXNlVmVyc2lvbjtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFiYXNlX3ZlcnNpb24gPSBldmVudC50YXJnZXQucmVzdWx0LmRhdGFiYXNlX3ZlcnNpb247XG4gICAgICAgICAgICAgICAgbGV0IHJlc2RiID0gdHlwZW9mKHJlcy5kYXRhYmFzZVZlcnNpb24pICE9IFwidW5kZWZpbmVkXCIgPyBwYXJzZUludChyZXMuZGF0YWJhc2VWZXJzaW9uKSA6IGRidjtcblxuICAgICAgICAgICAgICAgIGlmKGRidiA9PSByZXNkYil7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVsb2FkRnJvbURiKCk7XG4gICAgICAgICAgICAgICAgfWVsc2UgaWYocmVzZGIgPCBkYnYpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRVcGRhdGVzKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVEYXRhYmFzZVZlcnNpb24ocmVzZGIgLSB0aGlzLmRhdGFiYXNlVmVyc2lvbik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0VXBkYXRlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFVwZGF0ZXMoKSB7XG4gICAgICAgIGRlYnVnKFwiRGIuZ2V0VXBkYXRlc1wiKTtcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0Ojg4ODgvcmVzdC9mbG9vcnBsYW5zXCIsXG4gICAgICAgICAgICBtZXRob2Q6IFwiZ2V0XCIsXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGNvdW50ID0gcmVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsZXQgZG9uZSA9IDA7XG4gICAgICAgICAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgICAgICQuZWFjaChyZXMsIGZ1bmN0aW9uKGtleSwgdmFsKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB2YWwubGF5b3V0X2ltYWdlO1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmlkID0gU3RyaW5nKGRhdGEuaWQpO1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmhncmlkX3NwYWNlcyA9IHBhcnNlSW50KGRhdGEuaGdyaWRfc3BhY2VzKTtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS52Z3JpZF9zcGFjZXMgPSBwYXJzZUludChkYXRhLnZncmlkX3NwYWNlcyk7XG4gICAgICAgICAgICAgICAgICAgICQuZWFjaChkYXRhLmdyaWQsIGZ1bmN0aW9uKGtleSwgdmFsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHZhbCA9PT0gXCJcIil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuZ3JpZFtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHZhbCwgZnVuY3Rpb24oX2tleSwgX3ZhbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoX3ZhbCA9PT0gXCJcIil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmdyaWRba2V5XVtfa2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ID0gdGhhdC5kYXRhYmFzZS50cmFuc2FjdGlvbihbXCJsYXlvdXRfaW1hZ2VzXCJdLCBcInJlYWR3cml0ZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9iamVjdFN0b3JlKFwibGF5b3V0X2ltYWdlc1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZSA+PSBjb3VudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5yZWxvYWRGcm9tRGIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdC5vbmVycm9yID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRvbmUgPj0gY291bnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQucmVsb2FkRnJvbURiKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0U2VydmVyVmVyc2lvbihjYikge1xuICAgICAgICBkZWJ1ZyhcIkRiLmdldFNlcnZlclZlcnNpb25cIik7XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICBcInVybFwiOiBcImh0dHA6Ly9sb2NhbGhvc3Q6ODg4OC9yZXN0L2RhdGFiYXNlVmVyc2lvblwiLFxuICAgICAgICAgICAgXCJtZXRob2RcIjogXCJnZXRcIixcbiAgICAgICAgICAgIFwiZGF0YVR5cGVcIjogXCJqc29uXCIsXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgY2IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVsb2FkRnJvbURiKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNlbmRVcGRhdGVzKCkge1xuICAgICAgICBkZWJ1ZyhcIkRiLnNlbmRVcGRhdGVzXCIpO1xuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgICAgIGxldCByZXEgPSB0aGF0LmRhdGFiYXNlLnRyYW5zYWN0aW9uKFtcImxheW91dF9pbWFnZXNcIl0sIFwicmVhZHdyaXRlXCIpXG4gICAgICAgICAgICAub2JqZWN0U3RvcmUoXCJsYXlvdXRfaW1hZ2VzXCIpXG4gICAgICAgICAgICAuZ2V0QWxsKCk7XG4gICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0Ojg4ODgvcmVzdC91cGRhdGVEYXRhYmFzZVwiLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJwb3N0XCIsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YWJhc2VWZXJzaW9uOiB0aGF0LmRhdGFiYXNlVmVyc2lvbiArIHRoYXQuZGF0YWJhc2VfdmVyc2lvbixcbiAgICAgICAgICAgICAgICAgICAgbGF5b3V0X2ltYWdlczogZXZlbnQudGFyZ2V0LnJlc3VsdFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICAgICAgaWYocmVzLnN1Y2Nlc3Mpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5yZWxvYWRGcm9tRGIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHNlbmRPbmVVcGRhdGUobGF5b3V0X2ltYWdlKSB7XG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0Ojg4ODgvcmVzdC91cGRhdGVEYXRhYmFzZVwiLFxuICAgICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBkYXRhYmFzZVZlcnNpb246IHRoYXQuZGF0YWJhc2VWZXJzaW9uICsgdGhhdC5kYXRhYmFzZV92ZXJzaW9uLFxuICAgICAgICAgICAgICAgIGxheW91dF9pbWFnZXM6IFtsYXlvdXRfaW1hZ2VdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICBpZihyZXMuc3VjY2Vzcyl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRMYXlvdXRJbWFnZShkYXRhLCBjYikge1xuICAgICAgICBkZWJ1ZyhcIkRiLmFkZExheW91dEltYWdlXCIpO1xuICAgICAgICBsZXQgdCA9IHRoaXMuZGF0YWJhc2UudHJhbnNhY3Rpb24oW1wibGF5b3V0X2ltYWdlc1wiXSwgXCJyZWFkd3JpdGVcIilcbiAgICAgICAgICAgIC5vYmplY3RTdG9yZShcImxheW91dF9pbWFnZXNcIilcbiAgICAgICAgICAgIC5hZGQoZGF0YSk7XG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgICAgdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICBjYi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIGFsbCBpbWFnZXMgZnJvbSB0aGUgSW5kZXhlZERCIGRhdGFiYXNlIGFuZCBjYWxscyB0aGUgTGF5b3V0TWFuYWdlciByZXNldEZyb21EYiBtZXRob2RcbiAgICAgKiBAcGFyYW0ge051bWJlcnxFdmVudH0gW2lkXVxuICAgICAqL1xuICAgIHJlbG9hZEZyb21EYihpZCkge1xuICAgICAgICBkZWJ1ZyhcIkRiLnJlbG9hZEZyb21EYlwiKTtcbiAgICAgICAgaWYoaXNOYU4oaWQpKXtcbiAgICAgICAgICAgIGlkID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgICAgICQoXCIjYnVpbGRlcl9zZWxlY3RfZXhpc3RpbmdcIikuaHRtbChcIlwiKTtcbiAgICAgICAgbGV0IHJlcSA9IHRoaXMuZGF0YWJhc2UudHJhbnNhY3Rpb24oW1wibGF5b3V0X2ltYWdlc1wiXSwgXCJyZWFkd3JpdGVcIilcbiAgICAgICAgICAgIC5vYmplY3RTdG9yZShcImxheW91dF9pbWFnZXNcIilcbiAgICAgICAgICAgIC5nZXRBbGwoKTtcbiAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgIHRoYXQuY29udGFpbmVyLmxheW91dC5yZXNldEZyb21EYihldmVudCwgaWQpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGlkXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2JcbiAgICAgKi9cbiAgICBsb2FkRmxvb3JwbGFuKGlkLCBjYikge1xuICAgICAgICBkZWJ1ZyhcIkRiLmxvYWRGbG9vcnBsYW5cIik7XG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgICAgaWYodGhpcy5jb250YWluZXIuYW5kcm9pZCl7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmFsbEZwSWRzLmluZGV4T2YoaWQpO1xuICAgICAgICAgICAgaWYoaW5kZXggPiAtMSl7XG4gICAgICAgICAgICAgICAgbGV0IGZwID0gdGhpcy5hbmRyb2lkRnBEYXRhYmFzZVtpbmRleF0ubGF5b3V0X2ltYWdlO1xuICAgICAgICAgICAgICAgIGxldCBldmVudCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IGZwXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBjYi5hcHBseSh0aGF0LCBbZXZlbnRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgbGV0IHQgPSB0aGlzLmRhdGFiYXNlLnRyYW5zYWN0aW9uKFtcImxheW91dF9pbWFnZXNcIl0sIFwicmVhZHdyaXRlXCIpXG4gICAgICAgICAgICAgICAgLm9iamVjdFN0b3JlKFwibGF5b3V0X2ltYWdlc1wiKVxuICAgICAgICAgICAgICAgIC5nZXQoU3RyaW5nKGlkKSk7XG5cbiAgICAgICAgICAgIHQub25zdWNjZXNzID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgY2IuYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBldmVudFxuICAgICAqL1xuICAgIGRlbGV0ZUV4aXN0aW5nKGV2ZW50KSB7XG4gICAgICAgIGRlYnVnKFwiRGIuZGVsZXRlRXhpc3RpbmdcIik7XG4gICAgICAgIGxldCBpZCA9ICQoXCIjYnVpbGRlcl9zZWxlY3RfZXhpc3RpbmdcIikudmFsKCk7XG4gICAgICAgIGxldCB0ID0gdGhpcy5kYXRhYmFzZS50cmFuc2FjdGlvbihbXCJsYXlvdXRfaW1hZ2VzXCJdLCBcInJlYWR3cml0ZVwiKVxuICAgICAgICAgICAgLm9iamVjdFN0b3JlKFwibGF5b3V0X2ltYWdlc1wiKVxuICAgICAgICAgICAgLmRlbGV0ZShpZCk7XG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgICAgdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICB0aGF0LnJlbG9hZEZyb21EYigpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHNhdmVGbG9vcnBsYW4odmFycykge1xuICAgICAgICBkZWJ1ZyhcIkRiLnNhdmVGbG9vcnBsYW5cIik7XG4gICAgICAgIGlmKHR5cGVvZih2YXJzKSAhPSBcIm9iamVjdFwiKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkQXJndW1lbnRFeGNlcHRpb24oXCJzYXZlRmxvb3JwbGFuIHJlcXVpcmVzIGFuIG9iamVjdCBwYXJhbWV0ZXJcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mKHZhcnNbXCJpZFwiXSkgIT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZEFyZ3VtZW50RXhjZXB0aW9uKFwic2F2ZUZsb29ycGxhbiBtaXNzaW5nIGlkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBvcyA9IHRoaXMuZGF0YWJhc2UudHJhbnNhY3Rpb24oW1wibGF5b3V0X2ltYWdlc1wiXSwgXCJyZWFkd3JpdGVcIilcbiAgICAgICAgICAgIC5vYmplY3RTdG9yZShcImxheW91dF9pbWFnZXNcIik7XG4gICAgICAgIGxldCByZXEgPSBvcy5nZXQodmFyc1tcImlkXCJdKTtcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuXG4gICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAkLmVhY2godmFycywgZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCByZXF1cCA9IG9zLnB1dChkYXRhKTtcbiAgICAgICAgICAgIHJlcXVwLm9uc3VjY2VzcyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICBsZXQgb3MgPSB0aGF0LmRhdGFiYXNlLnRyYW5zYWN0aW9uKFtcInNldHRpbmdzXCJdLCBcInJlYWR3cml0ZVwiKVxuICAgICAgICAgICAgICAgICAgICAub2JqZWN0U3RvcmUoXCJzZXR0aW5nc1wiKTtcbiAgICAgICAgICAgICAgICBsZXQgcmVxID0gb3MuZ2V0KDEpO1xuICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzZXR0aW5ncyA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmRhdGFiYXNlX3ZlcnNpb24rKztcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5kYXRhYmFzZV92ZXJzaW9uKys7XG4gICAgICAgICAgICAgICAgICAgIG9zLnB1dChzZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VuZE9uZVVwZGF0ZShkYXRhKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERiOyJdfQ==

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = __webpack_require__(1);

var _jquery2 = _interopRequireDefault(_jquery);

var _Registry = __webpack_require__(0);

var _Registry2 = _interopRequireDefault(_Registry);

var _CustomExceptions = __webpack_require__(2);

var _CustomExceptions2 = _interopRequireDefault(_CustomExceptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = _Registry2.default.console.debug;
var superDebug = _Registry2.default.console.superDebug;

var Grid = function () {
    function Grid(container) {
        _classCallCheck(this, Grid);

        debug("Grid.constructor");
        this.container = container;

        //Grab and save our canvas
        this.canvas = (0, _jquery2.default)("#builder_canvas")[0];
        this.canvas_context = this.canvas.getContext('2d');
        this.overlay = (0, _jquery2.default)("#builder_canvas_overlay")[0];
        this.overlay_context = this.overlay.getContext('2d');

        //Setup image properties
        this.image_width = 0;
        this.image_height = 0;
        this.image = null;
        this.image_name = "";

        this.full_grid = [];
        this.multi_selected_grid = [];
        this.selected_grid = [];
        this.hover_grid = [];
        this.fp_grid = [];
        this.vgrid_spaces = parseInt((0, _jquery2.default)("#builder_vgrid_spaces").val());
        this.hgrid_spaces = parseInt((0, _jquery2.default)("#builder_hgrid_spaces").val());
        this.grid_color = (0, _jquery2.default)("#builder_grid_color").val();

        this.grid_lines_enabled = true;
        this.mouse_down = false;
        this.m_x_start = false;
        this.m_y_start = false;
        this.touch_cx = false;
        this.touch_cy = false;
    }

    _createClass(Grid, [{
        key: 'overlayTouchEnd',
        value: function overlayTouchEnd(event) {
            if (this.touch_cx && this.touch_cy) {
                var xy = this.clickCanvas(this.touch_cx, this.touch_cy);
                if (this.container.android) {
                    Android.setSpace(xy[0], xy[1], this.container.layout.floorplanId);
                }
            }
        }
    }, {
        key: 'overlayTouchMove',
        value: function overlayTouchMove(event) {
            this.touch_cx = false;
            this.touch_cy = false;
        }
    }, {
        key: 'overlayTouchStart',
        value: function overlayTouchStart(event) {
            var c = this.canvas.getContext('2d');
            var rect = this.canvas.getBoundingClientRect();
            var touch = event.touches[0];
            var thex = touch.clientX;
            var they = touch.clientY;
            var cx = thex - rect.left;
            var cy = they - rect.top;
            this.touch_cx = cx;
            this.touch_cy = cy;
        }
    }, {
        key: 'getFullGrid',
        value: function getFullGrid() {
            return this.full_grid;
        }
    }, {
        key: 'getImageName',
        value: function getImageName() {
            return this.image_name;
        }
    }, {
        key: 'getOverlay',
        value: function getOverlay() {
            return this.overlay;
        }
    }, {
        key: 'getMultiSelectedGrid',
        value: function getMultiSelectedGrid() {
            return this.multi_selected_grid;
        }
    }, {
        key: 'getHGridSpaces',
        value: function getHGridSpaces() {
            return this.hgrid_spaces;
        }
    }, {
        key: 'getVGridSpaces',
        value: function getVGridSpaces() {
            return this.vgrid_spaces;
        }
    }, {
        key: 'getGridColor',
        value: function getGridColor() {
            return this.grid_color;
        }
    }, {
        key: 'setGridColor',
        value: function setGridColor(color) {
            debug("Grid.setGridColor");
            this.grid_color = color;
            (0, _jquery2.default)("#builder_grid_color").val(color);
        }
    }, {
        key: 'clearMultiSelection',
        value: function clearMultiSelection(event) {
            debug("Grid.clearMultiSelection");
            this.multi_selected_grid = [];
            this.selected_grid = [];
            this.redraw();
        }
    }, {
        key: 'redraw',
        value: function redraw() {
            debug("Grid.redraw");
            this.drawGrid();
        }
    }, {
        key: 'resetZoom',
        value: function resetZoom() {
            debug("Grid.resetZoom");
            var w = this.canvas.width;
            var h = this.canvas.height;
            var css = {
                "width": parseInt(w) + "px",
                "height": parseInt(h) + "px"
            };
            (0, _jquery2.default)(this.canvas).css(css);
            (0, _jquery2.default)(this.overlay).css(css);
        }
    }, {
        key: 'setGridVars',
        value: function setGridVars(vars) {
            debug("Grid.setGridVars");
            if ((typeof vars === 'undefined' ? 'undefined' : _typeof(vars)) == "object") {
                var that = this;
                _jquery2.default.each(vars, function (key, value) {
                    if (typeof that[key] != "undefined") {
                        that[key] = value;
                    }
                });
                return true;
            }
            throw new _CustomExceptions2.default("setGridVars requires an object parameter");
        }
    }, {
        key: 'setHandVSpace',
        value: function setHandVSpace(hspace, vspace) {
            debug("Grid.setHandVSpace");
            this.hgrid_spaces = hspace;
            this.vgrid_spaces = vspace;
            (0, _jquery2.default)("#builder_hgrid_spaces").val(hspace);
            (0, _jquery2.default)("#builder_vgrid_spaces").val(vspace);
        }
    }, {
        key: 'setHoverGrid',
        value: function setHoverGrid(x, y, data) {
            debug("Grid.setHoverGrid");
            if (!this.hover_grid[x]) {
                this.hover_grid[x] = [];
            }
            this.hover_grid[x][y] = data;
        }
    }, {
        key: 'zoomIn',
        value: function zoomIn(event) {
            debug("Grid.zoomIn");
            var cw = (0, _jquery2.default)(this.canvas).css("width");
            var ch = (0, _jquery2.default)(this.canvas).css("height");
            var css = {
                "width": parseInt(cw) * 1.1 + "px",
                "height": parseInt(ch) * 1.1 + "px"
            };
            (0, _jquery2.default)(this.canvas).css(css);
            (0, _jquery2.default)(this.overlay).css(css);
        }
    }, {
        key: 'zoomOut',
        value: function zoomOut(event) {
            debug("Grid.zoomOut");
            var cw = (0, _jquery2.default)(this.canvas).css("width");
            var ch = (0, _jquery2.default)(this.canvas).css("height");
            var css = {
                "width": parseInt(cw) * .9 + "px",
                "height": parseInt(ch) * .9 + "px"
            };
            (0, _jquery2.default)(this.canvas).css(css);
            (0, _jquery2.default)(this.overlay).css(css);
        }
    }, {
        key: 'overlayClicked',
        value: function overlayClicked(event) {
            debug("Grid.overlayClicked");
            var results = this.getCanvasMouseXandY(event);
            this.clickCanvas(results[0], results[1]);
        }
    }, {
        key: 'overlayMouseDown',
        value: function overlayMouseDown(event) {
            superDebug("Grid.overlayMouseDown");
            this.mouse_down = true;
            var results = this.getCanvasMouseXandY(event);

            this.m_x_start = results[0];
            this.m_y_start = results[1];
            (0, _jquery2.default)(this.canvas).css("opacity", ".7");
            (0, _jquery2.default)(this.overlay).css("opacity", "1");
        }
    }, {
        key: 'overlayMouseUp',
        value: function overlayMouseUp(event) {
            superDebug("Grid.overlayMouseUp");
            this.mouse_down = false;
            (0, _jquery2.default)(this.canvas).css("opacity", "1");
            (0, _jquery2.default)(this.overlay).css("opacity", ".5");
            var results = this.getCanvasMouseXandY(event);
            var start = this.getGridXandY(this.m_x_start, this.m_y_start);
            var end = this.getGridXandY(results[0], results[1]);

            var sx = void 0,
                ex = void 0;
            if (start[0] > end[0]) {
                sx = end[0];
                ex = start[0];
            } else {
                sx = start[0];
                ex = end[0];
            }
            var sy = void 0,
                ey = void 0;
            if (start[1] > end[1]) {
                sy = end[1];
                ey = start[1];
            } else {
                sy = start[1];
                ey = end[1];
            }
            for (var x = sx; x <= ex; x++) {
                for (var y = sy; y <= ey; y++) {
                    if (!this.multi_selected_grid[x]) {
                        this.multi_selected_grid[x] = [];
                    }
                    this.multi_selected_grid[x][y] = "";
                }
            }
        }
    }, {
        key: 'overlayMouseMove',
        value: function overlayMouseMove(event) {
            superDebug("Grid.overlayMouseMove");
            if (this.mouse_down) {
                var results = this.getCanvasMouseXandY(event);
                this.drawBox(this.m_x_start, this.m_y_start, results[0], results[1]);
            }
        }
    }, {
        key: 'drawBox',
        value: function drawBox(sx, sy, ex, ey) {
            debug("Grid.drawBox");
            this.drawGrid();
            var xl = ex - sx,
                yl = ey - sy;
            this.overlay_context.rect(sx, sy, xl, yl);
            this.overlay_context.stroke();
        }
    }, {
        key: 'getCanvasMouseXandY',
        value: function getCanvasMouseXandY(event) {
            debug("Grid.getCanvasMouseXandY");
            var c = this.canvas_context;
            var wi = c.canvas.width;
            var he = c.canvas.height;
            var rect = this.canvas.getBoundingClientRect();
            var thex = event.clientX;
            var they = event.clientY;
            var cx = (thex - rect.left) / (rect.right - rect.left) * wi;
            var cy = (they - rect.top) / (rect.bottom - rect.top) * he;
            return [cx, cy];
        }
    }, {
        key: 'clickCanvas',
        value: function clickCanvas(cx, cy) {
            debug("Grid.clickCanvas");
            var results = this.getGridXandY(cx, cy);
            var x = results[0],
                y = results[1];
            var n = (0, _jquery2.default)("#builder_selected_box_name").val();
            if (this.full_grid[x]) {
                if (this.full_grid[x][y] || this.full_grid[x][y] === "") {
                    n = this.full_grid[x][y];
                }
            }
            this.container.layout.setSelectedGrid(x, y, n);
            this.redraw();
            return [x, y];
        }
    }, {
        key: 'getGridXandY',
        value: function getGridXandY(cx, cy) {
            var c = this.canvas_context;
            var wi = c.canvas.width;
            var he = c.canvas.height;
            var h = this.hgrid_spaces;
            var v = this.vgrid_spaces;
            var xsize = wi / h;
            var x = Math.floor(cx / xsize);
            var ysize = he / v;
            var y = Math.floor(cy / ysize);
            return [x, y];
        }
    }, {
        key: 'drawGrid',
        value: function drawGrid() {
            debug("Grid.drawGrid");

            var c = this.canvas_context;
            c.canvas.width = this.image_width;
            c.canvas.height = this.image_height;
            c.drawImage(this.image, 1, 1, this.image_width, this.image_height);

            var co = this.overlay_context;
            co.canvas.width = this.image_width;
            co.canvas.height = this.image_height;

            var wi = c.canvas.width;
            var he = c.canvas.height;

            var ho = this.hgrid_spaces;
            var vi = this.vgrid_spaces;
            var i = 0;

            var color = this.grid_color;

            var full_grid = this.full_grid;
            var selected_grid = this.selected_grid;
            var hover_grid = this.hover_grid;
            var multi_selected_grid = this.multi_selected_grid;
            var fp_grid = this.fp_grid;

            var android = this.container.android;

            if (this.grid_lines_enabled) {
                for (i = 0; i < vi; i++) {
                    c.moveTo(0, he / vi * i);
                    c.lineTo(wi, he / vi * i);
                    c.strokeStyle = color;
                    c.stroke();
                }
            }

            for (i = 0; i < ho; i++) {
                if (this.grid_lines_enabled) {
                    c.moveTo(wi / ho * i, 0);
                    c.lineTo(wi / ho * i, he);
                    c.strokeStyle = color;
                    c.stroke();
                }

                if (!android && (full_grid[i] || full_grid[i] === "")) {
                    for (var y = 0; y < full_grid[i].length; y++) {
                        if (full_grid[i][y] || full_grid[i][y] === "") {
                            co.fillStyle = "red";
                            co.fillRect(wi / ho * i, he / vi * y, wi / ho, he / vi);
                        }
                    }
                }

                if (android && (fp_grid[i] || fp_grid[i] === "")) {
                    for (var _y = 0; _y < fp_grid[i].length; _y++) {
                        if (fp_grid[i][_y] || fp_grid[i][_y] === "") {
                            co.fillStyle = "red";
                            co.fillRect(wi / ho * i, he / vi * _y, wi / ho, he / vi);
                        }
                    }
                }

                if (selected_grid[i] || selected_grid[i] === "") {
                    for (var _y2 = 0; _y2 < selected_grid[i].length; _y2++) {
                        if (selected_grid[i][_y2] || selected_grid[i][_y2] === "") {
                            c.fillStyle = "green";
                            c.fillRect(wi / ho * i, he / vi * _y2, wi / ho, he / vi);
                        }
                    }
                }

                if (!android && (hover_grid[i] || hover_grid[i] === "")) {
                    for (var _y3 = 0; _y3 < hover_grid[i].length; _y3++) {
                        if (hover_grid[i][_y3] || hover_grid[i][_y3] === "") {
                            co.fillStyle = "gold";
                            co.fillRect(wi / ho * i, he / vi * _y3, wi / ho, he / vi);
                        }
                    }
                }

                if (!android && (multi_selected_grid[i] || multi_selected_grid[i] === "")) {
                    for (var _y4 = 0; _y4 < multi_selected_grid[i].length; _y4++) {
                        if (multi_selected_grid[i][_y4] || multi_selected_grid[i][_y4] === "") {
                            co.fillStyle = "blue";
                            co.fillRect(wi / ho * i, he / vi * _y4, wi / ho, he / vi);
                        }
                    }
                }
            }
        }
    }]);

    return Grid;
}();

exports.default = Grid;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9idWlsZGVyL0dyaWQuZXM2Il0sIm5hbWVzIjpbImRlYnVnIiwiY29uc29sZSIsInN1cGVyRGVidWciLCJHcmlkIiwiY29udGFpbmVyIiwiY2FudmFzIiwiY2FudmFzX2NvbnRleHQiLCJnZXRDb250ZXh0Iiwib3ZlcmxheSIsIm92ZXJsYXlfY29udGV4dCIsImltYWdlX3dpZHRoIiwiaW1hZ2VfaGVpZ2h0IiwiaW1hZ2UiLCJpbWFnZV9uYW1lIiwiZnVsbF9ncmlkIiwibXVsdGlfc2VsZWN0ZWRfZ3JpZCIsInNlbGVjdGVkX2dyaWQiLCJob3Zlcl9ncmlkIiwiZnBfZ3JpZCIsInZncmlkX3NwYWNlcyIsInBhcnNlSW50IiwidmFsIiwiaGdyaWRfc3BhY2VzIiwiZ3JpZF9jb2xvciIsImdyaWRfbGluZXNfZW5hYmxlZCIsIm1vdXNlX2Rvd24iLCJtX3hfc3RhcnQiLCJtX3lfc3RhcnQiLCJ0b3VjaF9jeCIsInRvdWNoX2N5IiwiZXZlbnQiLCJ4eSIsImNsaWNrQ2FudmFzIiwiYW5kcm9pZCIsIkFuZHJvaWQiLCJzZXRTcGFjZSIsImxheW91dCIsImZsb29ycGxhbklkIiwiYyIsInJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJ0b3VjaCIsInRvdWNoZXMiLCJ0aGV4IiwiY2xpZW50WCIsInRoZXkiLCJjbGllbnRZIiwiY3giLCJsZWZ0IiwiY3kiLCJ0b3AiLCJjb2xvciIsInJlZHJhdyIsImRyYXdHcmlkIiwidyIsIndpZHRoIiwiaCIsImhlaWdodCIsImNzcyIsInZhcnMiLCJ0aGF0IiwiZWFjaCIsImtleSIsInZhbHVlIiwiaHNwYWNlIiwidnNwYWNlIiwieCIsInkiLCJkYXRhIiwiY3ciLCJjaCIsInJlc3VsdHMiLCJnZXRDYW52YXNNb3VzZVhhbmRZIiwic3RhcnQiLCJnZXRHcmlkWGFuZFkiLCJlbmQiLCJzeCIsImV4Iiwic3kiLCJleSIsImRyYXdCb3giLCJ4bCIsInlsIiwic3Ryb2tlIiwid2kiLCJoZSIsInJpZ2h0IiwiYm90dG9tIiwibiIsInNldFNlbGVjdGVkR3JpZCIsInYiLCJ4c2l6ZSIsIk1hdGgiLCJmbG9vciIsInlzaXplIiwiZHJhd0ltYWdlIiwiY28iLCJobyIsInZpIiwiaSIsIm1vdmVUbyIsImxpbmVUbyIsInN0cm9rZVN0eWxlIiwibGVuZ3RoIiwiZmlsbFN0eWxlIiwiZmlsbFJlY3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBSUEsUUFBUSxtQkFBU0MsT0FBVCxDQUFpQkQsS0FBN0I7QUFDQSxJQUFJRSxhQUFhLG1CQUFTRCxPQUFULENBQWlCQyxVQUFsQzs7SUFFTUMsSTtBQUVGLGtCQUFZQyxTQUFaLEVBQXNCO0FBQUE7O0FBQ2xCSixjQUFNLGtCQUFOO0FBQ0EsYUFBS0ksU0FBTCxHQUFpQkEsU0FBakI7O0FBR0E7QUFDQSxhQUFLQyxNQUFMLEdBQWMsc0JBQUUsaUJBQUYsRUFBcUIsQ0FBckIsQ0FBZDtBQUNBLGFBQUtDLGNBQUwsR0FBc0IsS0FBS0QsTUFBTCxDQUFZRSxVQUFaLENBQXVCLElBQXZCLENBQXRCO0FBQ0EsYUFBS0MsT0FBTCxHQUFlLHNCQUFFLHlCQUFGLEVBQTZCLENBQTdCLENBQWY7QUFDQSxhQUFLQyxlQUFMLEdBQXVCLEtBQUtELE9BQUwsQ0FBYUQsVUFBYixDQUF3QixJQUF4QixDQUF2Qjs7QUFFQTtBQUNBLGFBQUtHLFdBQUwsR0FBbUIsQ0FBbkI7QUFDQSxhQUFLQyxZQUFMLEdBQW9CLENBQXBCO0FBQ0EsYUFBS0MsS0FBTCxHQUFhLElBQWI7QUFDQSxhQUFLQyxVQUFMLEdBQWtCLEVBQWxCOztBQUVBLGFBQUtDLFNBQUwsR0FBaUIsRUFBakI7QUFDQSxhQUFLQyxtQkFBTCxHQUEyQixFQUEzQjtBQUNBLGFBQUtDLGFBQUwsR0FBcUIsRUFBckI7QUFDQSxhQUFLQyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsYUFBS0MsT0FBTCxHQUFlLEVBQWY7QUFDQSxhQUFLQyxZQUFMLEdBQW9CQyxTQUFTLHNCQUFFLHVCQUFGLEVB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QUNLckIsS0FBS2EsRUFBTixHQUFZRSxDQURoQixFQUVLZCxLQUFLYSxFQUFOLEdBQVkvQixHQUZoQixFQUdLaUIsS0FBS2EsRUFIVixFQUlLWixLQUFLYSxFQUpWO0FBTUg7QUFDSjtBQUNKOztBQUVELG9CQUFHLENBQUNqRSxPQUFELEtBQWFsQixvQkFBb0JvRixDQUFwQixLQUEwQnBGLG9CQUFvQm9GLENBQXBCLE1BQTJCLEVBQWxFLENBQUgsRUFBeUU7QUFDckUseUJBQUksSUFBSWhDLE1BQUksQ0FBWixFQUFlQSxNQUFJcEQsb0JBQW9Cb0YsQ0FBcEIsRUFBdUJJLE1BQTFDLEVBQWtEcEMsS0FBbEQsRUFBc0Q7QUFDbEQsNEJBQUdwRCxvQkFBb0JvRixDQUFwQixFQUF1QmhDLEdBQXZCLEtBQTZCcEQsb0JBQW9Cb0YsQ0FBcEIsRUFBdUJoQyxHQUF2QixNQUE4QixFQUE5RCxFQUFpRTtBQUM3RDZCLCtCQUFHUSxTQUFILEdBQWUsTUFBZjtBQUNBUiwrQkFBR1MsUUFBSCxDQUNLckIsS0FBS2EsRUFBTixHQUFZRSxDQURoQixFQUVLZCxLQUFLYSxFQUFOLEdBQVkvQixHQUZoQixFQUdLaUIsS0FBS2EsRUFIVixFQUlLWixLQUFLYSxFQUpWO0FBTUg7QUFDSjtBQUNKO0FBQ0o7QUFDSjs7Ozs7O2tCQUdVL0YsSSIsImZpbGUiOiJHcmlkLmVzNiIsInNvdXJjZVJvb3QiOiIvVXNlcnMvcmljaHdhbmRlbGwvUGhwc3Rvcm1Qcm9qZWN0cy9ncmlkLWJ1aWxkZXIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJCBmcm9tICdqcXVlcnknO1xuaW1wb3J0IFJlZ2lzdHJ5IGZyb20gJy4vUmVnaXN0cnknO1xuaW1wb3J0IEludmFsaWRBcmd1bWVudEV4Y2VwdGlvbiBmcm9tICcuL0N1c3RvbUV4Y2VwdGlvbnMnO1xuXG5sZXQgZGVidWcgPSBSZWdpc3RyeS5jb25zb2xlLmRlYnVnO1xubGV0IHN1cGVyRGVidWcgPSBSZWdpc3RyeS5jb25zb2xlLnN1cGVyRGVidWc7XG5cbmNsYXNzIEdyaWR7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb250YWluZXIpe1xuICAgICAgICBkZWJ1ZyhcIkdyaWQuY29uc3RydWN0b3JcIik7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuXG5cbiAgICAgICAgLy9HcmFiIGFuZCBzYXZlIG91ciBjYW52YXNcbiAgICAgICAgdGhpcy5jYW52YXMgPSAkKFwiI2J1aWxkZXJfY2FudmFzXCIpWzBdO1xuICAgICAgICB0aGlzLmNhbnZhc19jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5vdmVybGF5ID0gJChcIiNidWlsZGVyX2NhbnZhc19vdmVybGF5XCIpWzBdO1xuICAgICAgICB0aGlzLm92ZXJsYXlfY29udGV4dCA9IHRoaXMub3ZlcmxheS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIC8vU2V0dXAgaW1hZ2UgcHJvcGVydGllc1xuICAgICAgICB0aGlzLmltYWdlX3dpZHRoID0gMDtcbiAgICAgICAgdGhpcy5pbWFnZV9oZWlnaHQgPSAwO1xuICAgICAgICB0aGlzLmltYWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5pbWFnZV9uYW1lID0gXCJcIjtcblxuICAgICAgICB0aGlzLmZ1bGxfZ3JpZCA9IFtdO1xuICAgICAgICB0aGlzLm11bHRpX3NlbGVjdGVkX2dyaWQgPSBbXTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZF9ncmlkID0gW107XG4gICAgICAgIHRoaXMuaG92ZXJfZ3JpZCA9IFtdO1xuICAgICAgICB0aGlzLmZwX2dyaWQgPSBbXTtcbiAgICAgICAgdGhpcy52Z3JpZF9zcGFjZXMgPSBwYXJzZUludCgkKFwiI2J1aWxkZXJfdmdyaWRfc3BhY2VzXCIpLnZhbCgpKTtcbiAgICAgICAgdGhpcy5oZ3JpZF9zcGFjZXMgPSBwYXJzZUludCgkKFwiI2J1aWxkZXJfaGdyaWRfc3BhY2VzXCIpLnZhbCgpKTtcbiAgICAgICAgdGhpcy5ncmlkX2NvbG9yID0gJChcIiNidWlsZGVyX2dyaWRfY29sb3JcIikudmFsKCk7XG5cbiAgICAgICAgdGhpcy5ncmlkX2xpbmVzX2VuYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLm1vdXNlX2Rvd24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5tX3hfc3RhcnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5tX3lfc3RhcnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50b3VjaF9jeCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRvdWNoX2N5ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgb3ZlcmxheVRvdWNoRW5kKGV2ZW50KSB7XG4gICAgICAgIGlmKHRoaXMudG91Y2hfY3ggJiYgdGhpcy50b3VjaF9jeSkge1xuICAgICAgICAgICAgbGV0IHh5ID0gdGhpcy5jbGlja0NhbnZhcyh0aGlzLnRvdWNoX2N4LCB0aGlzLnRvdWNoX2N5KTtcbiAgICAgICAgICAgIGlmKHRoaXMuY29udGFpbmVyLmFuZHJvaWQpe1xuICAgICAgICAgICAgICAgIEFuZHJvaWQuc2V0U3BhY2UoeHlbMF0sIHh5WzFdLCB0aGlzLmNvbnRhaW5lci5sYXlvdXQuZmxvb3JwbGFuSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb3ZlcmxheVRvdWNoTW92ZShldmVudCkge1xuICAgICAgICB0aGlzLnRvdWNoX2N4ID0gZmFsc2U7XG4gICAgICAgIHRoaXMudG91Y2hfY3kgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBvdmVybGF5VG91Y2hTdGFydChldmVudCkge1xuICAgICAgICBsZXQgYyA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCB0b3VjaCA9IGV2ZW50LnRvdWNoZXNbMF07XG4gICAgICAgIGxldCB0aGV4ID0gdG91Y2guY2xpZW50WDtcbiAgICAgICAgbGV0IHRoZXkgPSB0b3VjaC5jbGllbnRZO1xuICAgICAgICBsZXQgY3ggPSAodGhleCAtIHJlY3QubGVmdCk7XG4gICAgICAgIGxldCBjeSA9ICh0aGV5IC0gcmVjdC50b3ApO1xuICAgICAgICB0aGlzLnRvdWNoX2N4ID0gY3g7XG4gICAgICAgIHRoaXMudG91Y2hfY3kgPSBjeTtcbiAgICB9XG5cbiAgICBnZXRGdWxsR3JpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZnVsbF9ncmlkO1xuICAgIH1cblxuICAgIGdldEltYWdlTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW1hZ2VfbmFtZTtcbiAgICB9XG5cbiAgICBnZXRPdmVybGF5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vdmVybGF5O1xuICAgIH1cblxuICAgIGdldE11bHRpU2VsZWN0ZWRHcmlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tdWx0aV9zZWxlY3RlZF9ncmlkO1xuICAgIH1cblxuICAgIGdldEhHcmlkU3BhY2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZ3JpZF9zcGFjZXM7XG4gICAgfVxuXG4gICAgZ2V0VkdyaWRTcGFjZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZncmlkX3NwYWNlcztcbiAgICB9XG5cbiAgICBnZXRHcmlkQ29sb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdyaWRfY29sb3I7XG4gICAgfVxuXG4gICAgc2V0R3JpZENvbG9yKGNvbG9yKSB7XG4gICAgICAgIGRlYnVnKFwiR3JpZC5zZXRHcmlkQ29sb3JcIik7XG4gICAgICAgIHRoaXMuZ3JpZF9jb2xvciA9IGNvbG9yO1xuICAgICAgICAkKFwiI2J1aWxkZXJfZ3JpZF9jb2xvclwiKS52YWwoY29sb3IpO1xuICAgIH1cblxuICAgIGNsZWFyTXVsdGlTZWxlY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZGVidWcoXCJHcmlkLmNsZWFyTXVsdGlTZWxlY3Rpb25cIik7XG4gICAgICAgIHRoaXMubXVsdGlfc2VsZWN0ZWRfZ3JpZCA9IFtdO1xuICAgICAgICB0aGlzLnNlbGVjdGVkX2dyaWQgPSBbXTtcbiAgICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9XG5cbiAgICByZWRyYXcoKSB7XG4gICAgICAgIGRlYnVnKFwiR3JpZC5yZWRyYXdcIik7XG4gICAgICAgIHRoaXMuZHJhd0dyaWQoKTtcbiAgICB9XG5cbiAgICByZXNldFpvb20oKSB7XG4gICAgICAgIGRlYnVnKFwiR3JpZC5yZXNldFpvb21cIik7XG4gICAgICAgIGxldCB3ID0gdGhpcy5jYW52YXMud2lkdGg7XG4gICAgICAgIGxldCBoID0gdGhpcy5jYW52YXMuaGVpZ2h0O1xuICAgICAgICBsZXQgY3NzID0ge1xuICAgICAgICAgICAgXCJ3aWR0aFwiOiBwYXJzZUludCh3KSAgKyBcInB4XCIsXG4gICAgICAgICAgICBcImhlaWdodFwiOiBwYXJzZUludChoKSArIFwicHhcIlxuICAgICAgICB9O1xuICAgICAgICAkKHRoaXMuY2FudmFzKS5jc3MoY3NzKTtcbiAgICAgICAgJCh0aGlzLm92ZXJsYXkpLmNzcyhjc3MpO1xuICAgIH1cblxuICAgIHNldEdyaWRWYXJzKHZhcnMpIHtcbiAgICAgICAgZGVidWcoXCJHcmlkLnNldEdyaWRWYXJzXCIpO1xuICAgICAgICBpZih0eXBlb2YodmFycykgPT0gXCJvYmplY3RcIil7XG4gICAgICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkLmVhY2godmFycywgZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mKHRoYXRba2V5XSkgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICAgICAgICAgIHRoYXRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEludmFsaWRBcmd1bWVudEV4Y2VwdGlvbihcInNldEdyaWRWYXJzIHJlcXVpcmVzIGFuIG9iamVjdCBwYXJhbWV0ZXJcIik7XG4gICAgfVxuXG4gICAgc2V0SGFuZFZTcGFjZShoc3BhY2UsIHZzcGFjZSkge1xuICAgICAgICBkZWJ1ZyhcIkdyaWQuc2V0SGFuZFZTcGFjZVwiKTtcbiAgICAgICAgdGhpcy5oZ3JpZF9zcGFjZXMgPSBoc3BhY2U7XG4gICAgICAgIHRoaXMudmdyaWRfc3BhY2VzID0gdnNwYWNlO1xuICAgICAgICAkKFwiI2J1aWxkZXJfaGdyaWRfc3BhY2VzXCIpLnZhbChoc3BhY2UpO1xuICAgICAgICAkKFwiI2J1aWxkZXJfdmdyaWRfc3BhY2VzXCIpLnZhbCh2c3BhY2UpO1xuICAgIH1cblxuICAgIHNldEhvdmVyR3JpZCh4LCB5LCBkYXRhKSB7XG4gICAgICAgIGRlYnVnKFwiR3JpZC5zZXRIb3ZlckdyaWRcIik7XG4gICAgICAgIGlmKCF0aGlzLmhvdmVyX2dyaWRbeF0pIHtcbiAgICAgICAgICAgIHRoaXMuaG92ZXJfZ3JpZFt4XSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaG92ZXJfZ3JpZFt4XVt5XSA9IGRhdGE7XG4gICAgfVxuXG4gICAgem9vbUluKGV2ZW50KSB7XG4gICAgICAgIGRlYnVnKFwiR3JpZC56b29tSW5cIik7XG4gICAgICAgIGxldCBjdyA9ICQodGhpcy5jYW52YXMpLmNzcyhcIndpZHRoXCIpO1xuICAgICAgICBsZXQgY2ggPSAkKHRoaXMuY2FudmFzKS5jc3MoXCJoZWlnaHRcIik7XG4gICAgICAgIGxldCBjc3MgPSB7XG4gICAgICAgICAgICBcIndpZHRoXCI6IHBhcnNlSW50KGN3KSAqIDEuMSArIFwicHhcIixcbiAgICAgICAgICAgIFwiaGVpZ2h0XCI6IHBhcnNlSW50KGNoKSAqIDEuMSArIFwicHhcIlxuICAgICAgICB9O1xuICAgICAgICAkKHRoaXMuY2FudmFzKS5jc3MoY3NzKTtcbiAgICAgICAgJCh0aGlzLm92ZXJsYXkpLmNzcyhjc3MpO1xuICAgIH1cblxuICAgIHpvb21PdXQoZXZlbnQpIHtcbiAgICAgICAgZGVidWcoXCJHcmlkLnpvb21PdXRcIik7XG4gICAgICAgIGxldCBjdyA9ICQodGhpcy5jYW52YXMpLmNzcyhcIndpZHRoXCIpO1xuICAgICAgICBsZXQgY2ggPSAkKHRoaXMuY2FudmFzKS5jc3MoXCJoZWlnaHRcIik7XG4gICAgICAgIGxldCBjc3MgPSB7XG4gICAgICAgICAgICBcIndpZHRoXCI6IHBhcnNlSW50KGN3KSAqIC45ICsgXCJweFwiLFxuICAgICAgICAgICAgXCJoZWlnaHRcIjogcGFyc2VJbnQoY2gpICogLjkgKyBcInB4XCJcbiAgICAgICAgfTtcbiAgICAgICAgJCh0aGlzLmNhbnZhcykuY3NzKGNzcyk7XG4gICAgICAgICQodGhpcy5vdmVybGF5KS5jc3MoY3NzKTtcbiAgICB9XG5cbiAgICBvdmVybGF5Q2xpY2tlZChldmVudCkge1xuICAgICAgICBkZWJ1ZyhcIkdyaWQub3ZlcmxheUNsaWNrZWRcIik7XG4gICAgICAgIGxldCByZXN1bHRzID0gdGhpcy5nZXRDYW52YXNNb3VzZVhhbmRZKGV2ZW50KTtcbiAgICAgICAgdGhpcy5jbGlja0NhbnZhcyhyZXN1bHRzWzBdLCByZXN1bHRzWzFdKTtcbiAgICB9XG5cbiAgICBvdmVybGF5TW91c2VEb3duKGV2ZW50KSB7XG4gICAgICAgIHN1cGVyRGVidWcoXCJHcmlkLm92ZXJsYXlNb3VzZURvd25cIik7XG4gICAgICAgIHRoaXMubW91c2VfZG93biA9IHRydWU7XG4gICAgICAgIGxldCByZXN1bHRzID0gdGhpcy5nZXRDYW52YXNNb3VzZVhhbmRZKGV2ZW50KTtcblxuICAgICAgICB0aGlzLm1feF9zdGFydCA9IHJlc3VsdHNbMF07XG4gICAgICAgIHRoaXMubV95X3N0YXJ0ID0gcmVzdWx0c1sxXTtcbiAgICAgICAgJCh0aGlzLmNhbnZhcykuY3NzKFwib3BhY2l0eVwiLCBcIi43XCIpO1xuICAgICAgICAkKHRoaXMub3ZlcmxheSkuY3NzKFwib3BhY2l0eVwiLCBcIjFcIik7XG4gICAgfVxuXG4gICAgb3ZlcmxheU1vdXNlVXAoZXZlbnQpIHtcbiAgICAgICAgc3VwZXJEZWJ1ZyhcIkdyaWQub3ZlcmxheU1vdXNlVXBcIik7XG4gICAgICAgIHRoaXMubW91c2VfZG93biA9IGZhbHNlO1xuICAgICAgICAkKHRoaXMuY2FudmFzKS5jc3MoXCJvcGFjaXR5XCIsIFwiMVwiKTtcbiAgICAgICAgJCh0aGlzLm92ZXJsYXkpLmNzcyhcIm9wYWNpdHlcIiwgXCIuNVwiKTtcbiAgICAgICAgbGV0IHJlc3VsdHMgPSB0aGlzLmdldENhbnZhc01vdXNlWGFuZFkoZXZlbnQpO1xuICAgICAgICBsZXQgc3RhcnQgPSB0aGlzLmdldEdyaWRYYW5kWSh0aGlzLm1feF9zdGFydCwgdGhpcy5tX3lfc3RhcnQpO1xuICAgICAgICBsZXQgZW5kID0gdGhpcy5nZXRHcmlkWGFuZFkocmVzdWx0c1swXSwgcmVzdWx0c1sxXSk7XG5cbiAgICAgICAgbGV0IHN4LCBleDtcbiAgICAgICAgaWYoc3RhcnRbMF0gPiBlbmRbMF0pIHtcbiAgICAgICAgICAgIHN4ID0gZW5kWzBdO1xuICAgICAgICAgICAgZXggPSBzdGFydFswXTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBzeCA9IHN0YXJ0WzBdO1xuICAgICAgICAgICAgZXggPSBlbmRbMF07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHN5LCBleTtcbiAgICAgICAgaWYoc3RhcnRbMV0gPiBlbmRbMV0pe1xuICAgICAgICAgICAgc3kgPSBlbmRbMV07XG4gICAgICAgICAgICBleSA9IHN0YXJ0WzFdO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHN5ID0gc3RhcnRbMV07XG4gICAgICAgICAgICBleSA9IGVuZFsxXTtcbiAgICAgICAgfVxuICAgICAgICBmb3IobGV0IHggPSBzeDsgeCA8PSBleDsgeCsrKXtcbiAgICAgICAgICAgIGZvcihsZXQgeSA9IHN5OyB5IDw9IGV5OyB5Kyspe1xuICAgICAgICAgICAgICAgIGlmKCF0aGlzLm11bHRpX3NlbGVjdGVkX2dyaWRbeF0pe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm11bHRpX3NlbGVjdGVkX2dyaWRbeF0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5tdWx0aV9zZWxlY3RlZF9ncmlkW3hdW3ldID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG92ZXJsYXlNb3VzZU1vdmUoZXZlbnQpIHtcbiAgICAgICAgc3VwZXJEZWJ1ZyhcIkdyaWQub3ZlcmxheU1vdXNlTW92ZVwiKTtcbiAgICAgICAgaWYodGhpcy5tb3VzZV9kb3duKXtcbiAgICAgICAgICAgIGxldCByZXN1bHRzID0gdGhpcy5nZXRDYW52YXNNb3VzZVhhbmRZKGV2ZW50KTtcbiAgICAgICAgICAgIHRoaXMuZHJhd0JveCh0aGlzLm1feF9zdGFydCwgdGhpcy5tX3lfc3RhcnQsIHJlc3VsdHNbMF0sIHJlc3VsdHNbMV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhd0JveChzeCwgc3ksIGV4LCBleSkge1xuICAgICAgICBkZWJ1ZyhcIkdyaWQuZHJhd0JveFwiKTtcbiAgICAgICAgdGhpcy5kcmF3R3JpZCgpO1xuICAgICAgICBsZXQgeGwgPSBleCAtIHN4LCB5bCA9IGV5IC0gc3k7XG4gICAgICAgIHRoaXMub3ZlcmxheV9jb250ZXh0LnJlY3Qoc3gsIHN5LCB4bCwgeWwpO1xuICAgICAgICB0aGlzLm92ZXJsYXlfY29udGV4dC5zdHJva2UoKTtcbiAgICB9XG5cbiAgICBnZXRDYW52YXNNb3VzZVhhbmRZKGV2ZW50KSB7XG4gICAgICAgIGRlYnVnKFwiR3JpZC5nZXRDYW52YXNNb3VzZVhhbmRZXCIpO1xuICAgICAgICBsZXQgYyA9IHRoaXMuY2FudmFzX2NvbnRleHQ7XG4gICAgICAgIGxldCB3aSA9IGMuY2FudmFzLndpZHRoO1xuICAgICAgICBsZXQgaGUgPSBjLmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCB0aGV4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgbGV0IHRoZXkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICBsZXQgY3ggPSAodGhleCAtIHJlY3QubGVmdCkgLyAocmVjdC5yaWdodC1yZWN0LmxlZnQpICogd2k7XG4gICAgICAgIGxldCBjeSA9ICh0aGV5IC0gcmVjdC50b3ApIC8gKHJlY3QuYm90dG9tLXJlY3QudG9wKSAqIGhlO1xuICAgICAgICByZXR1cm4gW2N4LCBjeV07XG4gICAgfVxuXG4gICAgY2xpY2tDYW52YXMoY3gsIGN5KSB7XG4gICAgICAgIGRlYnVnKFwiR3JpZC5jbGlja0NhbnZhc1wiKTtcbiAgICAgICAgbGV0IHJlc3VsdHMgPSB0aGlzLmdldEdyaWRYYW5kWShjeCwgY3kpO1xuICAgICAgICBsZXQgeCA9IHJlc3VsdHNbMF0sIHkgPSByZXN1bHRzWzFdO1xuICAgICAgICBsZXQgbiA9ICQoXCIjYnVpbGRlcl9zZWxlY3RlZF9ib3hfbmFtZVwiKS52YWwoKTtcbiAgICAgICAgaWYodGhpcy5mdWxsX2dyaWRbeF0pe1xuICAgICAgICAgICAgaWYodGhpcy5mdWxsX2dyaWRbeF1beV0gfHwgdGhpcy5mdWxsX2dyaWRbeF1beV0gPT09IFwiXCIpe1xuICAgICAgICAgICAgICAgIG4gPSB0aGlzLmZ1bGxfZ3JpZFt4XVt5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRhaW5lci5sYXlvdXQuc2V0U2VsZWN0ZWRHcmlkKHgsIHksIG4pO1xuICAgICAgICB0aGlzLnJlZHJhdygpO1xuICAgICAgICByZXR1cm4gW3gsIHldO1xuICAgIH1cblxuICAgIGdldEdyaWRYYW5kWShjeCwgY3kpIHtcbiAgICAgICAgbGV0IGMgPSB0aGlzLmNhbnZhc19jb250ZXh0O1xuICAgICAgICBsZXQgd2kgPSBjLmNhbnZhcy53aWR0aDtcbiAgICAgICAgbGV0IGhlID0gYy5jYW52YXMuaGVpZ2h0O1xuICAgICAgICBsZXQgaCA9IHRoaXMuaGdyaWRfc3BhY2VzO1xuICAgICAgICBsZXQgdiA9IHRoaXMudmdyaWRfc3BhY2VzO1xuICAgICAgICBsZXQgeHNpemUgPSB3aSAvIGg7XG4gICAgICAgIGxldCB4ID0gTWF0aC5mbG9vcihjeCAvIHhzaXplKTtcbiAgICAgICAgbGV0IHlzaXplID0gaGUgLyB2O1xuICAgICAgICBsZXQgeSA9IE1hdGguZmxvb3IoY3kgLyB5c2l6ZSk7XG4gICAgICAgIHJldHVybiBbeCwgeV07XG4gICAgfVxuXG4gICAgZHJhd0dyaWQoKSB7XG4gICAgICAgIGRlYnVnKFwiR3JpZC5kcmF3R3JpZFwiKTtcblxuICAgICAgICBsZXQgYyA9IHRoaXMuY2FudmFzX2NvbnRleHQ7XG4gICAgICAgIGMuY2FudmFzLndpZHRoID0gdGhpcy5pbWFnZV93aWR0aDtcbiAgICAgICAgYy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWFnZV9oZWlnaHQ7XG4gICAgICAgIGMuZHJhd0ltYWdlKHRoaXMuaW1hZ2UsIDEsIDEsIHRoaXMuaW1hZ2Vfd2lkdGgsIHRoaXMuaW1hZ2VfaGVpZ2h0KTtcblxuICAgICAgICBsZXQgY28gPSB0aGlzLm92ZXJsYXlfY29udGV4dDtcbiAgICAgICAgY28uY2FudmFzLndpZHRoID0gdGhpcy5pbWFnZV93aWR0aDtcbiAgICAgICAgY28uY2FudmFzLmhlaWdodCA9IHRoaXMuaW1hZ2VfaGVpZ2h0O1xuXG4gICAgICAgIGxldCB3aSA9IGMuY2FudmFzLndpZHRoO1xuICAgICAgICBsZXQgaGUgPSBjLmNhbnZhcy5oZWlnaHQ7XG5cbiAgICAgICAgbGV0IGhvID0gdGhpcy5oZ3JpZF9zcGFjZXM7XG4gICAgICAgIGxldCB2aSA9IHRoaXMudmdyaWRfc3BhY2VzO1xuICAgICAgICBsZXQgaSA9IDA7XG5cbiAgICAgICAgbGV0IGNvbG9yID0gdGhpcy5ncmlkX2NvbG9yO1xuXG4gICAgICAgIGxldCBmdWxsX2dyaWQgPSB0aGlzLmZ1bGxfZ3JpZDtcbiAgICAgICAgbGV0IHNlbGVjdGVkX2dyaWQgPSB0aGlzLnNlbGVjdGVkX2dyaWQ7XG4gICAgICAgIGxldCBob3Zlcl9ncmlkID0gdGhpcy5ob3Zlcl9ncmlkO1xuICAgICAgICBsZXQgbXVsdGlfc2VsZWN0ZWRfZ3JpZCA9IHRoaXMubXVsdGlfc2VsZWN0ZWRfZ3JpZDtcbiAgICAgICAgbGV0IGZwX2dyaWQgPSB0aGlzLmZwX2dyaWQ7XG5cbiAgICAgICAgbGV0IGFuZHJvaWQgPSB0aGlzLmNvbnRhaW5lci5hbmRyb2lkO1xuXG4gICAgICAgIGlmICh0aGlzLmdyaWRfbGluZXNfZW5hYmxlZCl7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdmk7IGkrKykge1xuICAgICAgICAgICAgICAgIGMubW92ZVRvKDAsIChoZSAvIHZpKSAqIGkpO1xuICAgICAgICAgICAgICAgIGMubGluZVRvKHdpLCAoaGUgLyB2aSkgKiBpKTtcbiAgICAgICAgICAgICAgICBjLnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICAgICAgICAgICAgYy5zdHJva2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpID0gMDsgaSA8IGhvOyBpKyspe1xuICAgICAgICAgICAgaWYodGhpcy5ncmlkX2xpbmVzX2VuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBjLm1vdmVUbygod2kgLyBobykgKiBpLCAwKTtcbiAgICAgICAgICAgICAgICBjLmxpbmVUbygod2kgLyBobykgKiBpLCBoZSk7XG4gICAgICAgICAgICAgICAgYy5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgICAgICAgICAgICAgIGMuc3Ryb2tlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCFhbmRyb2lkICYmIChmdWxsX2dyaWRbaV0gfHwgZnVsbF9ncmlkW2ldID09PSBcIlwiKSl7XG4gICAgICAgICAgICAgICAgZm9yKGxldCB5ID0gMDsgeSA8IGZ1bGxfZ3JpZFtpXS5sZW5ndGg7IHkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGZ1bGxfZ3JpZFtpXVt5XSB8fCBmdWxsX2dyaWRbaV1beV0gPT09IFwiXCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY28uZmlsbFN0eWxlID0gXCJyZWRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvLmZpbGxSZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh3aSAvIGhvKSAqIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGhlIC8gdmkpICogeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAod2kgLyBobyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGhlIC8gdmkpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihhbmRyb2lkICYmIChmcF9ncmlkW2ldIHx8IGZwX2dyaWRbaV0gPT09IFwiXCIpKXtcbiAgICAgICAgICAgICAgICBmb3IobGV0IHkgPSAwOyB5IDwgZnBfZ3JpZFtpXS5sZW5ndGg7IHkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGZwX2dyaWRbaV1beV0gfHwgZnBfZ3JpZFtpXVt5XSA9PT0gXCJcIil7XG4gICAgICAgICAgICAgICAgICAgICAgICBjby5maWxsU3R5bGUgPSBcInJlZFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgY28uZmlsbFJlY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHdpIC8gaG8pICogaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaGUgLyB2aSkgKiB5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh3aSAvIGhvKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaGUgLyB2aSlcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHNlbGVjdGVkX2dyaWRbaV0gfHwgc2VsZWN0ZWRfZ3JpZFtpXSA9PT0gXCJcIil7XG4gICAgICAgICAgICAgICAgZm9yKGxldCB5ID0gMDsgeSA8IHNlbGVjdGVkX2dyaWRbaV0ubGVuZ3RoOyB5Kyspe1xuICAgICAgICAgICAgICAgICAgICBpZihzZWxlY3RlZF9ncmlkW2ldW3ldIHx8IHNlbGVjdGVkX2dyaWRbaV1beV0gPT09IFwiXCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgYy5maWxsU3R5bGUgPSBcImdyZWVuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBjLmZpbGxSZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh3aSAvIGhvKSAqIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGhlIC8gdmkpICogeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAod2kgLyBobyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGhlIC8gdmkpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZighYW5kcm9pZCAmJiAoaG92ZXJfZ3JpZFtpXSB8fCBob3Zlcl9ncmlkW2ldID09PSBcIlwiKSl7XG4gICAgICAgICAgICAgICAgZm9yKGxldCB5ID0gMDsgeSA8IGhvdmVyX2dyaWRbaV0ubGVuZ3RoOyB5Kyspe1xuICAgICAgICAgICAgICAgICAgICBpZihob3Zlcl9ncmlkW2ldW3ldIHx8IGhvdmVyX2dyaWRbaV1beV0gPT09IFwiXCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY28uZmlsbFN0eWxlID0gXCJnb2xkXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBjby5maWxsUmVjdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAod2kgLyBobykgKiBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChoZSAvIHZpKSAqIHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHdpIC8gaG8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChoZSAvIHZpKVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIWFuZHJvaWQgJiYgKG11bHRpX3NlbGVjdGVkX2dyaWRbaV0gfHwgbXVsdGlfc2VsZWN0ZWRfZ3JpZFtpXSA9PT0gXCJcIikpe1xuICAgICAgICAgICAgICAgIGZvcihsZXQgeSA9IDA7IHkgPCBtdWx0aV9zZWxlY3RlZF9ncmlkW2ldLmxlbmd0aDsgeSsrKXtcbiAgICAgICAgICAgICAgICAgICAgaWYobXVsdGlfc2VsZWN0ZWRfZ3JpZFtpXVt5XSB8fCBtdWx0aV9zZWxlY3RlZF9ncmlkW2ldW3ldID09PSBcIlwiKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvLmZpbGxTdHlsZSA9IFwiYmx1ZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgY28uZmlsbFJlY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHdpIC8gaG8pICogaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaGUgLyB2aSkgKiB5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh3aSAvIGhvKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaGUgLyB2aSlcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyaWQ7Il19

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = __webpack_require__(1);

var _jquery2 = _interopRequireDefault(_jquery);

var _Registry = __webpack_require__(0);

var _Registry2 = _interopRequireDefault(_Registry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = _Registry2.default.console.debug;
var superDebug = _Registry2.default.console.superDebug;

var LayoutManager = function () {
    function LayoutManager(container) {
        _classCallCheck(this, LayoutManager);

        this.saveFloorplan = function () {
            debug("LayoutManager.saveFloorplan");
            var floorplanname = (0, _jquery2.default)("#builder_floorplan_name").val();
            this.setFloorplanName(floorplanname);
            var id = (0, _jquery2.default)("#builder_select_existing").val();
            var hs = parseInt((0, _jquery2.default)("#builder_hgrid_spaces").val());
            var vs = parseInt((0, _jquery2.default)("#builder_vgrid_spaces").val());
            var grid_color = (0, _jquery2.default)("#builder_grid_color").val();
            this.container.db.saveFloorplan({
                "id": id,
                "name": this.container.grid.getImageName(),
                "grid": this.container.grid.getFullGrid(),
                "hgrid_spaces": hs,
                "vgrid_spaces": vs,
                "floorplanname": floorplanname,
                "grid_color": grid_color
            });
        };

        debug("LayoutManager.constructor");
        this.container = container;
        this.floorplanId = false;

        var window_width = (0, _jquery2.default)(window).width();
        var window_height = (0, _jquery2.default)(window).height();
        var top_row_height = (0, _jquery2.default)("#top_row").height();
        (0, _jquery2.default)("#builder_canvas_container").css("maxWidth", window_width);
        (0, _jquery2.default)("#builder_canvas_container, #builder_container_container").height(window_height - top_row_height);

        var handle_down = false;
        (0, _jquery2.default)(window).on({
            "mousedown": function mousedown(event) {
                if ((0, _jquery2.default)(event.target).is("#resize_handle")) {
                    handle_down = true;
                }
            },
            "mousemove": function mousemove(event) {
                if (handle_down) {
                    var mouse_x = event.clientX;
                    (0, _jquery2.default)("#builder_canvas_container_container").width(mouse_x - 25);
                    var _window_width = (0, _jquery2.default)(window).width();
                    (0, _jquery2.default)("#builder_container_container").width(_window_width - mouse_x - 20);
                }
            },
            "mouseup": function mouseup() {
                handle_down = false;
            }
        });

        var handle_down_top = false;
        (0, _jquery2.default)(window).on({
            "mousedown": function mousedown(event) {
                if ((0, _jquery2.default)(event.target).is("#resize_handle_top")) {
                    handle_down_top = true;
                }
            },
            "mousemove": function mousemove(event) {
                if (handle_down_top) {
                    var mouse_y = event.clientY + 10;
                    (0, _jquery2.default)("#top_row").height(mouse_y);
                    var _window_height = (0, _jquery2.default)(window).height();
                    (0, _jquery2.default)("#builder_canvas_container, #builder_container_container").height(_window_height - mouse_y);
                }
            },
            "mouseup": function mouseup() {
                handle_down_top = false;
            }
        });

        (0, _jquery2.default)(window).resize(this.adjustLayout);
    }

    /**
     * We are using a dynamic layout that is readjusted based on window resize event
     */


    _createClass(LayoutManager, [{
        key: 'adjustLayout',
        value: function adjustLayout() {
            var window_width = (0, _jquery2.default)(window).width();
            var window_height = (0, _jquery2.default)(window).height();
            var top_row_height = (0, _jquery2.default)("#top_row").height();
            (0, _jquery2.default)("#builder_canvas_container").css("maxWidth", window_width);
            (0, _jquery2.default)("#builder_canvas_container, #builder_container_container").height(window_height - top_row_height);
        }

        /**
         *
         * @param {String} name
         */

    }, {
        key: 'setFloorplanName',
        value: function setFloorplanName(name) {
            debug("LayoutManager.setFloorplanName");
            if (name) {
                (0, _jquery2.default)("#top_row .page-header small").text(name);
                (0, _jquery2.default)("#builder_floorplan_name").val(name);
            } else {
                (0, _jquery2.default)("#builder_floorplan_name").val("");
                (0, _jquery2.default)("#top_row .page-header small").text("");
            }
        }
    }, {
        key: 'resetFromDb',
        value: function resetFromDb(event, id) {
            debug("LayoutManager.resetFromDb");
            (0, _jquery2.default)(event.target.result).each(function (i, el) {
                (0, _jquery2.default)("#builder_select_existing").append("<option value='" + el.id + "'>" + el.name + "</option>");
            });
            if (id) {
                (0, _jquery2.default)("#builder_select_existing").val(id);
            }
            if (event.target.result.length > 0) {
                this.displayFloorplan((0, _jquery2.default)("#builder_select_existing").val());
            }
        }
    }, {
        key: 'displayFloorplan',
        value: function displayFloorplan(id) {
            debug("LayoutManager.displayFloorplan");
            var that = this;
            that.floorplanId = id;
            this.container.db.loadFloorplan(id, function (event) {
                that.setImageName(event.target.result.name);
                that.setFloorplanName(event.target.result.floorplanname);
                that.container.grid.setHandVSpace(event.target.result.hgrid_spaces, event.target.result.vgrid_spaces);
                var image = document.createElement("img");
                image.src = event.target.result.image;
                image.onload = function (event) {
                    that.imageLoaded(image);
                };
                var grid_color = "#a8fb8b";
                if (typeof event.target.result.grid_color != "undefined") {
                    grid_color = event.target.result.grid_color;
                }
                that.container.grid.setGridColor(grid_color);
                that.container.grid.setGridVars({
                    "full_grid": event.target.result.grid
                });

                that.drawFloorPlan();
            });
        }
    }, {
        key: 'imageLoaded',
        value: function imageLoaded(img) {
            debug("LayoutManager.imageLoaded");
            if (img) {
                this.container.grid.setGridVars({
                    "image": img,
                    "image_height": img.height,
                    "image_width": img.width
                });
            }
            this.container.grid.redraw();
            this.container.grid.resetZoom();
        }
    }, {
        key: 'setImageName',
        value: function setImageName(name) {
            debug("LayoutManager.setImageName");
            this.container.grid.setGridVars({ "image_name": name });
            (0, _jquery2.default)("#builder_table caption#builder_title").html(name);
        }

        /**
         * Event handler fired when the #builder_image_input upload box is changed
         * This function will read from the file upload input box and create a FileReader object and generate a dataURL
         * out of it.
         *
         * The function will then call the addLayoutImage method in the Db class.
         *
         * @param event
         */

    }, {
        key: 'imageChanged',
        value: function imageChanged(event) {
            debug("LayoutManager.imageChanged");

            var input = event.target;
            var reader = new FileReader();
            var that = this;
            reader.onload = function () {
                var dataURL = reader.result;
                var imageObj = new Image();
                imageObj.src = dataURL;
                imageObj.onload = function () {
                    that.setImageName(input.files[0].name);
                    that.container.db.addLayoutImage({
                        "id": md5(dataURL),
                        "name": that.container.grid.getImageName(),
                        "image": dataURL,
                        "grid": [],
                        "hgrid_spaces": that.container.grid.getHGridSpaces(),
                        "vgrid_spaces": that.container.grid.getVGridSpaces(),
                        "grid_color": that.container.grid.getGridColor()
                    }, that.container.db.reloadFromDb);
                };
            };
            reader.readAsDataURL(input.files[0]);
        }
    }, {
        key: 'spacesChanged',
        value: function spacesChanged(event) {
            debug("LayoutManager.spacesChanged");
            this.container.grid.setGridVars({
                "hgrid_spaces": (0, _jquery2.default)("#builder_hgrid_spaces").val(),
                "vgrid_spaces": (0, _jquery2.default)("#builder_vgrid_spaces").val()
            });
            this.imageLoaded();
        }
    }, {
        key: 'addSpace',
        value: function addSpace(event) {
            debug("LayoutManager.addSpace");
            var name = (0, _jquery2.default)("#builder_selected_box_name").val();
            var multi_selected_grid = this.container.grid.getMultiSelectedGrid();
            var full_grid = this.container.grid.getFullGrid();
            for (var i = 0; i < multi_selected_grid.length; i++) {
                if (multi_selected_grid[i]) {
                    if (!full_grid[i]) {
                        full_grid[i] = [];
                    }
                    for (var y = 0; y < multi_selected_grid[i].length; y++) {
                        if (multi_selected_grid[i][y] || multi_selected_grid[i][y] === "") {
                            full_grid[i][y] = name;
                        }
                    }
                }
            }
            this.container.grid.setGridVars({
                "full_grid": full_grid,
                "multi_selected_grid": []
            });
            this.container.grid.redraw();
            this.drawFloorPlan();
        }
    }, {
        key: 'drawFloorPlan',
        value: function drawFloorPlan() {
            debug("LayoutManager.drawFloorPlan");
            (0, _jquery2.default)("#builder_named_grid_spaces").html("");
            var names = {};
            var full_grid = this.container.grid.getFullGrid();
            for (var x = 0; x < full_grid.length; x++) {
                if (full_grid[x]) {
                    for (var y = 0; y < full_grid[x].length; y++) {
                        if (full_grid[x][y] || full_grid[x][y] === "") {
                            var _name = full_grid[x][y];
                            if (_name.trim() == "") {
                                _name = "no name";
                            }
                            if (!names[_name]) {
                                names[_name] = [];
                            }
                            names[_name].push([x, y]);
                        }
                    }
                }
            }
            _jquery2.default.each(names, function (k, v) {
                var left = "<td class='bngs_name'>" + k + "</td>";
                var right = "<td><ul>";
                for (var i = 0; i < v.length; i++) {
                    right += "<li data-x='" + v[i][0] + "' data-y='" + v[i][1] + "'>" + "X: " + v[i][0] + " Y: " + v[i][1] + "</li>";
                }
                right += "</ul></td>";
                (0, _jquery2.default)("#builder_named_grid_spaces").append("<tr>" + left + right + "</tr>");
            });
        }
    }, {
        key: 'selectGridFromList',
        value: function selectGridFromList(event) {
            debug("LayoutManager.selectGridFromList");
            // var x = $(event.target).data("x");
            // var y = $(event.target).data("y");
            var name = (0, _jquery2.default)(event.currentTarget).find(".bngs_name").text();

            var x = void 0,
                y = void 0;
            _jquery2.default.each((0, _jquery2.default)(event.currentTarget).find("li"), function (i, o) {
                x = (0, _jquery2.default)(o).data("x");
                y = (0, _jquery2.default)(o).data("y");
            });
            this.setSelectedGrid(x, y, name);
            this.container.grid.redraw();
        }
    }, {
        key: 'setSelectedGrid',
        value: function setSelectedGrid(x, y, data) {
            debug("LayoutManager.setSelectedGrid");
            var selected_grid = [];
            selected_grid[x] = [];
            selected_grid[x][y] = data;
            this.container.grid.setGridVars({ "selected_grid": selected_grid });
            (0, _jquery2.default)("#builder_selected_box").show();
            (0, _jquery2.default)("#builder_selected_box_coords").html("x: " + x + " y: " + y);
            (0, _jquery2.default)("#builder_selected_box_name").val(data);
        }
    }, {
        key: 'hoverGridFromList',
        value: function hoverGridFromList(event) {
            debug("LayoutManager.hoverGridFromList");
            this.container.grid.setGridVars({ "hover_grid": [] });
            var that = this;
            _jquery2.default.each((0, _jquery2.default)(event.currentTarget).find("li"), function (i, o) {
                var x = (0, _jquery2.default)(o).data("x");
                var y = (0, _jquery2.default)(o).data("y");
                that.container.grid.setHoverGrid(x, y, name);
            });

            this.container.grid.redraw();
        }
    }, {
        key: 'removeHoverGridFromList',
        value: function removeHoverGridFromList(event) {
            debug("LayoutManager.removeHoverGridFromList");
            this.container.grid.setGridVars({ "hover_grid": [] });
            this.container.grid.redraw();
        }
    }, {
        key: 'selectChanged',
        value: function selectChanged(event) {
            debug("LayoutManager.selectChanged");
            this.displayFloorplan(event.target.value);
        }
    }, {
        key: 'toggleSpaceDisplay',
        value: function toggleSpaceDisplay(event) {
            debug("LayoutManager.toggleSpaceDisplay");
            (0, _jquery2.default)(event.currentTarget).toggleClass("builder_space_list_open");
        }
    }]);

    return LayoutManager;
}();

exports.default = LayoutManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9idWlsZGVyL0xheW91dE1hbmFnZXIuZXM2Il0sIm5hbWVzIjpbImRlYnVnIiwiY29uc29sZSIsInN1cGVyRGVidWciLCJMYXlvdXRNYW5hZ2VyIiwiY29udGFpbmVyIiwic2F2ZUZsb29ycGxhbiIsImZsb29ycGxhbm5hbWUiLCJ2YWwiLCJzZXRGbG9vcnBsYW5OYW1lIiwiaWQiLCJocyIsInBhcnNlSW50IiwidnMiLCJncmlkX2NvbG9yIiwiZGIiLCJncmlkIiwiZ2V0SW1hZ2VOYW1lIiwiZ2V0RnVsbEdyaWQiLCJmbG9vcnBsYW5JZCIsIndpbmRvd193aWR0aCIsIndpbmRvdyIsIndpZHRoIiwid2luZG93X2hlaWdodCIsImhlaWdodCIsInRvcF9yb3dfaGVpZ2h0IiwiY3NzIiwiaGFuZGxlX2Rvd24iLCJvbiIsImV2ZW50IiwidGFyZ2V0IiwiaXMiLCJtb3VzZV94IiwiY2xpZW50WCIsImhhbmRsZV9kb3duX3RvcCIsIm1vdXNlX3kiLCJjbGllbnRZIiwicmVzaXplIiwiYWRqdXN0TGF5b3V0IiwibmFtZSIsInRleHQiLCJyZXN1bHQiLCJlYWNoIiwiaSIsImVsIiwiYXBwZW5kIiwibGVuZ3RoIiwiZGlzcGxheUZsb29ycGxhbiIsInRoYXQiLCJsb2FkRmxvb3JwbGFuIiwic2V0SW1hZ2VOYW1lIiwic2V0SGFuZFZTcGFjZSIsImhncmlkX3NwYWNlcyIsInZncmlkX3NwYWNlcyIsImltYWdlIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwic3JjIiwib25sb2FkIiwiaW1hZ2VMb2FkZWQiLCJzZXRHcmlkQ29sb3IiLCJzZXRHcmlkVmFycyIsImRyYXdGbG9vclBsYW4iLCJpbWciLCJyZWRyYXciLCJyZXNldFpvb20iLCJodG1sIiwiaW5wdXQiLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwiZGF0YVVSTCIsImltYWdlT2JqIiwiSW1hZ2UiLCJmaWxlcyIsImFkZExheW91dEltYWdlIiwibWQ1IiwiZ2V0SEdyaWRTcGFjZXMiLCJnZXRWR3JpZFNwYWNlcyIsImdldEdyaWRDb2xvciIsInJlbG9hZEZyb21EYiIsInJlYWRBc0RhdGFVUkwiLCJtdWx0aV9zZWxlY3RlZF9ncmlkIiwiZ2V0TXVsdGlTZWxlY3RlZEdyaWQiLCJmdWxsX2dyaWQiLCJ5IiwibmFtZXMiLCJ4IiwidHJpbSIsInB1c2giLCJrIiwidiIsImxlZnQiLCJyaWdodCIsImN1cnJlbnRUYXJnZXQiLCJmaW5kIiwibyIsImRhdGEiLCJzZXRTZWxlY3RlZEdyaWQiLCJzZWxlY3RlZF9ncmlkIiwic2hvdyIsInNldEhvdmVyR3JpZCIsInZhbHVlIiwidG9nZ2xlQ2xhc3MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFJQSxRQUFRLG1CQUFTQyxPQUFULENBQWlCRCxLQUE3QjtBQUNBLElBQUlFLGFBQWEsbUJBQVNELE9BQVQsQ0FBaUJDLFVBQWxDOztJQUVNQyxhO0FBRUYsMkJBQVlDLFNBQVosRUFBc0I7QUFBQTs7QUFBQSxhQTBTdEJDLGFBMVNzQixHQTBTTixZQUFXO0FBQ3ZCTCxrQkFBTSw2QkFBTjtBQUNBLGdCQUFJTSxnQkFBZ0Isc0JBQUUseUJBQUYsRUFBNkJDLEdBQTdCLEVBQXBCO0FBQ0EsaUJBQUtDLGdCQUFMLENBQXNCRixhQUF0QjtBQUNBLGdCQUFJRyxLQUFLLHNCQUFFLDBCQUFGLEVBQThCRixHQUE5QixFQUFUO0FBQ0EsZ0JBQUlHLEtBQUtDLFNBQVMsc0JBQUUsdUJBQUYsRUFBMkJKLEdBQTNCLEVBQVQsQ0FBVDtBQUNBLGdCQUFJSyxLQUFLRCxTQUFTLHNCQUFFLHVCQUFGLEVBQTJCSixHQUEzQixFQUFULENBQVQ7QUFDQSxnQkFBSU0sYUFBYSxzQkFBRSxxQkFBRixFQUF5Qk4sR0FBekIsRUFBakI7QUFDQSxpQkFBS0gsU0FBTCxDQUFlVSxFQUFmLENBQWtCVCxhQUFsQixDQUFnQztBQUM1QixzQkFBTUksRUFEc0I7QUFFNUIsd0JBQVEsS0FBS0wsU0FBTCxDQUFlVyxJQUFmLENBQW9CQyxZQUFwQixFQUZvQjtBQUc1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VixDQUFSO0FBQ0Esb0JBQUlaLElBQUksc0JBQUVXLENBQUYsRUFBS0MsSUFBTCxDQUFVLEdBQVYsQ0FBUjtBQUNBaEQscUJBQUszQyxTQUFMLENBQWVXLElBQWYsQ0FBb0JvRixZQUFwQixDQUFpQ2QsQ0FBakMsRUFBb0NGLENBQXBDLEVBQXVDN0MsSUFBdkM7QUFDSCxhQUpEOztBQU1BLGlCQUFLbEMsU0FBTCxDQUFlVyxJQUFmLENBQW9CZ0QsTUFBcEI7QUFDSDs7O2dEQUV1Qm5DLEssRUFBTztBQUMzQjVCLGtCQUFNLHVDQUFOO0FBQ0EsaUJBQUtJLFNBQUwsQ0FBZVcsSUFBZixDQUFvQjZDLFdBQXBCLENBQWdDLEVBQUMsY0FBYyxFQUFmLEVBQWhDO0FBQ0EsaUJBQUt4RCxTQUFMLENBQWVXLElBQWYsQ0FBb0JnRCxNQUFwQjtBQUNIOzs7c0NBRWFuQyxLLEVBQU87QUFDakI1QixrQkFBTSw2QkFBTjtBQUNBLGlCQUFLOEMsZ0JBQUwsQ0FBc0JsQixNQUFNQyxNQUFOLENBQWF1RSxLQUFuQztBQUNIOzs7MkNBRWtCeEUsSyxFQUFPO0FBQ3RCNUIsa0JBQU0sa0NBQU47QUFDQSxrQ0FBRTRCLE1BQU1nRSxhQUFSLEVBQXVCUyxXQUF2QixDQUFtQyx5QkFBbkM7QUFDSDs7Ozs7O2tCQXNCVWxHLGEiLCJmaWxlIjoiTGF5b3V0TWFuYWdlci5lczYiLCJzb3VyY2VSb290IjoiL1VzZXJzL3JpY2h3YW5kZWxsL1BocHN0b3JtUHJvamVjdHMvZ3JpZC1idWlsZGVyIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICQgZnJvbSAnanF1ZXJ5JztcbmltcG9ydCBSZWdpc3RyeSBmcm9tICcuL1JlZ2lzdHJ5JztcblxubGV0IGRlYnVnID0gUmVnaXN0cnkuY29uc29sZS5kZWJ1ZztcbmxldCBzdXBlckRlYnVnID0gUmVnaXN0cnkuY29uc29sZS5zdXBlckRlYnVnO1xuXG5jbGFzcyBMYXlvdXRNYW5hZ2VyIHtcblxuICAgIGNvbnN0cnVjdG9yKGNvbnRhaW5lcil7XG4gICAgICAgIGRlYnVnKFwiTGF5b3V0TWFuYWdlci5jb25zdHJ1Y3RvclwiKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgICAgIHRoaXMuZmxvb3JwbGFuSWQgPSBmYWxzZTtcblxuICAgICAgICBsZXQgd2luZG93X3dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgICAgIGxldCB3aW5kb3dfaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICBsZXQgdG9wX3Jvd19oZWlnaHQgPSAkKFwiI3RvcF9yb3dcIikuaGVpZ2h0KCk7XG4gICAgICAgICQoXCIjYnVpbGRlcl9jYW52YXNfY29udGFpbmVyXCIpLmNzcyhcIm1heFdpZHRoXCIsIHdpbmRvd193aWR0aCk7XG4gICAgICAgICQoXCIjYnVpbGRlcl9jYW52YXNfY29udGFpbmVyLCAjYnVpbGRlcl9jb250YWluZXJfY29udGFpbmVyXCIpLmhlaWdodCh3aW5kb3dfaGVpZ2h0IC0gdG9wX3Jvd19oZWlnaHQpO1xuXG5cbiAgICAgICAgbGV0IGhhbmRsZV9kb3duID0gZmFsc2U7XG4gICAgICAgICQod2luZG93KS5vbih7XG4gICAgICAgICAgICBcIm1vdXNlZG93blwiOiBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICAgICAgaWYoJChldmVudC50YXJnZXQpLmlzKFwiI3Jlc2l6ZV9oYW5kbGVcIikpe1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVfZG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwibW91c2Vtb3ZlXCI6IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICBpZihoYW5kbGVfZG93bil7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtb3VzZV94ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgICAgICAgICAgICAgJChcIiNidWlsZGVyX2NhbnZhc19jb250YWluZXJfY29udGFpbmVyXCIpLndpZHRoKG1vdXNlX3ggLSAyNSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCB3aW5kb3dfd2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgJChcIiNidWlsZGVyX2NvbnRhaW5lcl9jb250YWluZXJcIikud2lkdGgod2luZG93X3dpZHRoIC0gbW91c2VfeCAtIDIwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJtb3VzZXVwXCI6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgaGFuZGxlX2Rvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGhhbmRsZV9kb3duX3RvcCA9IGZhbHNlO1xuICAgICAgICAkKHdpbmRvdykub24oe1xuICAgICAgICAgICAgXCJtb3VzZWRvd25cIjogZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgIGlmKCQoZXZlbnQudGFyZ2V0KS5pcyhcIiNyZXNpemVfaGFuZGxlX3RvcFwiKSl7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZV9kb3duX3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwibW91c2Vtb3ZlXCI6IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICBpZihoYW5kbGVfZG93bl90b3Ape1xuICAgICAgICAgICAgICAgICAgICBsZXQgbW91c2VfeSA9IGV2ZW50LmNsaWVudFkgKyAxMDtcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3Bfcm93XCIpLmhlaWdodChtb3VzZV95KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbmRvd19oZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgICAgICQoXCIjYnVpbGRlcl9jYW52YXNfY29udGFpbmVyLCAjYnVpbGRlcl9jb250YWluZXJfY29udGFpbmVyXCIpLmhlaWdodCh3aW5kb3dfaGVpZ2h0IC0gbW91c2VfeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwibW91c2V1cFwiOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGhhbmRsZV9kb3duX3RvcCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkKHdpbmRvdykucmVzaXplKHRoaXMuYWRqdXN0TGF5b3V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXZSBhcmUgdXNpbmcgYSBkeW5hbWljIGxheW91dCB0aGF0IGlzIHJlYWRqdXN0ZWQgYmFzZWQgb24gd2luZG93IHJlc2l6ZSBldmVudFxuICAgICAqL1xuICAgIGFkanVzdExheW91dCgpe1xuICAgICAgICBsZXQgd2luZG93X3dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgICAgIGxldCB3aW5kb3dfaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICBsZXQgdG9wX3Jvd19oZWlnaHQgPSAkKFwiI3RvcF9yb3dcIikuaGVpZ2h0KCk7XG4gICAgICAgICQoXCIjYnVpbGRlcl9jYW52YXNfY29udGFpbmVyXCIpLmNzcyhcIm1heFdpZHRoXCIsIHdpbmRvd193aWR0aCk7XG4gICAgICAgICQoXCIjYnVpbGRlcl9jYW52YXNfY29udGFpbmVyLCAjYnVpbGRlcl9jb250YWluZXJfY29udGFpbmVyXCIpLmhlaWdodCh3aW5kb3dfaGVpZ2h0IC0gdG9wX3Jvd19oZWlnaHQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKi9cbiAgICBzZXRGbG9vcnBsYW5OYW1lKG5hbWUpIHtcbiAgICAgICAgZGVidWcoXCJMYXlvdXRNYW5hZ2VyLnNldEZsb29ycGxhbk5hbWVcIik7XG4gICAgICAgIGlmKG5hbWUpe1xuICAgICAgICAgICAgJChcIiN0b3Bfcm93IC5wYWdlLWhlYWRlciBzbWFsbFwiKS50ZXh0KG5hbWUpO1xuICAgICAgICAgICAgJChcIiNidWlsZGVyX2Zsb29ycGxhbl9uYW1lXCIpLnZhbChuYW1lKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAkKFwiI2J1aWxkZXJfZmxvb3JwbGFuX25hbWVcIikudmFsKFwiXCIpO1xuICAgICAgICAgICAgJChcIiN0b3Bfcm93IC5wYWdlLWhlYWRlciBzbWFsbFwiKS50ZXh0KFwiXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVzZXRGcm9tRGIoZXZlbnQsIGlkKXtcbiAgICAgICAgZGVidWcoXCJMYXlvdXRNYW5hZ2VyLnJlc2V0RnJvbURiXCIpO1xuICAgICAgICAkKGV2ZW50LnRhcmdldC5yZXN1bHQpLmVhY2goZnVuY3Rpb24oaSwgZWwpe1xuICAgICAgICAgICAgJChcIiNidWlsZGVyX3NlbGVjdF9leGlzdGluZ1wiKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSdcIiArIGVsLmlkICsgXCInPlwiICsgZWwubmFtZSArIFwiPC9vcHRpb24+XCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYoaWQpe1xuICAgICAgICAgICAgJChcIiNidWlsZGVyX3NlbGVjdF9leGlzdGluZ1wiKS52YWwoaWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmKGV2ZW50LnRhcmdldC5yZXN1bHQubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlGbG9vcnBsYW4oJChcIiNidWlsZGVyX3NlbGVjdF9leGlzdGluZ1wiKS52YWwoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNwbGF5Rmxvb3JwbGFuKGlkKXtcbiAgICAgICAgZGVidWcoXCJMYXlvdXRNYW5hZ2VyLmRpc3BsYXlGbG9vcnBsYW5cIik7XG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgICAgdGhhdC5mbG9vcnBsYW5JZCA9IGlkO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5kYi5sb2FkRmxvb3JwbGFuKGlkLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoYXQuc2V0SW1hZ2VOYW1lKGV2ZW50LnRhcmdldC5yZXN1bHQubmFtZSk7XG4gICAgICAgICAgICB0aGF0LnNldEZsb29ycGxhbk5hbWUoZXZlbnQudGFyZ2V0LnJlc3VsdC5mbG9vcnBsYW5uYW1lKTtcbiAgICAgICAgICAgIHRoYXQuY29udGFpbmVyLmdyaWQuc2V0SGFuZFZTcGFjZShldmVudC50YXJnZXQucmVzdWx0LmhncmlkX3NwYWNlcywgZXZlbnQudGFyZ2V0LnJlc3VsdC52Z3JpZF9zcGFjZXMpO1xuICAgICAgICAgICAgbGV0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgICAgIGltYWdlLnNyYyA9IGV2ZW50LnRhcmdldC5yZXN1bHQuaW1hZ2U7XG4gICAgICAgICAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmltYWdlTG9hZGVkKGltYWdlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgZ3JpZF9jb2xvciA9IFwiI2E4ZmI4YlwiO1xuICAgICAgICAgICAgaWYodHlwZW9mKGV2ZW50LnRhcmdldC5yZXN1bHQuZ3JpZF9jb2xvcikgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICAgICAgZ3JpZF9jb2xvciA9IGV2ZW50LnRhcmdldC5yZXN1bHQuZ3JpZF9jb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuY29udGFpbmVyLmdyaWQuc2V0R3JpZENvbG9yKGdyaWRfY29sb3IpO1xuICAgICAgICAgICAgdGhhdC5jb250YWluZXIuZ3JpZC5zZXRHcmlkVmFycyh7XG4gICAgICAgICAgICAgICAgXCJmdWxsX2dyaWRcIjogZXZlbnQudGFyZ2V0LnJlc3VsdC5ncmlkXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5kcmF3Rmxvb3JQbGFuKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGltYWdlTG9hZGVkKGltZykge1xuICAgICAgICBkZWJ1ZyhcIkxheW91dE1hbmFnZXIuaW1hZ2VMb2FkZWRcIik7XG4gICAgICAgIGlmKGltZyl7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5ncmlkLnNldEdyaWRWYXJzKHtcbiAgICAgICAgICAgICAgICBcImltYWdlXCI6IGltZyxcbiAgICAgICAgICAgICAgICBcImltYWdlX2hlaWdodFwiOiBpbWcuaGVpZ2h0LFxuICAgICAgICAgICAgICAgIFwiaW1hZ2Vfd2lkdGhcIjogaW1nLndpZHRoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRhaW5lci5ncmlkLnJlZHJhdygpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5ncmlkLnJlc2V0Wm9vbSgpO1xuICAgIH1cblxuICAgIHNldEltYWdlTmFtZShuYW1lKSB7XG4gICAgICAgIGRlYnVnKFwiTGF5b3V0TWFuYWdlci5zZXRJbWFnZU5hbWVcIik7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmdyaWQuc2V0R3JpZFZhcnMoe1wiaW1hZ2VfbmFtZVwiOiBuYW1lfSk7XG4gICAgICAgICQoXCIjYnVpbGRlcl90YWJsZSBjYXB0aW9uI2J1aWxkZXJfdGl0bGVcIikuaHRtbChuYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZpcmVkIHdoZW4gdGhlICNidWlsZGVyX2ltYWdlX2lucHV0IHVwbG9hZCBib3ggaXMgY2hhbmdlZFxuICAgICAqIFRoaXMgZnVuY3Rpb24gd2lsbCByZWFkIGZyb20gdGhlIGZpbGUgdXBsb2FkIGlucHV0IGJveCBhbmQgY3JlYXRlIGEgRmlsZVJlYWRlciBvYmplY3QgYW5kIGdlbmVyYXRlIGEgZGF0YVVSTFxuICAgICAqIG91dCBvZiBpdC5cbiAgICAgKlxuICAgICAqIFRoZSBmdW5jdGlvbiB3aWxsIHRoZW4gY2FsbCB0aGUgYWRkTGF5b3V0SW1hZ2UgbWV0aG9kIGluIHRoZSBEYiBjbGFzcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBldmVudFxuICAgICAqL1xuICAgIGltYWdlQ2hhbmdlZChldmVudCkge1xuICAgICAgICBkZWJ1ZyhcIkxheW91dE1hbmFnZXIuaW1hZ2VDaGFuZ2VkXCIpO1xuXG4gICAgICAgIGxldCBpbnB1dCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgbGV0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IGRhdGFVUkwgPSByZWFkZXIucmVzdWx0O1xuICAgICAgICAgICAgbGV0IGltYWdlT2JqID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWFnZU9iai5zcmMgPSBkYXRhVVJMO1xuICAgICAgICAgICAgaW1hZ2VPYmoub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB0aGF0LnNldEltYWdlTmFtZShpbnB1dC5maWxlc1swXS5uYW1lKTtcbiAgICAgICAgICAgICAgICB0aGF0LmNvbnRhaW5lci5kYi5hZGRMYXlvdXRJbWFnZSh7XG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogbWQ1KGRhdGFVUkwpLFxuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogdGhhdC5jb250YWluZXIuZ3JpZC5nZXRJbWFnZU5hbWUoKSxcbiAgICAgICAgICAgICAgICAgICAgXCJpbWFnZVwiOiBkYXRhVVJMLFxuICAgICAgICAgICAgICAgICAgICBcImdyaWRcIjogW10sXG4gICAgICAgICAgICAgICAgICAgIFwiaGdyaWRfc3BhY2VzXCI6IHRoYXQuY29udGFpbmVyLmdyaWQuZ2V0SEdyaWRTcGFjZXMoKSxcbiAgICAgICAgICAgICAgICAgICAgXCJ2Z3JpZF9zcGFjZXNcIjogdGhhdC5jb250YWluZXIuZ3JpZC5nZXRWR3JpZFNwYWNlcygpLFxuICAgICAgICAgICAgICAgICAgICBcImdyaWRfY29sb3JcIjogdGhhdC5jb250YWluZXIuZ3JpZC5nZXRHcmlkQ29sb3IoKVxuICAgICAgICAgICAgICAgIH0sIHRoYXQuY29udGFpbmVyLmRiLnJlbG9hZEZyb21EYik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH07XG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKTtcbiAgICB9XG5cbiAgICBzcGFjZXNDaGFuZ2VkKGV2ZW50KSB7XG4gICAgICAgIGRlYnVnKFwiTGF5b3V0TWFuYWdlci5zcGFjZXNDaGFuZ2VkXCIpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5ncmlkLnNldEdyaWRWYXJzKHtcbiAgICAgICAgICAgIFwiaGdyaWRfc3BhY2VzXCI6ICQoXCIjYnVpbGRlcl9oZ3JpZF9zcGFjZXNcIikudmFsKCksXG4gICAgICAgICAgICBcInZncmlkX3NwYWNlc1wiOiAkKFwiI2J1aWxkZXJfdmdyaWRfc3BhY2VzXCIpLnZhbCgpXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmltYWdlTG9hZGVkKCk7XG4gICAgfVxuXG4gICAgYWRkU3BhY2UoZXZlbnQpe1xuICAgICAgICBkZWJ1ZyhcIkxheW91dE1hbmFnZXIuYWRkU3BhY2VcIik7XG4gICAgICAgIGxldCBuYW1lID0gJChcIiNidWlsZGVyX3NlbGVjdGVkX2JveF9uYW1lXCIpLnZhbCgpO1xuICAgICAgICBsZXQgbXVsdGlfc2VsZWN0ZWRfZ3JpZCA9IHRoaXMuY29udGFpbmVyLmdyaWQuZ2V0TXVsdGlTZWxlY3RlZEdyaWQoKTtcbiAgICAgICAgbGV0IGZ1bGxfZ3JpZCA9IHRoaXMuY29udGFpbmVyLmdyaWQuZ2V0RnVsbEdyaWQoKTtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IG11bHRpX3NlbGVjdGVkX2dyaWQubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgaWYobXVsdGlfc2VsZWN0ZWRfZ3JpZFtpXSl7XG4gICAgICAgICAgICAgICAgaWYoIWZ1bGxfZ3JpZFtpXSl7XG4gICAgICAgICAgICAgICAgICAgIGZ1bGxfZ3JpZFtpXSA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IobGV0IHkgPSAwOyB5IDwgbXVsdGlfc2VsZWN0ZWRfZ3JpZFtpXS5sZW5ndGg7IHkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGlmKG11bHRpX3NlbGVjdGVkX2dyaWRbaV1beV0gfHwgbXVsdGlfc2VsZWN0ZWRfZ3JpZFtpXVt5XSA9PT0gXCJcIil7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsX2dyaWRbaV1beV0gPSBuYW1lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmdyaWQuc2V0R3JpZFZhcnMoe1xuICAgICAgICAgICAgXCJmdWxsX2dyaWRcIjogZnVsbF9ncmlkLFxuICAgICAgICAgICAgXCJtdWx0aV9zZWxlY3RlZF9ncmlkXCI6IFtdXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5ncmlkLnJlZHJhdygpO1xuICAgICAgICB0aGlzLmRyYXdGbG9vclBsYW4oKTtcbiAgICB9XG5cbiAgICBkcmF3Rmxvb3JQbGFuKCl7XG4gICAgICAgIGRlYnVnKFwiTGF5b3V0TWFuYWdlci5kcmF3Rmxvb3JQbGFuXCIpO1xuICAgICAgICAkKFwiI2J1aWxkZXJfbmFtZWRfZ3JpZF9zcGFjZXNcIikuaHRtbChcIlwiKTtcbiAgICAgICAgbGV0IG5hbWVzID0ge307XG4gICAgICAgIGxldCBmdWxsX2dyaWQgPSB0aGlzLmNvbnRhaW5lci5ncmlkLmdldEZ1bGxHcmlkKCk7XG4gICAgICAgIGZvcihsZXQgeCA9IDA7IHggPCBmdWxsX2dyaWQubGVuZ3RoOyB4Kyspe1xuICAgICAgICAgICAgaWYoZnVsbF9ncmlkW3hdKXtcbiAgICAgICAgICAgICAgICBmb3IobGV0IHkgPSAwOyB5IDwgZnVsbF9ncmlkW3hdLmxlbmd0aDsgeSsrKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoZnVsbF9ncmlkW3hdW3ldIHx8IGZ1bGxfZ3JpZFt4XVt5XSA9PT0gXCJcIil7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IGZ1bGxfZ3JpZFt4XVt5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG5hbWUudHJpbSgpID09IFwiXCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBcIm5vIG5hbWVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFuYW1lc1tuYW1lXSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNbbmFtZV0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzW25hbWVdLnB1c2goW3gsIHldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAkLmVhY2gobmFtZXMsIGZ1bmN0aW9uKGssIHYpe1xuICAgICAgICAgICAgbGV0IGxlZnQgPSBcIjx0ZCBjbGFzcz0nYm5nc19uYW1lJz5cIiArIGsgKyBcIjwvdGQ+XCI7XG4gICAgICAgICAgICBsZXQgcmlnaHQgPSBcIjx0ZD48dWw+XCI7XG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdi5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgcmlnaHQgKz0gXCI8bGkgZGF0YS14PSdcIiArIHZbaV1bMF0gKyBcIicgZGF0YS15PSdcIiArIHZbaV1bMV0gKyBcIic+XCIgK1xuICAgICAgICAgICAgICAgICAgICBcIlg6IFwiICsgdltpXVswXSArIFwiIFk6IFwiICsgdltpXVsxXSArXG4gICAgICAgICAgICAgICAgICAgIFwiPC9saT5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJpZ2h0ICs9IFwiPC91bD48L3RkPlwiO1xuICAgICAgICAgICAgJChcIiNidWlsZGVyX25hbWVkX2dyaWRfc3BhY2VzXCIpLmFwcGVuZChcIjx0cj5cIiArIGxlZnQgKyByaWdodCArIFwiPC90cj5cIik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNlbGVjdEdyaWRGcm9tTGlzdChldmVudCkge1xuICAgICAgICBkZWJ1ZyhcIkxheW91dE1hbmFnZXIuc2VsZWN0R3JpZEZyb21MaXN0XCIpO1xuICAgICAgICAvLyB2YXIgeCA9ICQoZXZlbnQudGFyZ2V0KS5kYXRhKFwieFwiKTtcbiAgICAgICAgLy8gdmFyIHkgPSAkKGV2ZW50LnRhcmdldCkuZGF0YShcInlcIik7XG4gICAgICAgIGxldCBuYW1lID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5maW5kKFwiLmJuZ3NfbmFtZVwiKS50ZXh0KCk7XG5cbiAgICAgICAgbGV0IHgsIHk7XG4gICAgICAgICQuZWFjaCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmZpbmQoXCJsaVwiKSwgZnVuY3Rpb24oaSwgbyl7XG4gICAgICAgICAgICB4ID0gJChvKS5kYXRhKFwieFwiKTtcbiAgICAgICAgICAgIHkgPSAkKG8pLmRhdGEoXCJ5XCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZEdyaWQoeCwgeSwgbmFtZSk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmdyaWQucmVkcmF3KCk7XG4gICAgfVxuXG4gICAgc2V0U2VsZWN0ZWRHcmlkKHgsIHksIGRhdGEpIHtcbiAgICAgICAgZGVidWcoXCJMYXlvdXRNYW5hZ2VyLnNldFNlbGVjdGVkR3JpZFwiKTtcbiAgICAgICAgbGV0IHNlbGVjdGVkX2dyaWQgPSBbXTtcbiAgICAgICAgc2VsZWN0ZWRfZ3JpZFt4XSA9IFtdO1xuICAgICAgICBzZWxlY3RlZF9ncmlkW3hdW3ldID0gZGF0YTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuZ3JpZC5zZXRHcmlkVmFycyh7XCJzZWxlY3RlZF9ncmlkXCI6IHNlbGVjdGVkX2dyaWR9KTtcbiAgICAgICAgJChcIiNidWlsZGVyX3NlbGVjdGVkX2JveFwiKS5zaG93KCk7XG4gICAgICAgICQoXCIjYnVpbGRlcl9zZWxlY3RlZF9ib3hfY29vcmRzXCIpLmh0bWwoXCJ4OiBcIiArIHggKyBcIiB5OiBcIiArIHkpO1xuICAgICAgICAkKFwiI2J1aWxkZXJfc2VsZWN0ZWRfYm94X25hbWVcIikudmFsKGRhdGEpO1xuICAgIH1cblxuICAgIGhvdmVyR3JpZEZyb21MaXN0KGV2ZW50KSB7XG4gICAgICAgIGRlYnVnKFwiTGF5b3V0TWFuYWdlci5ob3ZlckdyaWRGcm9tTGlzdFwiKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuZ3JpZC5zZXRHcmlkVmFycyh7XCJob3Zlcl9ncmlkXCI6IFtdfSk7XG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgICAgJC5lYWNoKCQoZXZlbnQuY3VycmVudFRhcmdldCkuZmluZChcImxpXCIpLCBmdW5jdGlvbihpLCBvKXtcbiAgICAgICAgICAgIGxldCB4ID0gJChvKS5kYXRhKFwieFwiKTtcbiAgICAgICAgICAgIGxldCB5ID0gJChvKS5kYXRhKFwieVwiKTtcbiAgICAgICAgICAgIHRoYXQuY29udGFpbmVyLmdyaWQuc2V0SG92ZXJHcmlkKHgsIHksIG5hbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNvbnRhaW5lci5ncmlkLnJlZHJhdygpO1xuICAgIH1cblxuICAgIHJlbW92ZUhvdmVyR3JpZEZyb21MaXN0KGV2ZW50KSB7XG4gICAgICAgIGRlYnVnKFwiTGF5b3V0TWFuYWdlci5yZW1vdmVIb3ZlckdyaWRGcm9tTGlzdFwiKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuZ3JpZC5zZXRHcmlkVmFycyh7XCJob3Zlcl9ncmlkXCI6IFtdfSk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmdyaWQucmVkcmF3KCk7XG4gICAgfVxuXG4gICAgc2VsZWN0Q2hhbmdlZChldmVudCkge1xuICAgICAgICBkZWJ1ZyhcIkxheW91dE1hbmFnZXIuc2VsZWN0Q2hhbmdlZFwiKTtcbiAgICAgICAgdGhpcy5kaXNwbGF5Rmxvb3JwbGFuKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgfVxuXG4gICAgdG9nZ2xlU3BhY2VEaXNwbGF5KGV2ZW50KSB7XG4gICAgICAgIGRlYnVnKFwiTGF5b3V0TWFuYWdlci50b2dnbGVTcGFjZURpc3BsYXlcIik7XG4gICAgICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkudG9nZ2xlQ2xhc3MoXCJidWlsZGVyX3NwYWNlX2xpc3Rfb3BlblwiKTtcbiAgICB9XG5cbiAgICBzYXZlRmxvb3JwbGFuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGRlYnVnKFwiTGF5b3V0TWFuYWdlci5zYXZlRmxvb3JwbGFuXCIpO1xuICAgICAgICBsZXQgZmxvb3JwbGFubmFtZSA9ICQoXCIjYnVpbGRlcl9mbG9vcnBsYW5fbmFtZVwiKS52YWwoKTtcbiAgICAgICAgdGhpcy5zZXRGbG9vcnBsYW5OYW1lKGZsb29ycGxhbm5hbWUpO1xuICAgICAgICBsZXQgaWQgPSAkKFwiI2J1aWxkZXJfc2VsZWN0X2V4aXN0aW5nXCIpLnZhbCgpO1xuICAgICAgICBsZXQgaHMgPSBwYXJzZUludCgkKFwiI2J1aWxkZXJfaGdyaWRfc3BhY2VzXCIpLnZhbCgpKTtcbiAgICAgICAgbGV0IHZzID0gcGFyc2VJbnQoJChcIiNidWlsZGVyX3ZncmlkX3NwYWNlc1wiKS52YWwoKSk7XG4gICAgICAgIGxldCBncmlkX2NvbG9yID0gJChcIiNidWlsZGVyX2dyaWRfY29sb3JcIikudmFsKCk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmRiLnNhdmVGbG9vcnBsYW4oe1xuICAgICAgICAgICAgXCJpZFwiOiBpZCxcbiAgICAgICAgICAgIFwibmFtZVwiOiB0aGlzLmNvbnRhaW5lci5ncmlkLmdldEltYWdlTmFtZSgpLFxuICAgICAgICAgICAgXCJncmlkXCI6IHRoaXMuY29udGFpbmVyLmdyaWQuZ2V0RnVsbEdyaWQoKSxcbiAgICAgICAgICAgIFwiaGdyaWRfc3BhY2VzXCI6IGhzLFxuICAgICAgICAgICAgXCJ2Z3JpZF9zcGFjZXNcIjogdnMsXG4gICAgICAgICAgICBcImZsb29ycGxhbm5hbWVcIjogZmxvb3JwbGFubmFtZSxcbiAgICAgICAgICAgIFwiZ3JpZF9jb2xvclwiOiBncmlkX2NvbG9yXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTGF5b3V0TWFuYWdlcjsiXX0=

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(4);


/***/ })
/******/ ]);
//# sourceMappingURL=app.js.map