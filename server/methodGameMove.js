Meteor.methods({
    gameMove: function(gameId, dim, choiceIndex){
	check(gameId, String);
	check(dim, String);
	check(choiceIndex, Number);
	choiceIndex = Math.floor(choiceIndex);
	var myGame = Games.findOne({_id: gameId});
	if (!myGame)
	    throw new Meteor.Error("Invalid", "no such gameId: "+gameId);
	if ((dim!=='row') && (dim!=='col'))
	    throw new Meteor.Error("Invalid","dimname must be 'row' or 'col'");
	var ts = +new Date();
	if ( ts > myGame.timeEnds )
	    throw new Meteor.Error("Rejected", "timer has expired");
	if (dim==='row'){
	    if (myGame.rowUserId!==this.userId)
		throw new Meteor.Error("Forbidden", "unauthorized move by userId "+this.userId+" in game "+gameId);
	    if ((choiceIndex < 0) || (choiceIndex >= myGame.rownames.length))
		throw new Meteor.Error("Invalid", "choiceIndex invalid");
	    if (choiceIndex === myGame.row)
		return console.log('received duplicate row move from userId: '+this.userId);
	    if ( myGame.timeRow && myGame.timeThrottle && (ts < (myGame.timeRow+myGame.timeThrottle))){
		console.log('throttled rapid movement by userid: '+this.userId);
		throw new Meteor.Error("Throttled","Do not click so fast");
	    }
	    var last = [];
	    last[0] = ts;
	    last[1] = 0;
	    last[2] = choiceIndex;
	    Games.update({_id: gameId},
			 {$set: {
			     timeRow: ts,
			     row: choiceIndex,
			 },
			  $push: {
			      moves: last
			  }
			 });
	} 
	if (dim==='col'){
	    if (myGame.colUserId!==this.userId)
		throw new Meteor.Error("Forbidden", "unauthorized move by userId "+this.userId+" in game "+gameId);
	    if ((choiceIndex < 0) || (choiceIndex >= myGame.colnames.length))
		throw new Meteor.Error("Invalid", "choiceIndex invalid");
	    if (choiceIndex === myGame.col) 
		return console.log('received duplicate col move from userid: '+this.userId);
	    if ( myGame.timeCol && myGame.timeThrottle && (ts < (myGame.timeCol+myGame.timeThrottle))){
		console.log('throttled rapid movement by userid: '+this.userId);
		throw new Meteor.Error("Throttled","Do not click so fast. Server ignores moves faster than "+myGame.timeThrottle+" ms");
	    }
	    var last = [];
	    last[0] = ts;
	    last[1] = 1;
	    last[2] = choiceIndex;
	    Games.update({_id: gameId},
			 {$set: {
			     timeCol: ts,
			     col: choiceIndex,
			 },
			  $push: {
			      moves: last
			  }
			 });
	}
    }
});
