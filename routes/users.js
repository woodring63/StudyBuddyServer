var express = require('express');
var router = express.Router();
var users = require('../models/users');
var mongoose = require('mongoose');
var sessions = require('../models/session');
var fs = require('fs');
var busboy = require('connect-busboy');

var photoDir = '../photos/';

/* GET users listing. */
/**
 * Searches for users by name in the database
 *     return json of users {users:[{}]}
 *	   if not successful, returns {status:failure}
 */

router.get('/name/:name', function(req, res) {

	console.log(req.params.name);
	users.find({name : req.params.name})
		.setOptions({sort: ''})
		.exec(function(err,user){
			if(err){
				console.log(err);
				res.status(500).json({status: 'failure'});
			} else {
				//User should be a JSON document
				var json = {users : user};

				console.log(user);
				res.json(json);//Otherwise this was send
			}
		});
});

/* GET info of the user with this username*/
/**
 * 	Used for logging in and finding if a user exists,then if they do, it finds
 *  info about all of their sessions, and the sessions that are related to
 *  their classes occuring in the next 24 hours
 *      returns json {user:{},newSessions:[{}],joinedSessions[{}], createdSessions[{}]}
 *      if the user is not found, returns {status:failure}
 */

router.get('/username/:username', function(req, res) {

	users.findOne({username : req.params.username})
		.exec(function(err,user){
			if(err){
				console.log(err);
				res.status(500).json({status: 'failure'});
			}
            else if (!user)
            {
                console.log(err);
                res.status(500).json({status: 'failure',msg: "user does not exist"});
            }
            else {
				//User should be a JSON document
				var json = {user : user, joinedSessions: [], createdSessions: []};

				//Also return all sessions will occur with the users classes in the next 24 hours
				sessions.find(
					({$and : [{course : {$in : user.courses}},
						      {startTime : {$gte : new Date().getTime(),
                                            $lte : new Date().getTime() + 86400000}}]}))
					.exec(function(err,newsessions){
						if (err)
						{
                            console.log(err);
							res.status(500).json({status: 'failure'});
						}
						else
						{
							json.newSessions = newsessions;
							console.log(user.courses);
							//Also find info on all the users sessions
							sessions.find({ _id : {$in : user.sessions.concat(user.createdSessions)}})
								.exec(function(err,sessions)
								{
									if(err)
									{
                                        console.log(err);
										res.status(500).json({status: 'failure'});
									}else
									{
                                        for(var i = 0; i < sessions.length; i++)
                                        {
                                            if(sessions[i].leader == user._id)
                                            {
                                                json.createdSessions.push(sessions[i]);
                                            }
                                            else
                                            {
                                                json.joinedSessions.push(sessions[i]);
                                            }
                                        }
										res.json(json);
									}

								});
						}
					});
			}
		});
});

/* GET info of the user with the given id */
/**
 * 	Will return a specific user.  Will not be used for login.
 *      return json {user:{}}
 *      else {status:failure}
 */

router.get('/id/:id', function(req, res) {

	users.findById(req.params.id)
		.exec(function(err,user){
			if(err){
				console.log(err);
				res.status(500).json({status: 'failure'});
			} else {
				//User should be a JSON document
				var json = {user : user};
				console.log(user);
				res.json(json);//Otherwise this was send
			}
		});
});

/* GET info on each buddy of the given user */
/**
 *  Finds info for each buddy of the user passed to the server. May return
 *  empty if user has no buddies
 *      returns json {buddies:[{}]}
 *      if error, returns {status:failure}
 */

router.get('/buddies/:id', function(req, res) {
	var json;
	users.findById(req.params.id)
		.exec(function(err,user){
			if(err){
				console.log(err);
				res.status(500).json({status: 'failure'});
			} else {
				//User should be a JSON document
				users.find({ _id : {$in : user.buddies} }, function(err, buddyarr) {
					if(err)
					{
						res.status(500).json({status: 'failure'});
					}else
					{
						json = {buddies : buddyarr};
						console.log(json);
						res.json(json);
					}

				});

		}
		});
});

/*GET photo of specific user*/
/**
 * This method will find the file for the photo of the specific user and send it
 * back
 *     returns photo if successful
 *     if not found, returns {status:failure}
 */
