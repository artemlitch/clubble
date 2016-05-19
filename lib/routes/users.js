"use strict";

let express = require('express');
let router = express.Router();
let User = require('../models/user');
let passport = require('../passport/passport');

router.route('/register')
    .get(function (req, res, next) {
        if(req.user) {
            res.redirect('/');
        } else {
            res.render('register', { });
        }
    })
    .post(
        function(req, res, next) {
            User.register(new User({email: req.body.email}), req.body.password, function(err, account) {
                if (err) {
                    console.log(err);
                    return res.render('register', { message : err.message });
                }
                passport.authenticate('local')(req, res, function() {
                    req.session.save(function (err) {
                        if (err) {
                            return next(err);
                        }
                        res.redirect('/');
                    });
                });
            });
    });

router.get('/login', function(req, res) {
    if(req.user) {
        res.redirect('/');
    } else {
        res.render('login', { });
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login', // see text
    failureFlash: true // optional, see text as well
}));

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

module.exports = router;
