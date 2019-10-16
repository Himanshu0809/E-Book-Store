var mongoose=require("mongoose");

//SCHEMA SETUP FOR THE BEST SELLING BOOKS
var bestSellingSchema=new mongoose.Schema({
    title: String,
    price: Number,
    image: String,
    author:String, 
    publisher:String, 
    description:String,
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
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

module.exports=mongoose.model("BestSelling",bestSellingSchema);