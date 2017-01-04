var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

  console.log("hostname is " + req.hostname);
  switch (req.hostname) {
    case "cqyou.top":
      res.redirect("http://cqyou.top:2000");
      console.log("redirect to http://cqyou.top:2000")
      break;
    case "tbsblog.top":
      res.redirect("http://tbsblog.top:4000");
      console.log("redirect to http://tbsblog.top:4000")
      break;
    case "118.89.45.55":
      res.redirect("http://118.89.45.55:3000");
      console.log("redirect to http://118.89.45.55:3000");
      break;
  }
});


module.exports = router;
