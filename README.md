Jam.js
========
JavaScript Asynchronous Module Loader

A super light weight and easy to use Module and Namespace loader inspired by Mozilla's JavaScript code modules: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules

```javascript
imports("My.Qualified.Namespace");
```
The code in the namespace can now be referenced as a fully encapsulated object via dot notation:

```var thing = new My.Qualified.Namespace.exportedThing();```
Alternatively, import the namespace code to a specific object alias:

```javascript
var someVar = imports("My.Qualified.Namespace");
```
Or without using the global `imports()` function:

```javascript
Jam.imports("My.Qualified.Namespace");
```
Or importing specific modules into a namespace with a callback if required:

```javascript
Jam.imports("My.Qualified.Namespace", ["module1.jsm", "module2.jsm"], callback);
```

It is designed so that unlike other AMD/Module loading mechanisms:

* _No changes to your existing code or your coding style are required._
* _There is no need to wrap everything in closures, self executing functions or callbacks etc._
* _Module or namespace file paths references are never hard coded by the importer._
* _Anything not explicitly exported is always private to that module._

A 'module' is just simply defined as a single file, that by convention has a .jsm extension. Any number of 'modules' can be imported into the same Namespace.  This allows large namespaces to split code out into more traditional class files if required.

A module can itself import other Namespaces or Modules. When importing dependant namespaces or modules, Jam takes care of the asynchronicity, so that callbacks aren't required in module level code.

```javascript
// module1.jsm
"use strict";

// I can asynchronously import any number of other dependant Namespaces or Modules
// in a module too - and without requiring a callback
Jam.imports("My.Other.Namespace");

// Anything I don't export is private to the Module
var EXPORTED_SYMBOLS = ["Thing1", "Thing2"];

// I am only defined in this module scope NOT in the Global JavaScript scope
// I can only be accessed directly in this module, otherwise my full Namespace must be used
function Thing1(){
	// I can call any public/private/protected methods scoped to this module
	init();
}
Thing1.prototype = {
	// I can depend on other import()ed Namespaces for inheritance patterns
	// Jam.extend() automatically fixes __proto__ implementation for Opera & IE
	__proto__ : My.Other.Namespace.Thing4			
}

var Thing2 = {
	// "this" is always the Namespace context the module is exported into
	prototype : this.Thing1.prototype
}

function init(){
	// I'm not an exported symbol so remain private to the module, though I can be
	// called by public methods that are exported.
	// Notice how I don't need to be wrapped inside strange closures or anonymous
	// functions to achieve my privacy.  I look just like any other function.
}
```
By default, Jam.imports() assumes every namespace has a default module, of the namespace name with a .jsm extension. This allows a single namespace module to transparently import any required modules, without the caller being required to know in advance and specifiy the modules the Namespace depends on.

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

Jam.exec() loads and executes JavaScript files into the head tag of the document. They are executed in the order specified.
```javascript
Jam.exec("randomfile.js", basepath, callback);
// Or
Jam.exec(["randomfile1.js", "randomfile2.js", "randomfile3.js"], callback);
```

Jam.load() loads JavaScript files into browser cache. but DOES NOT execute them. They are loaded in the order specified.
```javascript
Jam.load("randomfile.js", basepath, callback);
// Or
Jam.load(["randomfile1.js", "randomfile2.js", "randomfile3.js"], callback);
```

They can be executed on demand with:
```javascript
var script = Jam.getScript("filepath.js");
script.exec(handler);
```

Lastly, Jam implements an extend() method.  This is a simple shim designed to allow static inheritance declarations using "__proto__", that are natively implemented by Mozilla & Webkit. module.export() automatically checks and extends exported module symbols, but it can also be called statically for use in IE and Opera on non-module objects:
```javascript
var subclass = {
	__proto__ : superclass
}

Jam.extend(subclass);
```
