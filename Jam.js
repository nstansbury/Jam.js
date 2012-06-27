/* ***** BEGIN LICENSE BLOCK *****
* Version: MPL 1.1/GPL 2.0/LGPL 2.1
*
* The contents of this file are subject to the Mozilla Public License Version
* 1.1 (the "License"); you may not use this file except in compliance with
* the License. You may obtain a copy of the License at
* http://www.mozilla.org/MPL/
*
* Software distributed under the License is distributed on an "AS IS" basis,
* WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
* for the specific language governing rights and limitations under the
* License.
*
* The Original Code is JamJs - JavaScript Asynchrous Module Loader.
*
* The Initial Developer of the Original Code is
* Neil Stansbury <neil@neilstansbury.com>.
* Portions created by the Initial Developer are Copyright (C) 2012
* the Initial Developer. All Rights Reserved.
*
* Contributor(s):
*
* Alternatively, the contents of this file may be used under the terms of
* either the GNU General Public License Version 2 or later (the "GPL"), or
* the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
* in which case the provisions of the GPL or the LGPL are applicable instead
* of those above. If you wish to allow use of your version of this file only
* under the terms of either the GPL or the LGPL, and not to allow others to
* use your version of this file under the terms of the MPL, indicate your
* decision by deleting the provisions above and replace them with the notice
* and other provisions required by the GPL or the LGPL. If you do not delete
* the provisions above, a recipient may use your version of this file under
* the terms of any one of the MPL, the GPL or the LGPL.
*
* ***** END LICENSE BLOCK ***** */


