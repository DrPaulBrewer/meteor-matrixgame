lastBatchOfGames = [];

countStrategyCounts = 0;

Tracker.autorun(function(){
    var myUser = Meteor.user();
    if (!myUser || !myUser.isAdmin) return;

    Meteor.setInterval(function(){
	if (Session.get('allGamesTimeEnds')){
	    Meteor.call('strategyCounts', Session.get('allGamesTimeEnds'), function(e,d){
		d.forEach(function(x){
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

