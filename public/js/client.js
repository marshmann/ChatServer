//Author: Nicholas Marshman

/*Some notes about jQuery:
  $ is a shortcut to represent jQuery
  Therefore you could replace every instance of "jQuery" with "$" and
  it would be functionally the same */
jQuery(function(){
  var socket = io(); //declare the socket connects to the host 
  jQuery('form').submit(function(){ //when someone hits the submit button
    socket.emit('chat message', jQuery('#mes').val()); //send a message event
    jQuery('#mes').val(''); //set the input box to be empty
          
    return false;
  });
  
  //When the "let's go game" button is pressed
  jQuery('#gameButton').click(function(){
    socket.emit('pageSwap', "");
    window.location.href='/game';
    
    return false;
  });
  
  //When the "return to chat" button is pressed
  jQuery('#chatButton').click(function(){
    socket.emit('pageSwap', "");
    window.location.href='/chat';
    
    return false;
  });
  
  //When the socket recieves a chat message
  socket.on('chat message', function(msg){
    //use DOM to append the message to the current list of messages
    if(msg==""){ /* ignore */ }
    else{
      let x = document.getElementById("messages");
      let d = new Date().toLocaleTimeString();
      x.textContent += ("\n[" + d + "] " + msg);
         
      //Autoscroll down when messages appear
      x.scrollTop = x.scrollHeight;     
    }     
  });
});
