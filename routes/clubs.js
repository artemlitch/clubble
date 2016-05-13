var express = require('express');
var router = express.Router();
var clubModel = require('../models/club');
var memberModel = require('../models/member');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Clubble' });
});

router.get('/:urlTitle', function(req, res, next) {
    if (req.params.urlTitle) { 
        clubModel.findOne({'urlTitle':req.params.urlTitle}, function (err, club) {
            if (err) return console.error(err);
            if (!club) return res.render('club404');
            console.log(club);
            res.render('clubpage', { title: club['title'] });
            
        });
        club = clubModel.find({'urlTitle':req.params.urlTitle});
    } else {
        res.render('index', { title: 'Express' });
    }
});

router.post('addclub', function(req, res, next) {
    var title = req.body.title;
     
    
});

module.exports = router;
