var express = require('express');
var router = express.Router();
var superagent = require("superagent");
var wechat = require("wechat");
var model = require("./weixinModel");
var rankingModel = require("./rankingModel")
var studentModel = require("./studentModel")

var crypto = require("crypto");
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();


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
    var message = request.weixin;
    var pattern = /(20\d{6}) (.*)/;
    //得到学号密码后绑定并回复成绩
    var isBind = pattern.test(message.Content);
    var isSubscribe = message.Event == 'subscribe';
    var isGrade = (message.Content == "成绩" || message.Content == "grade" || message.Content == "g" || message.Content == "查成绩");
    var isUnbind = message.Content == "解除绑定";
    var isSchedule = (message.Content == "课程表" || message.Content == '课表' || message.Content == "class" || message.Content == "c");
    var isRanking = message.Content == "排名";
    switch (true) {
        case isBind:
            bind(pattern, message, request, response);
            break;
        case isSubscribe:
            subscribe(message, request, response);
            break;
        case isGrade:
            getGrade(message, request, response);
            break;
        case isUnbind:
            unbind(message, request, response);
            break;
        case isSchedule:
            getSchedule(message, request, response);
            break;
        case isRanking:
            ranking(message, request, response);
            break;
        default:
            autoReply(message, request, response);
    }

}));


function subscribe(message, request, response) {
    response.reply({
        type: "text",
        content: '欢迎关注😊\n 回复“成绩”、“grade”、“g"查看个人成绩。\n 回复“课表”、“class"、”c”查看本周课表(本学期已结束，默认回复下学期第一周课表)\n 若第一次密码输入错误回复“解除绑定”可重新绑定教务网账号。'
    })
}

function ranking(message, request, response) {

    var id = null;
    model.findOne({ openid: request.query.openid }, function(err, std) {
        if (std) {
            //对密码进行bsae64编码
            id = std.studentId.toString();
            getRanking(id, response);
        } else {
            response.reply({
                type: "text",
                content: "请先回复学号 密码 绑定教务网账号. 如回复 20142794 112233"
            })
        }
    });
}

