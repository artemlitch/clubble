"use strict";

let express = require('express');
let router = express.Router();
let Club = require('../models/club');
let User = require('../models/user');
let Events = require('../models/events');
let passport = require('../passport/passport');
let attachDBUser = require('../middleware/getDBUser');
let async = require('async');
let multer = require('multer');
let uploadBanner = multer({ dest: 'uploads/club/'});

//override render function to always pass user and beta flag
router.use(function (req, res, next) {
    var _render = res.render;
    res.render = function (view, options, fn) {
        if (req.user) {
            options = Object.assign({}, options, {
                user: req.user
            });
        }
        options = Object.assign({}, options, {
            beta: process.env.BETA,
        });
        _render.call(this, view, options, fn);
    };
    next();
});

let userRouter = require('./users');
router.use(userRouter);
let apiRouter = require('./api');
router.use('/api', apiRouter);
let imgRouter = require('./images');
router.use('/img', imgRouter);
let clubRouter = require('./clubs');
router.use(clubRouter);

router.get('/', attachDBUser, function (req, res, next) {
    async.parallel({
        randomClub: done => {
            Club.random((err, randomClub) => {
                let name = "Music Club";
                if (randomClub) {
                    name = randomClub.name;
                }
                return done(err, name);
            });
        },
        newClubs: done => {
            Club.find()
                .sort({_id: -1})
                .limit(10)
                .exec(done);
        },
        popularClubs: done => {
            return done(null, []); // TODO: what is popular?
        },
        myClubs: done => {
            if (!req.user) {
                return done(null, []);
            }
            User
                .findOne({'email': req.user.email})
                .populate('memberClubs')
                .exec((err, user) => {
                    return done(err, (user || {}).memberClubs);
                });
        },
        recentEvents: done => {
            Events.find()
                .populate('club', 'clubLink')
                .sort({_id: -1})
                .limit(10)
                .exec(done)
        },
    }, (err, results) => {
        let context = {
            my_clubs: results.myClubs,
            search_club: results.randomClub,
            discover_clubs_events: results.newClubs.concat(results.recentEvents),
        };
        if(err) {
            return next(err);
        }
        res.render('index', context);
    });
});

module.exports = router;
