"use strict";

var EXPORTED_SYMBOLS = ["Manager", "Employee"];

imports("Contacts");


function Employee(firstname, lastname, employeeId){
	Contacts.Person.call(this, firstname, lastname);
	this.__employeeId = employeeId;
}
Employee.prototype = {
	__proto__ : Contacts.Person.prototype,

	getEmployeeId : function(){
		return this.__employeeId;
	}
}

function Manager(firstname, lastname, employeeId){
    Employee.apply(this, arguments);
}
Manager.prototype = {
	__proto__ : Employee.prototype,

	get position(){
        return "The Boss";
	}
}
