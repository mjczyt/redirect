var express = require('express');
var router = express.Router();
var superagent = require("superagent");
var wechat = require("wechat");

//微信传来学号和密码时返回学生成绩
router.post('/', wechat('CQYOU', function (request, response, next) {
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
          var stuGrade="您的成绩：\n";
          var gradeStr=JSON.stringify(res.body.grade);
          var gradeArry=gradeStr.split(',');
          for(let i=0;i<gradeArry.length;i++){
            stuGrade+=gradeArry[i]+"\n";
          }
          response.reply({
            type: "text",
            content: stuGrade
          })
        }
      });
  }
}));

module.exports = router;
