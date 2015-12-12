// claimedUserId is (and should be) ignored in favor of the users actual id in this.userId
// it is checked and a Meteor.Error thrown to help track any odd bugs around logging in

var checkUsers = function(claimedId, actualId){ 
    if (claimedId !== actualId)
	throw new Meteor.Error('Forbidden', 'blocked: user claiming to be '+claimedId+' actually '+actualId);
    return true;
}
    

Meteor.publish('myuserdata', function(claimedUserId){
    checkUsers(claimedUserId, this.userId);
    var userData =  Meteor.users.find({_id: this.userId});
    var currentExperiment = Experiments.find({'timeEnds': { $gt: +new Date() }}, 
					     { sort:{'timeBegins':-1}, 
					       limit:1
					     });
    var earnData = Earnings.find({userId: this.userId});
    return [userData, currentExperiment, earnData];
});


Meteor.publish('myrowgamedata', function(claimedUserId){
    checkUsers(claimedUserId, this.userId);
    var gameData = Games.find({visible: true, rowUserId: this.userId},
			      {fields: { 'colUserId': 0 }});
    return gameData;
});

Meteor.publish('mycolgamedata', function(claimedUserId){
    checkUsers(claimedUserId, this.userId);
    var gameData = Games.find({visible: true, colUserId: this.userId},
			      {fields: { 'rowUserId': 0 }});
    return gameData;
});


    
    

