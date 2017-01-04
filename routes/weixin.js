var express = require('express');
var router = express.Router();



/* GET users listing. */
router.get('/', function (req, res, next) {
  res.redirect("http://cqyou.top:2000"+req.originalUrl);
  console.log("redirect to http://cqyou.top:2000"+req.originalUrl);   
});
// router.post('/', function (req, res, next) {
//   res.redirect("http://cqyou.top:2000"+req.originalUrl);
//   console.log("redirect to http://cqyou.top:2000"+req.originalUrl);   
// });
module.exports = router;
