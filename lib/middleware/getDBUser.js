"use strict";
let User = require('../models/user');

module.exports = (req, res, next) => {
    if(req.user) {
        User.findOne({email:req.user.email}, (err, dbUser) => {
            if (err) {
                return next(err);
            }
            if (!dbUser) {
                return res.redirect('register');
            }
            req.user.dbUser = dbUser;
            next();
        });
    } else {
       next(); 
    }
}
