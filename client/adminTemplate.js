Session.setDefault({
    rollcallToggle: false,
    rollcallTimeEnds: 0
});

var nextGame = {};

var checkGameFile = function(g){
    var ok = false;
    try {	
	ok = ( 
	    (Match.test(g, gameFileSpec)) &&
		(g.rowMatrix.length === g.colMatrix.length) &&
		(g.rowMatrix.length === g.rownames.length) &&
		(g.rowMatrix[0].length === g.colMatrix[0].length) &&
		(g.rowMatrix[0].length === g.colnames.length) &&
		( (g.row>=0) && (g.row<g.rownames.length) ) &&
		( (g.col>=0) && (g.col<g.colnames.length) )
	);
    } catch(e) {};
    return ok;
};

var allGamesTimeEnds = function(){ 
    var last =  Games.findOne({}, {fields: {timeEnds: 1}, sort: {timeEnds: -1}});
    if (!last) return 0;
    return last.timeEnds;
};
	       

Template.adminTemplate.helpers({
    goodFile: function(){ 		     
	return checkGameFile(nextGame);
    },
    countUsersByScreen: function(s){
	return Meteor.users.find({screen: s}).count();
    },
    countUsersWithStrikes: function(){
	return Meteor.users.find({strikes: {$gt: 0}}).count();
    }
    gameFinished: function(){ 
	return (allGamesTimeEnds() < +Chronos.currentTime());
    },
    lastGameCountdown: function(){
	var t = allGamesTimeEnds() - (+Chronos.currentTime());
	if (t<0) return 0;
	return t;
    },
    rollcallToggle: function(){
	return Session.get('rollcallToggle');
    },
    rollcallFinished: function(){
	return (
	    (Session.get('rollcallTimeEnds')) &&
		(Session.get('rollcallTimeEnds') < (+Chronos.currentTime()))
	);
    },
    rollcallCountdown: function(){ 
	if (Session.get('rollcallTimeEnds')){ 
	    return (Session.get('rollcallTimeEnds')-(+Chronos.currentTime()));
	} 
	return 0;
    },
    countRollCall: function(){
	return (RollCall.find({}).count());
    }
});
