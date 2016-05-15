'use strict';
require('localenv');
var program = require('commander');
program
  .version('0.0.1')
  .option('-c, --club', 'Seed Club')
  .option('-u, --user', 'Seed User')
  .parse(process.argv);

function connectDB() {
    let mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI);

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log("DB connected");
    });
}


function seedDefaultUser() {
    let email='test@test.com', password='111', name={'first':'Artem', 'last':'Test'}; 
    connectDB();
    let User = require('../models/user');
    User.findOne({'email':email}, function (err, user) {
        if (!user) {
            let newUser = new User({'email':email, 'password':password, 'name':name});
            newUser.save(function () {
                console.log('saved');
                process.exit();
            });
        } else {
            console.log('User with email already exists');
            process.exit();
        }
    });
}

function seedDefaultClub() {
    let title='testClub', email='testclub@test.com', urlTitle='testclub'; 
    connectDB();
    let Club = require('../models/club');
    Club.findOne({'urlTitle':urlTitle}, function (err, club) {
        if (!club) {
            console.log('seeding club');
            let newClub = new Club({'title':title, 'email':email, 'urlTitle':urlTitle});
            newClub.save(function () {
                console.log('saved');
                process.exit();
            });
        } else {
            console.log('Club with urlTitle already exists');
            process.exit();
        }
    });
}


if (program.user) seedDefaultUser();
if (program.club) seedDefaultClub();

