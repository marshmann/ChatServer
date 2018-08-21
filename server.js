//We use Node, Express, and Socket.Io to make this.
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

//Once someone new connects to this chat room...
io.on('connection', function(socket){
  let client = ""; //initialize client name
  let firstMessage = true; //the first message is the username the user wants
  //check to see if the user has been in the session before
  if(socket.handshake.session.client != undefined) {
    client = socket.handshake.session.client;
    socket.emit('chat message', "Welcome back " + client);
    firstMessage = false;
  }
  let disconnectMsg = "";
  
  //Let the person who connected know who else is in the chat room
  if(clientList.length == 0) socket.emit('chat message', "You are the first to connect!");
  else socket.emit('chat message', "You have connected with: " + clientList);
  
  //When a client tries to send a message
  socket.on('chat message', function(msg){
    if(msg == "") { /*do nothing*/ } //ignore empty messages
    //if that person is new to the chat room, we need to get them a name!
    //The first message they send will be their name.
    //Also, we'll make sure everyone has a unique name.
    else if(firstMessage && !clientList.includes(msg)){
      socket.handshake.session.client = msg; //store the client name
      socket.handshake.session.save(); //save
      client = msg; //set the client name locally as well
      clientList.push(client); //add it to the list of clients
      io.emit('chat message', client + " has connected."); //let everyone know
      disconnectMsg = client + " has disconnected"; //set the default disconnect message
      firstMessage = false;
    }
    //if the name is taken, notify the client (and only him)
    else if(firstMessage && clientList.includes(msg)){
      //only the client trying to connect will see this.
      socket.emit('chat message', "That name is already taken, please try again");
    }
    else //the name has already been set, just send the message to the chat room
      io.emit('chat message', client + ": " + msg);
  });
  
  //make sure the user actually disconnects when they click the "lets go game" button
  socket.on('gameplay', function(){
    disconnectMsg = client + " has left to play pong!"; //change the disconnect message!
    socket.disconnect();
  });
  
  //If someone disconnects, let the chat know
  socket.on('disconnect', function(){
    if(client != ""){
      io.emit('chat message', disconnectMsg);
      let index = clientList.indexOf(client); //get the index of their username   
      if (index > -1) clientList.splice(index, 1); //remove it from the array
    }
  });
 
});

//This is saying the server is listening to anyone trying to connect
//the "0.0.0.0" represents that it is public to more than localhost
http.listen(8080, "0.0.0.0", function(){
  console.log('listening on *:8080');
});
