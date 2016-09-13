"use strict";

let express = require('express');
let router = express.Router({mergeParams: true});
let Club = require('../models/club');
let Events = require('../models/events');
let async = require('async');
let passport = require('../passport/passport');
let graph = require('fbgraph');
let request = require('request');
let fbToken = process.env.FB_CLIENT_ID+"|"+process.env.FB_CLIENT_SECRET;
let moment = require('moment');
//let fbToken = "access_token="+process.env.FB_CLIENT_TOKEN;

router.route('/json')
    .get(function (req, res, next) {
        async.waterfall([
            function(next) {
                Club.findOne({'clubLink': req.params.clubLink}).exec(next); 
            },
            function(club, next) {
                Events.find({'club': club}).exec(next);
            }], 
            function(err, events) {
                res.json(events); 
            });
    });

module.exports = router;
