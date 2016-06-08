"use strict";

let express = require('express');
let router = express.Router();
let Club = require('../models/club');
let attachDBUser = require('../middleware/getDBUser');
let async = require('async');
let eventRouter = require('./events');
let multer = require('multer');
let uploadBanner = multer({ dest: 'uploads/club/'});

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
        context['member'] = false;
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
            context['member'] = club.userIsMember(req.user.dbUser);
            console.log(context['member']);
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
router.post('/:clubLink/join', attachDBUser, function (req, res, next) {
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
        if (req.user) {
            if (club.userIsMember(req.user.dbUser)) {
                console.log("USER IS ALREADY MEMBER");
                res.send({redirect:`/${req.params.clubLink}`});
            } else {
                club.members.push(req.user.dbUser);
                req.user.dbUser.memberClubs.push(club);
                club.save((err) => {
                    if (err) {
                        return next(err);
                    }
                }).then(req.user.dbUser.save((err) => {
                    if (err) {
                        return next(err);
                    }
                    res.send({redirect:`/${req.params.clubLink}`});
                }));
            }
        } else {
            // send to login
            let nextRedirect = '/'
            if(req.body.next) {
                nextRedirect = req.body.next;
            }
            res.send({redirect: 'login?next='+nextRedirect});
        }
    });
});
router.get('/:clubLink/members', attachDBUser, function (req, res, next) {
    if (!req.params.clubLink) {
        return res.redirect('/');
    }
    Club.findOne({'clubLink': req.params.clubLink}).populate('members').exec((err, club) => {
        if (err) {
            return next(err);
        }
        if (!club) {
            return res.render('club_does_not_exist');
        }
        if (req.user) {
            if (club.userIsAdmin(req.user.dbUser)) {
                let context = {
                    name: club.name,
                    members: club.members,
                }
                console.log(context);
                res.render('club_member_page', context);
            } else {
                res.redirect('/login?next=/'+req.params.clubLink);
            }
        } else {
            res.redirect('/login?next=/'+req.params.clubLink);
        }
    });
});

router.use('/:clubLink/events', eventRouter);

module.exports = router;
