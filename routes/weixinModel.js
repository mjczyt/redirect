var mongoose=require("mongoose");


var weixinSchema=mongoose.Schema({
	openid:String,
	studentId:String,
	studentPassword:String
});
module.export=db.model("weixinModel",weixinSchema)