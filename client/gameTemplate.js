
myGame = {};
Session.setDefault('currentGameId',0);
Session.setDefault('gameUpdated',0);

Tracker.autorun(function(){
    // if there is no current game we need the wait screen
    if (Session.get('currentGameId')===0)
	Meteor.call('requestScreen','wait');
});

Tracker.autorun(function(){
    "use strict;"
    var myUserId = Meteor.userId();
    var unixTimeMS = +Chronos.currentTime();
    if (myUserId && unixTimeMS){ 
	var myGame = Games.findOne(
	    {
		timeBegins: {$lt: unixTimeMS},
		timeEnds: {$gt: unixTimeMS},
		$or: [
		    {'rowUserId': myUserId },
		    {'colUserId': myUserId }
		]
	    },
	    { fields: {_id: 1} }
	);
	if (myGame){
	    Session.set('currentGameId', myGame._id);
	} else {
	    if (Session.get('currentGameId')){ 
		// game expired or became inactive
		Session.set('currentGameId', 0);
	    }
	}
    }				
});

Tracker.autorun(function(){
    'use strict';
    var gameId = Session.get('currentGameId');
    if (gameId){
	myGame = Games.findOne({_id: gameId});
	if (Meteor.user().screen!=="game") 
	    Meteor.call('requestScreen', 'game');
	Session.set('gameUpdated', +new Date());
    } else {
	myGame = {};
	Session.set('gameUpdated', +new Date());
    }
});

var g = {
    mydim: function(){ 
	'use strict';
	if (!myGame) return;    
	if (Meteor.userId() === myGame.rowUserId) return 'row';
	if (Meteor.userId() === myGame.colUserId) return 'col';
	return;
    },

    otherdim: function(){
	'use strict';
	var d = this.mydim();
	if (d==='row') return 'col';
	if (d==='col') return 'row';
	return;
    },

    mychoice: function(){
	'use strict';
	if (!myGame) return;
	return myGame[this.mydim()];
    },

    otherchoice: function(){
	'use strict';
	if (!myGame) return;
	return myGame[this.otherdim()];
    },
    
    myMatrix: function(){
	'use strict';
	var idx = this.mydim()+'Matrix';
	if (!myGame) return;
	if (arguments.length===0)
	    return myGame[idx];
	return myGame[idx][arguments[0]][arguments[1]];
    },

    otherMatrix: function(){
	'use strict';
	var idx = this.otherdim()+'Matrix';
	if (!myGame) return;
	if (arguments.length===0)
	    return myGame[idx];
	return myGame[idx][arguments[0]][arguments[1]];	
    },

    updated: function(func){ 
	'use strict';
	// this is a function factory for reactive templates below
	return function(){
	    var args = Array.prototype.slice.call(arguments);
	    var updated = Session.get('gameUpdated'); 
	    // throwaway var triggers Reactive updates when game updated
	    if (typeof(func)==='function')
		return func.apply({}, args);
	    // func can be a string
	    // if so, it may refer to a method of g, or a property of myGame
	    if (typeof(g[func])==='function'){
		return g[func].apply(g, args);
	    }
	    if (!myGame) return null;
	    if ((func in myGame) && (myGame.hasOwnProperty(func)))
		return myGame[func];
	    return null;
	}
    }
};

Template.gameTemplate.helpers({
    mydim: g.updated('mydim'),
    otherdim: g.updated('otherdim'),
    cols: g.updated('colnames'),
    rows: g.updated('rownames'),
    dimname: function(index, dimtype){ 
	Session.get('gameUpdated');
	if (!myGame) return '';
	if ((index===0) || (index)) {
	    if (dimtype.indexOf('c')===0) return myGame.colnames[index];
	    return myGame.rownames[index];
	}
	return '';
    },
    mychoice: g.updated('mychoice'),
    otherchoice: g.updated('otherchoice'),
    getMyMatrix: g.updated('myMatrix'), 
    getTheirMatrix: g.updated('otherMatrix'),
    mypay: g.updated(function(){ return g.myMatrix(myGame.row,myGame.col) }),
    otherpay: g.updated(function(){ return g.otherMatrix(myGame.row,myGame.col) }),
    cellstate: g.updated(function(r,c){ 
	if ((r===myGame.row) && (c===myGame.col))
	    return 'highlightCrossing';
	if (r===myGame.row) return 'highlightRow';
	if (c===myGame.col) return 'highlightCol';
	return '';
    })    
});

Template.gameTemplate.events({
    'click th,td': function(event, template){ 
	'use strict';
	var classes, rowNoMatches, colNoMatches, hasRowNo, hasColNo, rowNo, colNo;
	var newChoice={};
	var mydim = g.mydim();
	if (Session.get('timer')<=0) return false;
	try { 
	    classes = event.currentTarget.className;
	    rowNoMatches = classes.match(/rowNo(\d+)/);
	    colNoMatches = classes.match(/colNo(\d+)/);
	    hasRowNo = (rowNoMatches) && (rowNoMatches.length>1);
	    hasColNo = (colNoMatches) && (colNoMatches.length>1);
	    if (hasRowNo) rowNo = parseInt(rowNoMatches[1]);
	    if (hasColNo) colNo = parseInt(colNoMatches[1]);
	    if (hasRowNo) newChoice.row = rowNo;
	    if (hasColNo) newChoice.col = colNo;
	    if (mydim in newChoice){ 
//	Meteor.call('gameMove', Session.get('currentGameId'), mydim, mychoice);
		Meteor.call('gameMove', Session.get('currentGameId'), mydim, newChoice[mydim]);
	    }
	} catch(e) { console.log(event); console.log(template); console.log(e);}
    }
});

