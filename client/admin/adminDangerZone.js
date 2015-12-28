var confirmDangerous = function(what, checkphrase){
    var msg = what+' can not be undone. To confirm, type: "'+checkphrase.toLowerCase()+'"';
    var reply='';
    // window.prompt can return null, then string functions fail
    try {
	reply = window.prompt(msg).toLowerCase().trim();
    } catch(e){}
    return (reply===checkphrase) || (reply==='"'+checkphrase+'"');
};

Template.adminDangerZone.events({
    'click #adminAbortButton': function(){
	var timeEnds = Session.get('allGamesTimeEnds');
	if ((!timeEnds) || (timeEnds < (+new Date())))
	    return console.log('no running games to abort.');
	if (confirmDangerous('Abort running games','abort')){
	    console.log('aborting games ending at '+timeEnds);
	    Meteor.call('adminAbortGame', timeEnds);
	    window.alert('aborted running games');
	}
    },

    'click #adminDoneButton': function(){
	if (confirmDangerous('Ending the experiment','done')){
	    Meteor.call('adminFinishExperiment');
	    window.alert('ended experiment. all participants shown "done" screen');
	}
    },
    
    'click #adminResetDatabaseButton': function(){
	if (confirmDangerous('Resetting the database','delete games')){
	    Meteor.call('adminResetDatabase');
	    window.alert('Database reset. All games deleted.');
	}
	
    },
    
    'click #adminDeleteDatabaseButton': function(){
	if (confirmDangerous('Deleting the database','delete everything')){
	    Meteor.call('adminDeleteDatabase');
	    window.alert('Database deleted and adm user recreated. To prevent problems, ou should probably close your browser window and open a new one.');
	}
    }
});
