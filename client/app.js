Matrices = new Mongo.Collection('matrices');
Games = new Mongo.Collection('games');
Experiments = new Mongo.Collection('experiments');
Earnings = new Mongo.Collection('earnings');
RollCall = new Mongo.Collection('rollcall');

Tracker.autorun(function(){
    if (Meteor.userId()){
	Meteor.subscribe('myuserdata');
	Meteor.subscribe('myrowgamedata');
	Meteor.subscribe('mycolgamedata');
    }
});

    
