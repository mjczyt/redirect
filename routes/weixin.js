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
                content: "您还没有绑定教务账号<a href=\"ophoto4.me:2000/bind/" + request.query.openid + "\"> ·点击绑定· </a>"
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


        if (std) {
            //对密码进行bsae64编码
            getAll(std.studentId, std.studentPassword, request.query.openid);

            var s = new Buffer(std.studentPassword).toString('base64');
            response.reply({
                type: "text",
                content: "(。・∀・)ノ您的<a href=\"ophoto4.me:2000/main/" + request.query.openid + "\"> ·个人主页· </a>"
            })
        } else {
            response.reply({
                type: "text",
                content: "您还没有绑定教务账号<a href=\"ophoto4.me:2000/bind/" + request.query.openid + "\"> ·点击绑定· </a>"
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
                console.log(err);
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
                        saveAccount(studentID, studentPwd, request.query.openid);
                        getAll(studentID, studentPwd, request.query.openid);

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
                console.log(err);
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
                        saveAccount(studentID, studentPwd, request.query.openid);
                        getAll(studentID, studentPwd, request.query.openid);

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





}

function unbind(message, request, response) {
    model.remove({ openid: request.query.openid }, function() {
        console.log("delect data of " + request.query.openid);
        studentModel.remove({ openid: request.query.openid }, function() {
            response.reply({
                type: "text",
                content: "您已解除绑定 重新绑定--><a href=\"ophoto4.me:2000/bind/" + request.query.openid + "\"> ·点击绑定· </a>"
            })
        });
    });

}

function getGrade(message, request, response) {

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
                        if ((err || !res.ok) && replied == false) {
                            console.log(err);
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
                                    //更新学生的所有成绩信息和课表信息

                                    getAllInfo(std.studentId, std.studentPassword, request.query.openid);

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
                            console.log(err);
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
                                    //更新学生的所有成绩信息和课表信息
                                    getAllInfo(std.studentId, std.studentPassword, request.query.openid);

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
                    content: "您还没有绑定教务账号<a href=\"ophoto4.me:2000/bind/" + request.query.openid + "\"> ·点击绑定· </a>"
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




function saveAccount(id, password, openid) {

    model.findOne({ openid: openid }, function(err, std) {
        if (err) { console.log(err) } else {
            if (std == null) {
                var student = new model({
                    openid: openid,
                    studentId: id,
                    studentPassword: password
                });
                student.save(function() {
                    console.log("saved new student infomation in database!");
                });

            }
        }
    })
}


function getAll(id, password, openid) {
    var startTime=Date.now();
    superagent
        .post('http://cqyou.top:5000/api/all')
        .send({
            "stdid": id,
            "stdpwd": new Buffer(password).toString('base64'),
            "week": null
        })
        .set('Content-Type', 'application/json')
        .redirects(0)
        .end(function(err, res) {
            var studentName = null;
            var totallInfo = null;
            var schedule = null;
            var grade = null;
            var gradeAll = null;

            var array = res.text.split("\n");
            console.log(array.length);
            var obj1 = JSON.parse(array[0]);
            var obj2 = JSON.parse(array[1]);
            var obj3 = JSON.parse(array[2]);
            for (var i = 0; i < 3; i++) {
                var obj = JSON.parse(array[i]);
                if (obj.stuInfo) {
                    studentName = obj.stuInfo.studentName;
                    schedule = obj.classTable;
                }
                if (obj.grade) {
                    grade = obj.grade;
                }
                if (obj.gradeAll) {
                    gradeAll = obj.gradeAll;
                    totallInfo = JSON.stringify(obj.totallInfo);
                }
            }
            studentModel.findOneAndRemove({ studentId: id }, function() {
                console.log("update " + id + " info");
            });
            var classTableArray = schedule.split("|");
            var stuDetail = new studentModel({
                studentId: id,
                studentPassword: password,
                openid: openid,
                studentName: studentName,
                gradeAll: gradeAll,
                grade: grade,
                totallInfo: totallInfo.replace(/"/g, ""),
                schedule: classTableArray
            });
            stuDetail.save(function() {
                var endTime=Data.now();
                console.log("saved " + id + " info" +"used "+endTime-startTime+" ms");
            })
        });
}


module.exports = router;
