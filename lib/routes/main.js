"use strict";

let express = require('express');
let router = express.Router();
let Club = require('../models/club');
let User = require('../models/user');
let passport = require('../passport/passport');
let attachDBUser = require('../middleware/getDBUser');
let async = require('async');

let eventRouter = require('./events');

let userRouter = require('./users');
router.use(userRouter);

let apiRouter = require('./api');
router.use('/api', apiRouter);
let imgRouter = require('./images');
router.use('/img', imgRouter);

let multer = require('multer');
let uploadBanner = multer({ dest: 'uploads/club/'});

//override render function to always pass user
router.use(function (req, res, next) {
    var _render = res.render;
    res.render = function (view, options, fn) {
        if (req.user) {
            options = Object.assign({}, options, {
                user: req.user
            });
        }
        _render.call(this, view, options, fn);
    };
    next();
});

router.get('/', attachDBUser, function (req, res, next) {
    async.parallel({
        randomClub: done => {
            Club.random((err, randomClub) => {
                let name = "Music Club";
                if (randomClub) {
                    name = randomClub.name;
                }
                done(err, name);
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
        }
    }, (err, results) => {
        let context = {
            my_clubs: results.myClubs,
            search_club: results.randomClub,
            popular_clubs: results.popularClubs,
            new_clubs: results.newClubs
        };
        res.render('index', context);
    });
});


router.route('/create_club')
    .get(function (req, res, next) {
        if (req.user) {
            res.render('create_club');
        } else {
            res.redirect('login');
        }
    })
    .post(attachDBUser, function (req, res, next) {
        if (req.user) {
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
            email: club.email,
            facebook: club.facebook,
            website: club.website,
            youtube: club.youtube,
            twitter: club.twitter,
            bannerURL: club.bannerURL,
        };
        context['admin'] = false;
        context['editable'] = false;
        if (req.user) {
            context['user'] = req.user.email;
            if (club.userIsAdmin(req.user.dbUser)) {
                context['clubLink'] = club.clubLink;
                context['admin'] = true;
                if(req.query.edit) {
                    context['editable'] = true;
                }
            }
        }        
        res.render('club_home', context);
    });
});
router.post('/:clubLink', uploadBanner.single('banner'), attachDBUser, function (req, res, next) {
    if (!req.params.clubLink) {
        return res.redirect('/');
    }
    let clubBody = req.body;
    Club.findOne({'clubLink': req.params.clubLink}, (err, club) => {
        if (err) {
            return next(err);
        }
        if (!club) {
            return res.render('club_does_not_exist');
        }
        if (req.user) {
            if (club.userIsAdmin(req.user.dbUser)) {
                //save club here and refresh
                for (var key in clubBody) {
                    club[key] = clubBody[key];
                }
                if (req.file) {
                    if(club['bannerURL']) {
                        //TODO
                        //delete the old photo, dont want to keep it on here 4 ever
                    }
                    club['bannerURL'] = '/img/banner/'+req.file['filename'];
                }
                club.save((err) => {
                    if (err) {
                        return next(err);
                    }
                    res.redirect(`/${club.clubLink}`);
                });
            } else {
                // send to login
                return res.redirect('login');
            }
        } else {
            // send to login
            return res.redirect('login');
        }
    });
});

router.use('/:clubLink/events', eventRouter);

module.exports = router;
