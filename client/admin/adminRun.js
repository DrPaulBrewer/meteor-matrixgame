/* globals Admin,RollCall,myGame,nextGame */


// custom Meteor.methods we will need to call to do roll call and run the experiment
// startRollCall(timerEnds) -- clears user list, sets screens to rollcall with timer and yes/present button
// endRollCall() -- puts rollcall screen back to wait screen, clears headerTimer, and adds strike to nonresponder
// pairRollBeginExperiment(gameFilledIn) -- splits user list into pairs, inserts games into Game table


Template.adminRun.events({
    'click #adminRollCallButton': function(){
	'use strict';
	// choose file first
	if (!Session.get('adminGoodCSVFile'))
	    return console.log('no .csv file loaded. must Choose file before running roll call.');
	// you should not start a roll call with games running
	if (Session.get('allGamesTimeEnds')>(+new Date()))
	    return console.log("While matrix games as still running, you can not start a new roll call. Wait until those games are over or terminate them.");
	// if you have run a roll call, you need to use it. duplicates are potentially messy.
	if (Session.get('rollcallToggle')) 
	    return console.log('roll call begun. running a second rollcall is not recommended as this may confuse participants.  To do it anyway, refresh the admin browser window and that will clear the rollcall checkmark on the admin screen');
	try {
	    // this next function throws on invalid user input
	    var rcDuration = Admin.getDurationInputMS('#adminRollCallDurationInput');
	    var rcExpires = +new Date()+rcDuration;
	    Meteor.call('startRollCall', rcExpires, function(e){ 
		if(e){
		    console.log('startRollCall failed, error message follows');
		    console.log(e);
		} else {
		    // start roll call succeeded. 
		    // set the toggle so we get a green mark and do not accidentally start another one.
		    // and set the local expiration on the admin screen so we can watch it tick down
		    Session.set('rollcallToggle', true);
		    Session.set('rollcallTimeEnds', rcExpires);
		    // disable the GO button until the rollcall is finished
		    $('#adminGoButton').prop('disabled',1);
		    Meteor.setTimeout(function(){ 
			$('#adminGoButton').prop('disabled',0);
		    }, rcDuration);
		}
	    });
	} catch(e){ console.log(e); }	
    },

    'click #adminGoButton': function(){
	'use strict';
	if (!Session.get('rollcallToggle')) 
	    return console.log('need to run rollcall before starting next matrix game');
	if (Session.get('rollcallTimeEnds') > (+new Date()))
	    return console.log('need to wait until rollcall ends before starting next matrix game');
	if (!Session.get('adminGoodCSVFile'))
	    return console.log('can not GO: need confirmed good .csv file to configfure matrix game');
	if (RollCall.find({}).count()<2)
	    return console.log('can not GO: need at least 2 participants');
	// clear rollcallToggle and disable button to avoid multiple GO clicks
	$('#adminGoButton').prop('disabled',1);
	Session.set('rollcallToggle', false); 
	try {
	    // this next function throws on invalid user input
	    var gameDuration = Admin.getDurationInputMS('#adminGameDurationInput');
	    var now = +new Date();
	    // slackMS allows for some internet delay in communicating the start of the game. 2000 = 2 sec
	    var slackMS = 2000;
	    // every game needs these properties
	    var initGame = {
		visible: true,
		moves: []
	    };
	    // game also needs a begin and end time
	    var gameTimer = {
		timeBegins: now+slackMS,
		timeEnds: now+gameDuration+slackMS,
	    };
	    // assemble the game from various variables into var gameFactory
	    /* globals myGame:true */
	    myGame = Object.assign({}, nextGame, gameTimer, initGame);
	    // tell the server to call the pairRollBeginExperiment function that
	    // makes multiple games from gameFactory to pairs of participants randomly pulled from roll call
	    Meteor.call('pairRollBeginExperiment', myGame, function(e){
		if (e){
		    // there was an error running the server call to start the experiment
		    console.log(e); 
		    // set the rollcallToggle and button states so we can GO again
		    Session.set('rollcallToggle', true);
		    $('#adminGoButton').prop('disabled',false);
		} else {
		    // the server call to start the experiment succeeded
		    // The GO button was disabled earlier. make the admin run another roll call.
		    // end the previous rollcall and increment baseball strikes
		    Meteor.call('endRollCall', function(e){ if (e) console.log(e); });
		    // in 1 second update time Ends 
		    Meteor.setTimeout(Admin.updateEnds, 1000);
		    Session.set('gameUpdated', +new Date());
		}

	    });
	} catch(e){ console.log(e); }
    }
});
// Template...onRendered is called on admin screen refresh or new admin login
//    set the good .csv checkmark based on the goodness of existing data
//    clear the good roll call checkmark
//    disable the GO button until the file is loaded and/or rollcall run

var lastRendered = 0;

Template.adminRun.onRendered(function(){
    if (!this.custom){ 
	this.custom = true;
	var ts = +new Date();
	var diffts = ts - lastRendered;
	lastRendered = ts;
	if (diffts<1000)
	    return console.log('rapidly calling Template.adminRun.onRendered');
	Session.set('adminGoodCSVFile', Admin.checkGameSpec(nextGame));
	Session.set('rollcallToggle', false);
	$('#adminGoButton').prop('disabled', true);
	Admin.armFileInput();
	Meteor.setInterval(Admin.updateEnds, 10000);
	
	Tracker.autorun(function(){
	    'use strict';
	    // only enable the roll call button when there is a known good csv file
	    $('#adminRollCallButton').prop('disabled', 
					   (!Session.get('adminGoodCSVFile')));
	});
    }
});