///UNTESTED
router.get('/photo/:id',function(req,res) {
// The filename is simple the local directory and tacks on the requested url
    var filename = photoDir+req.params.id;

    // This line opens the file as a readable stream
    var readStream = fs.createReadStream(__dirname + '/photos/'+ filename);

    // This will wait until we know the readable stream is actually valid before piping
    readStream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        readStream.pipe(res);
    });

    // This catches any errors that happen while creating the readable stream (usually invalid names)
    readStream.on('error', function(err) {
        res.end(err);
    });
});

/* POST users  */
/**
 *  Will take any user and throw it in the database so it must be
 *  formatted specifically for the db
 *      Pass in a user of the form:
 *		{
 *          name: String,
 *          username: String,
 *          courses: Array of Strings,
 *          major: String,
 *          bio: String,
 *          buddies: [],
 *          sessions: [],
 *          createdSessions: []
 *      }
 *      Leave the last two fields as empty arrays
 *          returns json {status:failure/success}
 */

router.post('/newuser', function(req, res) {
	//If more info than necessary is given, it will indiscriminately
	//stored in the database
	var record = new users(req.body);
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

/*POST upload a photo for the user*/
/**
 * The name of the photo will be the id of the user. IT will be stored
 * in the photo directory
 */

router.post('/upload',function(req, res){
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);

        //Path where image will be uploaded
        fstream = fs.createWriteStream(__dirname + '/photos/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log("Upload Finished of " + filename);
            res.redirect('back');
        });
    });
});

/* PUT users as friends  */
/**
 * Uses the id of the two to become friends to add them to each other's
 * buddy list.  Only use this method after the second person has accepted
 * the request
 *     returns json {status:failure/success}
 */

