/* globals totalEarnings:true,Games */

totalEarnings = function(myUserId, unixTimeMS){
    'use strict';
    var myTotalEarnings = 0;
    if (myUserId && unixTimeMS){
	var oldRowGames = Games.find(
	    {
		timeEnds: {$lt: unixTimeMS},
		rowUserId: myUserId
	    },
	    { fields: {
		rowEarn:1
	    }}
	).fetch();
	myTotalEarnings += oldRowGames.reduce(
	    function(pval, game){
		try {
		    return pval+game.rowEarn;
		} catch(e) {}
		return pval;
	    }, 
	    0
	);
	var oldColGames = Games.find(
	    { 
		timeEnds: {$lt: unixTimeMS},
		colUserId: myUserId
	    },
	    {
		fields: {
		    colEarn: 1
		}
	    }
	).fetch();
	myTotalEarnings += oldColGames.reduce(
	    function(pval, game){
		try {
		    return pval+game.colEarn;
		} catch(e) {}
		return pval;
	    },
	    0
	);
    }
    return myTotalEarnings;
};
