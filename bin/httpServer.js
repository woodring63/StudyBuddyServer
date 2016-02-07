//---------------------------------------------------------------
// The purpose is to serve a file!
//---------------------------------------------------------------

var util = require('util');
var path = require('path');
var http = require('http');
var fs   = require('fs');
var server = http.createServer();

server.on('request', function (request, response) {
	var file = path.normalize('.' + request.url);
	fs.exists(file, function(exists) {
		if (exists) {
			var rs = fs.createReadStream(file);
			rs.on('error', function() {
				response.writeHead(500);
				response.end('Internal Server Error');
			});
			response.writeHead(200);
			rs.pipe(response)
		} else {
			response.writeHead(404);
			response.end('Not found');
		}
	}
}

// Listen for the websocket. Use IPv4 or localhost
//server.listen(4000, 'IPv4 address');

//server.listen(4000, '10.36.78.160');
server.listen(4000, '10.36.67.99');

// localhost
//server.listen(4000);

