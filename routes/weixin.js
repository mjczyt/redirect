var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.redirect("http://cqyou.top:2000"+req.originalUrl);
  console.log("redirect to http://cqyou.top:2000"+req.originalUrl);   
});
router.post('/', function (req, res, next) {
  var signature = req.query.signature;
  var nonce = req.query.nonce;
  var timestamp = req.query.timestamp;
  var echostr = req.query.echostr;
  var temArray = [timestamp, "CQYOU", nonce].sort();
  var tem = temArray.join('');
  var scyptoString = sha1(tem);
  if (scyptoString == signature) {
    var content = JSON.stringify(req.body);
    content = content.slice(2, -5);
    parseString(content, { explicitArray: false, ignoreAttrs: true }, function (err, result) {
      var contentJSON = JSON.stringify(result);
      console.log(result.xml.FromUserName);
      console.log(result.xml.Content);
    });
  } else { console.log("connect fail!") }
});
module.exports = router;
