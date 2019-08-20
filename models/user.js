var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var userSchema=new mongoose.Schema({
    username:{ type: String, unique:true, required:true},
    password:String,
    firstname:String,
    lastname:String,
    image:{
        type:String,
        default:"https://previews.123rf.com/images/tanyastock/tanyastock1803/tanyastock180300490/97923644-user-icon-avatar-login-sign-circle-button-with-soft-color-gradient-background-vector-.jpg"
    },
    imageId:{
        type:String,
        default:"https://previews.123rf.com/images/tanyastock/tanyastock1803/tanyastock180300490/97923644-user-icon-avatar-login-sign-circle-button-with-soft-color-gradient-background-vector-.jpg".public_id
    },
    email:{ type: String, unique:true, required:true}, 
    resetPasswordToken: String,
    resetPasswordExpires:Date,
    isAdmin:{type:String, enum:["admin", "user"], default:"user"}
});

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User", userSchema);