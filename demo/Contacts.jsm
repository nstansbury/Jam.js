"use strict";

var EXPORTED_SYMBOLS = ["Contact", "Person", "Company", "Group"];


var Contact = {
	toString : function(){
		throw "Not Implemented";
	}
}

function Person(firstname, lastname){
	this.__firstname = firstname;
	this.__lastname = lastname;
}
Person.prototype = {
	__proto__ : Contact,
	
	get firstName(){
		return this.__firstname;
	},
	get lastName(){
		return this.__lastname;
	},
	toString : function(){
		return this.firstName +" " +this.lastName;
	}
}

function Company(companyname){
	this.__companyname = companyname;
}
Company.prototype = {
	__proto__ : Contact,
	
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
	__proto__ : Contact,
	
	toString : function(){
		
	}
}
