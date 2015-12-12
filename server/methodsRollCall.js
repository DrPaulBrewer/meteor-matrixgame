Meteor.methods({
    startRollCall:function(timerEnds){
	"use strict;"
	check(timerEnds, Number);
	if (this.userId !== adminId)
	    throw new Meteor.Error("Forbidden","only admin can call this function");
	if (timerEnds > ( +new Date() ) ){ 
	    // delete the records of the previous RollCall
	    RollCall.remove({});
	    // put all logged-in users onto rollcall screen
	    Meteor.users.update({'screen': {$exists: true}},
				{ $set: {screen: 'rollcall',
					 headerTimerEnds: timerEnds}
				},
				{ multi: true }
				);
	}
    },

    endRollCall: function(){
	"use strict;"
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
	"use strict;"
	if (this.userId){
	    Meteor.users.update(
		{
		    _id: this.userId
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
	"use strict;"
	if (this.userId !== adminId)
	    throw new Meteor.Error("Forbidden","only admin can call this function");
	check(gameFactory, Match.ObjectIncluding(gameFactorySpec));
	var roll = (RollCall
		    .find({})
		    .map(function(x){ return x.userId })
		    );
	var pairs = [];
	var thisPair = [];
	var numpairs = Math.floor(roll.length/2);
	var j = 0; 
	var k = 0;
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
    }
});

