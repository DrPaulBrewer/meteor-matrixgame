Tracker.autorun(function(){
    var myUser = Meteor.user();
    if (myUser && myUser.isAdmin){ 
	console.log("subscribing to adminsecrets");
	Meteor.subscribe("adminsecrets");
    }
});
