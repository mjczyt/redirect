var express = require('express');
var router = express.Router();
var superagent = require("superagent");
var wechat = require("wechat");



/* GET users listing. */
// router.get('/', function (req, res, next) {
//   res.redirect("http://cqyou.top:2000"+req.originalUrl);
//   console.log("redirect to http://cqyou.top:2000"+req.originalUrl);   
// });
router.get('/', wechat('CQYOU', function (request, response, next) {
  // message is located in req.weixin
  var message = request.weixin;
  var pattern = /(20\d{6}) (\w*)/;
  if (pattern.test(message.Content)) {
    var studentID = pattern.exec(message.Content)[1];
    var studentPwd = pattern.exec(message.Content)[2];
    console.log("student");
    console.log("id:" + studentID + " password:" + studentPwd);
    superagent
      .post('http://cqyou.top:5000/api/grade')
      .send({
        "stdid": studentID,
        "stdpwd": studentPwd
      })
      .set('Content-Type', 'application/json')
      .redirects(0)
      .accept('application/json')
      .end(function (err, res) {
        if (err || !res.ok) {
          console.log('Oh no! error');
        } else {
          response.reply({
            type: "text",
            content: res.body.grade
          })
        }
      });
  }
}));

module.exports = router;
