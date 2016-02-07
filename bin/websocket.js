//---------------------------------------------------------------
// The purpose is to introduce you to websockets
// This is a SERVER that is SEPARATE from the http server.
//
// Your webpage (in this case the index.html in this directory)
// will be SERVED by the http server. THEN, it will connect to the 
// websocket server. Then - they will talk to each other!
//
// Note that in regular http - the server cannot initiate a conversation
// Here, the websocket server sends a message to the client browser.
//
// This example has THREE parts
// 1) The http server code (which is same as what we did earlier)
// 2) This code - this is the web socket server
// It prints what it got from client. It also sends a message to the
// client after every 1 second.
// 3) The html or client code. Note how it connects to the websocket
// and how it sends and receives messages
//
// To RUN THIS EXAMPLE
// First, run node httpServer.js on one terminal
// Next, run node 1_ws.js on another terminal
// Next, type localhost:4000/index.html on some browser
//
//---------------------------------------------------------------
var io = require('socket.io').listen(5000);

function Message(u, t, r) {
	this.user = u;
	this.text = t;
	this.room = r;
}
var messages = [];

var players = [];


io.sockets.on('connection', function(socket) {
	
	// If someone sends a message, add it to the list
	socket.on('sendMessage', function(u, t, r) {
		console.log(u + ": " + t);
		var message = new Message(u, t, r);
		messages.push(message);
		io.sockets.emit("updateChat", messages);
	});
	
	// Get the local ip address of my machine IP address
	socket.on('IP', function(content) {
		var os = require('os');
		var interfaces = os.networkInterfaces();
		var addresses = [];
		for (var k in interfaces) {
			for (var k2 in interfaces[k]) {
				var address = interfaces[k][k2];
				if (address.family === 'IPv4' && !address.internal) {
					addresses.push(address.address);
				}
			}
		}
		console.log(addresses[0]);
		io.sockets.emit("updateIP", addresses[0]);
	});
	
	// On the load, send back all the players
	socket.on('onLoad', function(content) {
		io.sockets.emit("updatePlayers", players);
	});
	
	// If someone logged in, they need to be added
	socket.on('addPlayer', function(content) {
		console.log(content + " has logged in.");
		// add the player
		players.push(content);
	});
	
	// If someone logs out, they need to be removed
	socket.on('removePlayer', function(content) {
		console.log(content + " has logged out.");
		// remove the player
		var index = players.indexOf(content);
		players.splice(index, 1);
	});
	
});













