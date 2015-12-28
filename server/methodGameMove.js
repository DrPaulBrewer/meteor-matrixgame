/* globals Games,gameCache */
/* updateLag:true */

updateLag = 0;

Meteor.methods({
    getLag: function(){
	return updateLag;
    },

    gameMove: function(gameId, dim, choiceIndex){
	"use strict";
	var ts = +new Date();
	var game = gameCache[gameId];
	if (choiceIndex < 0) return;
	if (!game || (ts>game.timeEnds)) return;
	if ((dim!=='row') && (dim!=='col'))
	    throw new Meteor.Error("Invalid","dimname must be 'row' or 'col'");
	if (dim==='row'){
	    if (game.rowUserId !== this.userId) return;
	    if (game.rownames.length <= choiceIndex) return;
	    Meteor.setTimeout(function(){
		Games.update(gameId,
			     {$set: {
				 timeRow: ts,
				 row: choiceIndex,
			     },
			      $push: {
				  moves: [ts,0,choiceIndex]
			      }
			     });
		updateLag = 0.8*updateLag+0.2*(+new Date()-ts);
	    }, 20);
	}
	if (dim==='col'){
	    if (game.colUserId !== this.userId) return;
	    if (game.colnames.length <= choiceIndex) return;
	    Meteor.setTimeout(function(){
		Games.update(gameId,
			     {$set: {
				 timeCol: ts,
				 col: choiceIndex,
			     },
			      $push: {
				  moves: [ts, 1, choiceIndex]
			      }
			     });
		updateLag = 0.8*updateLag+0.2*(+new Date()-ts);
	    }, 20);
	}
    }
});
