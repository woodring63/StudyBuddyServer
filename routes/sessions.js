/**
 * Created by enclark on 2/29/2016.
 */
var express = require('express');
var router = express.Router();
var sessions = require('../models/session');
var users = require('../models/users');
var mongoose = require('mongoose');

/* GET session by id. */
/**
 * Finds the session with the given id
 *     returns json {session : {}}
 *     else returns {status : failure}
 */

router.get('/id/:id', function(req, res) {
    sessions.findById(req.params.id)
        .exec(function(err,session){
            if(err){
                console.log(err);
                res.status(500).json({status: 'failure'});
            } else {
                //User should be a JSON document
                var json = {session : session};
                console.log(session);
                res.json(json);//Otherwise this was send
            }
        });
});

/* GET sessions with filter*/
/**
 * Filters the sessions by courses, end times, and/or start times. If any
 * parameter is not used, place a 0 in it's spot. The course should have
 * no space in it.
 *     returns json {sessions : [{}]}
 *     may be empty or returns {status:failure}
 */

router.get('/filter/:course/:startTime/:endTime', function(req,res) {
    //Checks which fields are filled out and then constructs an object to search for based off
    //these parameters
    var arr = [];
    if(req.params.course != '0')
    {
        var str = req.params.course;
        arr.push({course : str.replace("%20"," ")});
    }
    if(req.params.startTime != '0')
    {
        arr.push({startTime : {$gte : parseInt(req.params.startTime)}});
    }else
    {
        arr.push({startTime : {$gte : new Date().getTime() - 86400000 * 7}});
    }
    if(req.params.endTime != '0')
    {
        arr.push({endTime : {$lte : parseInt(req.params.endTime)}});
    }
    console.log(arr);
    sessions.find({ $and : arr }, function(err, array) {
        if(err) {
            res.status(500).json({status: 'failure'})}
        else{
            var json = {sessions : array};
            console.log(json);
            res.json(json);
        }

    });//Otherwise this was send

});

/*GET the current document that has been stored in the db*/
/**
 * Returns a json containing the current string object stored for the document in the database.
 * Sends the json in the form:
 * {
 *     document: String
 * }
 * else it will return status:failure
 */

router.get('/document/:sessionid',function(req,res) {
    sessions.findById(req.params.sessionid, function(err,session){
        if(err)
        {
            console.log(err);
            res.status(500).json({status:'failure'});
        }else{
            res.json({text:session.document});
        }

    })
});

/*GET the current  whiteboard that has been stored in the db*/
/**
 * Returns a json containing the current string object stored for the document in the database.
 * Sends the json in the form:
 * {
 *     whiteboard: String
 * }
 * else it will return status:failure
 */

router.get('/whiteboard/:sessionid',function(req,res) {
    sessions.findById(req.params.sessionid, function(err,session){
        if(err)
        {
            console.log(err);
            res.status(500).json({status:'failure'});
        }else{
            res.json({whiteboard:session.whiteboard});
        }

    })
});

/* GET the tasks of the session*/
/**
 * Returns a json containing the current string object stored for the tasks stored in the database.
 * Sends the json in the form:
 * {
 *     tasks: [tasks]
 * }
 * else it will return status:failure
 */

router.get('/tasks/:sessionid',function(req,res) {
    sessions.findById(req.params.sessionid, function(err,session){
        if(err)
        {
            console.log(err);
            res.status(500).json({status:'failure'});
        }else{
            res.json({tasks:session.tasks});
        }
    })
});

/* GET the chat history of the session*/
/**
 * Returns a json containing the current string object stored for the document in the database.
 * Sends the json in the form:
 * {
 *     chat: [messages]
 * }
 * else it will return status:failure
 */

router.get('/chat/:sessionid',function(req,res) {
    sessions.findById(req.params.sessionid, function(err,session){
        if(err)
        {
            console.log(err);
            res.status(500).json({status:'failure'});
        }else{
            res.json({messages:session.messages});
        }
    })
});

