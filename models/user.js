var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    name: {
        first: String,
        last: String,
    },
    username: { type: String, required: true, unique: true}, 
    password: { type: String, required: true }, 
    email: String,
    admin: Boolean,
    clubs: [{ type: Schema.Types.ObjectId, ref :'Club'}],
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
