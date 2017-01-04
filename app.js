var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var wechat = require("wechat");
const cmd = require("child_process").exec;

var index = require('./routes/index');
var users = require('./routes/users');
var weixin = require("./routes/weixin");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use("/weixin", weixin);
app.use('/weixin', wechat('CQYOU', function (req, res, next) {
  // message is located in req.weixin
  var message = req.weixin;
  var pattern = /(20\d{6}) (\w*)/;
  if (pattern.test(message.Content)) {
    var studentID = pattern.exec(message.Content)[1];
    var studentPwd = pattern.exec(message.Content)[2];
    console.log("student");
    console.log("id:" + studentID + " password:" + studentPwd);
    cmd("node login " + studentID + " " + studentPwd + " " + 1, function (err, stdout, stderr) {
      var content = JSON.parse(stdout);
      res.reply({
        type: "text",
        content: content.grade
      });
    });

  }

}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(80, function () {
  console.log("start listen to 80");
});
module.exports = app;
