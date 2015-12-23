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
		    var r=0, c=0;
		    try { 
		    for(r=0;r<myGame.rownames.length; r++)
			for(c=0; c<myGame.colnames.length; c++)
			    Session.set('watcher'+r+','+c, 0);
		    } catch(e) {};
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
    },
    allGamesTimeEnds: function(){ 
	return new Date(Session.get('allGamesTimeEnds')).toString();
    }
});

