"use strict";

/** @namespace */
var Jam = {
	/** @private */
	_global : this,
	
	/** @type Object */
	Modules : {},
	
	/** @type Object */
	Namespaces : {},
	
	/** @type Array */
	callStack : [],
	
	/** @param {String|String[]} namespace */
	/** @param {String|String[]} [module] */
	/** @param {Function} [callback] */
	/** @returns {Void} */
	import : function(namespace, module, callback){
		if(Array.isArray(namespace)){
			if(typeof module != "undefined" || "function"){		// Oh for multiple function signatures!
				throw "Modules cannot be specified with multiple Namespaces";
			}
			callback = module;
		}
		else if(Array.isArray(module)){	// 
			if(namespace == undefined){
				throw "Namespace must be specified to import Modules into";
			}
		}
		else if(typeof module != "string"){
			callback = module;
			module = namespace +".js";
		}
		
		if(callback){
			Jam.callStack.push(callback);
		}
		
		function onloaded(module){
			var last = Jam.callStack[Jam.callStack.length -1];
			if(last.namespace == namespace){
				import_module();
			}
		}
		
		function import_module(){
			var length = Jam.callStack.length;
			if(length > 0){
				var last = Jam.callStack[length -1];
				if(typeof last == "function"){
					last();
					Jam.callStack.pop();
				}
				else if(last.module.isLoaded()){
					var ns = Jam.Namespaces[last.namespace];
					if(ns.import(last.module) == 0x1){
						Jam.callStack.pop();
						import_module();
					}
				}
			}
		}
		/*
			Jam.hasNamespace();
			Jam.getNamespace();
			Jam.importNamespace();
			Jam.dropNamespace();
			Jam.hasModule();
			Jam.loadModule();
		*/
		
		if(Jam.Namespaces[namespace] == undefined ){
			Jam.Namespaces[namespace] = new Jam.Namespace(namespace);
			module = new Jam.Module(module);
			
			var loader = {
				namespace : namespace,
				module : module
			}
			this.callStack.push(loader);
			module.load(onloaded);
		}
	}
}

Jam.Loader = function(){
	
}


/** @constructor */
/** @param {String} url */
Jam.Module = function(url){
	this.__url = url;
	this.__isloaded = false;
}
Jam.Module.prototype = {
	/** @private */
	__src : "",
	
	/** @returns {String} */
	getUrl : function(){
		return this.__url
	},
	
	/** @returns {Boolean} */
	isLoaded : function(){
		return this.__isloaded;
	},
	
	/** @param {Function} onloaded */
	/** @returns {Void} */
	load : function(onloaded){
		var module = this;
		var httpRequest = new XMLHttpRequest();
		httpRequest.open("get", this.getUrl(), true);
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState === 4){
				console.log("# Module Loaded :: " +module.getUrl());
				module.__src = httpRequest.responseText;
				module.__isloaded = true;
				onloaded(module);
			}
		}
		httpRequest.send();
	},
	
	/** @param {Object} context */
	/** @param {String[]} [symbols] */
	/** @returns {Void} */
	export : function(context, symbols){
		var export_module = this.__src +'\nfunction export_symbols(){\
					for(var i = 0; i < EXPORTED_SYMBOLS.length; i++){\
						var symbol = EXPORTED_SYMBOLS[ i ];\
						context[ symbol ] = eval(symbol);\
					}\
				};\
				export_symbols();'
		var f = new Function("context", export_module);
		f.call(context, context);
	}
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
			var context = Jam._global;
			var path = this.getName().split(".");
			var len = path.length;
			for(var i = 0; i < len; i++)	{
				var name = path[ i ];
				if(context.hasOwnProperty(name) == false)	{
					context[ name ] = {};
				}
				context = context[ name ];
			}
			this.__context = context;
		}
		return this.__context;
	},
	
	/** @param {Jam.Module} module */
	/** @returns {Boolean} */
	hasModule : function(module){
		return this.__modules[module.getUrl()] ? true : false;
	},
	
	/** @param {Jam.Module} module */
	/** @returns {Integer} */
	import : function(module){
		console.log("# Importing Module into Namespace :: "+this.getName());
		try {
			module.export(this.getContext());
		}
		catch(e){
			// NB. We could throw on dependant Jam.import() calls but it means we have to load synchronously to allow for multiple imports() 
			//console.log("# Module Import Failed :: " +e);
			return 0x0;
		}
		console.log("# Module Imported");
		return 0x1;
	}
}
