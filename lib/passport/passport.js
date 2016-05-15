"use strict";
let passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
let User = require('../models/user');

passport.use(new LocalStrategy({usernameField:'email'}, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;
