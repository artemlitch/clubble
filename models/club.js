var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClubSchema = new Schema({
    title: String,
    twitter: String,
    youtube: String,
    email: String,
    facebook: String,
    urlTitle: String,
    admins: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
    members: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
});

var Club = mongoose.model('Club', ClubSchema);
module.exports = Club;
