/* globals Admin */

Tracker.autorun(function(){
    if (Meteor.userId()){ 
	var userAdminData = Meteor.users.findOne({_id: Meteor.userId(), isAdmin:1}, {fields: {isAdmin: 1}});
	if (userAdminData && userAdminData.isAdmin){
	    Admin.login();
	} else {
	    // login for user
	    Meteor.subscribe('myuserdata', Meteor.userId());
	    Meteor.subscribe('myrowgamedata', Meteor.userId());
	    Meteor.subscribe('mycolgamedata', Meteor.userId());
	}
    }
});


