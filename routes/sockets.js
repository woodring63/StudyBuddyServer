/**
 * Created by enclark on 4/19/2016.
 */
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


io.on('connection', function(socket){

    socket.on('new mutation',function(msg){
        console.log("Received");
        io.emit('new mutation', msg);
    });
    socket.on('task',function(msg){
        console.log("Received tasks");
        io.emit('task', msg);
    });
});
server.listen(8300);