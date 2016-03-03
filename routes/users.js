var express = require('express');
var router = express.Router();
var users = require('../models/users');
var mongoose = require('mongoose');
var sessions = require('../models/session'); //Not tested
//mongoose.connect('mongodb://localhost:3000');


/* GET users listing. */
// /users/<name>

// returns a users by name
//Searches for users
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
router.get('/username/:username', function(req, res) {

	users.findOne({username : req.params.username})
		.exec(function(err,user){
			if(err){
				console.log(err);
				res.status(500).json({status: 'failure'});
			} else {
				//User should be a JSON document
				var json = {user : user};
				console.log(user);

				//Also return all sessions will occur with the users classes in the next 24 hours
				sessions.find(
					({$and : [{course : user.courses },
						{startTime : {$gte : new Date().getTime(), $lte : new Date().getTime() + 86400000}}]}))
					.exec(function(err,newsessions){
						if (err)
						{
							res.status(500).json({status: 'failure'});
						}
						else
						{
							json.newSessions = newsessions;
							console.log(newsessions);
							console.log(json);
							//Also find info on all the users sessions
							sessions.find({ _id : {$in : user.sessions}})
								.exec(function(err,joinedSessions)
								{
									if(err)
									{
										res.status(500).json({status: 'failure'});
									}else
									{
										json.joinedSessions = joinedSessions;
										console.log(json);
										res.json(json);
									}

								});
						}
					});

			}
		});
});

/* GET info of the user with the given id */
//Returns a specific user by searching for their info with their id
//Will be used to get a friend's info or their info
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

/* POST users  */

//Stores the data in the database
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



/* PUT users as friends  */

//Find both users and add their id to the buddy list
//Requires Id of both users
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

/* PUT remove courses from their list  */
//Allows the user to delete certain courses
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



	//this should be an array
	//users.findById(req.params.id, function(err, user1)
	//{
	//	if(err) res.send(err);
	//	//Adds each course to the user
    //
	//	//Array.prototype.push.apply(user1.courses, courses);
	//	user1.save(function(err)
	//	{
	//		if(err) res.send(err);
	//		res.status(200).json({status: 'success'});
	//	});
    //
	//});
});

/* PUT add courses from their list  */
//User can add courses to their user object
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
router.put('/setcourses/:id', function(req, res) {

	users.findById(req.params.id, function(err, user1)
	{
		if(err) {
			res.status(500).json({status: 'failure'});
		}
		else
		{		user1.courses = req.body.courses;
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
//Sets the major of the person
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
//unjoin a session
router.put('/unjoinsession/:id/:sessionid',function(req,res) {
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
//join a session, add the session id to the array list of session ids
router.put('/joinsession/:id/:sessionid',function(req,res) {
	users.findById(req.params.id, function(err, user1)
	{
		if(err){
			res.status(500).json({status: 'failure'});
		}
		else
		{
			//adds user to the buddy list, then
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