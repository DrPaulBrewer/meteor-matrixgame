myMatrix = [[0]];
theirMatrix = [[0]];
rownames = [0];
colnames = [0];
Session.set('mydim','row');
Session.set('selected-row', 0);
Session.set('selected-col', 0);
Session.set('timer', 999);

Tracker.autorun(function(){
    "use strict;"
    // Chronos is a reactive var, will retrigger Tracker ever 1 sec
    var unixTimeMS = +Chronos.currentTime();
    var timeExpiresMS = Session.get('timeExpires');
    if ((unixTimeMS) && (timeExpiresMS)){
	if (unixTimeMS>timeExpiresMS){ 
	    if (Session.get('timer')>0)
		Session.set('timer',0);
	} else {
	    Session.set('timer', round((timeExpiresMS-unixTimeMS)/1000));
	}
    } 
});
    

Tracker.autorun(function(){
    "use strict;"
    var myUserId = Meteor.userId();
    var unixTimeMS = +Chronos.currentTime();
    if (myUserId && unixTimeMS){ 
	if (Games){
	    var myGame = Games.findOne({
		timeBegins: {$lt: unixTimeMS},
		timeEnds: {$gt: unixTimeMS},
		$or: [
		    {'rowUserId': myUserId },
		    {'colUserId': myUserId }
		]
	    });
	    if (myGame){
		Session.set('currentGameId', myGame._id);
	    }
	}				
    }
});

Tracker.autorun(function(){
    "use strict;"
    var gameId = Session.get('currentGameId');
    if (gameId){ 
	console.log('downloading new game');
	var game = Games.findOne({_id: gameId},
				{fields: {
				    rownames: 1, 
				    colnames: 1, 
				    timeExpires: 1,
				    rowMatrix: 1,
				    colMatrix: 1,
				    rowUserId: 1,
				    colUserId: 1
				}});
	if (!game) return console.log("Error: new game not found!");
	rownames = game.rownames;
	colnames = game.colnames;
	Session.set('timeExpires', game.timeExpires);
	if (Meteor.userId() === game.rowUserId){
	    Session.set('mydim','row');
	    myMatrix = game.rowMatrix;
	    theirMatrix = game.colMatrix;
	} else if (Meteor.userId() === game.colUserId){ 
	    Session.set('mydim','col');
	    myMatrix = game.colMatrix;
	    theirMatrix = game.rowMatrix;
	} else {
	    console.log(game);
	    return console.log("Error: can not determine if I play row or col");
	}	
    }
});

Tracker.autorun(function(){
    "use strict;"
    var mydim = Session.get('mydim');
    var mychoice = Session.get('selected-'+mydim);
    var gameId = Session.get('currentGameId');
    if (gameId)
	Meteor.call('gameMove', Session.get('currentGameId'), mydim, mychoice);
});

Tracker.autorun(function(){
    "use strict;"
    var gameId = Session.get('currentGameId');
    if (!gameId) return;
    var mydim = Session.get('mydim');
    var myGame = Games.findOne({_id: gameId},
			       {fields: {'row': 1, 'col': 1}}
			      );
    if (mydim==='row' && ('col' in myGame)) Session.set('selected-col',myGame.col);
    if (mydim==='col' && ('row' in myGame)) Session.set('selected-row',myGame.row);
});

Template.gameTemplate.helpers({
    mydim: function(){ return Session.get('mydim')},
    otherdim: function(){ if (Session.get('mydim')==='row') return 'col';
			  return 'row'; 
			},
    timer: function(){ return Session.get('timer')}, 
    cols: function(){ Session.get('currentGameId'); return colnames },
    rows: function(){ Session.get('currentGameId'); return rownames },
    dimname: function(index, dimtype){ 
	if (dimtype.indexOf('c')===0) return colnames[index];
	return rownames[index];
    },
    mychoice: function(){ return Session.get('selected-'+Session.get('mydim')) },
    otherchoice: function(){ return Session.get('selected-'+((Session.get('mydim')==='row')?'col':'row')); },
    getMyMatrix: function(r,c){ Session.get('currentGameId'); return myMatrix[r][c] },
    getTheirMatrix: function(r,c){ Session.get('currentGameId'); return theirMatrix[r][c] },
    mypay: function(){ return myMatrix[Session.get('selected-row')][Session.get('selected-col')]},
    otherpay: function(){ return theirMatrix[Session.get('selected-row')][Session.get('selected-col')]},
    cellstate: function(r,c){ 
	if ((r===Session.get('selected-row')) && (c===Session.get('selected-col'))) 
	    return 'highlightCrossing';
	if (r===Session.get('selected-row')) return 'highlightRow';
	if (c===Session.get('selected-col')) return 'highlightCol';
	return '';
    }
    
    
});

Template.gameTemplate.events({
    'click th,td': function(event, template){ 
	var classes, rowNoMatches, colNoMatches, hasRowNo, hasColNom, rowNo, colNo;
	var newChoice={};
	var mydim = Session.get('mydim');
	if (Session.get('timer')<=0) return false;
	try { 
	    classes = $(event.toElement).attr("class");
	    rowNoMatches = classes.match(/rowNo(\d+)/);
	    colNoMatches = classes.match(/colNo(\d+)/);
	    hasRowNo = (rowNoMatches) && (rowNoMatches.length>1);
	    hasColNo = (colNoMatches) && (colNoMatches.length>1);
	    if (hasRowNo) rowNo = parseInt(rowNoMatches[1]);
	    if (hasColNo) colNo = parseInt(colNoMatches[1]);
	    if (hasRowNo) newChoice.row = rowNo;
	    if (hasColNo) newChoice.col = colNo;
	    if (mydim in newChoice){ 
		Session.set('selected-'+mydim, newChoice[mydim]);
	    }
	} catch(e) { console.log(e);}
    }
});

