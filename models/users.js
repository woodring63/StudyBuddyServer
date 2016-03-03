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
    major: String,
    buddies: Array, //stored as IDs
    sessions: Array
});

//***********The following code will most likely not be used***
//***********It's here for example purposes only right now*****

userSchema.methods.findBuddies = function(){
    var budArray = [];
    for(var buddy in this.buddies)
    {
        budArray.push(User.findById(buddy));
    }
    return budArray;
};

userSchema.methods.findSessions = function(){
    var sessionArray = [];
    for(var session in this.sessions)
    {
        sessionArray.push(User.findById(session));
    }
    return sessionArray;
};

userSchema.methods.findCreatedSessions = function(){
    var createdSessionArray = [];
    for(var session in this.createdSessions)
    {
        createdSessionArray.push(User.findById(session));
    }
    return createdSessionArray;
};

//Edit data

userSchema.methods.addBuddy = function(newBudId, id){
    User.findById(id, function(err, user)
    {
       if(err) throw err;

        user.friends.push(newBudId);

        user.save(function(err)
        {
            if(err) throw err;
        });
        return user;
    });

};

//*************************************************************

var User = mongoose.model('Users', userSchema);

module.exports = User;