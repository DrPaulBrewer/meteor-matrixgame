Meteor.methods({
    startRollCall:function(timerEnds){
	check(timerEnds, Number);
	if (timerEnds > ( +new Date() ) ){ 
	    // delete the records of the previous RollCall
	    RollCall.remove({});
	    // put all logged-in users onto rollcall screen
	    Meteor.users.update({'screen': {$exists: true}},
				{ $set: {screen: 'rollcall',
					 headerTimerEnds: timerEnds}
				});
	}
    },

    endRollCall: function(){
	Meteor.users.update({'screen': 'rollcall'},
			    { $set: {screen: 'wait'},
			      $unset: { headerTimerEnds: ''}
			    });
    },

    clickReadyButton: function(){
	if (this.userId){
	    Meteor.users.update(
		{
		    _id: this.userId
		},
		{ 
		    $set: { screen: 'wait' } 
		}
	    );
	    RollCall.upsert({userId: this.userId});
	}
    },

    pairRollBeginExperiment: function(){ 
	var roll = (RollCall
		    .find({})
		    .fetch()
		    .map(function(x){ return x.userId })
		    );
	
    }
});
