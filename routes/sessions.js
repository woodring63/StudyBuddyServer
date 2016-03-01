/**
 * Created by enclark on 2/29/2016.
 */
var router = express.Router();
var sessions = require('../models/session');
var mongoose = require('mongoose');



/* GET session by id. */
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

/* GET sessions with filter*/           //20161118
router.get('/:course/:startTime/:endTime/:date', function(req,res) {
    //Checks which fields are filled out and then constructs an object to search for based off
    //these parameters
    var arr = [];
    if(req.params.course != '0')
    {
        push.apply(arr, [{course : req.params.course}]);
    }
    if(req.params.startTime != '0')
    {
        push.apply(arr, [{startTime : {$gte : req.params.startTime}}]);
    }
    if(req.params.endTime != '0')
    {
        push.apply(arr, [{endTime : {$lte : req.params.endTime}}]);
    }
    if(req.params.date != '0')
    {
        push.apply(arr, [{date : req.params.date}]);
    }

    users.find({ $add : arr }, function(err, array) {
        if(err) res.status(500).json({status: 'failure'});

        var json = {sessions : array};
        console.log(json);
        res.json(json);
    });//Otherwise this was send

});




/* POST a session into the db. */
router.post('/newsession', function(req, res) {
    //If more info than necessary is given, it will indiscriminately
    //stored in the database
    var record = new sessions(req.body);
    record.save(function(err){
        if(err) {
            console.log(err);
            res.status(500).json({status: 'failure'});
        }else{
            //User should be a JSON document
            res.status(200).json({status: 'success'});
        }
    });
});


