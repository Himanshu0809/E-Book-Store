var mongoose=require("mongoose");
//SCHEMA SETUP
var bookSchema=new mongoose.Schema({
    title: String,
    price: String,
    image: String,
    author:String, 
    publisher:String, 
    description:String,
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});

module.exports=mongoose.model("Book",bookSchema);