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
    return [userData];
});


Meteor.publish('myrowgamedata', function(claimedUserId){
    checkUsers(claimedUserId, this.userId);
    var gameData = Games.find({visible: true, rowUserId: this.userId},
			      {fields: { colUserId: 0, moves:0 }});
    return gameData;
});

Meteor.publish('mycolgamedata', function(claimedUserId){
    checkUsers(claimedUserId, this.userId);
    var gameData = Games.find({visible: true, colUserId: this.userId},
			      {fields: { rowUserId: 0, moves:0 }});
    return gameData;
});

Meteor.startup(function(){
    Games._ensureIndex({colUserId:1});
    Games._ensureIndex({rowUserId:1});
    Games._ensureIndex({timeEnds:1});
});
    
    

