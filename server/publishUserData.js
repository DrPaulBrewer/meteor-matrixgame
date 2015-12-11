Meteor.publish('myuserdata', function(){
    var userData =  Meteor.users.find({_id: this.userId});
    var currentExperiment = Experiments.find({'timeEnds': { $gt: +new Date() }}, 
					     { sort:{'timeBegins':-1}, 
					       limit:1
					     });
    var earnData = Earnings.find({userId: this.userId});
    return [userData, currentExperiment, earnData];
});


Meteor.publish('myrowgamedata', function(){
    var gameData = Games.find({visible: 1, rowUserId: this.userId},
			      {fields: { 'colUserId': 0 }});
    return gameData;
});

Meteor.publish('mycolgamedata', function(){
    var gameData = Games.find({visible: 1, colUserId: this.userId},
			      {fields: { 'rowUserId': 0 }});
    return gameData;
});


    
    