/* POST a session into the db. */
/**
 * Will indiscriminately take the given session and put it into the
 * database, so it must be formatted correctly. Times are in milliseconds
 * and include the date.  Leave attendees and messages as an empty array
 * Place id of the leader in the json object and the server will then
 * update the leaders information as well.
 * Pass it in the form of:
 * {
 *     title : String,
 *     startTime : Number,
 *     endTime : Number,
 *     course: String,
 *     bio : String,
 *     attendees : [],
 *     messages : [],
 *     course : String,
 *     leader : String
 * }
 * returns json {status:failure/success}
 */

router.post('/newsession', function(req, res) {
    //If more info than necessary is given, it will indiscriminately
    //stored in the database
    var record = new sessions(req.body);
    users.findById(record.attendees[0])
         .exec(function(err,user){
            if(err)
            {
                console.log(err);
                res.status(500).json({status: 'failure'});
            }else
            {
                console.log(record);
                console.log(record.attendees[0]);
                record.save(function(err,session) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({status: 'failure'});
                    } else {
                        if(!user)
                        {
                            res.status(500).json({status: 'failure'});
                            return;
                        }
                        user.sessions.push(session._id)
                        user.save(function(err)
                        {
                            if(err)
                            {
                                res.status(500).json({status: 'failure'});
                            }else
                            {
                                res.status(200).json({status: 'success'});
                            }

                        });
                    }
                });
            }
         });
});

/*PUT add a task to the session*/
/**
 * This method takes a json of task or json array of tasks and pushes it onto the array of tasks
 * for this session. The tasks assume that the names are unique.  The tasks should be formatted accordingly:
 * {
 *      tasks: [{
 *                  task: String,
 *                  startTime: Number,
 *                  endTime: Number,
 *                  completed: Boolean
 *             },...]
 * }
 *
 * returns json {status:failure/success}
 */

router.put('/addtask/:sessionid',function(req,res){
    sessions.update(
        {_id: req.params.sessionid},
        {$pushAll : {tasks : req.body.tasks}},
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
});

/*PUT remove a task from the session*/
/**
 * The method finds the task of the given name form the given session id and removes it
 * from the task array.  The tasks assume that the names are unique.
 * May later be changed to account
 * for their ids.
 * returns json {status:failure/success}
 */

router.put('/removetask/:task/:sessionid',function(req,res){

    var task = req.params.task.replace("%20"," ");

    sessions.findById(req.params.sessionid, function(err, session){
            if(err) {
                console.log(err);
                res.status(500).json({status: 'failure'});
            }else
            {
                for(var i = 0; i < session.tasks.length; i++)
                {
                    if(session.tasks[i].task == task)
                    {
                        session.tasks[i].remove();
                    }
                }
                session.save(function(err){
                    if(err)
                        res.status(500).json({status: 'failure'});
                    else
                    {
                        res.status(200).json({status: 'success'});
                    }
                });
            }
        });
});

/*PUT remove a task from the session*/
/**
 * This method takes a json of task or json array of tasks and updates the task based on the given
 * completed status. The tasks assume that the names are unique and takes names as the identifier.
 * The tasks should be formatted accordingly:
 * {
 *     task: String,
 *     completed: Boolean
 * }
 *
 * returns json {status:failure/success}
 */

router.put('/updatetask/:sessionid',function(req,res){
    sessions.findById( req.params.sessionid, function(err, session){
            if(err) {
                console.log(err);
                res.status(500).json({status: 'failure'});
            }else
            {
                for(var i = 0; i < session.tasks.length; i++)
                {
                    if(session.tasks[i].task == req.body.task)
                    {
                        session.tasks[i].completed = req.body.completed;
                        console.log(session.tasks[i]);
                    }
                }
                console.log(session.tasks);
                session.save(function(err){
                    if(err)
                        res.status(500).json({status: 'failure'});
                    else
                    {
                        res.status(200).json({status: 'success'});
                    }
                });
            }
        });
});





module.exports = router;

