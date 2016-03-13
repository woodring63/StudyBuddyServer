var mongoose = require('mongoose');

/**
 * The schema of the session. The SessionSchema object on the android side should format everything
 * accordingly.
 */

var sessions = mongoose.Schema({
	title: String,
	startTime: Number,
	endTime: Number,
    course: String,
	attendees: Array,
	messages: Array,
	leader: String
});

module.exports = mongoose.model('Session', sessions);

