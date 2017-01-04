var superagent = require("superagent");
var cheerio = require("cheerio");
var fs = require("fs");
const mainSite = "http://202.202.1.176:8080/";
var stuNumber = process.argv[2];
var stuPassword = process.argv[3];
var weekNumber = process.argv[4];
var classArry = [];
var gradeArry = [];
var classTableToPrint = "";
var gradePrint = [];
var stuInfo = null;
var cmd = require("child_process").exec;
var cookie = "";
const charset = require('superagent-charset');
charset(superagent);

var MD5code = "";


var verify = "__VIEWSTATE=dDw1OTgzNjYzMjM7dDw7bDxpPDE%2BO2k8Mz47aTw1Pjs%2BO2w8dDxwPGw8VGV4dDs%2BO2w86YeN5bqG5aSn5a2mOz4%2BOzs%2BO3Q8cDxsPFRleHQ7PjtsPFw8c2NyaXB0IHR5cGU9InRleHQvamF2YXNjcmlwdCJcPgpcPCEtLQpmdW5jdGlvbiBvcGVuV2luTG9nKHRoZVVSTCx3LGgpewp2YXIgVGZvcm0scmV0U3RyXDsKZXZhbCgiVGZvcm09J3dpZHRoPSIrdysiLGhlaWdodD0iK2grIixzY3JvbGxiYXJzPW5vLHJlc2l6YWJsZT1ubyciKVw7CnBvcD13aW5kb3cub3Blbih0aGVVUkwsJ3dpbktQVCcsVGZvcm0pXDsgLy9wb3AubW92ZVRvKDAsNzUpXDsKZXZhbCgiVGZvcm09J2RpYWxvZ1dpZHRoOiIrdysicHhcO2RpYWxvZ0hlaWdodDoiK2grInB4XDtzdGF0dXM6bm9cO3Njcm9sbGJhcnM9bm9cO2hlbHA6bm8nIilcOwppZih0eXBlb2YocmV0U3RyKSE9J3VuZGVmaW5lZCcpIGFsZXJ0KHJldFN0cilcOwp9CmZ1bmN0aW9uIHNob3dMYXkoZGl2SWQpewp2YXIgb2JqRGl2ID0gZXZhbChkaXZJZClcOwppZiAob2JqRGl2LnN0eWxlLmRpc3BsYXk9PSJub25lIikKe29iakRpdi5zdHlsZS5kaXNwbGF5PSIiXDt9CmVsc2V7b2JqRGl2LnN0eWxlLmRpc3BsYXk9Im5vbmUiXDt9Cn0KZnVuY3Rpb24gc2VsVHllTmFtZSgpewogIGRvY3VtZW50LmFsbC50eXBlTmFtZS52YWx1ZT1kb2N1bWVudC5hbGwuU2VsX1R5cGUub3B0aW9uc1tkb2N1bWVudC5hbGwuU2VsX1R5cGUuc2VsZWN0ZWRJbmRleF0udGV4dFw7Cn0KZnVuY3Rpb24gd2luZG93Lm9ubG9hZCgpewoJdmFyIHNQQz13aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCt3aW5kb3cubmF2aWdhdG9yLmNwdUNsYXNzK3dpbmRvdy5uYXZpZ2F0b3IuYXBwTWlub3JWZXJzaW9uKycgU046TlVMTCdcOwp0cnl7ZG9jdW1lbnQuYWxsLnBjSW5mby52YWx1ZT1zUENcO31jYXRjaChlcnIpe30KdHJ5e2RvY3VtZW50LmFsbC50eHRfZHNkc2RzZGpramtqYy5mb2N1cygpXDt9Y2F0Y2goZXJyKXt9CnRyeXtkb2N1bWVudC5hbGwudHlwZU5hbWUudmFsdWU9ZG9jdW1lbnQuYWxsLlNlbF9UeXBlLm9wdGlvbnNbZG9jdW1lbnQuYWxsLlNlbF9UeXBlLnNlbGVjdGVkSW5kZXhdLnRleHRcO31jYXRjaChlcnIpe30KfQpmdW5jdGlvbiBvcGVuV2luRGlhbG9nKHVybCxzY3IsdyxoKQp7CnZhciBUZm9ybVw7CmV2YWwoIlRmb3JtPSdkaWFsb2dXaWR0aDoiK3crInB4XDtkaWFsb2dIZWlnaHQ6IitoKyJweFw7c3RhdHVzOiIrc2NyKyJcO3Njcm9sbGJhcnM9bm9cO2hlbHA6bm8nIilcOwp3aW5kb3cuc2hvd01vZGFsRGlhbG9nKHVybCwxLFRmb3JtKVw7Cn0KZnVuY3Rpb24gb3Blbldpbih0aGVVUkwpewp2YXIgVGZvcm0sdyxoXDsKdHJ5ewoJdz13aW5kb3cuc2NyZWVuLndpZHRoLTEwXDsKfWNhdGNoKGUpe30KdHJ5ewpoPXdpbmRvdy5zY3JlZW4uaGVpZ2h0LTMwXDsKfWNhdGNoKGUpe30KdHJ5e2V2YWwoIlRmb3JtPSd3aWR0aD0iK3crIixoZWlnaHQ9IitoKyIsc2Nyb2xsYmFycz1ubyxzdGF0dXM9bm8scmVzaXphYmxlPXllcyciKVw7CnBvcD1wYXJlbnQud2luZG93Lm9wZW4odGhlVVJMLCcnLFRmb3JtKVw7CnBvcC5tb3ZlVG8oMCwwKVw7CnBhcmVudC5vcGVuZXI9bnVsbFw7CnBhcmVudC5jbG9zZSgpXDt9Y2F0Y2goZSl7fQp9CmZ1bmN0aW9uIGNoYW5nZVZhbGlkYXRlQ29kZShPYmopewp2YXIgZHQgPSBuZXcgRGF0ZSgpXDsKT2JqLnNyYz0iLi4vc3lzL1ZhbGlkYXRlQ29kZS5hc3B4P3Q9IitkdC5nZXRNaWxsaXNlY29uZHMoKVw7Cn0KXFwtLVw%2BClw8L3NjcmlwdFw%2BOz4%2BOzs%2BO3Q8O2w8aTwxPjs%2BO2w8dDw7bDxpPDA%2BOz47bDx0PHA8bDxUZXh0Oz47bDxcPG9wdGlvbiB2YWx1ZT0nU1RVJyB1c3JJRD0n5a2m5Y%2B3J1w%2B5a2m55SfXDwvb3B0aW9uXD4KXDxvcHRpb24gdmFsdWU9J1RFQScgdXNySUQ9J%2BW4kOWPtydcPuaVmeW4iFw8L29wdGlvblw%2BClw8b3B0aW9uIHZhbHVlPSdTWVMnIHVzcklEPSfluJDlj7cnXD7nrqHnkIbkurrlkZhcPC9vcHRpb25cPgpcPG9wdGlvbiB2YWx1ZT0nQURNJyB1c3JJRD0n5biQ5Y%2B3J1w%2B6Zeo5oi357u05oqk5ZGYXDwvb3B0aW9uXD4KOz4%2BOzs%2BOz4%2BOz4%2BOz4%2BOz7p2B9lkx%2BYq%2Fjf62i%2BiqicmZx%2Fxg%3D%3D&__VIEWSTATEGENERATOR=CAA0A5A7&Sel_Type=STU&txt_dsdsdsdjkjkjc=" + stuNumber + "&txt_dsdfdfgfouyy=" + stuPassword + "&txt_ysdsdsdskgf=&pcInfo=&typeName=&aerererdsdxcxdfgfg=&efdfdfuuyyuuckjg=";



