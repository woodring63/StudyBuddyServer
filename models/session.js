var mongoose = require('mongoose');

var Session = mongoose.Schema({
	title: String,
	startTime: String,
	endTime: String,
	attendees: Array,
	messages: Array,
	course: String,
	date: String
});

module.exports = mongoose.model('Session', Session);