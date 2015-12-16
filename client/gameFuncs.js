myGame = {};
Session.setDefault('currentGameId',0);
Session.setDefault('gameUpdated',0);
Session.setDefault('myTotalEarnings',0);

G = {
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
	    if (typeof(G[func])==='function'){
		return G[func].apply(G, args);
	    }
	    if (!myGame) return null;
	    if ((func in myGame) && (myGame.hasOwnProperty(func)))
		return myGame[func];
	    return null;
	}
    }
};

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
    getRowMatrix: G.updated('rowMatrix'),
    getColNatrix: G.updated('colMatrix'),
    getMyMatrix: G.updated('myMatrix'), 
    getTheirMatrix: G.updated('otherMatrix'),
    mypay: G.updated(function(){ return G.myMatrix(myGame.row,myGame.col) }),
    otherpay: G.updated(function(){ return G.otherMatrix(myGame.row,myGame.col) }),
    cellstate: G.updated(function(r,c){ 
	if ((r===myGame.row) && (c===myGame.col))
	    return 'highlightCrossing';
	if (r===myGame.row) return 'highlightRow';
	if (c===myGame.col) return 'highlightCol';
	return '';
    })    
};

G.templateEvents = {
    'click th,td': function(event, template){ 
	'use strict';
	var classes, rowNoMatches, colNoMatches, hasRowNo, hasColNo, rowNo, colNo;
	var newChoice={};
	var mydim = G.mydim();
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
};

