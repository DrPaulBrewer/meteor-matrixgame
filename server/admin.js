// On server start, set up the adm/adm account, force logout old adm

Meteor.startup(function(){
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

// define adminsecrets as pretty much everything

Meteor.publish("adminsecrets", function(){ 
    if (this.userId !== adminId){
	return this.error(
	    new Meteor.Error("Forbidden","non-admin client attempted to subscribe to adminsecrets")
	);
    }
    
    var allusers = Meteor.users.find({});
    var allgames = Games.find({});
    var allmatrices = Matrices.find({});
    var allsessions = Sessions.find({});
    return [allusers, allgames, allmatrices, allsessions];
});
