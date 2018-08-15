//We use Node, Express, and Socket.Io to make this.
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use("/public", express.static('public')); 

var clientList = [];

//Any connections to the base url or to the url/chat will have the same
//html page at the moment.
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//Once someone new connects to this chat room...
io.on('connection', function(socket){
  let client = ""; //initalize their client name
  let firstMessage = true; 
  
  //Let the person who connected know who else is in the chat room
  if(clientList.length == 0)
    socket.emit('chat message', "You are the first to connect!");
  else
    socket.emit('chat message', "You have connected with: " + clientList);
  
  //When a client tries to send a message
  socket.on('chat message', function(msg){
    //if that person is new to the chat room, we need to get them a name!
    //The first message they send will be their name.
    //Also, we'll make sure everyone has a unique name.
    if(firstMessage && !clientList.includes(msg)){
      client = msg; //set the client name
      clientList.push(client); //add it to the list of clients
      io.emit('chat message', client + " has connected."); //let everyone know
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
  
  //If someone disconnects, let the chat know
  socket.on('disconnect', function(){
    io.emit('chat message', client + " has disconnected.");
  });
});

//This is saying the server is listening to anyone trying to connect
//the "0.0.0.0" represents that it is public to more than localhost
http.listen(8080, "0.0.0.0", function(){
  console.log('listening on *:8080');
});