superagent
  .post(mainSite)
  .set('Content-Type', 'application/json; charset=utf-8')
  .redirects(0)
  .end(function (err, res) {
    if (err || !res.ok) {
      console.log('Oh no! error');
    } else {

      setTimeout(function () {
        cookie = JSON.stringify(res.header["set-cookie"]);
        cookie = cookie.slice(1, cookie.length - 1);
        // console.log(cookie);
        //得到由学号和密码加密后的MD5后再去验证
        cmd("node MD5 " + stuNumber + " " + stuPassword, function (err, stdout, stderr) {
          MD5code = stdout;
          verify=verify.concat(MD5code);
          login();
        });
      }, 50);
    }
  })

//登录并获取原始课程表
function login() {
  superagent.post('http://202.202.1.176:8080/_data/index_login.aspx')
    .send(verify)
    .set('Cookie', cookie)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36')
    .charset("gbk")
    .redirects(0)
    .end(function (err, res) {
      if (err || !res.ok) {
        console.log('Oh no! error');
      } else {
        // console.log('yay got ' + res.text);
        cookie = JSON.stringify(res.header["set-cookie"]);
        cookie = cookie.slice(1, cookie.length - 1);
        // console.log(cookie);
        setTimeout(function () {

          //查询课表          
          cmd("node class " + cookie, function (err, stdout, stdin) {
            // console.log(stdout);
            var $ = cheerio.load(stdout);
            var $title = $("div.page_title div");
            var $pageTable = $(".page_table");
            var $firstPageTitle = $($pageTable[0]);
            var $secondPageTitle = $($pageTable[2]);
            var $firstPage = $($pageTable[1]);
            var $secondPage = $($pageTable[3]);
            var $firstPageClass = $($firstPage.find("tr"));
            var $secondPageClass = $($secondPage.find("tr"));
            // 遍历第二部分课表 加入classArray
            for (let i = 2; i < $firstPageClass.length; i++) {
              var isRepeat = false;
              var content = $($firstPageClass[i]).find("td");
              var name = $(content[1]).text();
              var credit = $(content[2]).text();
              var period = $(content[3]).text();
              var category = $(content[6]).text();
              var modality = $(content[7]).text();
              var teacher = $(content[9]).text();
              var week = $(content[10]).text();
              var time = $(content[11]).text();
              var room = $(content[12]).text();
              week = changeWeekFormat(week);
              if (name != "") {
                var classInfo = {
                  lessonName: name,
                  lessonCredit: credit,
                  lessonPeriod: period,
                  lessonCategory: category,
                  lessonModality: modality,
                  lessonTeacher: teacher,
                  lessonWeek: week,
                  lessonTime: time,
                  lessonRoom: room,
                  extraClass: []
                };
                if (classArry.length == 0) {
                  classArry.push(classInfo);
                }
                for (let j = 0; j < classArry.length; j++) {
                  if (classArry[j].lessonName == name) {
                    classArry[j].extraClass.push(JSON.stringify({
                      extraWeek: week,
                      extraTime: time,
                      extraRoom: room
                    }));
                    isRepeat = true;
                  }
                }
                if (isRepeat != true) {
                  classArry.push(classInfo);
                }
              }
            }

            //遍历第二部分课表 加入classArray
            for (let i = 2; i < $secondPageClass.length; i++) {
              var isRepeat = false;
              var content = $($secondPageClass[i]).find("td");
              var name = $(content[1]).text();
              var credit = $(content[2]).text();
              var period = $(content[3]).text();
              var teacher = $(content[7]).text();
              var week = $(content[9]).text();
              var time = $(content[10]).text();
              var room = $(content[11]).text();
              week = changeWeekFormat(week);
              var classInfo = {
                lessonName: name,
                lessonCredit: credit,
                lessonPeriod: period,
                lessonTeacher: teacher,
                lessonWeek: week,
                lessonTime: time,
                lessonRoom: room,
                extraClass: []
              };
              if (classArry.length == 0) {
                classArry.push(classInfo);
              }
              for (let j = 0; j < classArry.length; j++) {
                //针对后半部分课程表，没有课程名称的行
                if (classArry[j].lessonTeacher == teacher) {
                  classArry[j].extraClass.push(JSON.stringify({
                    extraWeek: week,
                    extraTime: time,
                    extraRoom: room
                  }));
                  isRepeat = true;
                }
              }
              if (isRepeat != true) {
                classArry.push(classInfo);
              }
              // console.log(classArry);
            }
            //如果用户输入了周数信息则返回本周要上的课
            if (weekNumber != null) {
              classTableToPrint = classTableWeek(weekNumber);

            }

            cmd("node grade " + cookie, function (err, stdout, stdin) {
              var gradeToPrint = [];
              var $ = cheerio.load(stdout);
              var $lesson = $("tr");
              for (let i = 3; i < $lesson.length; i++) {
                var content = $($lesson[i]).find("td");
                var name = $(content[1]).text();
                var credit = $(content[2]).text();
                var type = $(content[3]).text();
                var grade = $(content[6]).text();
                var gradeInfo = {
                  lessonName: name,
                  lessonCredit: credit,
                  lessonType: type,
                  lessonGrade: grade
                }
                gradePrint.push(name + " : " + grade);
                gradeArry.push(gradeInfo)
              }

              console.log(JSON.stringify({
                "stuInfo": stuInfo,
                "classTable": classTableToPrint,
                "grade": gradePrint
              }));
            })


            //记录学生信息
            patternId = /学号：(\d*)/;
            patternName = /姓名：([\u4e00-\u9fa5]*)/
            var studentName = patternName.exec($firstPageTitle.text())[1];
            var studentId = patternId.exec($firstPageTitle.text())[1];
            stuInfo = {
              studentName: studentName,
              studentId: studentId
            }
          })
          //原始信息 stuInfo classArry gradeArry
        }, 50);

      }
    })


}










