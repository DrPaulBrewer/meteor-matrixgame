// fulfill and log requests by userId to switch screens between game and wait

Meteor.methods({
    requestScreen: function(req){ 
	if (this.userId){
	    var thisUser = Meteor.users.findOne({_id: this.userId}, {fields: {screen: 1, username: 1}});
	    if (thisUser && thisUser.screen){ 
		var allowed = ( (thisUser.screen==='wait' && req==='game') ||
				(thisUser.screen==='game' && req==='wait') );
		if (allowed){
		    Meteor.users.update({_id: this.userId}, {$set: { screen: req }});
		} 
		
	    }
	}
    }
});
