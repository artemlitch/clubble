"use strict";

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let EventSchema = new Schema({
    name: String,
    facebook_link: String,
    fromFacebook: Boolean,
    facebook_id: {type: String, unique: true},
    description: String,
    tags: [String],
    start_time: String,
    end_time: String,
    start_month: String,
    start_date: String,
    place: {name: String},
    club: [{type: Schema.Types.ObjectId, ref: 'Club'}],
});


let Event = mongoose.model('Event', EventSchema);
module.exports = Event;
