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
    var allgames = Games.find({});
    var rollcall = RollCall.find({});
    return [allusers, allgames, rollcall];
});

// define adminMinimal as omitting game move stack, but keeping current move

Meteor.publish("adminMinimal", function(){
    "use strict";
    if (this.userId !== adminId) return;
    
    var allusers = Meteor.users.find({});
    var allgames = Games.find({}, {fields: {moves: 0}});
    var rollcall = RollCall.find({});
    return [allusers, allgames, rollcall];
});

    
