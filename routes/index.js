var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

  console.log("hostname is " + req.hostname);
  switch (req.hostname) {
    case "akatbs.top":
      res.redirect("http://akatbs.top:2000");
      console.log("redirect")
      break;
    case "127.0.0.1":
      res.render('index', { title: 'Express' });
      break;
  }
});


module.exports = router;
