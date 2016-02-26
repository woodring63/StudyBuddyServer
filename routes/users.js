var express = require('express');
var router = express.Router();
var users = require('../models/users');



/* GET users listing. */
// /users/<name>
//Theoretically returns a user by name
router.get('/:name?', function(req, res) {
	// res.send(req.query.name);
	users.find(req.query.name)
		.setOptions({sort: ''})
		.exec(function(err,user){
			if(err){
				console.log(err);
				res.status(500).json({status: 'failure'});
			} else {
				//User should be a JSON document
				var json = {user : user, buddyList : user.findBuddies()};
				console.log(user);
				res.send(json);
			}
		});
});


//Theoretically stores the data in the database
router.post('/:name?', function(req, res) {
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




module.exports = router;