/* globals Games,RollCall,adminId,gameFactorySpec,postGameEarnings */

/* globals gameCache:true */

gameCache = {};

Meteor.methods({
    startRollCall:function(timerEnds){
	"use strict";
	check(timerEnds, Number);
	if (this.userId !== adminId)
	    throw new Meteor.Error("Forbidden","only admin can call this function");
	if (timerEnds > ( +new Date() ) ){ 
	    // delete the records of the previous RollCall
	    RollCall.remove({});
	    // put all participants with some screen onto rollcall screen
	    Meteor.users.update({'screen': {$exists: true, $ne: 'admin'}},
				{ $set: {screen: 'rollcall',
					 headerTimerEnds: timerEnds}
				},
				{ multi: true }
				);
	}
    },

    endRollCall: function(){
	"use strict";
	// Note: this function does not delete the contents of RollCall, see startRollCall for that
	// puts all users still on rollcall screen back onto wait screen, clears headerTimer, and adds Strike
	if (this.userId !== adminId)
	    throw new Meteor.Error("Forbidden","only admin can call this function");
	Meteor.users.update({'screen': 'rollcall'},
			    { $set: {screen: 'wait'},
			      $unset: { headerTimerEnds: ''},
			      $inc: {strikes: 1}
			    },
			    {multi: true}
			   );
    },

    clickReadyButton: function(){
	"use strict";
	// move clicking user from rollcall screen to wait screen and reset user strikes to 0
	if (this.userId){
	    Meteor.users.update(
		{
		    _id: this.userId, 
		    screen:'rollcall'
		},
		{ 
		    $set: { screen: 'wait', strikes: 0 } 
		}
	    );
	    RollCall.upsert({userId: this.userId},
			   {$set: {userId: this.userId}});
	}
    },

    pairRollBeginExperiment: function(gameFactory){
	"use strict";
	// pull random pairs of users from RollCall and assign them a new matrix game
	// Games are constructed from the gameFactory parameter 
	if (this.userId !== adminId)
	    throw new Meteor.Error("Forbidden","only admin can call this function");
	check(gameFactory, Match.ObjectIncluding(gameFactorySpec));
	var roll = (RollCall
		    .find({})
		    .map(function(x){ return x.userId; })
		    );
	var pairs = [];
	var thisPair = [];
	var numpairs = Math.floor(roll.length/2);
	var j = 0; 
	var k = 0;
	var l = 0;
	var thisGame = {};
	for(var i=0; i<numpairs; ++i){ 
	    j = Math.floor(Random.fraction()*roll.length);
	    if (j===roll.length) j=0;
	    thisPair = [roll.splice(j,1)[0]];
	    k = roll.length;
	    while(k===roll.length){ 
		k = Math.floor(Random.fraction()*roll.length);
	    }
	    thisPair.push(roll.splice(k,1)[0]);
	    pairs.push(thisPair);
	}
	for(i=0; i<numpairs; ++i){ 
	    thisGame = Object.assign({},
				     {timeThrottle: 1000 },
				     gameFactory,
				     {rowUserId: pairs[i][0],
				      colUserId: pairs[i][1]
				     });
	    Games.insert(thisGame);
	    
	    for(j=0; j<2; ++j){ 
		Meteor.users.update({_id: pairs[i][j]},
				    {$set: {'screen': 'game',
					    'headerTimerEnds': thisGame.timeEnds
					   }
				    });
	    }
	}
	Meteor.setTimeout(postGameEarnings, (3000+gameFactory.timeEnds-(+new Date())));
	var gameList = Games.find({timeEnds: thisGame.timeEnds},{fields:{moves:0}}).fetch();
	gameCache = {};
	for(i=0,l=gameList.length;i<l;++i)
	    gameCache[gameList[i]._id] = gameList[i];
    }
});

