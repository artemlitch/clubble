"use strict";
let CronJob = require('cron').CronJob;
let async = require('async');
let Club = require('../models/club');
let Event = require('../models/events');
let graph = require('fbgraph');
let request = require('request');
let fbToken = process.env.FB_CLIENT_ID+"|"+process.env.FB_CLIENT_SECRET;
let moment = require('moment');

new CronJob('* */30 * * * *', function() {
    async.waterfall([
        function(next) {
            Club.find({facebook: {$ne: ""}}).exec(next); 
        },
        function(clubs, next) {
            async.each(clubs, function(club, callback) {
                // Perform operation on file here.
                var options = {
                    timeout:  3000
                    , pool:     { maxSockets:  Infinity }
                    , headers:  { connection:  "keep-alive" }
                };
                let currentTime = Date.now()/1000 | 0;
                //TODO: move this to a validation function
                let reg = (/(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:groups\/)?(?:[\w\-]*\/\/)*([\w\-\.]*)/)
                let fbClub = club.facebook.match(reg)[1];
                graph
                .setOptions(options)
                .get(fbClub+"/events",{since:currentTime, access_token: fbToken}, function(err, res) {
                    let fbEvents = []
                    if(res) {
                        fbEvents = res.data;
                        for(let e in fbEvents) {
                            let d = moment(fbEvents[e]['start_time']);
                            fbEvents[e]['start_month'] = d.format('MMMM');
                            fbEvents[e]['start_date'] = d.format('D');
                            fbEvents[e]['start_time'] = d.format('h:mm a');
                            //update the event in Mongo DB
                            fbEvents[e]['club'] = club;
                            fbEvents[e].fromFacebook = true;
                            fbEvents[e].facebook_link = "www.facebook.com/events/"+fbEvents[e].id;
                            Event.update({facebook_id: fbEvents[e].id}, fbEvents[e], {upsert: true}, 
                            function (err) { 
                                if(err) {
                                    console.log(err);
                                }
                           });
                        }
                    }
                });
            }, function(err) {
            });
            next(null, null, []);
        }]); 
}, null, true, 'America/Los_Angeles');
