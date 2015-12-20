Tracker.autorun(function(){
    if (Meteor.userId()){ 
	var userAdminData = Meteor.users.findOne({_id: Meteor.userId(), isAdmin:1}, {fields: {isAdmin: 1}});
	if (userAdminData && userAdminData.isAdmin){
	    // login for admin
	    console.log("requesting admin data subscription");
	    // note: unauthorized calls are rejected on the server side
	    Meteor.subscribe("adminMinimal");
	} else {
	    // login for user
	    Meteor.subscribe('myuserdata', Meteor.userId());
	    Meteor.subscribe('myrowgamedata', Meteor.userId());
	    Meteor.subscribe('mycolgamedata', Meteor.userId());
	}
    }
});


