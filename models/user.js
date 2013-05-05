var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
	email : String,
	dateMovedIn: Date,
	dateMovedOut: Date,
	address   : { type: Schema.Types.Mixed, ref: 'Address' }
});

userSchema.plugin(passportLocalMongoose);

// return User model
module.exports = mongoose.model('User', userSchema);