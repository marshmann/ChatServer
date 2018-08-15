# ChatServer
A simple to use and edit chat server and client.  

It goes without saying that server.js contains the server-side code.

The views files contains the html code for each of the pages.  The client.html file contains the client-side code for the chatbox, and game.html is a **NYI** html file that will contain a unity-based project.

The public file contains the files that are linked to the client-based HTML code (namely, CSS and JS files).

The node_modules file, and the json files in the main dir are what was generated with the following node commands:
```
npm init
npm install --save express
npm install --save socket.io 
```


To start the server all you need to do is `node server.js`.

I also recommend using another program to allow for external IPs to connect to your server. I personally used serveo.net for this.

`ssh -R <a website name>:80:<your ip>:8080 serveo.net`
