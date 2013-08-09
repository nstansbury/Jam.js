"use strict";

Jam.import("Contacts");


var EXPORTED_SYMBOLS = ["Supplier"];


function supplier_toString(s){
	return "Supplier ID: " +s.getSupplierId() +" Name: " +s.getCompanyName();
}

function Supplier(supplierId, companyname){
	Contacts.Company.call(this, companyname);
	this.__supplierId = supplierId;
}
Supplier.prototype = {
	__proto__ : Contacts.Company.prototype,
	
	getSupplierId : function(){
		return this.__supplierId;
	},
	
	toString : function(){
		return supplier_toString(this);	// Show a private/protected accessor
	}
}
