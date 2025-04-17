const mongoose=require("mongoose")
const Schema = require('mongoose').Schema
const postchema= new mongoose.Schema({
    photourl:{
        type:String,
        required:true,
        trim:true
    },
    title:{
        type:String,
        required:true,
      
        trim:true
    },
    description: {
        type: String,
        
        default:"",
        trim:true
      
      },
      
      author: {
        type: Schema.Types.ObjectId,
        ref: 'Auth',
       
    },
     price:{
      type: Number,
        required: true,
        default:0
       
     },
    createdAt: {
        type: Date,
        default: Date.now
      },
})
const ProductPost=mongoose.model("ProductPost",postchema);
module.exports=ProductPost;