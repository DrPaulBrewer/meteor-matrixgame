Template.rollcallTemplate.events({
    'click #readyButton': function(event, template){ 
	Meteor.call('clickReadyButton');
    }
});
