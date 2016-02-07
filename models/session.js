var mongoose = require('mongoose');

var Session = mongoose.Schema({
	// Data for a session
	// Note that this is just a test file
	/*
	creator: User,
	members: Users,
	creationDate: Date,
	expirationDate: Date,
	location: Location,
	whiteboardURL: String,
	documentURL: String,
	tasksURL: String,
	stickynotesURL: String
	*/
})

module.exports = mongoose.model('Session', Session);