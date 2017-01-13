var express = require('express');
var router = express.Router();
var superagent = require("superagent");
var wechat = require("wechat");
var model = require("./weixinModel");
var crypto = require("crypto");

function sha1(str) {
  var md5sum = crypto.createHash("sha1");
  md5sum.update(str);
  str = md5sum.digest("hex");
  return str;
}
//微信服务器验证程序
router.get('/', function (req, res, next) {
  var signature = req.query.signature;
  var nonce = req.query.nonce;
  var timestamp = req.query.timestamp;
  var echostr = req.query.echostr;
  var temArray = [timestamp, "CQYOU", nonce].sort();
  var tem = temArray.join('');
  var scyptoString = sha1(tem);
  if (scyptoString == signature) {
    res.send(echostr);
  } else { console.log(tem) }
});


//微信传来学号和密码时返回学生成绩
router.post('/', wechat('CQYOU', function(request, response, next) {
    // message is located in req.weixin
    var message = request.weixin;
    var pattern = /(20\d{6}) (\w*)/;
    //得到学号密码后绑定并回复成绩
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
            .end(function(err, res) {
                if (err || !res.ok) {
                    console.log('Oh no! error');
                } else {
                    var stuGrade = "您的成绩：\n";
                    var gradeStr = JSON.stringify(res.body.grade);
                    gradeStr = gradeStr.slice(1, -1);
                    var gradeArry = gradeStr.split(',');
                    for (let i = 0; i < gradeArry.length; i++) {
                        stuGrade += gradeArry[i] + "\n";
                    }
                    response.reply({
                        type: "text",
                        content: stuGrade
                    })
                }
            });

        model.findOne({ openid: request.query.openid }, function(err, std) {
            if (err) { console.log(err) } else {
                if (std == null) {
                    var student = new model({
                        openid: request.query.openid,
                        studentId: studentID,
                        studentPassword: studentPwd
                    });
                    student.save();
                    console.log("saved new student infomation in database!");
                    model.find(function(err, std) {
                        if (err) { console.log(err) } else { console.log(std) }
                    });
                }
            }
        })

    }
    if (message.Content == "成绩" || message.Content == "grade" || message.Content == "g") {
    getGrade(request,response);
    }
    if (message.Content == '课表' || message.Content == "class" || message.Content == "c") {
        model.findOne({ openid: request.query.openid }, function(err, std) {
            if (err) { console.log(err) } else {
                if (std != null) {
                    superagent
                        .post('http://cqyou.top:5000/api/schedule')
                        .send({
                            "stdid": std.studentId,
                            "stdpwd": std.studentPassword,
                            'week': 1
                        })
                        .set('Content-Type', 'application/json')
                        .redirects(0)
                        .accept('application/json')
                        .end(function(err, res) {
                            if (err || !res.ok) {
                                console.log('Oh no! error');
                            } else {
                                var stuSchedule = "您的课表：\n";
                                var schedule = JSON.stringify(res.body.classTable);
                                schedule = schedule.slice(1, -1);
                                var scheduleArry = schedule.split(',');
                                for (let i = 0; i < scheduleArry.length; i++) {
                                    stuSchedule += scheduleArry[i] + "\n";
                                }
                                response.reply({
                                    type: "text",
                                    content: stuSchedule
                                })
                            }
                        });
                } else {
                    response.reply({
                        type: "text",
                        content: "请先回复学号 密码 绑定教务网账号. 如回复 20142794 112233"
                    })
                }
            }
        })
    }
    if (message.Content == "解除绑定") {
        model.remove({ openid: request.query.openid },function(){
            console.log("delect data of "+request.query.openid);
            response.reply({
                        type: "text",
                        content: "您已经解除绑定 重新回复学号 密码绑定教务网账号。"
                    })
        });
    }
}));

function getGrade(request,response){
           model.findOne({ openid: request.query.openid }, function(err, std) {
            if (err) { console.log(err) } else {
                if (std != null) {
                    superagent
                        .post('http://cqyou.top:5000/api/grade')
                        .send({
                            "stdid": std.studentId,
                            "stdpwd": std.studentPassword
                        })
                        .set('Content-Type', 'application/json')
                        .redirects(0)
                        .accept('application/json')
                        .end(function(err, res) {
                            if (err || !res.ok) {
                                console.log('Oh no! error');
                            } else {
                                var stuGrade = "您的成绩：\n";
                                var gradeStr = JSON.stringify(res.body.grade);
                                gradeStr = gradeStr.slice(1, -1);
                                var gradeArry = gradeStr.split(',');
                                for (let i = 0; i < gradeArry.length; i++) {
                                    stuGrade += gradeArry[i] + "\n";
                                }
                                response.reply({
                                    type: "text",
                                    content: stuGrade
                                })
                            }
                        });
                } else {
                    response.reply({
                        type: "text",
                        content: "请先回复学号 密码 绑定教务网账号. 如回复 20142794 112233"
                    })
                }
            }
        })
}

module.exports = router;
