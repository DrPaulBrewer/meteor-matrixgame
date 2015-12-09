Meteor.methods({
    setUserAttribute: function(userId, attribute, val){ 
	"use strict";
	var myUpdate = {};
	check(userId, String);
	check(attribute, String);
	myUpdate[attribute] = val;
	Meteor.users.update({'_id': userId}, {$set: myUpdate});
    }
});


