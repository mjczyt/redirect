var express = require('express');
var router = express.Router();
var superagent = require("superagent");
var wechat = require("wechat");
var model = require("./weixinModel");
//微信传来学号和密码时返回学生成绩
router.post('/', wechat('CQYOU', function(request, response, next) {
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

    } else if (message.Content == "成绩") {
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
                        content: "请先输入学号 密码 绑定教务网账号"
                    })
                }
            }
        })
    }
}));

module.exports = router;
