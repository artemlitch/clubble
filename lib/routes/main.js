"use strict";

let express = require('express');
let router = express.Router();
let Club = require('../models/club');
let User = require('../models/user');
let passport = require('../passport/passport');
let attachDBUser = require('../middleware/getDBUser');
var userRouter = require('./users');

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
    if (req.user) {
        User.findOne({'email': req.user.email}).populate('memberClubs').exec(function (err, user) {
            var context = {my_clubs: user.memberClubs}
            res.render('index', context);
        });
    } else { 
        res.render('index', {});
    }
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
