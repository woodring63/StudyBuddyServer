/**
 * Created by enclark on 2/25/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//First argument is the collection
var userSchema = new Schema({
    name: String,
    username: {type: String, required: true, unique: true},
    courses: Array,
    buddies: Array, //stored as IDs
    sessions: Array,
    createdSessions: Array
});

userSchema.methods.findBuddies = function(){
    var budArray = [];
    for(var buddy in this.buddies)
    {
        budArray.push(mongo.findById(buddy));
    }
    return budArray;
};

userSchema.methods.findSessions = function(){
    var sessionArray = [];
    for(var session in this.sessions)
    {
        sessionArray.push(mongo.findById(session));
    }
    return sessionArray;
};

userSchema.methods.findCreatedSessions = function(){
    var createdSessionArray = [];
    for(var session in this.createdSessions)
    {
        createdSessionArray.push(mongo.findById(session));
    }
    return createdSessionArray;
};
//Edit data

var User = mongoose.model('Users', userSchema);

module.exports = User;