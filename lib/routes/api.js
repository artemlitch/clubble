"use strict";

let Club = require('../models/club');

let router = require('express').Router();
module.exports = router;

router.route('/clubs/search')
    .get((req, res, next) => {
        let query = req.query.q;
        if (!query || query.length === 0) {
            return res.status(400);
        }
        Club
            .find(
                { $text: { $search: query } },
                { score: { $meta: 'textScore' } }
            )
            .sort({ score : { $meta : 'textScore' } })
            .exec((err, results) => {
                if (err) {
                    return next(err);
                }
                results = results.map(club => {
                    club = club.toJSON();
                    return {
                        name: club.name,
                        description: club.description.substring(0,50),
                        clubLink: club.clubLink,
                    }; });
                res.send({
                    results: results,
                });
            })
    });
