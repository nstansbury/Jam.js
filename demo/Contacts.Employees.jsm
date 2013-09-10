"use strict";

var EXPORTED_SYMBOLS = ["Manager", "Worker"];

Jam.import("Contacts");


function Manager(firstname, lastname, employeeId){
	Contacts.Person.call(this, arguments);
	this.__employeeId = employeeId;
}
Manager.prototype = {
	__proto__ : Contacts.Person.prototype,

	getEmployeeId : function(){
		return this.__employeeId;
	}
}


function Worker(firstname, lastname, employeeId){
	Contacts.Person.call(this, firstname, lastname);
	this.__employeeId = employeeId;
}
Worker.prototype = {
	__proto__ : Contacts.Person.prototype,

	getEmployeeId : function(){
		return this.__employeeId;
	}
}