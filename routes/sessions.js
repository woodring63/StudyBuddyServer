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

router.get('/:course/:startTime/:endTime', function(req,res) {
    //Checks which fields are filled out and then constructs an object to search for based off
    //these parameters
    var arr = [];
    if(req.params.course != '0')
    {
        var str = req.params.course;
        arr.push({course : str.slice(0,str.length - 3) + ' ' + str.slice(str.length - 3)});
    }
    if(req.params.startTime != '0')
    {
        arr.push({startTime : {$gte : parseInt(req.params.startTime)}});
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
    users.findById(record.leader)
         .exec(function(err,user){
            if(err)
            {
                console.log(err);
                res.status(500).json({status: 'failure'});
            }else
            {
                record.save(function(err,session) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({status: 'failure'});
                    } else {
                        user.createdSessions.push(session._id)
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

/**/
/**
 *
 */

module.exports = router;

