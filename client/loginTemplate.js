Session.setDefault('showPassRow',false);

Accounts.onLoginFromLink(function(err, response){
    // this empty function needed to activate poetic:accounts-passwordless
    // and that will 
    //
    // err is a Meteor.Error object
    // response is a success object in the form of { userId: docId }
});

Template.loginTemplate.helpers({
    showPassRow: function(){ 
	return Session.get('showPassRow');
    }
});

Template.loginTemplate.events({
    'change #emailInput': function(event, template){
	var email = $('#emailInput').val().toLowerCase().trim();
	if ( (/^adm/.test(email)) &&
	     $('#passRow').prop('hidden')
	   ) $('#passRow').prop('hidden','false');
    }

    'click #loginButton': function(event, template){ 
	// fetch the id and password from the login form
	var email = $('#emailInput').val().trim();
	var pass  = $('#passInput').val().trim();
	if (pass && pass!=="undefined"){ 
	    // attempt login as admin user
	    // the email field actually contains an admin userid
	    Meteor.loginWithPassword(email, pass, function(e){ 
		if (e) console.log(e);
	    });
	    return;
	}
	// attempt login as user using email/loginToken
	



	// and supply an error handling function to create an account if it does not exist




		// if bad password -- log -- then do nothing
		if (/password/.test(e.reason)) {
		    console.log("signin failed");
		    console.log(e);
		    return false;
		}
		// if nonexistent account -- ask user if he wants to make account and make if needed
		if (/not found/.test(e.reason)){
		    if (confirm("Create new id "+id+" ?")){ 
			Accounts.createUser({'username': id,
					     'password': pass,
					     function(e){ 
						 if (e) {
						     console.log("create user failed: ");
						     console.log(e);
						 }
						 else {
						     console.log("created user "+id);
						     
						 }
					     }
					     });
		    } else {
			console.log("user cancelled new account creation");
		    }
		}
	    }
	});
    }
});