function getRanking(id, response) {
    rankingModel.findOne({ "studentId": id }, function(err, adventure) {
        // adventure=JSON.parse(adventure);
        var studentInfo = {
            "学号": adventure.studentId,
            "年级": adventure.datesOfAttendance,
            "姓名": adventure.studentName,
            "学院": adventure.college,
            "专业": adventure.major,
            "班级": adventure.class,
            "专业百分比": adventure.persentOfMajor,
            "国家英语通过情况": adventure.english,
            "补考情况": adventure.makeupExamination,
            "体育课程情况": adventure.physical,
            "学生课程平均绩点": adventure.GPA,
            "年级排名": adventure.rankingInCollage,
            "年级人数": adventure.numberOfCollage,
            "年级最高绩点": adventure.highestGPAInCollage,
            "年级最低绩点": adventure.lowestGPAInCollage,
            "专业排名": adventure.rankingInMajor,
            "专业人数": adventure.numberOfMajor,
            "专业最高绩点": adventure.highestGPAInMajor,
            "专业最低绩点": adventure.lowestGPAInMajor,
            "班排名": adventure.rankingInClass,
            "班人数": adventure.numberOfClass,
            "班最高绩点": adventure.highestGPAInClass,
            "班最低绩点": adventure.lowestGPAInClass
        }
        var str = JSON.stringify(studentInfo).slice(1, -1);
        var strArray = str.split(",");
        for (var i = 0; i < strArray.length; i++) {
            strArray[i] = strArray[i] + "\n"
        }
        var reply = strArray.toString().replace(/"/g, "");
        reply = reply.replace(/,/g, "");
        response.reply({
            type: "text",
            content: reply
        })
    })
}

function getSchedule(message, request, response) {
    model.findOne({ openid: request.query.openid }, function(err, std) {
         setTimeout(function() {
            getAllInfo(std.studentId, std.studentPassword, request.query.openid);
        }, 1000);
        if (std) {
            //对密码进行bsae64编码
            var s = new Buffer(std.studentPassword).toString('base64');
            response.reply([{
                title: '您的课表 (。・∀・)ノ゛',
                description: 'come to see this',
                picurl: 'http://ojyfslgzw.bkt.clouddn.com/title.jpeg',
                url: "ophoto4.me:2000/main/" + request.query.openid
            }]);
        } else {
            response.reply({
                type: "text",
                content: "请先回复学号 密码 绑定教务网账号. 如回复 20142794 112233"
            })
        }
    });
}

function bind(pattern, message, request, response) {
    var replied = false;
    var studentID = pattern.exec(message.Content)[1];
    var studentPwd = pattern.exec(message.Content)[2];
    console.log("student bind");
    console.log("id:" + studentID + " password:" + studentPwd, request.query.openid);

    setTimeout(function() {
        getAllInfo(studentID, studentPwd);
    }, 1000);

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
            if ((err || !res.ok) && replied == false) {
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
            if ((err || !res.ok) && replied == false) {
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

function unbind(message, request, response) {
    model.remove({ openid: request.query.openid }, function() {
        console.log("delect data of " + request.query.openid);
        response.reply({
            type: "text",
            content: "您已经解除绑定 重新回复学号 密码绑定教务网账号。"
        })
    });
}

function getGrade(message, request, response) {

    model.findOne({ openid: request.query.openid }, function(err, std) {
        var replied = false;
        //保存学生的所有成绩信息和课表信息
        setTimeout(function() {
            getAllInfo(std.studentId, std.studentPassword, request.query.openid);
        }, 1000);

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
                        if ((err || !res.ok) && replied == false) {
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
                        if ((err || !res.ok) && replied == false) {
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

function autoReply(message, request, response) {
    superagent
        .post('http://www.tuling123.com/openapi/api')
        .set({ 'Content-Type': 'application/json', 'user-agent': 'node-superagent/3.4.1', accept: 'application/json' })
        .send({
            "key": "186399c43ec24361a3720b7f41c0e2ec",
            "info": message.Content,
            "userid": request.query.openid.toString().substring(0, 6)
        })
        .redirects(0)
        .end(function(err, res) {
            if (err || !res.ok) {
                console.log('Oh no! error');
            } else {
                var resContent = JSON.parse(res.text);
                if (resContent.url) {
                    response.reply([{
                        title: resContent.text,
                        description: '这里是为你找到的信息',
                        picurl: 'http://ojyfslgzw.bkt.clouddn.com/title.jpeg',
                        url: resContent.url
                    }]);

                } else if (resContent.list) {
                    var replyList = [];
                    resContent.list.forEach(function(e, i) {
                        if (e.article && i < 5) {
                            replyList.push({
                                title: e.article,
                                description: "信息来源：" + e.source,
                                picurl: e.icon,
                                url: e.detailurl
                            })
                        } else if (i < 5) {
                            replyList.push({
                                title: e.name,
                                description: e.info,
                                picurl: e.icon,
                                url: e.detailurl
                            })
                        }
                    })
                    response.reply(replyList);
                } else {
                    response.reply({
                        type: "text",
                        content: resContent.text
                    })
                }

            }
        });
}

function getAllInfo(id, password, openid) {

    var getGraded = false;
    var getSchedule = false;
    superagent
        .post('http://cqyou.top:5000/apiB/gradeAll')
        .send({
            "stdid": id,
            "stdpwd": new Buffer(password).toString('base64')
        })
        .set('Content-Type', 'application/json')
        .redirects(0)
        .end(function(err, res) {
            if (err || !res.ok) {
                console.log('Oh no! error');
            } else {
                if (!getGraded) {
                    getGraded = true;
                    event.emit('got', "grade", res.body, id, password, openid);
                }

            }
        });
    superagent
        .post('http://cqyou.top:5000/api/gradeAll')
        .send({
            "stdid": id,
            "stdpwd": new Buffer(password).toString('base64')
        })
        .set('Content-Type', 'application/json')
        .redirects(0)
        .end(function(err, res) {
            if (err || !res.ok) {
                console.log('Oh no! error');
            } else {
                if (!getGraded) {
                    getGraded = true;
                    event.emit('got', "grade", res.body, id, password, openid);
                }

            }
        });
    superagent
        .post('http://cqyou.top:5000/apiB/schedule')
        .send({
            "stdid": id,
            "stdpwd": new Buffer(password).toString('base64'),
            "week": null
        })
        .set('Content-Type', 'application/json')
        .redirects(0)
        .end(function(err, res) {
            if (err || !res.ok) {
                console.log('Oh no! error');
            } else {
                if (!getSchedule) {
                    getSchedule = true;
                    event.emit('got', "schedule", res.body, id, password, openid);
                }

            }
        });
    superagent
        .post('http://cqyou.top:5000/api/schedule')
        .send({
            "stdid": id,
            "stdpwd": new Buffer(password).toString('base64'),
            "week": null
        })
        .set('Content-Type', 'application/json')
        .redirects(0)
        .end(function(err, res) {
            if (err || !res.ok) {
                console.log('Oh no! error');
            } else {
                if (!getSchedule) {
                    getSchedule = true;
                    event.emit('got', "schedule", res.body, id, password, openid);
                }

            }
        });
}

var grade = {}
var schedule = {}
var count = 0;
//每次获取到学生所有信息后会触发got事件 课表和成绩都获取到后 将信息储存到数据库
event.on('got', function(type, body, id, password, openid) {
    count++;
    console.log(type + ' 事件触发');
    switch (type) {
        case "schedule":
            schedule = body;
            break;
        case "grade":
            grade = body;
            break;
    }

    if (count % 2 == 0 && body.status == undefined) {

        studentModel.findOneAndRemove({ studentId: id }, function() {
            console.log("update " + id + " info");
        });

        var totallInfo = JSON.stringify(grade.totallInfo);
        var classTable = schedule.classTable;
        var classTableArray = classTable.split("|");
        var stuDetail = new studentModel({
            studentId: id,
            studentPassword: password,
            openid: openid,
            studentName: schedule.stuInfo.studentName,
            gradeAll: grade.gradeAll,
            totallInfo: totallInfo.replace(/"/g, ""),
            schedule: classTableArray
        });
        stuDetail.save(function() {
            console.log("saved " + id + " info");
        })
        grade = {};
        schedule = {};
    } else if (body.status == 'wrong') {
        console.log('账号密码错误.');
    }

});




module.exports = router;
