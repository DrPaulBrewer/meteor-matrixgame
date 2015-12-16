lastBatchOfGames = [];

Tracker.autorun(function(){
    'use strict';
    var myUser = Meteor.user();
    if (myUser && myUser.isAdmin){
	var lastGameEnds = allGamesTimeEnds(); 
	myGame = Games.findOne({timeEnds: lastGameEnds});
	Session.set('gameUpdated', +new Date());
    }
});

Template.adminWatchGame.helpers({
    countMoves: function(r,c){
	return Games.find({timeEnds: allGamesTimeEnds(),
		    row: r,
		    col: c
		   }, {fields: {_id: 1}}).count();
    }
});
