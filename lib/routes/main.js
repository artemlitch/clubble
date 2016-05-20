"use strict";

let express = require('express');
let router = express.Router();
let Club = require('../models/club');
let User = require('../models/user');
let passport = require('../passport/passport');
let attachDBUser = require('../middleware/getDBUser');
var userRouter = require('./users');
var async = require('async');
router.use(userRouter);

//override render function to always pass user
router.use(function( req, res, next ) {
    var _render = res.render;
    res.render = function( view, options, fn ) {
        if (req.user) {
            options = Object.assign({}, options, {
                user: req.user
            });
        }
        _render.call( this, view, options, fn );
    }
    next();
});

router.get('/', function (req, res, next) {
    async.waterfall([
        //find new clubs
        function(next) {
            Club.find().sort({_id:-1}).limit(10).exec(next); 
        },
        //find popular clubs TODO: what is popular?
        function(newClubs, next) {
           next(null, newClubs, {}); 
        },
        //find clubs linked to user
        function(newClubs, popularClubs, next) {
            let context = {
                my_clubs: {}, 
                popular_clubs: popularClubs, 
                new_clubs: newClubs
            };
            if (req.user) {
                User.findOne({'email': req.user.email}).populate('memberClubs').exec(function (err, user) {
                    if (err) next(err);
                    context['my_clubs'] = user.memberClubs;
                    next(null, context);
                });
            } else {
                next(null, context);
            }
        },
    ], function(err, context) {
        res.render('index', context);
    });
});


router.route('/create_club')
    .get(function (req, res, next) {
        if(req.user) {
            res.render('create_club');
        } else {
            res.redirect('login');
        }
    })
    .post(attachDBUser, function (req, res, next) {
        if(req.user) {
            let formData = req.body;
            let club = new Club();
            let errors = {};
            ['name', 'email', 'clubLink'].forEach(fieldName => {
                let val = formData[fieldName] || '';
                if (val.length === 0) {
                    errors[fieldName] = `Invalid ${fieldName}`;
                }
                else {
                    club[fieldName] = val;
                }
            });
            if (Object.keys(errors).length !== 0) {
                return res.render('create_club', {
                    model: formData,
                    errors: errors,
                });
            }
            club.description = formData.description || '';
            club.admins.push(req.user.dbUser); 
            club.members.push(req.user.dbUser); 

            req.user.dbUser.ownedClubs.push(club);
            req.user.dbUser.memberClubs.push(club);
                        
            club.save((err) => {
                if (err) {
                    return next(err);
                }
            })
            .then(req.user.dbUser.save((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect(`/${club.clubLink}`);
            }));
        } else {
            res.redirect('login');
        }
    });

router.get('/:clubLink', attachDBUser, function (req, res, next) {
    if (!req.params.clubLink) {
        return res.redirect('/');
    }
    Club.findOne({'clubLink': req.params.clubLink}, (err, club) => {
        if (err) {
            return next(err);
        }
        if (!club) {
            return res.render('club_does_not_exist');
        }
        let context = {
            name: club.name,
            email: club.email,
            description: club.description,
        };
        if (req.user) {
            context['user'] = req.user.email;
            if(club.userIsAdmin(req.user.dbUser)) {  
                res.render('club_home_admin', context);
            } else {
                res.render('club_home', context);
            }
        } else {
            res.render('club_home', context);
        }
    });
});

module.exports = router;
