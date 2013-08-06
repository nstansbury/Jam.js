Jam.js
========
JavaScript Asynchronous Module Loader

A super light weight and easy to use Module and Namespace loader inspired by Mozilla's JavaScript code modules: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules

```javascript
Jam.import("My.Qualified.Namespace");
```
```javascript
Jam.import("My.Qualified.Namespace", ["module1.jsm", "module2.jsm", "module3.jsm"], callback);
```

It is designed so that unlike other AMD/Module loading mechanisms, no changes to your existing code or your coding style are required, and there is no need to wrap everything in self executing functions, or callbacks etc.


A 'module' is just simply defined as a single file, that by convention has a .jsm extension. Any number of 'modules' can be imported into the same Namespace.  This allows large namespaces to split code out into more traditional class files if required.
```javascript
// module1.jsm
"use strict";

// I can import any number of other dependant Namespaces or Modules in a module too
Jam.import("My.Other.Namespace");

// Anything I don't export is private to the Module
var EXPORTED_SYMBOLS = ["Thing1", "Thing2"];

// I am 'Global' only in this module NOT in the Global JavaScript object
function Thing1(){

}
Thing1.prototype = {
	// I can depend on other import()ed Namespaces for inheritance patterns
	__proto__ : My.Other.Namespace.Thing4			
}

var Thing2 = {

}

function init(){
	// I'm not an exported symbol so remain private to the module
}

// "this" is always the Module itself
this.init();

```


Modules and Namespaces can be hacked around as needed, such as importing random JS files into useful namespaces as well as importing one Module into multiple Namespaces to share private data between them.

```javascript
var mod = new Jam.Module("myModule.jsm");
var ns = new Jam.Namespace("My.New.Namespace");
ns.import(mod, callback);
```

We can also decide at run-time which symbols to export from each module rather than statically declaring them.
```javascript
var ns = new Jam.Namespace("My.New.Namespace");
var context = ns.getContext();

var symbols = ["publicSymbol1", "publicSymbol2"];
var mod = new Jam.Module("myRandomJSFile.js");
mod.export(context, symbols);
```
