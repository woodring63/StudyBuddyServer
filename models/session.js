var mongoose = require('mongoose');

var Session = mongoose.Schema({
	title: String
});

module.exports = mongoose.model('Session', Session);