router.put('/updatefriends/:id/:id2',function(req,res) {
	users.findById(req.params.id, function(err, user1)
	{
		if(err) {
			res.status(500).json({status: 'failure'});
		}
		else
		{
			//adds user to the buddy list, then
			user1.buddies.push(req.params.id2);
			user1.save(function(err)
			{
				if(err)
				{
					res.status(500).json({status: 'failure'});
				}
			});
			//Now for the second user
			users.findById(req.params.id2, function(err, user2)
			{
				if(err) {
					res.status(500).json({status: 'failure'});
				}else
				{
					user2.buddies.push(req.params.id);
					user2.save(function(err)
					{
						if(err) {
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

/* PUT delete the user from the user buddy list  */
/**
 * The first id is the current user and the second id is the buddy that
 * the user wants to remove from their buddy list. Does not remove the first user
 * from the buddy list of the second user.
 *     returns json {status:failure/success}
 */

router.put('/deletefriend/:id/:id2',function(req,res) {
	users.update(
        { _id: req.params.id },
        { $pull: { buddies : req.params.id2 } },
        { safe: true }, function(err, user1) {
		if(err) {
			console.log(err);
			res.status(500).json({status: 'failure'});
		}
		else
		{
            res.status(200).json({status: 'success'});
		}

	});

});

/* PUT remove courses from their list  */
/**
 *	Deletes the courses from the array passed to the server from the
 *  course list of the given user
 *  Pass the courses in a json object like:
 *  {
 *      courses : ["COMS 309, ...]
 *  }
 *      returns json {status:failure/success}
 */

router.put('/deletecourses/:id',function(req,res) {
	//expecting: {courses: [<course>, ....]}
	var courses = req.body.courses;
	users.update(
		{ _id: req.params.id },
		{ $pullAll: { courses : courses } },
		{ safe: true },
		function remove(err, obj) {
			if(err)
			{
				res.status(500).json({status: 'failure'});
			}else
			{
				res.status(200).json({status: 'success'});
			}
		});
});

/* PUT add courses from their list  */
/**
 *	Adds courses from the given array to the user object.  Does not
 *  overwrite the current array
 *  Pass the courses in the form of a json object:
 *  {
 *      courses : ["COMS 309, ...]
 *  }
 *      returns json {status:failure/success}
 */

router.put('/addcourses/:id', function(req, res) {
	//expecting: {courses: [<course>, ....]
	var courses = req.body.courses;

	//this should be an array
	users.findById(req.params.id, function(err, user1)
	{
		if(err)
		{
			res.status(500).json({status: 'failure'});
		}else
		{
			//Adds each course to the user
			for(var i = 0; i < courses.length; i += 1)
			{
				user1.courses.push(courses[i]);//May want to optimize this
			}

			//Array.prototype.push.apply(user1.courses, courses);
			user1.save(function(err)
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
});

/* PUT update courses on their list  */
/**
 * 	More useful and quicker than the last method. Replaces the old courses
 *  with the new array of courses
 *  Pass the courses in the form of a json object:
 *  {
 *      courses : ["COMS 309", ...]
 *  }
 *      returns json {status:failure/success}
 */

router.put('/setcourses/:id', function(req, res) {

	users.findById(req.params.id, function(err, user1)
	{
		if(err) {
			res.status(500).json({status: 'failure'});
		}
		else
		{
            user1.courses = req.body.courses;
			//Array.prototype.push.apply(user1.courses, courses);
			user1.save(function(err)
			{
				if(err)
				{
					res.status(500).json({status: 'failure'});
				}
				else{
					res.status(200).json({status: 'success'});
				}

			});}
	});
});

/* PUT update the major of the user */
/**
 * Sets the major of the person from the params.  Now that I'm thinking
 * about it, I have doubts about this method, but I think it has worked
 *     returns json {status:failure/success}
 */

router.put('/setmajor/:id/:major', function(req, res) {

	users.findById(req.params.id, function(err, user1)
	{
		if(err)
		{
			res.status(500).json({status: 'failure'});
		}
		else
		{
			user1.major = req.params.major;
			//Array.prototype.push.apply(user1.courses, courses);
			user1.save(function(err)
			{
				if(err){
					res.status(500).json({status: 'failure'});
				}
				else {
					res.status(200).json({status: 'success'});
				}
			});
		}
	});
});

/* PUT remove sessions from their list  */
/**
 * Removes the person from the attendance list of the session and the
 * session from the joinedSession of the user
 *     returns json {status:failure/success}
 */

router.put('/leavesession/:id/:sessionid',function(req,res) {
	users.update(
		{ _id: req.params.id },
		{ $pull: { sessions : req.params.sessionid } },
		{ safe: true },
		function remove(err, obj) {
			if(err) {
				res.status(500).json({status: 'failure'});
			}
			else {
				sessions.update(
					{ _id: req.params.sessionid },
					{ $pull: { attendees : req.params.id } },
					{ safe: true },
					function remove(err, obj) {
						if(err) {
							res.status(500).json({status: 'failure'});
						}
						else {
							res.status(200).json({status: 'success'});
						}
					});
			}
		});
});

/* PUT add sessions from their list  */
/**
 * Adds the person to the sessions attendance and the session to the list
 * joined session of the user
 *     returns json {status:failure/success}
 */

router.put('/joinsession/:id/:sessionid',function(req,res) {
	users.findById(req.params.id, function(err, user1)
	{
		if(err){
			res.status(500).json({status: 'failure'});
		}
		else
		{
			//adds user to the buddy list, then
			for(var i = 0; i < user1.createdSessions.length; i ++)
            {
                if(user1.createdSessions[i] == req.params.sessionid)
                {
                    res.status(200).json({status: 'success',msg:"User has already created this session"});
                    return;
                }
            }
            for(var i = 0; i < user1.sessions.length; i ++)
            {
                if(user1.sessions[i] == req.params.sessionid)
                {
                    res.status(200).json({status: 'success',msg:"User is already signed up for this session"});
                    return;
                }
            }
			user1.sessions.push(req.params.sessionid);
			sessions.findById(req.params.sessionid, function(err,session) {
				if(err)
				{
					res.status(500).json({status: 'failure'});
				}
				else
				{
					session.attendees.push(req.params.id);
					session.save(function(err)
					{
						if(err)
							res.status(500).json({status: 'failure'});
						else
						{
							user1.save(function(err)
							{
								if(err)
									res.status(500).json({status: 'failure'});
								else
								{
									res.status(200).json({status: 'success'});
								}
							});
						}
					});
				}
			});
		}

	});
});

module.exports = router;