var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var sessions = require('../models/session');
console.log(server);

//Not used, but without it, the code breaks

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Study Buddy' });
});



io.on('connection', function(socket){
    console.log("Client connected Chat");

    socket.on('new message',function(msg){
        console.log("message: " + msg.msg);
        sessions.update(
            {_id: msg.session},
            {$push : {messages : {name : msg.name, message: msg.msg}}},
            { safe: true },
            function(err, session) {
                if (err) {
                    console.log(err);
                }
            });
        io.emit('message', msg);
    });

    socket.on('new bitmap',function(msg){
        console.log("message: " + msg);
        sessions.update(
            {_id: msg.session},
            {whiteboard: msg.image},
            {safe:true},
            function(err,message){
                if(err){
                    console.log(err);
                }
            });
        io.emit('new bitmap', msg);

    });

    socket.on('new mutation',function(msg){
        console.log("Received");
        io.emit('new mutation', msg);
    });

    socket.on('add task',function(msg){
        console.log("Received tasks");
        sessions.update(
            {_id: msg.session},
            {$push: {tasks : msg}},
            { safe: true },
            function(err, session){
                if(err) {
                    console.log(err);
                }else
                {
                    //msg is a json object
                    io.emit('new task', msg);
                }
            });
    });
});
server.listen(8000);

module.exports = router;