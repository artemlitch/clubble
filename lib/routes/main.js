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

router.post('addclub', function (req, res, next) {
    let title = req.body.title;
    // TODO
});

router.get('/:urlTitle', function (req, res, next) {
    if (!req.params.urlTitle) {
        return res.redirect('/');
    }
    Club.findOne({'urlTitle': req.params.urlTitle}, (err, club) => {
        if (err) {
            return next(err);
        }
        if (!club) {
            return res.render('club404');
        }
        let title = club['title'];
        res.render('clubpage', {
            title: title
        });
    });
});
module.exports = router;
