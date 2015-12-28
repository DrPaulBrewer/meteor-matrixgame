Template.doneTemplate.onRendered(function(){
    Meteor.setTimeout(function(){
	Meteor.logout();
    }, 5000);
});
