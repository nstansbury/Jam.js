Jam.js
========

JavaScript Asynchronous Module Loader

A super light weight and easy to use Module and Namespace loader inspired by Mozilla's JavaScript code modules:

https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules


```javascript
Jam.import("My.Namespace");

```

```javascript
// My.Namespace.jsm

"use strict";

Jam.import("My.Other.Namespace");				// I can import any number of other dependant Namespaces too


var EXPORTED_SYMBOLS = ["Thing1", "Thing2"];	// Anything I don't export is private to the Module

function Thing1(){

}
Thing1.prototype = {
	__proto__ : My.Other.Namespace.Thing4		// I can depend on other import()ed Namespaces for inheritance patterns
	
}

var Thing2 = {

}

function PrivateThing(){
	// I'm not exported so private to the module
}

// "this" is always the Module itself

```




Designed so that unlike other AMD/Module mechanisms you don't require any changes to your existing code or your coding style.  There is no need to wrap everything in self executing functions etc etc.

A module is just simply defined as a single file.  Any number of "modules" can be imported into the same namespace.  This allows large namespaces to split code out into more traditional class files if required.

Modules and Namespaces can be hacked around as needed such as importing random JS files into useful namespaces as well as importing one Module into multiple namespaces to sharing data between them.

```javascript

var module = new Jam.Module("some_file_url.js");
module.load(callback);

function callback(){
	Jam.Namespaces["My.Namespace"].import(module);
	Jam.Namespaces["My.Other.Namespace"].import(module);
}

```
