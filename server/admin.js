// On server start, set up the adm/adm account, force logout old adm

/* globals adminId:true */
/* globals Games,RollCall */


adminId=0;

var createAdmin = function(){
    var password = process.env.password;
    if (!password){
	password = 'adm';
    }
    console.log('adm password: '+password);
    var id = Accounts.createUser({username: 'adm'});
    if (!id) throw new Meteor.Error("Fatal","Unable to create adm id");
    Accounts.setPassword(id, password);
    Meteor.users.update(id, {$set: {screen: 'admin'}});    
    return id;
};

Meteor.startup(function(){
    "use strict";
    // adminId is an intentional global exported from here
    //    for use in server-side publish functions later
    var adminUser = Accounts.findUserByUsername('adm');
    if (adminUser && adminUser._id){
	adminId = adminUser._id;
	Meteor.users.update(adminId, {$set: {screen: 'admin'}});    
    } else {
	adminId = createAdmin();
    }
});

// define adminFull as pretty much everything

Meteor.publish("adminFull", function(){ 
    "use strict";
    if (this.userId !== adminId) return;
    
    var allusers = Meteor.users.find({}, {fields: {services:0}});
    var games = Games.find({});
    var rollcall = RollCall.find({});
    return [allusers, games, rollcall];
});

// define adminMinimal as omitting game move stack, but keeping current move

Meteor.publish("adminMinimal", function(){
    "use strict";
    if (this.userId !== adminId) return;    
    var allusers = Meteor.users.find({}, {fields: {services: 0}});
    var rollcall = RollCall.find({});
    return [allusers, rollcall];
});

Meteor.methods({
    strategyCounts: function(timeEnds){
	if (this.userId !== adminId) return;
	var aggPipeline = [
	    { $match: {timeEnds: timeEnds} },
	    { $project: { rowcol: { $concat: [
		{ $substr: ["$row", 0, 3] },
		  ",",
		{ $substr: ["$col", 0, 3] }
	    ] } , _id:0 } },
	    { $sort: {rowcol: 1}},
	    { $group: { _id: "$rowcol", count: { $sum: 1 } } }
	];
	return Games.aggregate(aggPipeline);
    },

    gamesAggregate: function(pipeline){
	if (this.userId !== adminId) return;
	return Games.aggregate(pipeline);
    },
    
    allGamesTimeEnds: function(after){
	"use strict";
	var last = Games.findOne({timeEnds: {$gt: after}}, {fields: {timeEnds:1}, sort: {timeEnds: -1}});
	if (!last) return 0;
	return last.timeEnds;
    },

    adminAbortGame: function(timeEnds){
	var ts = +new Date();
	if (this.userId !== adminId) return;
	Games.update({
	    timeEnds: timeEnds
	},{ $set: {
	    timeEnds: ts,
	    timeEndsOriginal: timeEnds,
	    aborted: 1
	}},{
	    multi: 1
	});
	Meteor.users.update({
	    screen: 'game'
	}, { 
	    $set:{ 
		headerTimerEnds: 0,
		screen: 'wait'
	    }},{
		multi:1
	});
	return ts;
    },

    adminSumFromChoices: function(timeEnds){
	if (this.userId !== adminId) return;
	var thisGame;
	var theseGames = Games.find({
	    timeEnds: timeEnds,
	    aborted: {$exists: false}
	},{
	    fields: {
		row: 1,
		col: 1,
		rowMatrix: 1,
		colMatrix: 1
	    }
	}).fetch();
	for(var i=0,l=theseGames.length,sum=0; i<l; ++i){
	    thisGame = theseGames[i];
	    sum += thisGame.rowMatrix[thisGame.row][thisGame.col];
	    sum += thisGame.colMatrix[thisGame.row][thisGame.col];
	}
	return sum;
    },
    
    adminFinishExperiment: function(){
	if (this.userId !== adminId) return;
	Meteor.users.update({screen: {$ne: 'admin'}},
			     {$set: { screen: 'done'}}, 
			     {multi:true});
    },

    adminResetDatabase: function(){
	if (this.userId !== adminId) return;
	Games.remove({});
	Meteor.users.update({screen: {$ne: 'admin'}},
			    {$set: { screen: 'wait'}}, 
			    {multi:true});
	
    },

    adminDeleteDatabase: function(){
	if (this.userId !== adminId) return;
	Games.remove({});
	Meteor.users.remove({});
	createAdmin();
    }

});

    
