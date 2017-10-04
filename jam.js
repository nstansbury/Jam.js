"use strict";
/** @description A JavaScript Asynchronous Module loader */
/** @author Neil Stansbury <neil@neilstansbury.com> */


/** @namespace */
var Jam = {
    /** @version 1.2.6 */
	/** @type {string} */
	version : "1.2.6",

	/** @private */
	_global : this,

	/** @private */
	__namespaces : {},

	/** @private */
	__modules : {},

	/** @private */
	__scripts : {},

    /** @type {String} */
	__baseURL : "",

	/** @type {String} */
	defaultPath : "",

    /** @type {Boolean} */
    preventCache : false,

	/*
	* contentloaded.js
	*
	* Author: Diego Perini (diego.perini at gmail.com)
	* Summary: cross-browser wrapper for DOMContentLoaded
	* Updated: 20101020
	* License: MIT
	* Version: 1.2
	*
	* URL:
	* http://javascript.nwbox.com/ContentLoaded/
	* http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
	*
	*/

	/** @author iego Perini (diego.perini at gmail.com) Original Code contentLoad.js */
	/** @param {Window} win DOM Window reference */
	/** @returns{void} */
	init : function(win) {
		var done = false, top = true,

		doc = win.document, root = doc.documentElement,

		add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
		rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
		pre = doc.addEventListener ? '' : 'on';

		function loaded(){
			console.log("JavaScript Asynchronous Module & Namespace Loader v" +Jam.version +" :: Jam is ready...");
			Jam.onready();
		}

		function init(e) {
			if(e.type == 'readystatechange' && doc.readyState != 'complete'){
				return;
			}
			(e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
			if(!done && (done = true)){
				loaded.call(win, e.type || e);
			}
		}

		function poll(){
			try{
				root.doScroll('left');
			}
			catch(e){
				setTimeout(poll, 50);
				return;
			}
			init('poll');
		};

		if(doc.readyState == 'complete'){
			loaded.call(win, 'lazy');
		}
		else {
			if(doc.createEventObject && root.doScroll){
				try {
					top = !win.frameElement;
				}
				catch(e){}
				if(top){
					poll()
				};
			}
			doc[add](pre + 'DOMContentLoaded', init, false);
			doc[add](pre + 'readystatechange', init, false);
			win[add](pre + 'load', init, false);
		}
	},

	/** @returns {String} */
	getBaseUrl : function()	{
        if(this.__baseURL === ''){
            var base = document.querySelector('head > base');
            if(base && base.href != ''){
                this.__baseURL = base.href;
            }
            else {
                var fileparts = window.location.href.split("/");
        		fileparts.pop();
        		this.__baseURL = fileparts.join("/") +"/";
            }
        }
        return this.__baseURL;
	},

	/** @param {Function} callback */
	/** @param {Number} groupcount */
	/** @returns {Function} */
	/** @constructor */
	getGroupCallback : function(callback, groupcount)	{
		var count = 0;
		return function handler()	{
			count++;
			if(count == groupcount)	{
				if(callback)	{
					setTimeout(callback, 0);
				}
			}
		}
	},

	/** @param {String} url */
	/** @returns {Boolean} */
	hasModule : function(url){
		return this.__modules[url] != undefined ? true : false;
	},

	/** @param {String} url */
	/** @returns {Jam.Module} */
	getModule : function(url){
		return this.__modules[url] || null;
	},

	/** @param {String} url */
	/** @returns {Jam.Module} */
	addModule : function(url){
		var Mod = new Jam.Module(url);
		this.__modules[url] = Mod;
		return Mod;
	},

	/** @param {String} namespace */
	/** @returns {Boolean} */
	hasNamespace : function(namespace){
		return this.__namespaces[namespace] != undefined ? true : false;
	},

	/** @param {String} namespace */
	/** @returns {Jam.Namespace} */
	getNamespace : function(namespace){
		return this.__namespaces[namespace] || null;
	},

	/** @param {String} namespace */
	/** @returns {Jam.Namespace} */
	addNamespace : function(namespace){
		var Ns = new Jam.Namespace(namespace);
		this.__namespaces[namespace] = Ns;
		return Ns;
	},
	dropNamespace : function(){throw "Not Yet Implemented";},

	/** @param {String} url */
	/** @returns {Boolean} */
	hasScript : function(url){
		return this.__scripts[url] != undefined ? true : false;
	},

	/** @param {String} url */
	/** @returns {Jam.Script} */
	getScript : function(url)	{
		return this.__scripts[url] || null;
	},

	/** @param {String} url */
	/** @returns {Jam.Script} */
	addScript : function(url)	{
		var script = new Jam.Script(url);
		var head = document.getElementsByTagName("head")[0];
		head.appendChild(script.getElement());
		this.__scripts[url] = script;
		return script;
	},

	/** @returns {void} */
	onready : function(){},

	/** @description Define the named object context and return it */
	/** @param {String} name */
	/** @returns {Object} */
	define : function(name){
		var context = Jam._global;
		var path = name.split(".");
		var len = path.length;
		for(var i = 0; i < len; i++)	{
			var part = path[i];
			if(context.hasOwnProperty(part) == false)	{
				context[part] = {};
			}
			context = context[part];
		}
		context .__name__ = name;	// Ala Python
		return context;
	},

	/** @description Import the specified modules asynchronously into the Namespace. */
	/** @param {String|String[]} namespace */
	/** @param {String|String[]} [module] Fully qualified path to JavaScript file to import */
	/** @param {Function} [onImportHandler] */
	/** @returns {void} */
	imports : function(namespace, module, onImportHandler){
        if(typeof module == "function"){
            onImportHandler = module;
        }
		if(Array.isArray(namespace)){
            if(typeof module !== "undefined" && typeof module !== "function"){		// Oh for multiple function signatures!
                throw "Modules cannot be specified with multiple Namespaces";
            }
            this._importsWithNamespaceArray(namespace, onImportHandler);
			return;
		}
		else if(Array.isArray(module)){
			if(namespace == undefined){
				throw "Namespace must be specified to import Modules into";
			}
            this._importsWithModuleArray(namespace, module, onImportHandler);
            return;
		}
		else if(typeof module != "string"){
			module = Jam.getBaseUrl() +this.defaultPath +namespace +Jam.Module.defaultExtn;
            if(this.preventCache){
                //module += "?" +Math.random();
            }
		}

		if(Jam.hasNamespace(namespace)){
			var ns = Jam.getNamespace(namespace);
		}
		else {
			var ns = Jam.addNamespace(namespace);
		}

		if(Jam.hasModule(module)){
			var mod = Jam.getModule(module);
			if(ns.hasModule(mod)){
                if(onImportHandler){
                    setTimeout(onImportHandler, 0);
                }
				return;
			}
		}
		else {
			var mod = Jam.addModule(module);
		}

		ns.imports(mod, onImportHandler);
	},

    /** @description Import the specified modules asynchronously into the Namespace. */
    /** @param {String[]} namespaces */
    /** @param {Function} [onImportHandler] */
    /** @returns {void} */
    _importsWithNamespaceArray : function(namespaces, onImportHandler){
        if(onImportHandler){
            onImportHandler = Jam.getGroupCallback(onImportHandler, namespaces.length);
        }
        for(var i = 0; i < namespaces.length; i++){
            this.imports(namespaces[i], null, onImportHandler);
        }
    },

    /** @description Import the specified modules asynchronously into the Namespace. */
    /** @param {String} namespace */
    /** @param {String[]} modules Fully qualified path to JavaScript file to import */
    /** @param {Function} [onImportHandler] */
    /** @returns {void} */
    _importsWithModuleArray : function(namespace, modules, onImportHandler){
        if(onImportHandler){
            onImportHandler = Jam.getGroupCallback(onImportHandler, modules.length);
        }
        for(var i = 0; i < modules.length; i++){
            this.imports(namespaces, modules[i], onImportHandler);
        }
    },

	/** @description This function allows us to use the static '__proto__' declaration (or just 'proto' in ES3) declaration for inheritance on Opera & IE
	/** @param {Object} base */
	/** @returns {void} */
	extend : function(base)	{
		if(Object.__proto__ != undefined)	{
			return;
		}
		console.log("Extending Prototype");
		function prototypeObject(superClass, subClass)	{
			for(var property in superClass)	{
				if(subClass.hasOwnProperty(property) == false)	{	// Has subClass overridden superClass
                    var descriptor = Object.getOwnPropertyDescriptor(superClass, property);
                    if(descriptor){
                        Object.defineProperty(subClass, property, descriptor);
                    }
				}
			}
            if(superClass.hasOwnProperty("__proto__")){
                prototypeObject(superClass.__proto__, subClass);
            }
		}

        if(typeof(base) == "function" && base.prototype != undefined && base.prototype.__proto__ != undefined){ // Constructor.prototype.__proto__
            console.log("Jam :: Prototyping Constructor: " +base.name);
            prototypeObject(base.prototype.__proto__, base.prototype);
        }
        else if(typeof(base) == "object" && base.__proto__ != undefined){		                                // Object.__proto__
            for(var name in base)	{
                console.log("Jam :: Prototyping Object Literal: " +name);
                var object = base[name];
                prototypeObject(object.__proto__, object);
            }
        }
	},

	/** @description Load the specified scripts asynchronously without executing them */
	/** @param {Array|String} filename */
	/** @param {String} [basepath] */
	/** @param {Function} [onLoadListener] */
	/** @returns {void} */
	load : function(filename, basepath, onLoadListener)	{
		if(typeof(filename) == "string")	{
			filename = [filename];
		}
		if(typeof(basepath) == "function")	{
			onLoadListener = basepath;
			basepath = undefined;
		}
		if(basepath == undefined)	{
			basepath = this.getBaseUrl();
		}

		var loadCount = filename.length;
		var handler = Jam.getGroupCallback(onLoadListener, loadCount);

		for(var i = 0; i < loadCount; i++)	{
			if(this.hasScript(url)){
				var script = this.getScript(url);
			}
			else {
				var script = this.addScript(url);
			}
			if(script.getReadyState() < Jam.ReadyState.LOADING){
				script.load(handler);
			}
		}
	},

	/** @description Execute the specified scripts in the order specified */
	/** @param {Array|String} filename */
	/** @param {String} [basepath] */
	/** @param {Function} [onExecListener] */
	/** @param {Function} [onExecError] */
	/** @returns {void} */
	exec : function(filename, basepath, onExecListener, onExecError)	{
		if(typeof(basepath) == "function")	{		// Basepath has not been specified
			if(typeof(onExecListener) == "function")	{
				onExecError = onExecListener;
			}
			onExecListener = basepath;
			basepath = null;
		}

		if(typeof(filename) == "string")	{
			var fileparts = filename.split("/");
			if(fileparts.length > 1)	{
				filename = [fileparts[fileparts.length -1]];
				fileparts.pop();
				var path  = fileparts.join("/") +"/";
				var re = new RegExp( Jam.getBaseUrl(), "gim");	// Ensure a partial path doesn't duplicate a basepath
				path = path.replace(re, "");
				if(path.indexOf("//") != -1){
					basepath = path;
				}
				else {
					basepath = (basepath == null) ? this.getBaseUrl() + path : basepath + path;
				}

			}
			else {
				filename = [filename];
				if(basepath == undefined)	{
					basepath = this.getBaseUrl();
				}
			}
		}
		else {
			basepath = (basepath == null) ? "" : basepath;
		}

		var loadCount = filename.length;

		var scripts = [];
		for(var i = 0; i < loadCount; i++)	{
			var script = Jam.getScript(basepath +filename[i]);
			if(!script)	{
				script = Jam.addScript(basepath +filename[i]);
			}
			scripts.push(script);
		}

		function execScript(next) {
			if(scripts[next]){
				try {
					scripts[next].exec(loadCount > 1 ? true : false, execScript.bind(null, next +1));
				}
				catch(e) {
					if(onExecError)		{
						onExecError(script, e);
					}
				}
			}
			else {
				onExecListener();
			}
		}
		execScript(0);
	},

	/** @description Combine all the modules and dependancies into a single file */
	/** @param {Array|String} modules */
	/** @returns {String} */
	build : function(modules){throw "Not Yet Implemented";}
}


/** @constructor */
/** @param {String} namespace */
Jam.Namespace = function(namespace){
	this.__context = null;
	this.__name = namespace;
}
Jam.Namespace.prototype = {

	/** @private */
	__modules : {},

	/** @private */
	__listeners : {},

	/** @returns {String} */
	getName : function(){
		return this.__name;
	},

	/** @returns {Object} */
	getContext : function(){
		if(this.__context == undefined){
			this.__context = Jam.define(this.getName());
		}
		return this.__context;
	},

	/** @param {Jam.Module} module */
	/** @returns {Boolean} */
	hasModule : function(module){
		return this.__modules[module.getUrl()] ? true : false;
	},

	/** @param {Jam.Module} module */
	/** @param {Function} listener */
	/** @returns {void} */
	imports : function(module, listener){
		var ns = this;
		var url = module.getUrl();
		function onReady(){
			if(module.getReadyState() == Jam.ReadyState.READY){
				console.log("Jam :: Namespace Imported: "+ns.getName());
				ns.__modules[url] = module;
				if(ns.__listeners[url] == undefined){
					return;
				}
				for(var i = 0; i < ns.__listeners[url].length; i++){
					setTimeout(ns.__listeners[url][i], 0);	// Ensures exceptions thrown don't look like module exceptions
				}
				ns.__listeners[url] = null;
			}
		}
		if(this.hasModule(module)){
			if(listener){
				setTimeout(listener, 0);
			}
		}
		else {
			if(listener){
				(this.__listeners[url] != undefined) ? this.__listeners[url].push(listener) : this.__listeners[url] = [listener];
			}
			if(module.getReadyState() == Jam.ReadyState.EMPTY){
                module.onready = onReady;
            }
            module.exports(this.getContext());
		}
	}
}


/** @static */
Jam.ReadyState = {
	EMPTY : 0x0,
	LOADING : 0x1,
	STALLED : 0x2,
	ERROR : 0x3,
	LOADED : 0x4,	// Module code is loaded
	PARSED : 0x5,	// Module is parsed
    STATIC : 0x6,	// Module static module dependencies are exported
	READY : 0x7		// Module dependencies are exported
}



/** @constructor */
/** @param {String} url */
Jam.Module = function(url){
	this.__url = url;
}

/** @type {String} */
Jam.Module.defaultExtn = ".jsm";

/** @protected */
/** @type {Object[]} */
Jam.Module.exported = [];

/** @protected */
/** @param {Jam.Module} module */
/** @returns {Boolean} */
Jam.Module.hasDependency = function(module){
    var end = Jam.Module.exported.length -1;
	if(end >= 0){
		return Jam.Module.exported[end].module == module ? false : true;
	}
	return false;
}

/** @protected */
/** @returns {Function} */
Jam.Module.getDependency = function(){
    var end = Jam.Module.exported.length -1;
	if(end >= 0){
		return Jam.Module.exported[end].exports;
	}
	return null;
}

/** @protected */
/** @param {Jam.Module} module */
/** @returns {Boolean} */
Jam.Module.finalExport = function(module){
    var end = Jam.Module.exported.length -1;
    if(end >= 0){
        return Jam.Module.exported[end].module == module ? true : false;
    }
    return false;
}

/** @protected */
/** @param {Jam.Module} */
/** @returns {void} */
Jam.Module.beginExport = function(module, exporter){
    if(Jam.Module.finalExport(module) == false){
        //console.log("_____Jam :: Begin Export: " +module.getUrl());
        var item = {
            module : module,
            exports : exporter
        }
        Jam.Module.exported.push(item);
    }
}

/** @protected */
/** @param {Jam.Module} */
/** @returns {void} */
Jam.Module.endExport = function(module){
    if(Jam.Module.finalExport(module)){
        //console.log("_____Jam :: End exports: " +module.getUrl());
        Jam.Module.exported.pop();
    }
}

Jam.Module.prototype = {
	/** @private */
    __scope : function(){},

	/** @private */
	/** @type {Jam.ReadyState} */
	__status : Jam.ReadyState.EMPTY,

	/** @returns {String} */
	getUrl : function(){
		return this.__url
	},

	/** @returns {Jam.ReadyState} */
	getReadyState : function(){
		return this.__status;
	},

	/** @param {Function} loadHandler */
	/** @returns {void} */
	load : function(loadHandler){

		var module = this;
		if(window.XMLHttpRequest)	{
			var httpRequest = new XMLHttpRequest();
		}
		else if(window.XDomainRequest){
			var httpRequest = new XDomainRequest();
		}
		else if(window.ActiveXObject){
			var httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		}
		httpRequest.open("get", module.getUrl(), true);
		httpRequest.onreadystatechange = function(){
			switch(httpRequest.readyState){
				case 2:
					break;
				case 3:
					module.__status = Jam.ReadyState.STALLED;		// Need a timeout check here
					break;
				case 4:
					if(httpRequest.status != 200){
						module.__status = Jam.ReadyState.ERROR;
					}
					else if(httpRequest.responseText == ""){
						module.__status = Jam.ReadyState.EMPTY;
					}
					else {
						//console.log("Jam :: Module Loaded: " +module.getUrl());
						module.__status = Jam.ReadyState.LOADED;
						loadHandler.call(module, httpRequest.responseText);
					}
					break;
			}
		}
		httpRequest.send();
        this.__status = Jam.ReadyState.LOADING;
	},

	/** @param {String} src */
	/** @returns {void} */
	imports : function(src){
		var source = src +'\n\
				function export_symbols(){\
					if(symbols == undefined && (typeof EXPORTED_SYMBOLS === "undefined" || Array.isArray(EXPORTED_SYMBOLS) == false)){\
						symbols = [];\
					}\
					else {\
						symbols = symbols || EXPORTED_SYMBOLS;\
					}\
					for(var i = 0; i < symbols.length; i++){\
						var symbol = symbols[ i ];\
						try{\
							context[symbol] = eval(symbol);\
						}catch(e){\
							console.error("Error Exporting Symbol: `" +symbol +"` from " +context.__name__);\
							throw e;\
						}\
						Jam.extend(context[symbol]);\
					}\
				};\
				export_symbols();'
		try {
			//console.log("Jam :: Module Imported: " +this.getUrl());
			this.__scope = new Function("context", "symbols", source);
			this.__status = Jam.ReadyState.PARSED;
		}
		catch(e){	// Error in the module code
			this.__status = Jam.ReadyState.ERROR;
			throw "Jam Module Import Failed: " +this.getUrl() +" " +e;
		}
	},

	/** @param {Object} context */
	/** @param {String[]} [symbols] */
	/** @returns {void} */
	exports : function(context, symbols){

        if(context == null || typeof context != "object"){
            throw "Jam :: Invalid context specified for Module export";
        }
        if(symbols != null && (Array.isArray(symbols) == false || symbols.length == 0)){
            throw "Jam :: Invalid symbols specified for Module export";
        }

        var module = this;
		function onload(data){
            //console.log("_____Jam :: Module Loaded: " +module.getUrl());
            module.imports(data);
            module.exports(context, symbols);
		}

        function export_module(){
            //console.log("_____Jam :: Module Executing: " +module.getUrl() +" State: " +module.getReadyState());
            var error = "";
            try {
                if(module.getReadyState() < Jam.ReadyState.PARSED){
                    return;
                }
                else if(module.getReadyState() < Jam.ReadyState.STATIC){
                    module.__scope.call(context, context, symbols);
                    //console.log("_____Jam :: Module Executed: " +module.getUrl());
                }
            }
            catch(e){
                error = e;
            }
            if(Jam.Module.hasDependency(module)){
                //console.log("_____Jam :: Module Dependency:" +module.getUrl());
                return;
            }
            if(error){
				module.__status = Jam.ReadyState.ERROR;
				console.error("Jam Module Import Failed: " +module.getUrl() +" " +error +" Perhaps you have forgotton to import() a dependancy?");
				return;
            }

            Jam.Module.endExport(module);
            if(module.getReadyState() != Jam.ReadyState.READY){
                module.__status = Jam.ReadyState.READY;
                module.onready();
            }
            var dep = Jam.Module.getDependency();
            if(dep){
                dep();
            }
        }

        //console.log("_____Jam :: Exporting: " +this.getUrl());

        if(this.getReadyState() < Jam.ReadyState.READY){
            Jam.Module.beginExport(module, export_module);
        }

		if(this.getReadyState() < Jam.ReadyState.LOADING){
			this.load(onload);
		}
        else if(this.getReadyState() >= Jam.ReadyState.PARSED){
            setTimeout(export_module, 0);
        }
	},

	/** @returns {void} */
	onready : function(){}
}


/** @param {String} url */
/** @param {String} [type] */
/** @constructor */
Jam.Script = function(url, type)	{
	this.__url = url;
	this.__size = -1;
	this.__status = Jam.ReadyState.EMPTY;
	this.__script = document.createElement("script");
	this.__script.type = type || "text/javascript";
}
Jam.Script.prototype = {
	//__head : document.getElementsByTagName("head")[0],

	/** @returns {String} */
	getElement : function()	{
		return this.__script;
	},

	/** @returns {String} */
	getPath : function()	{
		var delim = this.__url.lastIndexOf("/");
		return this.__url.slice(0, delim);
	},

	/** @returns {String} */
	getUrl : function(){
		return this.__url;
	},

	/** @returns {String} */
	getName : function(){
		var delim = this.__url.lastIndexOf("/");
		return this.__url.slice(delim+1);
	},

	/** @returns {Number} */
	getSize : function(){
		return this.__size;
	},

	/** @returns {Jam.ReadyState} */
	getReadyState : function(){
		return this.__status;
	},

	/** @param {Function} [onLoadHandler] */
	/** @returns {void} */
	load : function(onLoadHandler){
		var script = this;

		if(window.XMLHttpRequest)	{
			var httpRequest = new XMLHttpRequest();
		}
		else if(window.XDomainRequest){
			var httpRequest = new XDomainRequest();
		}
		else if(window.ActiveXObject){
			var httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		}
		httpRequest.open("GET", this.getUrl(), true);
		httpRequest.onreadystatechange = function(){
			switch(httpRequest.readyState){
				case 2:
					break;
				case 3:
					script.__status = Jam.ReadyState.STALLED;		// Need a timeout check here
					break;
				case 4:
					if(httpRequest.status != 200){
						script.__status = Jam.ReadyState.ERROR;
					}
					else if(httpRequest.responseText == ""){
						script.__status = Jam.ReadyState.EMPTY;
					}
					else {
						script.__status = Jam.ReadyState.LOADED;
						onLoadHandler.call(script);
					}
					break;
			}
		}
		httpRequest.send();
        this.__status = Jam.ReadyState.LOADING;
	},

	/** @param {boolean} async This avoids causing needless CORs requests on non-dependant resources */
	/** @param {Function} [onExecHandler] */
	/** @returns {void} */
	exec : function(async, onExecHandler){
		var script = this;
		function execute(){
			var elem = script.getElement();
			if(elem.addEventListener){
				elem.addEventListener("load", onready, false);
			}
			else if(elem.readyState){
				elem.onreadystatechange = function(){
					if(elem.readyState == "complete" || elem.readyState == "loaded"){
						onready();
					}
				};
			}
			elem.src = script.getUrl();
		}

		function onready()	{
			script.__status = Jam.ReadyState.READY;
			if(onExecHandler){
				console.log("Jam :: Script Executed: "+script.getName());
				setTimeout(function(){
					onExecHandler(script);
				}, 0);
			}
		}

		if(this.getReadyState == Jam.ReadyState.LOADING){
			return;
		}
		else if(this.getReadyState == Jam.ReadyState.LOADED || async == false){
			execute();
		}
		else {
			this.load(execute);
			this.__status = Jam.ReadyState.LOADING;
		}
	}
}


/** @description Import the specified modules asynchronously into the Namespace. */
/** @param {String|String[]} namespace */
/** @param {String|String[]} [module] Fully qualified path to JavaScript file to import */
/** @param {Function} [onImportHandler] */
/** @returns {void} */
function imports(namespace, module, onImportHandler){
	Jam.imports.apply(Jam, arguments)
}



//** @see http://matt.scharley.me/2012/03/09/monkey-patch-name-ie.html */
if(Function.prototype.name === undefined && Object.defineProperty !== undefined) {
   Object.defineProperty(Function.prototype, 'name', {
       get: function() {
           var funcNameRegex = /function\s([^(]{1,})\(/;
           var results = (funcNameRegex).exec((this).toString());
           return (results && results.length > 1) ? results[1].trim() : "";
       },
       set: function(value) {}
   });
}


Jam.init(window);
