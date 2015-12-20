#matrixgame 

##Copyright 2015- Dr Paul Brewer Economic and Financial Technology Consulting LLC http://eaftc.com

##License: You are welcome to fork and copy this software as free code available under the MIT License.

This software creates Game Theory experiments for a group of human participants.  

It is written using the Meteor Javascript framework.

##Prerequisites:

 * Linux server with [Meteor](https://install.meteor.com) and git installed.

 * various devices with web browsers for the human participants. An android smartphone's chrome web browser might be OK.  

##Usage

WARNING: This is a rough draft under development and testing. There are missing pieces dealing with closing down the experiment and getting a list of payments to be made.  As is it is only useful for comment and testing.  Automated
tests currently indicate that there are throttling issues with more than ~ 20-40 participants.  

It creates a "cheap talk" version of a normal form matrix game where moves are visible, but future versions will be able to vary the information conditions
so that games where the moves are invisible or visible by only one side of the game. 

Subjects are shown a game matrix and a timer that counts down, and are able to see each others' row/col selections in real time until
the timer expires. When the timer expires, the selected cell determines earnings accumulated at the top of each subjects' screen
and in a local mongo database included with meteor. All row/col choices are timestamped for each game.  

1. get the software onto the server using a terminal window

    git clone https://github.com/DrPaulBrewer/matrixgame

 to update an unmodified copy of the software to the latest version

    cd matrixgame 
    git pull 

 The software may run on the server as an ordinary user and does not require root priviledges.

2. run the software on the server

    cd matrixgame
    meteor run 

 Please note that the server may report the web address when the software starts.  

 When the server starts it will tell you its address in the terminal window.  In some cases you should change the address with `ROOT_URL` environment variable.  

 If the software reports the address as `localhost:3000`, often you may also be able to also access the web site from the computer's
 numeric IP address because by default meteor binds to all available network interfaces.  Find the numeric ethernet ip address on the server with the `ifconfig` command.  
 For example, if the address is at `1.2.3.4` you may be able to access via the web using `http://1.2.3.4:3000`  

 Note that some participants may be behind firewalls that block port 3000. To change or get rid of the `:3000` or change from `localhost` to `.com` or `.edu` name, 
 you can change the address with the `ROOT_URL` environment variable when running, i.e. to run on port 3333 `ROOT_URL=http://someserver.amazinguniversity.edu:3333 meteor run`.  
 To run on the standard port 80, you need to either (i) run as root, which is not recommended, or (ii) install an NGINX  reverse proxy.  How to install and use NGINX for this purpose
 is well documented elsewhere on the interent.  

 You can stop the server at any time by interrupting it with the `control-C` key.  Stopping the server does not
delete existing data or log out participants.  Instead a red warning message is displayed that they have disconnected.
 It may log out the experiment administrator.

3. From a web browser login to the software with user `adm` and password `adm`.

 This is horribly insecure, of course, and the software will be updated soon where you choose a password when starting the server.

 The experiment administrator page provides an example configuration file which you can use to set up any game matrix desired.

 It explains how to load it into software, do a rollcall of participants, and start the game period. 

 A basic monitor is provided that shows the current/last configured game matrix and current strategy statistics. 

4. End-of-experiment: Currently the earnings due each subject in experimental units is shown at the top of each screen.  
 Be aware, however, it is easy for subjects who are technically aware to change this number to be any amount desired.  This is a general
 weakness of web software and not this software specifically.  The earnings reported in the database can not be altered from the browser
 in this way, but are stored with each game record and would need to be aggregated.  A "finish the experiment" screen for the admin
 will be released in a forthcoming update.

# Automated testing with random robots

The danger with software intended for many people to use simultaneously is that it works fine when only a few people are around, but eventually fails under heavier loads.  

If you have a computer with [Docker](https://docs.docker.com/engine/installation/) installed, you can create, say, 50 robotic participants to randomly make choices every 5 seconds in matrixgame as follows:

    docker run -e url=http://your.matrixgames.address:port -e bots=50 -e deltat=5000 drpaulbrewer/matrixgame-test:latest
    
 * `-e url=` sets the game url that the robots should contact. You **must** replace the url shown above with your matrixgame's url.
 * `-e bots=` sets the number of robot participants. You can change it to suit your needs.
 * `-e deltat=` sets the click interval in milliseconds.  You can change this too.
 * `drpaulbrewer/matrixgame-test:latest` identifes the Docker image on Dockerhub to be download and run.  This should not be changed.
 
You should have matrixgame installed and running (e.g. as described in the "Usage" section near the top of the page) before you run the docker command to start the robots.  The robots and the matrixgame do not need can run on different computers or the same computer.  Effects of network load are only tested if the robots run on a different computer from the matrixgame server.

##News
-----
 Dec. 18 2015 -- First working draft posted to Github. Use at own risk, not yet tested in an actual lab experiment. Not yet recommended for production use.
