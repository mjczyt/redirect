var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

  console.log("hostname is " + req.hostname);
  switch (req.hostname) {
    case "cqyou.top":
      console.log(req.path);
      res.redirect("http://cqyou.top:2000");
      console.log("redirect to http://cqyou.top:2000")
      break;
    case "tbsblog.top":
      res.redirect("http://tbsblog.top:4000");
      console.log("redirect to http://tbsblog.top:4000")
      break;
  }
});


module.exports = router;
