/* globals Admin */

Accounts.onLogin(function(){
    var myUser = Meteor.user();
    if (!myUser) return;
    if (myUser.username==='adm'){
	Admin.login();
	console.log('logged in as admin user');
    } else {
	// login for user
	Meteor.subscribe('myuserdata', Meteor.userId());
	Meteor.subscribe('myrowgamedata', Meteor.userId());
	Meteor.subscribe('mycolgamedata', Meteor.userId());
	console.log('logged in as participant');
    }
    Meteor.users.update(Meteor.userId(), 
			{
			    $set: {
				'profile.inAt': +new Date() 
			    }
			});
});


