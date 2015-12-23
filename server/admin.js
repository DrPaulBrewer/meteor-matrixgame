// On server start, set up the adm/adm account, force logout old adm

adminId=0;

Meteor.startup(function(){
    "use strict;"
    // adminId is an intentional global exported from here
    //    for use in server-side publish functions later
    var adminUser = Accounts.findUserByUsername('adm');
    if (!adminUser){
	console.log("creating new adm user");
	adminId = Accounts.createUser({username: 'adm'});
    } else {
	adminId = adminUser._id;
    }
    if (!adminId) console.log("Error: cant find or create adm id");
    check(adminId, String);
    Accounts.setPassword(adminId, 'adm', {logout: true});
    Meteor.users.update({_id: adminId}, {$set: {isAdmin: 1 }});
});

// define adminFull as pretty much everything

Meteor.publish("adminFull", function(){ 
    "use strict;"
    if (this.userId !== adminId) return;
    
    var allusers = Meteor.users.find({});
    var games = Games.find({});
    var rollcall = RollCall.find({});
    return [allusers, rollcall];
});

// define adminMinimal as omitting game move stack, but keeping current move

Meteor.publish("adminMinimal", function(){
    "use strict";
    if (this.userId !== adminId) return;
    
    var allusers = Meteor.users.find({});
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
    }
    
});

    
