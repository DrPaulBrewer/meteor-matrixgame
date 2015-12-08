var myMatrix = [[0,0,0,0], [0,10,0,0], [0,0,20,0], [0,0,0,30]];
var theirMatrix = [[0,0,0,0], [0,10,0,0], [0,5,5,5], [0,5,15,5]];

var rownames = [0,1,2,3];
var colnames = [0,'A','B','C'];

Session.set('mydim','row');
Session.set('selected-row', 0);
Session.set('selected-column', 0);
Session.set('timer', 180);

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

