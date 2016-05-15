"use strict";

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
    name: {
        first: String,
        last: String,
    },
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    ownedClubs: [{type: Schema.Types.ObjectId, ref: 'Club'}],
    memberClubs: [{type: Schema.Types.ObjectId, ref: 'Club'}],
});

let User = mongoose.model('User', UserSchema);
module.exports = User;