"use strict";
/** @namespace */
var Jam = {
	__scripts : {},
	
	defaultPath : "",
	
	/** @param {Function} callback */
	/** @param {Array} args */
	/** @param {Object} context */
	/** @returns {Function} */
	asyncCallback : function(callback, args, context)	{
		function delegate(args)	{
			callback.apply(context, args);
		}
		setTimeout(delegate, 0, args)
	},
	
	/** @param {Number} asyncCount */
	/** @param {Function} callback */
	/** @returns {Function} */
	/** @constructor */
	/** @private */
	__getAsyncHandler : function(asyncCount, callback)	{
		var count = 0;
		return function handler(script)	{
			count++;
			if(count == asyncCount)	{
				if(callback)	{
					setTimeout(callback, 0);
				}
			}
		}
	},
	
	/** @param {String} namespace */
	/** @returns {Object} */
	/** @protected */
	_getNamespace : function(namespace)		{
		var ns = window;
		var components = namespace.split(".");
		for( var i = 0; i < components.length; i++ )	{
			var comp = components[ i ];
			if( ns[ comp ] == undefined )	{
				ns[ comp ] = {};
			}
			ns = ns[ comp ];
		}
		return ns;
	},
	
	/** @description This function allows us to use the static '__proto__' (or just 'proto' in ES3) declaration for inheritance on Opera & IE
	/** @param {Object} root */
	/** @returns {Void} */
	Extend : function(root)	{
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
		for(var name in root)	{
			var object = root[ name ];
			if(typeof(object) == "function" && object.prototype != undefined && object.prototype.__proto__ != undefined)		{	// Constructor.prototype.__proto__
				console.log("Prototyping Object: " +name);
				prototypeObject(object.prototype.__proto__, object.prototype);
			}
			else if(typeof(object) == "object" && object.__proto__ != undefined)		{		// Object.__proto__
				console.log("Prototyping Object: " +name);
				prototypeObject(object.__proto__, object);
			}
		}
	},
	
	/** @returns {String} */
	getBaseUrl : function()	{
		if(!this.defaultPath)	{
			// We should check for <head><base/></head> element
			var fileparts = window.location.href.split("/");
			fileparts.pop();
			this.defaultPath = fileparts.join("/") +"/";
		}
		return this.defaultPath;
	},
	
	/** @param {String} filepath */
	/** @param {Array|String} [filename] */
	/** @returns {Array|Script} */
	getScript : function(filepath, filename)	{
		if(this.__scripts[ filepath ] == undefined)	{
			return null;
		}
		var scripts = this.__scripts[ filepath ];
		if(filename)	{
			for(var i = 0; i < scripts.length; i++)	{
				if(scripts[ i ].getName() == filename)	{
					return base[ i ];
				}
			}
			return null;
		}
		return scripts;
	},
	
	/** @param {Jam.Script} script */
	/** @returns {Void} */
	/** @protected */
	_addScript : function(script)	{		
		if(this.getScript(script.getParent(), script.getName())) 	{
			return;	// Already added
		}
		
		var head = document.getElementsByTagName("head")[0];
		head.appendChild(script.getElement());
		
		var filepath = script.getParent();
		if(this.__scripts[ filepath ] == undefined)	{
			this.__scripts[ filepath ] = [];
		}
		this.__scripts[ filepath ].push(script);
	},
	
	/** @description Load the specified scripts asynchrously without executing them */
	/** @param {Array|String} filename */
	/** @param {String} [basepath] */
	/** @param {Function} [onLoadListener] */
	/** @returns {Void} */
	Load : function(filename, basepath, onLoadListener)	{
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
		var handler = Jam.__getAsyncHandler(loadCount, onLoadListener);
		
		for(var i = 0; i < loadCount; i++)	{
			var script = new Jam.Script(basepath +filename[ i ]);
			script.load(handler);
		}
	},
	
	/** @description Execute the specified scripts in the order specified */
	/** @param {Array|String} filename */
	/** @param {String} [basepath] */
	/** @param {Function} [onExecListener] */
	/** @param {Function} [onExecError] */
	/** @returns {Void} */
	Exec : function(filename, basepath, onExecListener, onExecError)	{
		if(typeof(basepath) == "function")	{		// Basepath has not been specified
			if(typeof(onExecListener) == "function")	{
				onExecError = onExecListener;
			}
			onExecListener = basepath;
			basepath = undefined;
		}
		
		if(typeof(filename) == "string")	{
			var fileparts = filename.split("/");
			if(fileparts.length > 1)	{
				filename = [fileparts[fileparts.length -1]];
				fileparts.pop();
				var path  = fileparts.join("/") +"/";
				var re = new RegExp( this.getBaseUrl(), "gim");	// Ensure a partial path doesn't duplicate a basepath
				path = path.replace(re, "");
				basepath = (basepath == undefined) ? this.getBaseUrl() + path : basepath + path;
			}
			else {
				filename = [filename];
				if(basepath == undefined)	{
					basepath = this.getBaseUrl();
				}
			}
		}
		
		var loadCount = filename.length;
		var handler = Jam.__getAsyncHandler(loadCount, onExecListener);
		
		for(var i = 0; i < loadCount; i++)	{
			var script = Jam.getScript(basepath, filename[ i ]);
			if(script)	{
				if(script.getElement().src)	{
					continue;	
				}
			}
			else {
				script = new Jam.Script(basepath +filename[ i ]);		
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
	
	/** @description Import and execute the specified scripts into a namespace */
	/** @param {Array|String} namespace */
	/** @param {Array|String} [basepath] */
	/** @param {Function|String} [onImportListener] */
	/** @returns {Void} */
	Import : function(namespace, basepath, onImportListener)	{
		if(typeof(namespace) == "string")	{
			namespace = [namespace];
		}
		if(typeof(basepath) == "function")	{
			onImportListener = basepath;
			basepath = undefined;
		}
		if(basepath == undefined)	{
			basepath = this.getBaseUrl();
		}
		
		var importCount = namespace.length;
		
		var files = [];
		var objects = []
		for(var i = 0; i < importCount; i++)	{
			objects.push(this._getNamespace(namespace[ i ]));
			files.push(namespace[ i ] +".js");
		}
		
		function onImport()	{
			for(var i = 0; i < importCount; i++)	{
				Jam.Extend(objects[ i ]);
			}
			onImportListener();
		}
		
		this.Exec(files, basepath, onImport);
	}
}

/** @param {String} url */
/** @param {String} [type] */
/** @constructor */
Jam.Script = function(url, type)	{
	this.__url = url;
	this.__size = -1;
	this.__isLoaded = false;
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
	getParent : function()	{
		var delim = this.__url.lastIndexOf("/");
		return this.__url.slice(0, delim);
	},
	
	/** @returns {String} */
	getUrl : function()	{
		return this.__url;
	},
	
	/** @returns {String} */
	getName : function()	{
		var delim = this.__url.lastIndexOf("/");
		return this.__url.slice(delim+1);
	},
	
	/** @returns {Number} */
	getSize : function()	{
		return this.__size;
	},
	
	/** @param {Function} [onLoadListener] */
	/** @returns {Void} */
	load : function(onLoadListener)	{
		Jam._addScript(this);
		//var script = this;
		//script.__isLoaded = true;
	},
	
	/** @param {Function} [onExecListener] */
	/** @returns {Void} */
	exec : function(onExecListener)	{
		var script = this;
		function onload()	{
			script.__isLoaded = true;
			onExecListener(script);
		}
		var elem = this.getElement();
		if(elem.addEventListener) {
			elem.addEventListener("load", onload, false);
		}
		else if(elem.readyState) {
			elem.onreadystatechange = function()	{
				if(this.readyState == "complete" || this.readyState == "loaded")		{
					onload();
				}
			};
		}
		elem.src = this.getUrl();
		Jam._addScript(this);
	},
	
	/** @returns {Boolean} */
	isLoaded : function()	{
		return this.__isLoaded;
	}
}
	