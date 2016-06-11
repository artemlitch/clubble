"use strict";

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let passportLocalMongoose = require('passport-local-mongoose');

let UserSchema = new Schema({
    name: {
        first: String,
        last: String,
    },
    email: {type: String, required: true, unique: true},
    password: {type: String, required: false},
    ownedClubs: [{type: Schema.Types.ObjectId, ref: 'Club'}],
    memberClubs: [{type: Schema.Types.ObjectId, ref: 'Club'}],
    superUser: {type: Boolean},
});

UserSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

let User = mongoose.model('User', UserSchema);
module.exports = User;
