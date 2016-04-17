var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Node OpenID Connect Provider' });
});

router.get('/test', function(req, res) {
  res.render('test', { title: 'Express' });
});

module.exports = router;
