var mongoose = require('mongoose');
var hash = require('../util/hash');
var aws = require('../util/aws');

UserSchema = mongoose.Schema({
                             firstName:  String,
                             lastName:   String,
                             email:      String,
                             userToken:  String,
                             salt:       String,
                             hash:       String,  
                             });

UserSchema.statics.signup = function(firstName, lastName, email, password, activationKey, done){
	var User = this;
	hash(password, function(err, salt, hash){
         if(err)
            throw err;
         //TODO call aws to get the user token token using the activationKey
         var userToken= 'SET_TO_USER_TOKEN';
         User.create({
                     firstName : firstName,
                     lastName : lastName,
                     email : email,
                     userToken : userToken,
                     salt : salt,
                     hash : hash
                     }, function(err, user){
                         if(err)
                            throw err;
                         //create bucket that will hold all objects for user
                         aws.createBucket(user,done);                         
                     });
         });
}


UserSchema.statics.isValidUserPassword = function(email, password, done) {
	this.findOne({email : email}, function(err, user){
                 // if(err) throw err;
                 if(err) return done(err);
                 if(!user) return done(null, false, { message : 'Incorrect email.' });
                 hash(password, user.salt, function(err, hash){
                      if(err) return done(err);
                      if(hash == user.hash) return done(null, user);
                      done(null, false, {
                           message : 'Incorrect password'
                           });
                      });
                 });
};


var User = mongoose.model("User", UserSchema);
module.exports = User;