"use strict";
/** @description A JavaScript Asynchronous Module loader */
/** @author Neil Stansbury <neil@neilstansbury.com> */
/** @version 1.0 */


/** @namespace */
var Jam = {
	/** @type Integer */
	version : 1.0,
	
	/** @private */
	_global : this,
	
	/** @private */
	__namespaces : {},
	
	/** @private */
	__modules : {},
	
	/** @private */
	__scripts : {},
	
	/** @type {String} */
	defaultPath : "",
	
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
	/** @returns{Void} */
	init : function(win) {
		var done = false, top = true,
		
		doc = win.document, root = doc.documentElement,
		
		add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
		rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
		pre = doc.addEventListener ? '' : 'on';
		
		function loaded(){
			Jam.defaultPath = Jam.getBaseUrl();
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
		// We should check for <head><base/></head> element
		var fileparts = window.location.href.split("/");
		fileparts.pop();
		return fileparts.join("/") +"/";
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
	
	/** @returns {Void} */
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
	
	/** @description Import the specified modules asynchrously into the Namespace. */
	/** @param {String|String[]} namespace */
	/** @param {String|String[]} [module] Fully qualified path to JavaScript file to import */
	/** @param {Function} [onImportHandler] */
	/** @returns {Void} */
	import : function(namespace, module, onImportHandler){
		if(Array.isArray(namespace)){
			if(typeof module !== "undefined" || "function"){		// Oh for multiple function signatures!
				throw "Modules cannot be specified with multiple Namespaces";
			}
			onImportHandler = module;
		}
		else if(Array.isArray(module)){ 
			if(namespace == undefined){
				throw "Namespace must be specified to import Modules into";
			}
		}
		else if(typeof module != "string"){
			onImportHandler = module;	// Module is optional param
			module = this.defaultPath +namespace +Jam.Module.defaultExtn;
		}
		
		if(Jam.hasNamespace(namespace)){
			var ns = Jam.getNamespace(namespace);
		}
		else {
			var ns = Jam.addNamespace(namespace);
		}
		
		if(Jam.hasModule(module)){
			var mod = Jam.getModule(module);
			if(ns.hasModule(mod) && onImportHandler){
				onImportHandler();
				return;
			}
		}
		else {
			var mod = Jam.addModule(module);
		}
		
		ns.import(mod, onImportHandler);
	},
	
	/** @description This function allows us to use the static '__proto__' declaration (or just 'proto' in ES3) declaration for inheritance on Opera & IE
	/** @param {Object} base */
	/** @returns {Void} */
	extend : function(base)	{
		if(Object.__proto__ != undefined)	{
			return;	
		}
		function prototypeObject(superClass, subClass)	{
			for(var key in superClass)	{
				if(subClass[ key ] == undefined)	{	// Has subClass overwritten superClass
					subClass[ key ] = superClass[ key ];
				}
			}
		}
		for(var name in base)	{
			var object = base[ name ];
			if(typeof(object) == "function" && object.prototype != undefined && object.prototype.__proto__ != undefined)		{	// Constructor.prototype.__proto__
				console.log("Jam :: Prototyping Object: " +name);
				prototypeObject(object.prototype.__proto__, object.prototype);
			}
			else if(typeof(object) == "object" && object.__proto__ != undefined)		{		// Object.__proto__
				console.log("Jam :: Prototyping Object: " +name);
				prototypeObject(object.__proto__, object);
			}
		}
	},
	
	/** @description Load the specified scripts asynchrously without executing them */
	/** @param {Array|String} filename */
	/** @param {String} [basepath] */
	/** @param {Function} [onLoadListener] */
	/** @returns {Void} */
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
	/** @returns {Void} */
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
		var handler = Jam.getGroupCallback(onExecListener, loadCount);
		
		for(var i = 0; i < loadCount; i++)	{
			var script = Jam.getScript(basepath +filename[i]);
			if(script)	{
				if(script.getReadyState() > Jam.ReadyState.EMPTY)	{
					continue;
				}
			}
			else {
				script = Jam.addScript(basepath +filename[i]);	
			}
			try {
				script.exec(handler);
			}
			catch(e)	{
				if(onExecError)		{
					onExecError(script, e);
				}
			}
			
		}
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
	/** @param {Function} handler */
	/** @returns {Integer} */
	import : function(module, handler){
		var ns = this
		function onReady(){
			if(module.getReadyState() == Jam.ReadyState.READY){
				console.log("Jam :: Namespace Imported: "+ns.getName());
				ns.__modules[module.getUrl()] = module;
				callback();	
			}
		}
		function callback(){
			if(handler){
				setTimeout(handler, 0);	// Because otherwise exceptions thrown look like module exceptions
			}
		}
		if(this.hasModule(module)){
			callback();
			return;
		}
		else {
			module.onready = onReady;
			module.export(this.getContext());	
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
	ENDED : 0x6,	// Module is exported
	WAITING : 0x7,	// Waiting for dependancies
	READY : 0x8		// Module dependancies are exported
}

/*	TBC
	Jam.Module should listen to module for completion events
	module should listen to Jam for READY event
*/

/** @constructor */
/** @param {String} url */
Jam.Module = function(url){
	this.__url = url;
}

/** @private */
/** @type {Jam.Module[]} */
Jam.Module.stack = [];

/** @type {String} */
Jam.Module.defaultExtn = ".jsm";


/** @param {Jam.Module} module */
/** @param {Function} execHandler */
/** @returns {Void} */
Jam.Module.exec = function(module, execHandler){
	function exec(){
		try {
			if(Jam.Module.isWaiting(module) == false){
				var item = Jam.Module.getCurrent();
				execHandler.call(module);
				if(Jam.Module.isWaiting(module)){
					module.__status = Jam.ReadyState.WAITING;
					item.handler = execHandler;
				}
				else {
					Jam.Module.stack.pop();					// Take this module off the stack
					module.onready();
					var next = Jam.Module.getCurrent();
					if(next){
						Jam.Module.exec(next.module, next.handler);	
					}
				}
			}
		}
		catch(e){
			if(Jam.Module.isWaiting(module)){			// Are we waiting for dependancies after executing the handler?
				module.__status = Jam.ReadyState.WAITING;
				item.handler = execHandler;
			}
			else {
				module.__status = Jam.ReadyState.ERROR;
				Jam.Module.stack = [];					// We should do better than this
				throw(module.getUrl() +": " +e);
			}
		}
	}
	setTimeout(exec, 0);
}

/** @param {Jam.Module} module */
/** @returns {Void} */
Jam.Module.isWaiting = function(module){
	if(Jam.Module.stack.length > 0){
		return Jam.Module.stack[Jam.Module.stack.length -1].module == module ? false : true;	
	}
	else {
		return false;
	}
}

/** @returns {Object} */
Jam.Module.getCurrent = function(){
	if(Jam.Module.stack.length > 0){
		return Jam.Module.stack[Jam.Module.stack.length -1];
	}
	else {
		return null;	
	}
}

/** @param {Jam.Module} module */
/** @returns {Void} */
Jam.Module.add = function(module, handler){
	var item = {
		module : module,
		handler : handler
	}
	Jam.Module.stack.push(item);
}

Jam.Module.prototype = {
	/** @private */
	__export : function(){},
	
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
	
	/** @param {Jam.Module} module */
	/** @param {Function} loadHandler */
	/** @returns {Void} */
	load : function(loadHandler){
		Jam.Module.add(this, null);
		
		var module = this;
		if(window.XMLHttpRequest)	{
			var httpRequest = new XMLHttpRequest();
		}
		else if(window.ActiveXObject)	{
			var httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		}
		httpRequest.open("get", module.getUrl(), true);
		httpRequest.onreadystatechange = function() {
			switch(httpRequest.readyState){
				case 2:
					module.__status = Jam.ReadyState.LOADING;
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
	},
	
	/** @param {String} src */
	/** @returns {Void} */
	import : function(src){
		var source = src +'\n\
				function export_symbols(){\
					if(symbols == undefined && (typeof EXPORTED_SYMBOLS === "undefined" || Array.isArray(EXPORTED_SYMBOLS) == false)){\
						symbols = [];\
					}\
					else {\
						symbols = symbols || EXPORTED_SYMBOLS;\
					}\
					for(var i = 0; i < symbols.length; i++){\
						var symbol = symbols[ i ];;\
						context[symbol] = eval(symbol);\
						Jam.extend(context[symbol]);\
					}\
				};\
				export_symbols();'
		try {
			//console.log("Jam :: Module Imported: " +this.getUrl());
			this.exec = new Function("context", "symbols", source);
			this.__status = Jam.ReadyState.PARSED;
		}
		catch(e){	// Error in the module code
			console.log("Jam :: Module Import Failed: " +this.getUrl());
			this.__status = Jam.ReadyState.ERROR;
			throw e;
		}
	},
	
	/** @param {Object} context */
	/** @param {String[]} [symbols] */
	/** @returns {Void} */
	export : function(context, symbols){
		
		function onLoadHandler(data){
			if(this.getReadyState() == Jam.ReadyState.LOADED){
				this.import(data);
				var module = this;
				setTimeout(function(){
					module.export(context, symbols);	
				}, 0);
			}
		}
		
		function onExecHandler(){
			if(this.getReadyState() >= Jam.ReadyState.PARSED){
				this.exec.call(context, context, symbols);
				//console.log("Jam :: Module Executed: " +this.getUrl());
				this.__status = Jam.ReadyState.READY;
			}
		}
		
		if(context == null || typeof context != "object"){
			throw "Jam :: Invalid context specified for Module export";
		}
		if(symbols != null && (Array.isArray(symbols) == false || symbols.length == 0)){
			throw "Jam :: Invalid symbols specified for Module export";
		}
		
		if(this.getReadyState() < Jam.ReadyState.LOADING){	
			this.load(onLoadHandler);
		}
		else if(this.getReadyState() >= Jam.ReadyState.PARSED){
			Jam.Module.exec(this, onExecHandler);
		}
	},
	
	/** @returns {Void} */
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
	/** @returns {Void} */
	load : function(onLoadHandler){
		
		//var script = this;
		//script.__isLoaded = true;
	},
	
	/** @param {Function} [onExecHandler] */
	/** @returns {Void} */
	exec : function(onExecHandler){
		var script = this;
		function onload()	{
			script.__status = Jam.ReadyState.READY;
			if(onExecHandler){
				console.log("Jam :: Script Executed: "+script.getName());
				setTimeout(function(){
					onExecHandler(script);
				}, 0);
			}
		}
		var elem = this.getElement();
		if(elem.addEventListener){
			elem.addEventListener("load", onload, false);
		}
		else if(elem.readyState){
			elem.onreadystatechange = function(){
				if(this.readyState == "complete" || this.readyState == "loaded"){
					onload();
				}
			};
		}
		this.__status = Jam.ReadyState.LOADING;
		elem.src = this.getUrl();
	}
}


Jam.init(window);
