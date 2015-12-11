Matrices = new Mongo.Collection('matrices');
Games = new Mongo.Collection('games');
Experiments = new Mongo.Collection('sessions');
Earnings = new Mongo.Collection('earnings');
RollCall = new Mongo.Collection('rollcall');

Meteor.subscribe('myuserdata');
Meteor.subscribe('myrowgamedata');
Meteor.subscribe('mycolgamedata');


    
