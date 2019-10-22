var mongoose = require("mongoose");

var orderSchema = mongoose.Schema({
    user:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    cart:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Cart"
        }
    },
    address:{
        type:String,
        required:true
    },
    name:{
        type:String, 
        required:true
    },
    paymentId:{
        type:String,
        required: true
    } 
});

module.exports = mongoose.model("Order", orderSchema);
