// Template...onRendered is called on admin screen refresh or new admin login
//    set the good .csv checkmark based on the goodness of existing data
//    clear the good roll call checkmark
//    disable the GO button until the file is loaded and/or rollcall run

/* globals Admin,nextGame */

Template.adminTemplate.onRendered(function(){
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

});
