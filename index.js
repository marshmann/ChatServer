var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//ssh -R crappychat:80:192.168.12.92:8080 serveo.net

app.use("/public", express.static('public')); 

var clientCounter = 0;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  let clientNumber = clientCounter++;
  let otherNumber = 1-clientNumber;
  
  let client = "Client " + clientNumber;
  io.emit('chat message', client + " has connected");
	
  socket.on('chat message', function(msg){
    io.emit('chat message', client + ": " + msg);
  });
  
  socket.on('disconnect', function(){
    io.emit('chat message', client + " has disconnected");
  });
});

http.listen(8080, "0.0.0.0", function(){
  console.log('listening on *:8080');
});
