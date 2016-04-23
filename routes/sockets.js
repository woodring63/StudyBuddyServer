/**
 * Created by enclark on 4/19/2016.
 */
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var sessions = require('../models/session');

io.on('connection', function(socket){

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
                    msg.id = session._id;
                    io.emit('task', msg);
                }
            });
    });
//This is broken and functionality does not exist on the android side
    socket.on('remove task',function(msg){
        console.log("Received tasks");
        sessions.update(
            {_id: msg.session},
            {$pullAll : {tasks : req.body.tasks}},
            { safe: true },
            function(err, session){
                if(err) {
                    console.log(err);
                    res.status(500).json({status: 'failure'});
                }else
                {
                    res.status(200).json({status: 'success'});
                }
            });
        io.emit('remove task', {id:msg.id});
    });

});
server.listen(8300);