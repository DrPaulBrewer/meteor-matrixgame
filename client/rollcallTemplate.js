Template.rollcallTemplate.events({
    'click #readyButton': function(){ 
	Meteor.call('clickReadyButton');
    }
});
