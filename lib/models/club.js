"use strict";

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ClubSchema = new Schema({
    name: String,
    twitter: String,
    youtube: String,
    email: String,
    facebook: String,
    clubLink: String,
    admins: [{type: Schema.Types.ObjectId, ref: 'User'}],
    members: [{type: Schema.Types.ObjectId, ref: 'User'}],
});

ClubSchema.methods.userIsAdmin = function (user) {
   return this.admins.some(function (admin) {
        return admin.equals(user._id);
   });
}
let Club = mongoose.model('Club', ClubSchema);
module.exports = Club;
