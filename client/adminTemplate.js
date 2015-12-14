Session.setDefault({
    rollcallToggle: false,
    rollcallTimeEnds: 0
});

nextGame = {};

var checkGameSpec = function(g){
    "use strict";
    var ok = false;
    try {	
	ok = ( 
	    (Match.test(g, gameFileSpec)) &&
		(g.rownames.length) &&
		(g.colnames.length) &&
		(g.rowMatrix.length === g.colMatrix.length) &&
		(g.rowMatrix.length === g.rownames.length) &&
		(g.rowMatrix[0].length === g.colMatrix[0].length) &&
		(g.rowMatrix[0].length === g.colnames.length) &&
		( (g.row>=0) && (g.row<g.rownames.length) ) &&
		( (g.col>=0) && (g.col<g.colnames.length) )
	);
    } catch(e) {};
    return ok;
};

var toNextGame = function(next){
    "use strict";
    nextGame = {
	rowMatrix: [],
	colMatrix: [],
	rownames: [],
	colnames: [],
	row: 0,
	col: 0
    }
    var shared = this;
    if ((!shared) || (!shared.data) || (!shared.data.rows) || (shared.data.rows.length<6) || (shared.data.rows.length>2000) )
	throw "File REJECTED. This file does not look like a matrix game specification.   The chosen .csv file is missing rows or has too many rows (2000+) and does not seem like a matrix game specification similar to the example file provided.  ";
    var rows = shared.data.rows;
    var i;
    var mode = 'comment';
    console.log('.csv file dump follows');
    var needRowLog = false;
    if (console.table) 
	console.table(rows);
    else 
	needRowLog = true;
    rows.forEach(function(row){
	"use strict";
	try {
	    if (row && row.length){
		if (needRowLog) console.log(row.join(","));
		if (row[0] && row[0].length) mode = row[0].toLowerCase().trim();
		// do not try to extract data elements if the initial data cell is empty
		if ((row.length<2) || (row[1].toString().trim().length===0)) return;
		switch(mode){
		case 'rowmatrix':
		    nextGame.rowMatrix.push(row.slice(1));
		    break;
		case 'colmatrix':
		    nextGame.colMatrix.push(row.slice(1));
		    break;
		case 'rownames':
		    if (mode===row[0]) nextGame.rownames = row.slice(1);
		    break;
		case 'colnames':
		    if (mode===row[0]) nextGame.colnames = row.slice(1);
		    break;
		case 'row':
		    if (mode===row[0]) nextGame.row = row[1];
		    break;
		case 'col':
		    if (mode===row[0]) nextGame.col = row[1];
		case 'comment':
		    break;
		default:
		    console.log('unrecognized row type: '+mode);
		    break;
		}
	    }
	} catch(e) {console.log(e)};
    });
};

var armFileInput = function(){
    'use strict';
    $('#adminFileInput').prop('disabled',false);
    CSV.begin('#adminFileInput').call(toNextGame).go(
	function(e,d){
	    if (e) {
		// report any error to console.log and unset adminGoodCSVFile
		console.log(e);
		Session.set('adminGoodCSVFile',false);
	    } else {
		// if no error, checkGameSpec and set session var for green checkmark in step 1
		Session.set('adminGoodCSVFile', checkGameSpec(nextGame));
	    }
	    // rearm after 1 sec to quell the impatient
	    Meteor.setTimeout(armFileInput, 1000);
	}
    );
};

var allGamesTimeEnds = function(){ 
    "use strict";
    var last =  Games.findOne({}, {fields: {timeEnds: 1}, sort: {timeEnds: -1}});
    if (!last) return 0;
    return last.timeEnds;
};
	       

Template.adminTemplate.helpers({
    goodFile: function(){ 		     
	return Session.get('adminGoodCSVFile');
    },
    countUsersByScreen: function(s){
	return Meteor.users.find({screen: s}).count();
    },
    countUsersWithStrikes: function(){
	return Meteor.users.find({strikes: {$gt: 0}}).count();
    },
    gameFinished: function(){ 
	return (allGamesTimeEnds() < +Chronos.currentTime());
    },
    lastGameCountdown: function(){
	var t = Math.round( (allGamesTimeEnds() - (+Chronos.currentTime())) / 1000);
	if (t<0) return 0;
	return t;
    },
    rollcallToggle: function(){
	return Session.get('rollcallToggle');
    },
    rollcallFinished: function(){
	return (
	    (Session.get('rollcallTimeEnds')) &&
		(Session.get('rollcallTimeEnds') < (+Chronos.currentTime()))
	);
    },
    rollcallCountdown: function(){ 
	if (Session.get('rollcallTimeEnds')){ 
	    return Math.round((Session.get('rollcallTimeEnds')-(+Chronos.currentTime()))/1000);
	} 
	return 0;
    },
    countRollCall: function(){
	return (RollCall.find({}).count());
    }
});

var getDurationInputMS = function(jqselector){ 
    var durationMS = 1000*parseInt($(jqselector).val());
    if (!(durationMS>0)) 
	throw new Meteor.Error('InvalidUserInput', 
			       'time duration for '+jqselector+' requires a positive integer, got:'+durationMS);
    return durationMS;
};

// custom Meteor.methods we will need to call to do roll call and run the experiment
// startRollCall(timerEnds) -- clears user list, sets screens to rollcall with timer and yes/present button
// endRollCall() -- puts rollcall screen back to wait screen, clears headerTimer, and adds strike to nonresponder
// pairRollBeginExperiment(gameFilledIn) -- splits user list into pairs, inserts games into Game table

Template.adminTemplate.events({
    'click #adminRollCallButton': function(event, template){
	'use strict';
	// if you have run a roll call, you need to use it. duplicates are potentially messy.
	if (Session.get('rollCallToggle')) return console.log('roll call begun. running a second rollcall is not recommended as this may confuse participants.  To do it anyway, refresh the admin browser window and that will clear the rollcall checkmark on the admin screen');
	try {
	    // this next function throws on invalid user input
	    var rcDuration = getDurationInputMS('#adminRollCallDurationInput');
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
    'click #adminGoButton': function(event, template){
	'use strict';
	if (!Session.get('rollcallToggle')) 
	    return console.log('need to run rollcall before starting next matrix game');
	// clear rollcallToggle and disable button to avoid multiple GO clicks
	$('#adminGoButton').prop('disabled',1);
	Session.get('rollcallToggle', false); 
	if (Session.get('rollcallTimeEnds') > (+new Date()))
	    return console.log('need to wait until rollcall ends before starting next matrix game');
	if (!Session.get('adminGoodCSVFile'))
	    return console.log('can not GO: need confirmed good .csv file to configfure matrix game');	
	try {
	    // this next function throws on invalid user input
	    var gameDuration = getDurationInputMS('#adminGameDurationInput');
	    var now = +new Date();
	    // slackMS allows for some internet delay in communicating the start of the game
	    var slackMS = 500;
	    var initGame = {
		visible: true,
		moves: []
	    };
	    var gameTimer = {
		timeBegins: now+slackMS,
		timeEnds: now+gameDuration+slackMS,
	    };
	    var gameFactory = Object.assign({}, nextGame, gameTimer, initGame);
	    Meteor.call('pairRollBeginExperiment', gameFactory, function(e){
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
		}
	    });
	} catch(e){ console.log(e); }
    }
});

Template.adminTemplate.onRendered(function(){
    Session.set('adminGoodCSVFile', checkGameSpec(nextGame));
    Session.set('rollcallToggle', false);
    $('#adminGoButton').prop('disabled', true);
    armFileInput();
});
