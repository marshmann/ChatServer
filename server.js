//Author: Nicholas Marshman
//Node, express, express-session, socket.io, and express-socket.io.session 
//were used to make this server.
var express = require('express');
var session = require('express-session')({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  });
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var sose = require('express-socket.io-session');

//Link the public file to the server
app.use(express.static(path.join(__dirname, 'public'))); 
//Specific use of /public for the icon linking in the html.
app.use("/public", express.static('public')); 

//Specify we are using session-scope
app.use(session);

io.use(sose(session, {autoSave:true}));
//The array containing the connected client's usernames
var clientList = [];

//Any connections to the base url or to the url/chat will redirect to the chat page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/client.html');
});

app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/views/client.html');
});

//redirect anyone who connects to the webpage with /game in the path to the game page
app.get('/game', function(req, res){
  res.sendFile(__dirname + '/views/game.html');
});

//Someone connected to the server, thus creating their own unique socket!
//A socket is an object that allows the client to communicate with the server.
//In short, one can, at a base-level, think of a socket as a client who's connected to the server.
io.on('connection', function(socket){
  let client = ""; //initialize client name
  let firstMessage = true; //the first message will be set as the client's username
  let disconnectMsg = true; //initalize that we should display a disconnect message
    
  /*
    Quick tutorial on how these sessions work:
      In theory:
      A session is simply utilized to store some data in the user's browser, which allows for some
      convience.  For this project in particular, it means the client doesn't need to reenter
      a username everytime he/she wants to go to a different webpage on our website.  It also
      allows us to have some custom messages for users who have been on the website before and for
      new users who haven't.
      
      Technial:
      You create and attach attributes to the socket's session object: "socket.handshake.session"
      Each attribute is defaultly valued as "undefined", and you can crete them on-the-go.
      These attributes are stored in cookies in the browser.
      Thus, if the attributes aren't "undefined" when we access them, then we can assume the user
      is someone who's already opened the webpage in their browser before.
  */
  
  //check to see if the user has been in the session before
  //If the client attribute isn't undefined, then it's an old client.
  if(socket.handshake.session.client != undefined) {
    client = socket.handshake.session.client; //Store the client's name locally for ease-of-access
    clientList.push(client); //Also, put it in the client list
    
    //Now we will check to see if the old user who connected was just swapping between 
    //the chat page and the game page. If they were, then we don't need to welcome them back. 
    if(!socket.handshake.session.swapping) {
      //This will send a message to everyone on the server
      //'chat message' is the event and the second field is the message.
      io.emit('chat message', "Everyone welcome back " + client + "!");
    }
      
    //Since the first message for a new user represents the username they want,
    //we need to set it to false to not override the old user's name.
    firstMessage = false;
  }
  
  //Let the person who connected know who else is in the chat room
    //Unlike io.emit, socket.emit will send a message to just the client, not the whole chat-room
  if(clientList.length == 0) socket.emit('chat message', "You are the first to connect!");
  //If the user was swapping pages, then we don't need to print this
  //Also, since we already added that old-user to the clientList, it would print his own name
  //which isn't a big issue, but I decided to avoid it.
  else if(firstMessage) socket.emit('chat message', "You have connected with: " + clientList);
 
  //When a chat message event occurs for a user
  socket.on('chat message', function(msg){
    if(msg == "") { /*do nothing*/ } //ignore empty messages
    //if that person is new to the chat room, we need to get them a name!
    //The first message they send will be their name.
    //Also, we'll make sure everyone has a unique name.
    else if(firstMessage && !clientList.includes(msg)){
      socket.handshake.session.client = msg; //store the client name in the session
      socket.handshake.session.save(); //save the session
  
      client = msg; //set the client name locally as well
      clientList.push(client); //add it to the list of clients
      
      io.emit('chat message', client + " has connected."); //let everyone know
      firstMessage = false; //make it so subsequent messages don't alter the username
    }
    //if the name is taken, notify the client (and only him)
    else if(firstMessage && clientList.includes(msg)){
      //only the client who tried entering a name will see this message
      socket.emit('chat message', "That name is already taken, please try again");
    }
    //If the name client's name is already set, then we'll just send their message to everyone
    //on the server.
    else io.emit('chat message', client + ": " + msg);
  });
  
  //When swapping from the chat window to the game and vise versa, we want to make sure
  //the disconnect message doesn't show, as it would just spam the chat room!
  //Thus, we made it so when the user clicks a button that relates to changing 
  //between the server's webpages, a pageSwap event will occur before the user diconnects.
  socket.on('pageSwap', function(){
    disconnectMsg = false; //make sure no disconnect message occurs
    
    //Calling this is technically not nessessary, since it'll automatically happen when
    //the webpage has to load the new page.  However, since sometimes the clients weren't
    //always disconnecting on these page swaps for whatever reason, I recommend calling it.
    socket.disconnect(); 
  });
  
  //If someone disconnects, a disconnect event is fired.
  socket.on('disconnect', function(){
    if(client != "") { //We only care about clients who were already registered
      let index = clientList.indexOf(client); //get the index of their username   
      if (index > -1) clientList.splice(index, 1); //remove it from the client list
       
      if(disconnectMsg) { //if the user actually has disconnected
        io.emit('chat message', client + " has disconnected."); //tell the server
        //set the session attribute to represent that they weren't swapping pages
        socket.handshake.session.swapping = false; 
      }
      //else, the user is swapping between the server's webpages
      else socket.handshake.session.swapping = true; //set the swapping attribute to true
      
      //Regardless of the reason for the disconnect, we will do this:
      socket.handshake.session.save(); //save the session
    }
  });
});

//This is saying the server is listening to anyone trying to connect
//the "0.0.0.0" represents that it is public to more than localhost
http.listen(8080, "0.0.0.0", function(){
  console.log('listening on *:8080');
});
