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
		rowMatrix:1,
		row:1,
		col:1
	    }}
	).fetch();
	myTotalEarnings += oldRowGames.reduce(
	    function(pval, game){
		try {
		    return pval+game.rowMatrix[game.row][game.col]
		} catch(e) {};
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
		    colMatrix:1,
		    row:1,
		    col:1
		}
	    }
	).fetch();
	myTotalEarnings += oldColGames.reduce(
	    function(pval, game){
		try {
		    return pval+game.colMatrix[game.row][game.col]
		} catch(e) {};
		return pval;
	    },
	    0
	);
    }
    return myTotalEarnings;
};
