/* globals Games,gameCache */
/* globals updateLag:true */

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
	    Games.update(gameId,
			 {$set: {
			     timeRow: ts,
			     row: choiceIndex,
			 },
			  $push: {
			      moves: [ts,0,choiceIndex]
			  }
			 }, function(){
			     updateLag = 0.9*updateLag+0.1*(+new Date()-ts);
			 });
	    
	}
	if (dim==='col'){
	    if (game.colUserId !== this.userId) return;
	    if (game.colnames.length <= choiceIndex) return;
	    Games.update(gameId,
			 {$set: {
			     timeCol: ts,
			     col: choiceIndex,
			 },
			  $push: {
			      moves: [ts, 1, choiceIndex]
			  }
			 }, function(){
			     updateLag = 0.9*updateLag+0.1*(+new Date()-ts);
			 });
	}
    }
});
