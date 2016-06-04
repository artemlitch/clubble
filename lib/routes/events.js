"use strict";

let express = require('express');
let router = express.Router({mergeParams: true});
let Club = require('../models/club');
let async = require('async');
let passport = require('../passport/passport');
let graph = require('fbgraph');
let request = require('request');
let fbToken = process.env.FB_CLIENT_ID+"|"+process.env.FB_CLIENT_SECRET;
//let fbToken = "access_token="+process.env.FB_CLIENT_TOKEN;

router.route('/json')
    .get(function (req, res, next) {
        async.waterfall([
            function(next) {
                Club.findOne({'clubLink': req.params.clubLink}).exec(next); 
            },
            function(club, next) {
                var options = {
                    timeout:  3000
                    , pool:     { maxSockets:  Infinity }
                    , headers:  { connection:  "keep-alive" }
                };
                let currentTime = Date.now()/1000 | 0;
                //TODO: move this to a validation function
                let reg = (/(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/\/)*([\w\-\.]*)/)
                if (club.facebook) {
                    let fbClub = club.facebook.match(reg)[1];
                    graph
                    .setOptions(options)
                    .get(fbClub+"/events",{since:currentTime, access_token: fbToken}, function(err, res) {
                        let fbEvents = []
                        if(res) {
                            fbEvents = res.data;
                        }
                        next(err, club, fbEvents);
                    });
                } else {
                    next(null, club, []);
                }
            }], 
            function(err, club, fbEvents) {
                let clubbleEvents = [];
                let events = {
                    fbEvents: fbEvents,
                    clubbleEvents: clubbleEvents,
                }
                res.json(events); 
            });
    });

module.exports = router;
