/* global Admin */

Session.setDefault('adminScreen','help');

Admin.menuToTemplate = {
    help: 'adminPrep',
    run: 'adminRun',
    watch: 'adminWatchGame',
    users: 'adminLoginLists',
    cleanup: 'adminDangerZone'
};

Template.adminTemplate.helpers({
    adminScreen: function(){
	return Template[Admin.menuToTemplate[Session.get('adminScreen')]];
    },
    gt: function(s){
	var adminScreen = Session.get('adminScreen');
	if (adminScreen===s) return '> '+s;
	return s;
    }
});

Template.adminTemplate.events({
    'click #adminMenuList li':function(e){
	var val = $(e.target).text().replace('> ','');
	Session.set('adminScreen',val);
    }
});
