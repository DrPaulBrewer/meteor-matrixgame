Template.userTemplate.helpers({
    screenIs: function(state){ 
	return (Meteor.user().screen===state);
    }
});


