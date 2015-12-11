myMatrix = [[0,0],[0,0]];
theirMatrix = [[0,0],[0,0]];
rownames = [0,1];
colnames = [0,1];
Session.set('mydim','row');
Session.set('selected-row', 0);
Session.set('selected-column', 0);
Session.set('timer', 999);

Tracker.autorun(function(){
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
    var gameId = Session.get('currentGameId');
    if (gameId){ 
	console.log('downloading new game');
	var game = Games.findOne({_id: gameId});
	if (!game) return console.log("Error: new game not found!");
	rownames = game.rownames;
	colnames = game.colnames;
	Session.set('timeExpires', game.timeExpires);
	if (Meteor.userId() === game.rowUserId){
	    Session.set('mydim','row');
	    myMatrix = game.rowMatrix;
	    theirMatrix = game.colMatrix;
	} else if (Meteor.userId() === game.colUserId){ 
	    Session.set('mydim','column');
	    myMatrix = game.colMatrix;
	    theirMatrix = game.rowMatrix;
	} else {
	    console.log(game);
	    return console.log("Error: can not determine if I play row or column");
	}	
    }
});

Template.gameTemplate.helpers({
    mydim: function(){ return Session.get('mydim')},
    otherdim: function(){ if (Session.get('mydim')==='row') return 'column';
			  return 'row'; 
			},
    timer: function(){ return Session.get('timer')}, 
    cols: colnames,
    rows: rownames,
    dimname: function(index, dimtype){ 
	if (dimtype.indexOf('c')===0) return colnames[index];
	else return rownames[index];
    },
    mychoice: function(){ return Session.get('selected-'+Session.get('mydim')) },
    otherchoice: function(){ return Session.get('selected-'+Session.get('otherdim')) },
    getMyMatrix: function(r,c){ return myMatrix[r][c] },
    getTheirMatrix: function(r,c){ return theirMatrix[r][c] },
    mypay: function(){ return myMatrix[Session.get('selected-row')][Session.get('selected-column')] },
    otherpay: function(){ return theirMatrix[Session.get('selected-row')][Session.get('selected-column')]},
    cellstate: function(r,c){ 
	if ((r===Session.get('selected-row')) && (c===Session.get('selected-column'))) 
	    return 'highlightCrossing';
	if (r===Session.get('selected-row')) return 'highlightRow';
	if (c===Session.get('selected-column')) return 'highlightCol';
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
	    if (hasColNo) newChoice.column = colNo;
	    if (mydim in newChoice){ 
		Session.set('selected-'+mydim, newChoice[mydim]);
	    }
	} catch(e) { console.log(e);}
    }
});
