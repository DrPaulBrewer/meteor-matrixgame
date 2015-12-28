/* globals postGameEarnings:true */
/* globals Games */

postGameEarnings = function(){
    "use strict";
    var theseGames = Games.find({
	timeEnds: {$lt: +new Date()},
	aborted: {$exists: false},
	rowEarn: {$exists: false},
	colEarn: {$exists: false}
    },{
	fields: {
	    _id: 1,
	    row: 1,
	    col: 1,
	    rowMatrix: 1,
	    colMatrix: 1
	}
    }).fetch();	    
    console.log("updating earnings for "+theseGames.length+" games");
    theseGames.forEach(function(thisGame){
	Games.update(thisGame._id, { $set: {
	    rowEarn: thisGame.rowMatrix[thisGame.row][thisGame.col],
	    colEarn: thisGame.colMatrix[thisGame.row][thisGame.col]
	}});
    }, function(){});
};
