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
		if (game && game.rowEarn)
		    return pval+game.rowEarn;
		else
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
		if (game && game.colEarn)
		    return pval+game.colEarn;
		else
		    return pval;
	    },
	    0
	);
    }
    return myTotalEarnings;
};
