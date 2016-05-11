var express = require('express');
var router = express.Router();
var ClubModel = require('../models/club');
var UserModel = require('../models/user');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/clubs', function(req, res, next) {
    
});

router.post('addclub', function(req, res, next) {
    var title = req.body.title;
    
    
});

module.exports = router;
