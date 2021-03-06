var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/studyBuddy';
var ObjectId = require('mongodb').ObjectID;


function findUser(db, username, callback) {
	//This should sort the data returned to the cursor
	var cursor = db.collection('users').find({name: username});
	cursor.toArray(function (err,result)
			{
				if(err)
				{
					console.log(err);
					return 0;
				}else if(result.length)
				{
					console.log('Found:',result);
					return user;
				}else
				{
					console.log("No documents found matching search");
					return 0;
				}

			});
	if(typeof(callback) == "function")
	{
		callback();
	}
};

function findSessionByClass(db, classname, callback)
{

		//This should sort the data returned to the cursor
	var cursor = db.collection('sessions').find({course: classname});
	cursor.toArray(function (err,result)
			{
				if(err)
				{
					console.log(err);
					return 0;
				}else if(result.length)
				{
					console.log('Found:',result);
					return user;
				}else
				{
					console.log("No documents found matching search");
					return 0;
				}

			});
	if(typeof(callback) == "function")
	{
		callback();
	}
}


