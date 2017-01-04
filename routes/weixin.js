var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log("http://cqyou.top:2000"+req.originalUrl);
  
  res.redirect("http://cqyou.top:2000"+req.originalUrl);
  
});

module.exports = router;
