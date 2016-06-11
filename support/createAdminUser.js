'use strict';
require('localenv');
let mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
let db = mongoose.connection;
let User = require('../lib/models/user');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("DB connected");
    //create user here
    User.register(new User({email: 'admin@clubble.ca', superUser:true}), process.env.ADMINPASS, function(err, account) {
        if (err) {
            console.log(err.message);
            process.exit();
        }
            console.log('User created '+ account);
            process.exit();
    });
});
