/* globals myGame:true,G:true */

myGame = {};
Session.setDefault('currentGameId',0);
Session.setDefault('gameUpdated',0);
Session.setDefault('myTotalEarnings',0);

G = {
    mydim: function(){ 
	'use strict';
	if (myGame === {}) return;    
	if (Meteor.userId() === myGame.rowUserId) return 'row';
	if (Meteor.userId() === myGame.colUserId) return 'col';
	return;
    },

    otherdim: function(){
	'use strict';
	if (myGame === {}) return;    
	if (Meteor.userId() === myGame.rowUserId) return 'col';
	if (Meteor.userId() === myGame.colUserId) return 'row';
	return;
    },

    mychoice: function(){
	'use strict';
	if (myGame === {}) return;
	return myGame[this.mydim()];
    },

    otherchoice: function(){
	'use strict';
	if (myGame === {}) return;
	return myGame[this.otherdim()];
    },

    matrixFunc: function(dim){
	'use strict';
	// function factory for matrix functions
	// dim must be 'row', 'col', or a function() returning 'row' or 'col'
	return function(){
	    var adim, prop;
	    if (myGame === {}) return;
	    adim = ((typeof(dim) === 'function')? dim(): dim);
	    if (!adim) return;
	    prop = adim+'Matrix';
	    if (arguments.length<2)
		return myGame[prop];
	    return myGame[prop][arguments[0]][arguments[1]];
	};
    },

    updated: function(func){ 
	'use strict';
	// this is a function factory for reactive template helpers below
	return function(){
	    var args = Array.prototype.slice.call(arguments);
	    /* tell jshint to ignore that updated is defined but never used */
	    /* jshint unused:false */
	    var updated = Session.get('gameUpdated');
	    // updated var triggers Reactive updates when game updated
	    if (typeof(func)==='function')
		return func.apply({}, args);
	    // func can be a string
	    // if so, it may refer to a method of g, or a property of myGame
	    if (typeof(G[func])==='function'){
		return G[func].apply(G, args);
	    }
	    if (myGame && (func in myGame) && (myGame.hasOwnProperty(func)))
		return myGame[func];
	    return null;
	};
    }
};


G.myMatrix = G.matrixFunc(G.mydim);
G.otherMatrix = G.matrixFunc(G.otherdim);
G.rowMatrix = G.matrixFunc('row');
G.colMatrix = G.matrixFunc('col');

G.templateHelpers = {
    mydim: G.updated('mydim'),
    otherdim: G.updated('otherdim'),
    cols: G.updated('colnames'),
    rows: G.updated('rownames'),
    dimname: function(index, dimtype){ 
	Session.get('gameUpdated');
	if (!myGame) return '';
	if ((index===0) || (index)) {
	    if (dimtype.indexOf('c')===0) return myGame.colnames[index];
	    return myGame.rownames[index];
	}
	return '';
    },
    mychoice: G.updated('mychoice'),
    otherchoice: G.updated('otherchoice'),
    row: G.updated('row'),
    col: G.updated('col'),
    getRowMatrix: G.updated('rowMatrix'),
    getColMatrix: G.updated('colMatrix'),
    getMyMatrix: G.updated('myMatrix'), 
    getTheirMatrix: G.updated('otherMatrix'),
    mypay: G.updated(function(){ 
	return G.myMatrix(myGame.row,myGame.col);
    }),
    otherpay: G.updated(function(){ 
	return G.otherMatrix(myGame.row,myGame.col);
    }),
    rowpay: G.updated(function(){ 
	return myGame.rowMatrix[myGame.row][myGame.col]; 
    }),
    colpay: G.updated(function(){ 
	return myGame.colMatrix[myGame.row][myGame.col];
    }),
    cellstate: G.updated(function(r,c){ 
	if ((r===myGame.row) && (c===myGame.col))
	    return 'highlightCrossing';
	if (r===myGame.row) return 'highlightRow';
	if (c===myGame.col) return 'highlightCol';
	return '';
    }),
    gameTemplate: G.updated(function(){ 
	return Template[myGame.gameTemplate];
    }),
    cellTemplate: G.updated(function(){
	return Template[myGame.cellTemplate];
    })
};

var myPreviousClick;
var myPreviousClickMS;

var capitalFirst = function(s){
    return s.charAt(0).toUpperCase()+s.slice(1);
};

G.templateEvents = {
    'click th,td': function(event, template){ 
	'use strict';
	var classes, rowNoMatches, colNoMatches, hasRowNo, hasColNo, rowNo, colNo;
	var newChoice={};
	var mydim = G.mydim();
	if ((+new Date())>myGame.timeEnds) return false;
	if ( (myGame.timeThrottle) &&
	     ( (+new Date()) < myGame['time'+capitalFirst(mydim)]+myGame.timeThrottle ) )
	    return console.log("rapid click ignored. clicks allowed every "+myGame.timeThrottle+" ms");		
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
		if (myGame[mydim] === newChoice[mydim])
		    return console.log('repeated click on server-acknowledged previous choice. ignored. not sent to server');
		if ((myPreviousClick === newChoice[mydim]) && (myPreviousClickMS > (+new Date() - 2000)))
		    return console.log('repeated click on unacknowledged previous choice within a time of two seconds. ignored. not sent to server'); 
		Meteor.call('gameMove', Session.get('currentGameId'), mydim, newChoice[mydim]);
		myPreviousClick = newChoice[mydim];
		myPreviousClickMS = +new Date();
	    }
	} catch(e) { console.log(event); console.log(template); console.log(e);}
    }
};



