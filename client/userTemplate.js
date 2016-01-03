Template.userTemplate.helpers({
    screenIs: function(state){
	var myUser = Meteor.user();
	if (myUser && (myUser.username==='adm'))
	    return ('admin'===state);
	return (myUser.screen===state);
    }
});


