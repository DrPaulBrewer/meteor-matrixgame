/* globals totalEarnings, Games, myGame */

Tracker.autorun(function(){
    'use strict';
    // if a user is on the game screen but there is no current game then
    // wait 2 seconds to increase confidence and if still an issue ask for the wait screen
    var myUser = Meteor.user();
    if ( myUser && (myUser.screen==='game') && (Session.get('currentGameId')===0) )
	Meteor.setTimeout(function(){
	    if ( (Meteor.user().screen==='game') && (Session.get('currentGameId')===0) )
		Meteor.call('requestScreen', 'wait');
	}, 2000);	    
});

Tracker.autorun(function(){
    'use strict';
    // this Tracker updates a session var for earnings -- the headerTemplate may show this Session var in the header
    // totalEarnings is defined in /lib and available to both client and server
    // the + in +Chronos.currentTime() is a conversion from date to unix time in MS, a number
    var myTotalEarnings = totalEarnings( Meteor.userId(), +Chronos.currentTime() );
    Session.set('myTotalEarnings', myTotalEarnings);
});

Tracker.autorun(function(){
    "use strict";
    var myUserId = Meteor.userId();
    var unixTimeMS = +Chronos.currentTime();
    if (myUserId && unixTimeMS){ 
	// try to fetch the id of an active game including this userid
	var someGame = Games.findOne(
	    {
		timeBegins: {$lt: unixTimeMS},
		timeEnds: {$gt: unixTimeMS},
		$or: [
		    {'rowUserId': myUserId },
		    {'colUserId': myUserId }
		]
	    },
	    { fields: {_id: 1} }
	);
	// if there is an active game, set the currentGameId
	// if not, set currentGameId to 0
	if (someGame){
	    Session.set('currentGameId', someGame._id);
	} else {
	    if (Session.get('currentGameId')){ 
		// game expired or became inactive
		Session.set('currentGameId', 0);
	    }
	}
    }				
});

Tracker.autorun(function(){
    'use strict';
    // when Session var currentGameId changes, set global myGame to the game object
    // and keep myGame updated with any database changes.
    // if the users screen is not the game screen, request the game screen
    // finally, put a timeStamp in Session var 'gameUpdated'
    /* globals myGame:true */
    var gameId = Session.get('currentGameId');
    if (gameId){
	myGame = Games.findOne(gameId);
	if (Meteor.user().screen!=="game") 
	    Meteor.call('requestScreen', 'game');
    } else {
	myGame = {};
    }
    Session.set('gameUpdated', +new Date());
});


