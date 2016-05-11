var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ClubSchema = new Schema({
    title: String,
    twitter: String,
    youtube: String,
    email: String,
    facebook: String,
    admin: { type: Schema.Types.ObjectId, ref: 'User' }, 
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

var Club = mongoose.model('Club', ClubSchema);
module.exports = Club;
