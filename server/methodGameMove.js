/* globals Games */

Meteor.methods({
    gameMove: function(gameId, dim, choiceIndex){
	var ts = +new Date();
	if ((dim!=='row') && (dim!=='col'))
	    throw new Meteor.Error("Invalid","dimname must be 'row' or 'col'");
	var myGame = Games.findOne(gameId,{ 
	    fields: {
		moves: 0
	    }
	});
	if (!myGame || (ts>myGame.timeEnds))
	    throw new Meteor.Error("Ended", "game has ended or does not exist");
	if (dim==='row'){
	    if (myGame.rowUserId!==this.userId)
		throw new Meteor.Error("Forbidden", "unauthorized move by userId "+this.userId+" in game "+gameId);
	    if ((choiceIndex < 0) || (choiceIndex >= myGame.rownames.length))
		throw new Meteor.Error("Invalid", "choiceIndex invalid");
	    if ( myGame.timeRow && myGame.timeThrottle && (ts < (myGame.timeRow+myGame.timeThrottle))){
		console.log('throttled rapid row movement by userid: '+this.userId);
		throw new Meteor.Error("Throttled","Do not click so fast");
	    }
	    Games.update({_id: gameId},
			 {$set: {
			     timeRow: ts,
			     row: choiceIndex,
			 },
			  $push: {
			      moves: [ts,0,choiceIndex]
			  }
			 }, 
			 function(){});
	} 
	if (dim==='col'){
	    if (myGame.colUserId!==this.userId)
		throw new Meteor.Error("Forbidden", "unauthorized move by userId "+this.userId+" in game "+gameId);
	    if ((choiceIndex < 0) || (choiceIndex >= myGame.colnames.length))
		throw new Meteor.Error("Invalid", "choiceIndex invalid");
	    if ( myGame.timeCol && myGame.timeThrottle && (ts < (myGame.timeCol+myGame.timeThrottle))){
		console.log('throttled rapid col movement by userid: '+this.userId);
		throw new Meteor.Error("Throttled","Do not click so fast");
	    }
	    Games.update({_id: gameId},
			 {$set: {
			     timeCol: ts,
			     col: choiceIndex,
			 },
			  $push: {
			      moves: [ts, 1, choiceIndex]
			  }
			 }, function(){} );
	}
    }
});
