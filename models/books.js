var mongoose=require("mongoose");
//SCHEMA SETUP
var bookSchema=new mongoose.Schema({
    title: String,
    price: Number,
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
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports=mongoose.model("Book",bookSchema);