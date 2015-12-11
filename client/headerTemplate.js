Template.headerTemplate.helpers({
    connectStatus: function(){
	var status = Meteor.status();
	if (status.reason)
	    return status.status+' reason:'+status.reason;
	return Meteor.status().status;
    },
    timeRemaining: function(){
	var myUser = Meteor.user();
	var unixTimeMS = +Chronos.currentTime();
	if (!myUser) return undefined;
	if (!myUser.headerTimerEnds) return undefined;
	var ends = myUser.headerTimerEnds;
	if (ends < unixTimeMS) return 0;
	return Math.round((ends-unixTimeMS)/1000);
    }
});

Template.headerTemplate.events({
    'click #signoffButton': function(event, template){ 
	Meteor.logout(function(e){ console.log('signoff by user'); }); 	
    }
});
