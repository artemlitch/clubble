"use strict";

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ClubSchema = new Schema({
    title: String,
    twitter: String,
    youtube: String,
    email: String,
    facebook: String,
    urlTitle: String,
    admins: [{type: Schema.Types.ObjectId, ref: 'User'}],
    members: [{type: Schema.Types.ObjectId, ref: 'User'}],
});

let Club = mongoose.model('Club', ClubSchema);
module.exports = Club;
