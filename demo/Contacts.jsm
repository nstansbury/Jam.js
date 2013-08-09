"use strict";

var EXPORTED_SYMBOLS = ["Person", "Company", "Group"];


function Contact(){
	
}
Contact.prototype = {
	toString : function(){
		throw "Not Implemented";
	}
}

function Person(firstname, lastname){
	this.__firstname = firstname;
	this.__lastname = lastname;
}
Person.prototype = {
	__proto__ : Contact.prototype,
	
	getFirstName : function(){
		return this.__firstname;
	},
	getLastName : function(){
		return this.__lastname;
	},
	toString : function(){
		return this.getFirstName() +" " +this.getLastName();
	}
}

function Company(companyname){
	this.__companyname = companyname;
}
Company.prototype = {
	__proto__ : Contact.prototype,
	
	getCompanyName : function(){
		return this.__companyname;
	},
	toString : function(){
		return this.getCompanyName();
	}
}


function Group(){

}
Group.prototype = {
	__proto__ : Contact.prototype,
	
	toString : function(){
		
	}
}
