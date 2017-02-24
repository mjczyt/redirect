var mongoose=require("mongoose");


var studentDetail = mongoose.Schema({
    studentId: String,
    studentPassword: String,
    openid:String,
    studentName: String,
    gradeAll: Array,
    totallInfo: String,
    schedule: Array
});
/* global db */
module.exports=db.model("student",studentDetail);