var mongoose = require('mongoose');

/**
 * The schema of the session. The SessionSchema object on the android side should format everything
 * accordingly. Loc is basically a GeoJSON object and the loc type describes the type of coords given.
 * Point is a good example.  For more info : https://docs.mongodb.org/manual/applications/geospatial-indexes/
 */

var sessions = mongoose.Schema({
	startTime: Number,
	endTime: Number,
    course: String,
	attendees: Array,
	bio: String,
	messages: Array,
	leader: String,
	loc: {
		type: { type: String },
		coordinates: []
	}
});

module.exports = mongoose.model('Session', sessions);

