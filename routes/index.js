var express = require('express');
var router = express.Router();

//Not used, but without it, the code breaks

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Study Buddy' });
});

module.exports = router;