const mongoose = require("mongoose");
const Schema=mongoose.Schema;




const reviewSchema=new Schema({
    comment:String,

    rating:{
        type:Number,
        min:1,
        max:5,
        required:true,
        default:1,
        set:val=>Math.round(val)
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})


module.exports=mongoose.model("Review",reviewSchema);