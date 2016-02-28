var express = require('express');
var router = express.Router();
var users = require('../models/users');
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:3000');


/* GET users listing. */
// /users/<name>

// returns a users by name
//Searches for users
router.get('/name/:name?', function(req, res) {

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

//Returns a specific user by searching for their info with their id
//Will be used to get a friend's info or their info
router.get('/id/:id?', function(req, res) {

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



/* PUT users  */

//Find both users and add their id to the buddy list
//Requires Id of both users
router.put('/updatefriends/:id/:id2',function(req,res) {
	users.findById(req.params.id, function(err, user1)
	{
		if(err) res.send(err);

		//adds user to the buddy list, then
		user1.buddies.push(req.params.id2);
		user1.save(function(err)
		{
			if(err) res.send(err);
		});

	});
		users.findById(req.params.id2, function(err, user2)
		{
			if(err) res.send(err);

			user2.buddies.push(req.params.id);
			user2.save(function(err)
			{
				if(err) res.send(err);
				res.status(200).json({status: 'success'});

			});
		});
});

//Allows the user to delete certain courses
router.put('/deletecourses/:id',function(req,res) {
	//expecting: {courses: [<course>, ....]
	var courses = req.body.courses;
	users.update(
		{ _id: req.params.id },
		{ $pullAll: { courses : courses } },
		{ safe: true },
		function remove(err, obj) {
			if(err) res.send(err);
			res.status(200).json({status: 'success'});
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

//User can add courses to their user object
router.put('/addcourses/:id', function(req, res) {
	//expecting: {courses: [<course>, ....]
	var courses = req.body.courses;

	//this should be an array
	users.findById(req.params.id, function(err, user1)
	{
		if(err) res.send(err);
		//Adds each course to the user
		for(var i = 0; i < courses.length; i += 1)
		{
			user1.courses.push(courses[i]);
		}

		//Array.prototype.push.apply(user1.courses, courses);
		user1.save(function(err)
		{
			if(err) res.send(err);
			res.status(200).json({status: 'success'});
		});

	});
});


//*******LAST TWO ARE UNTESTED*******************************

//unjoin a session
router.put('/unjoinsession/:id/:sessionid',function(req,res) {
	users.update(
		{ _id: req.params.id },
		{ $pull: { sessions : req.params.sessionid } },
		{ safe: true },
		function remove(err, obj) {
			if(err) res.send(err);
			res.status(200).json({status: 'success'});
		});
});

//join a session, add the session id to the array list of session ids
router.put('/joinsession/:id/:sessionid',function(req,res) {
	users.findById(req.params.id, function(err, user1)
	{
		if(err) res.send(err);

		//adds user to the buddy list, then
		user1.sessions.push(req.params.sessionid);
		user1.save(function(err)
		{
			if(err) res.send(err);
		});

	});
});




module.exports = router;