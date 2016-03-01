var mongoose = require('mongoose');

var sessions = mongoose.Schema({
	title: String,
	startTime: Number,
	endTime: Number,
	attendees: Array,
	messages: Array,
	course: String
});

module.exports = mongoose.model('Session', sessions);

