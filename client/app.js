Tracker.autorun(function(){
    if (Meteor.userId()){
	Meteor.subscribe('myuserdata');
	Meteor.subscribe('myrowgamedata');
	Meteor.subscribe('mycolgamedata');
    }
});

    
