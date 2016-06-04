"use strict";

let Club = require('../models/club');
let path = require('path');
let router = require('express').Router();
module.exports = router;

router.route('/banner/:id')
    .get((req, res, next) => {
        res.sendFile(path.join(__dirname, '../../uploads/club', req.params.id));
    });
