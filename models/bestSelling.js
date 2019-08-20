var mongoose=require("mongoose");

//SCHEMA SETUP FOR THE BEST SELLING BOOKS
var bestSellingSchema=new mongoose.Schema({
    title: String,
    price: String,
    image: String,
    author:String, 
    publisher:String, 
    description:String,
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]
});

module.exports=mongoose.model("BestSelling",bestSellingSchema);