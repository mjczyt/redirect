var mongoose=require("mongoose");


var weixinSchema=mongoose.Schema({
	openid:String,
	studentId:String,
	studentPassword:String
});
/* global db */
module.exports=db.model("weixinModel",weixinSchema);