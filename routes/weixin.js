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
router.get('/', function(req, res, next) {
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
    var replied = false;
    var message = request.weixin;
    var pattern = /(20\d{6}) (.*)/;
    //得到学号密码后绑定并回复成绩
    if (pattern.test(message.Content) || message.Event == 'subscribe' || message.Content == "成绩" || message.Content == "grade" || message.Content == "g" || message.Content == "解除绑定" || message.Content == "课程表" || message.Content == '课表' || message.Content == "class" || message.Content == "c") {
        if (pattern.test(message.Content)) {
            var studentID = pattern.exec(message.Content)[1];
            var studentPwd = pattern.exec(message.Content)[2];
            console.log("student");
            console.log("id:" + studentID + " password:" + studentPwd);

            superagent
                .post('http://cqyou.top:5000/api/grade')
                .send({
                    "stdid": studentID,
                    "stdpwd": new Buffer(studentPwd).toString('base64')
                })
                .set('Content-Type', 'application/json')
                .redirects(0)
                .accept('application/json')
                .end(function(err, res) {
                    if (err || !res.ok) {
                        response.reply({
                            type: "text",
                            content: "天哪~服务器出问题啦！"
                        });
                    } else {
                        var pattern = /(wrong)/;
                        if (pattern.exec(res.text) == null) {
                            var stuGrade = "您的成绩：\n";
                            var gradeStr = JSON.stringify(res.body.grade);
                            gradeStr = gradeStr.replace(/"/g, "");
                            gradeStr = gradeStr.slice(1, -1);
                            var gradeArry = gradeStr.split(',');
                            for (let i = 0; i < gradeArry.length; i++) {
                                stuGrade += gradeArry[i] + "\n";
                            }
                            if (!replied) {
                                response.reply({
                                    type: "text",
                                    content: stuGrade
                                });
                                replied = true;
                            }
                        } else {
                            if (!replied) {
                                response.reply({
                                    type: "text",
                                    content: "账号或密码输入有误哟."
                                });
                                replied = true;
                            }
                        }
                    }
                });


            superagent
                .post('http://cqyou.top:5000/apiB/grade')
                .send({
                    "stdid": studentID,
                    "stdpwd": new Buffer(studentPwd).toString('base64')
                })
                .set('Content-Type', 'application/json')
                .redirects(0)
                .accept('application/json')
                .end(function(err, res) {
                    if (err || !res.ok) {
                        response.reply({
                            type: "text",
                            content: "天哪~服务器出问题啦！"
                        });
                    } else {
                        var pattern = /(wrong)/;
                        if (pattern.exec(res.text) == null) {
                            var stuGrade = "您的成绩：\n";
                            var gradeStr = JSON.stringify(res.body.grade);
                            gradeStr = gradeStr.replace(/"/g, "");
                            gradeStr = gradeStr.slice(1, -1);
                            var gradeArry = gradeStr.split(',');
                            for (let i = 0; i < gradeArry.length; i++) {
                                stuGrade += gradeArry[i] + "\n";
                            }
                            if (!replied) {
                                response.reply({
                                    type: "text",
                                    content: stuGrade
                                });
                                replied = true;
                            }
                        } else {
                            if (!replied) {
                                response.reply({
                                    type: "text",
                                    content: "账号或密码输入有误哟."
                                });
                                replied = true;
                            }
                        }
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

                    }
                }
            })

        }
        if (message.Event == 'subscribe') {
            response.reply({
                type: "text",
                content: '欢迎关注😊\n 回复“成绩”、“grade”、“g"查看个人成绩。\n 回复“课表”、“class"、”c”查看本周课表(本学期已结束，默认回复下学期第一周课表)\n 若第一次密码输入错误回复“解除绑定”可重新绑定教务网账号。'
            })
        }
        if (message.Content == "成绩" || message.Content == "grade" || message.Content == "g") {
            model.findOne({ openid: request.query.openid }, function(err, std) {
                var replied = false;

                if (err) { console.log(err) } else {
                    if (std != null) {

                        superagent
                            .post('http://cqyou.top:5000/api/grade')
                            .send({
                                "stdid": std.studentId,
                                "stdpwd": new Buffer(std.studentPassword).toString('base64')
                            })
                            .set('Content-Type', 'application/json')
                            .redirects(0)
                            .accept('application/json')
                            .end(function(err, res) {
                                if (err || !res.ok) {
                                    response.reply({
                                        type: "text",
                                        content: "天哪~服务器出问题啦！"
                                    });
                                } else {
                                    var pattern = /(wrong)/;
                                    if (pattern.exec(res.text) == null) {
                                        var stuGrade = "您的成绩：\n";
                                        var gradeStr = JSON.stringify(res.body.grade);
                                        gradeStr = gradeStr.replace(/"/g, "");
                                        gradeStr = gradeStr.slice(1, -1);
                                        var gradeArry = gradeStr.split(',');
                                        for (let i = 0; i < gradeArry.length; i++) {
                                            stuGrade += gradeArry[i] + "\n";
                                        }
                                        if (!replied) {
                                            response.reply({
                                                type: "text",
                                                content: stuGrade
                                            });
                                            replied = true;
                                        }
                                    } else {
                                        if (!replied) {
                                            response.reply({
                                                type: "text",
                                                content: "账号或密码输入有误哟."
                                            });
                                            replied = true;
                                        }
                                    }
                                }
                            });



                        superagent
                            .post('http://cqyou.top:5000/apiB/grade')
                            .send({
                                "stdid": std.studentId,
                                "stdpwd": new Buffer(std.studentPassword).toString('base64')
                            })
                            .set('Content-Type', 'application/json')
                            .redirects(0)
                            .accept('application/json')
                            .end(function(err, res) {
                                if (err || !res.ok) {
                                    response.reply({
                                        type: "text",
                                        content: "天哪~服务器出问题啦！"
                                    });
                                } else {
                                    var pattern = /(wrong)/;
                                    if (pattern.exec(res.text) == null) {
                                        var stuGrade = "您的成绩：\n";
                                        var gradeStr = JSON.stringify(res.body.grade);
                                        gradeStr = gradeStr.replace(/"/g, "");
                                        gradeStr = gradeStr.slice(1, -1);
                                        var gradeArry = gradeStr.split(',');
                                        for (let i = 0; i < gradeArry.length; i++) {
                                            stuGrade += gradeArry[i] + "\n";
                                        }
                                        if (!replied) {
                                            response.reply({
                                                type: "text",
                                                content: stuGrade
                                            });
                                            replied = true;
                                        }
                                    } else {
                                        if (!replied) {
                                            response.reply({
                                                type: "text",
                                                content: "账号或密码输入有误哟."
                                            });
                                            replied = true;
                                        }
                                    }
                                }
                            });


                    } else {
                        response.reply({
                            type: "text",
                            content: "请先回复学号 密码 绑定教务网账号. 如回复 20142794 112233 （中间记得空格间隔）"
                        })
                    }
                }
            })
        }
        if (message.Content == "解除绑定") {
            model.remove({ openid: request.query.openid }, function() {
                console.log("delect data of " + request.query.openid);
                response.reply({
                    type: "text",
                    content: "您已经解除绑定 重新回复学号 密码绑定教务网账号。"
                })
            });
        }
        if (message.Content == "课程表" || message.Content == '课表' || message.Content == "class" || message.Content == "c") {
            model.findOne({ openid: request.query.openid }, function(err, std) {
                if (std) {
                    //对密码进行bsae64编码
                    var s = new Buffer(std.studentPassword).toString('base64');

                    response.reply([{
                        title: '您的课表 (。・∀・)ノ゛',
                        description: 'come to see this',
                        picurl: 'http://ojyfslgzw.bkt.clouddn.com/title.jpeg',
                        url: "cqyou.top:2000/main/" + std.studentId + "/" + s
                    }]);
                } else {
                    response.reply({
                        type: "text",
                        content: "请先回复学号 密码 绑定教务网账号. 如回复 20142794 112233"
                    })
                }
            });
        }
    } else {
        superagent
            .post('http://www.tuling123.com/openapi/api')
            .send({
                "key": "186399c43ec24361a3720b7f41c0e2ec",
                "info": message.Content,
                "userid": request.query.openid.toString()
            })
            .set('Content-Type', 'application/json')
            .redirects(0)
            .accept('application/json')
            .end(function(err, res) {
                if (err || !res.ok) {
                    console.log('Oh no! error');
                } else {
                     console.log('yay got ' + JSON.parse(res.text).text)
                    response.reply({
                        type: "text",
                        content: JSON.parse(res.text).text
                    })

                }
            });
    }


}));



module.exports = router;
