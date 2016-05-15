"use strict";

let express = require('express');
let router = express.Router();
let Club = require('../models/club');
let passport = require('../passport/passport');
var userRouter = require('./users');

router.use(userRouter);

router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Clubble',
        user: req.user
    });
});


router.route('/create_club')
    .get(function (req, res, next) {
        res.render('create_club');
    })
    .post(function (req, res, next) {
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

        club.save((err) => {
            if (err) {
                return next(err);
            }
            res.redirect(`/${club.clubLink}`);
        });
    });

router.get('/:clubLink', function (req, res, next) {
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
        res.render('club_home', context);
    });
});

module.exports = router;
