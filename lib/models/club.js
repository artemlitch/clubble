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
    description: String,
    tags: [String],
    admins: [{type: Schema.Types.ObjectId, ref: 'User'}],
    members: [{type: Schema.Types.ObjectId, ref: 'User'}],
});

ClubSchema.methods.userIsAdmin = function (user) {
   return this.admins.some(function (admin) {
        return admin.equals(user._id);
   });
}
ClubSchema.statics.random = function(callback) {
  this.count(function(err, count) {
    if (err) {
      return callback(err);
    }
    var rand = Math.floor(Math.random() * count);
    this.findOne().skip(rand).exec(callback);
  }.bind(this));
};

let Club = mongoose.model('Club', ClubSchema);
module.exports = Club;
