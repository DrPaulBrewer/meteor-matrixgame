Session.setDefault('adminLoginListSortField','profile.inAt');

// if you change the list size limit below, you should change it in the HTML template input box too.
Session.setDefault('adminLoginListLimit',10);

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
	return  moment(d).calendar().replace('Today at','');
    },
    userCount: function(){ return Meteor.users.find({}).count(); }
});

Template.adminLoginLists.events({
    'click input[name="sortby"]':function(e){
	Session.set('adminLoginListSortField', $(e.target).val());
    },
    'change #adminLoginListLimit': function(e){
	Session.set('adminLoginListLimit', parseInt($(e.target).val()) );
    }
});
