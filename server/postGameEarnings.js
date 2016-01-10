/* globals postGameEarnings:true */
/* globals Games */

var getAllEarnings = function(ts){
    var i,l,id;
    if (!ts) ts = +new Date();
    var rowPipeline = [
	{ $match: {timeEnds: {$lt: ts} } },
	{ $project: { rowUserId:1, rowEarn: 1 } },
	{ $sort: { rowUserId: 1 } },
	{ $group: { _id: "$rowUserId", earn: { $sum: "$rowEarn" } } }
    ];
    var rowpay =  Games.aggregate(rowPipeline);
    var colPipeline = [
	{ $match: {timeEnds: {$lt: ts} } },
	{ $project: { colUserId:1, colEarn: 1 } },
	{ $sort: { colUserId: 1 } },
	{ $group: { _id: "$colUserId", earn: { $sum: "$colEarn" } } }
    ];
    var colpay = Games.aggregate(colPipeline);
    var pay = {};
    for(i=0,l=rowpay.length; i<l; ++i){
	id = rowpay[i]._id;
	if (pay[id])
	    pay[id] += rowpay[i].earn;
	else
	    pay[id] = rowpay[i].earn;
    }
    for(i=0,l=colpay.length; i<l; ++i){
	id = colpay[i]._id;
	if (pay[id])
	    pay[id] += colpay[i].earn;
	else
	    pay[id] = colpay[i].earn;
    }
    return pay;
};

postGameEarnings = function(){
    "use strict";
    var id;
    var theseGames = Games.find({
	timeEnds: {$lt: +new Date()},
	aborted: {$exists: false},
	rowEarn: {$exists: false},
	colEarn: {$exists: false}
    },{
	fields: {
	    _id: 1,
	    row: 1,
	    col: 1,
	    rowMatrix: 1,
	    colMatrix: 1
	}
    }).fetch();	    
    console.log("updating earnings for "+theseGames.length+" games");
    theseGames.forEach(function(thisGame){
	Games.update(thisGame._id, { $set: {
	    rowEarn: thisGame.rowMatrix[thisGame.row][thisGame.col],
	    colEarn: thisGame.colMatrix[thisGame.row][thisGame.col]
	}});
    });
    var pay = getAllEarnings(+new Date());
    for (id in pay){
	if (pay.hasOwnProperty(id))
	    Meteor.users.update(id, {$set: {earnings: pay[id]} }, function(){} );
    }
};
