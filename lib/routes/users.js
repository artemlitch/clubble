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
            res.render('login', { });
        }
    })
    .post(function(req, res, next) {
        if (process.env.BETA) {
            if (req.body.beta_key == undefined || req.body.beta_key != process.env.BETA_KEY) {
                return res.render('login', { message : "Wrong Beta Key" });
            }
        }
        User.register(new User({name: {first: req.body.firstname, last: req.body.lastname}, email: req.body.email}), req.body.password, function(err, account) {
            if (err) {
                return res.render('login', { message : err.message });
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
        res.render('login', { next: req.query.next });
    }
});

router.post('/login', function(req, res, next) { 
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.render('login', {'message': 'Wrong username or password'});}
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            if (req.body.next) { return res.redirect(req.body.next)}
            return res.redirect('/');
        });
    })(req, res, next);
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

module.exports = router;