//将周数的格式由“1-4”转换成数组[1,2,3,4]方便提取时遍历
function changeWeekFormat(week) {
  var newArry = [];
  var arry = week.split(",");
  arry.forEach(function (ele) {
    var pattern1 = /(\d*)-(\d*)/;
    var pattern2 = /(\d*)/
    if (pattern1.test(ele)) {
      var number1 = Number.parseInt(pattern1.exec(ele)[1]);
      var number2 = Number.parseInt(pattern1.exec(ele)[2]);
      while (number1 <= number2) {
        newArry.push(number1);
        number1++
      }
    } else if (pattern2.test(ele)) {
      var number = Number.parseInt(pattern2.exec(ele)[1]);
      newArry.push(number);
    }
  })
  return newArry;
}


//用户输入周数后返回本周需要上的课及时间
function classTableWeek(week) {
  var classTableRaw = [];
  classArry.forEach(function (element, index) {
    var weekArry = element.lessonWeek;
    weekArry.forEach(function (e) {
      if (week == e) {
        var lessonInfo = {
          lessonName: element.lessonName,
          lessonTime: element.lessonTime
        }
        classTableRaw.push(lessonInfo);
      }
    })
    //extraClass
    element.extraClass.forEach(function (ele) {
      var extra = JSON.parse(ele);
      var extraWeek = extra.extraWeek;
      extraWeek.forEach(function (e, i) {
        if (week == e) {
          var lessonInfo = {
            lessonName: element.lessonName,
            lessonTime: extra.extraTime
          }
          classTableRaw.push(lessonInfo);
        }
      })
    })
  })
  var classTableOrder = [];
  var chineseNumber = ["一", "二", "三", "四", "五", "六", "日"]
  for (let j = 0; j < 7; j++) {
    classTableRaw.forEach(function (e) {
      if (e.lessonTime.indexOf(chineseNumber[j]) != -1) {
        var classTimeInfo = "周" + chineseNumber[j] + ":" + e.lessonName + e.lessonTime.substr(1, e.lessonTime.length - 1);
        classTableOrder.push(classTimeInfo);
      }
    })
  }
  return classTableOrder;
}
















