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
It is designed so that unlike other AMD/Module loading mechanisms, no changes to your existing code or your coding style are required, and there is no need to wrap everything in closures, self executing functions or callbacks etc.

A 'module' is just simply defined as a single file, that by convention has a .jsm extension. Any number of 'modules' can be imported into the same Namespace.  This allows large namespaces to split code out into more traditional class files if required.

A module can itself import other Namespaces or Modules. When importing dependant namespaces or modules, Jam takes care of the asynchronicity, so that callbacks aren't required in module level code.

```javascript
// module1.jsm
"use strict";

// I can asynchronously import any number of other dependant Namespaces or Modules in a module too - and without requiring a callback
Jam.import("My.Other.Namespace");

// Anything I don't export is private to the Module
var EXPORTED_SYMBOLS = ["Thing1", "Thing2"];

// I am 'Global' only in this module NOT in the Global JavaScript object
function Thing1(){
	init();		// We can call private/protected methods scoped to this module
}
Thing1.prototype = {
	// I can depend on other import()ed Namespaces for inheritance patterns
	__proto__ : My.Other.Namespace.Thing4			
}

var Thing2 = {
	// "this" is always the Namespace context the module is exported into
	prototype : this.Thing1.prototype
}

function init(){
	// I'm not an exported symbol so remain private to the module, though I can be called by public methods that are exported
	// Notice how I don't need to be wrapped inside strange closures to achieve my privacy.  I look just like any other function.
}
```
By default, every namespace has a default module, named as the namespace with a .jsm extension. This allows a single namespace module to transparently import any required modules.

Modules and Namespaces can also be hacked around as needed, such as importing random JS files into useful namespaces as well as importing one Module into multiple Namespaces to share private data between them.

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

Jam also implements a few convienience functions designed to be used for ordinary scripts.

Jam.exec() Loads and executes JavaScript files into the head tag of the document. They are executed in the order specified.
```javascript
Jam.exec("randomfile.js", basepath, callback);
Jam.exec(["randomfile1.js", "randomfile2.js", "randomfile3.js"], callback);
```

Jam.exec() Loads JavaScript files into the head tag of the document but DOES NOT execute them. They are loaded in the order specified.
```javascript
Jam.exec("randomfile.js", basepath, callback);
// Or
Jam.exec(["randomfile1.js", "randomfile2.js", "randomfile3.js"], callback);
```

They can be executed on demand with:
```javascript
var script = Jam.getScript("filepath.js");
script.exec(handler);
```

Lastly Jam implements an extend() method.  This is a simple shim designed to allow static inheritance declarations using __proto__, that are natively implemented by Mozilla & Webkit. module.export() automatically checks and extends exported module symbols, but it can also be called statically for use in IE and Opera on non-module objects:
```javascript
var subclass = {
	__proto__ : superclass
}

Jam.extend(subclass);
```