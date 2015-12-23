lastBatchOfGames = [];
countStrategyCounts = 0;
adminGameWatcher = 0;

adminWatch = Tracker.autorun(function(){
    var myUser = Meteor.user();
    if (!myUser || !myUser.isAdmin) return;
    if (!adminGameWatcher)
	adminGameWatcher = Meteor.setInterval(function(){
	    if (Session.get('allGamesTimeEnds')){
		Meteor.call('strategyCounts', Session.get('allGamesTimeEnds'), function(e,data){
		    data.forEach(function(x){
			Session.set('watcher'+x._id, x.count);
		    });
		    countStrategyCounts += 1;
		});
	    }
	}, 10000);
    
});
    
Template.adminWatchGame.helpers({
    countMoves: function(r,c){
	return Session.get('watcher'+r+','+c);
    }
});

