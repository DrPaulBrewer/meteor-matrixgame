Template.loginTemplate.events({
    'click #loginButton': function(){ 
	// fetch the id and password from the login form
	// make id and password input lower case and remove whitespace
	var id = $('#idInput').val().toLowerCase().trim();
	var pass = $('#passInput').val().toLowerCase().trim();
	// sanity check id and password
	if ((id.length<=0) || (pass.length<=0)) return false;
	if ((/[^a-zA-Z0-9]/.test(id)) || (/[^a-zA-Z0-9]/.test(pass))) {
	    console.log("non-alphanumeric characters in id or password");
	    return false;
	}
	// if sane, try to actually login with these
	// and supply an error handling function to create an account if it does not exist
	Meteor.loginWithPassword(id, pass, function(e){ 
	    if (e){ 
		// if bad password -- log -- then do nothing
		if (/password/.test(e.reason)) {
		    console.log("signin failed");
		    console.log(e);
		    return false;
		}
		// if nonexistent account -- ask user if he wants to make account and make if needed
		if (/not found/.test(e.reason)){
		    if (window.confirm("Create new id "+id+" ?")){ 
			Accounts.createUser({'username': id,
					     'password': pass
					    },
					    function(e){ 
						if (e) {
						    console.log("create user failed: ");
						    console.log(e);
						}
						else {
						    console.log("created user "+id);			     
						}
					    }
					   );
		    } else {
			console.log("user cancelled new account creation");
		    }
		}
	    }
	});
    }
});
