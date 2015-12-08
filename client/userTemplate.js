Meteor.subscribe('userdata');

Template.userTemplate.helpers({
    statusIs: function(state){ 
	return (Meteor.user().status===state);
    }
});

Tracker.autorun(function(){
    console.log('user information:');
    console.log(Meteor.user());    
});
