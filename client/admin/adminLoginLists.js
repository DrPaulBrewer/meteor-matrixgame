Session.setDefault('adminLoginListSortField','profile.inAt');
Session.setDefault('adminLoginListLimit',30);

Template.adminLoginLists.helpers({
    sortedUsers: function(){
	var sortField = Session.get('adminLoginListSortField');
	var findOptions = {
	    limit: Session.get('adminLoginListLimit'),
	    fields: {services:0},
	    sort: {}
	};
	// reverse sort by field
	findOptions.sort[sortField]=-1;
	return Meteor.users.find({},findOptions).fetch();
    },
    mydate: function(d){
	return moment(d).calendar();
    }
});

Template.adminLoginLists.events({
    'click input[name="sortby"]':function(e){
	Session.set('adminLoginListSortField', $(e.target).val());
    },
    'change #adminLoginListLimit': function(e){
	Session.set('adminLoginListLimit', parseInt($(e.target).val()) );
    }
});
