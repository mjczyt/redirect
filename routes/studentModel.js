var mongoose=require("mongoose");


var studentDetail = mongoose.Schema({
    studentId: String,
    studentPassword: String,
    studentName: String,
    gradeAll: Array,
    totallInfo: String,
    schedule: Array
});
/* global db */
module.exports=db.model("student",weixinSchema);