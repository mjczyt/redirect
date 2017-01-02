var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

  console.log("hostname is " + req.hostname);
  switch (req.hostname) {
    case "akatbs.top":
      res.redirect("http://118.89.45.55:2000");
      console.log("redirect")
      break;
    case "tbsblog.top":
      res.redirect("http://118.89.45.55:4000");
      break;
  }
});


module.exports = router;
