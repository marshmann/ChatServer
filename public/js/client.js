/*Some notes about jQuery:
  $ is a shortcut to represent jQuery
  Therefore you could replace every instance of "jQuery" with "$" and
  it would be functionally the same */
jQuery(function(){
  var socket = io(); //declare the socket connects to the host 
  jQuery('form').submit(function(){ //when someone hits the submit button
    socket.emit('chat message', jQuery('#m').val()); //send a message event
    jQuery('#m').val(''); //set the input box to be empty
          
    return false;
  });
  
  //When the "let's go game" button is pressed
  jQuery('#game').click(function(){
    socket.emit('gameplay', "hi");
    window.location.href='/game'
    return false;
  });
  
  //When the socket recieves a chat message
  socket.on('chat message', function(msg){
    //use DOM to append the message to the current list of messages
    var x = document.getElementById("messages");
    x.textContent += ("\n" + msg);
       
    //Autoscroll down when messages appear
    x.scrollTop = x.scrollHeight;          
  });
});
