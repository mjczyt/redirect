var superagent = require("superagent");
var cheerio = require("cheerio");
const charset = require('superagent-charset');
charset(superagent);

var cookie=process.argv[2];
// const cookie = "ASP.NET_SessionId=u2jzqy450ahxon55vctyxdbq; path=/";

var  getInfo=function(cookie) {
  superagent.post("http://202.202.1.176:8080/znpk/Pri_StuSel_rpt.aspx")
  .send("Sel_XNXQ=20160&rad=on&px=1")
  .set("Cookie", cookie)
  .set("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36")
  .charset('gbk')
  .end(function (err, content) {
    if (err) {
      console.log(err);
    } else {
      console.log(content.text);
      var $ = cheerio.load(content.text);
    }
  })


}

getInfo(cookie);