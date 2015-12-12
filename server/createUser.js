Accounts.onCreateUser(function(options, user){ 
    user.screen = 'wait';
    user.strikes = 0;
    return user;
});
