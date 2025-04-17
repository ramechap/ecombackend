const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const Schema = require('mongoose').Schema
const accountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    
  },
 
  email: {
    type: String,
    required: true,
    unique: true,  // Ensures email is unique
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid Email');
      }
    }
  },
  password: {
    type: String,
    required: true
  },
  confirmpassword: {
    type: String,
    required: true
  },
  cart:
    [
      {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'ProductPost',  // Reference to the ProductPost collection
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        }
    }
    ]
  ,
  createdAt: {
    type: Date,
    default: Date.now
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
});
// Instance method to generate a new token and add it to the tokens array
accountSchema.methods.generateAuthToken=async function(){
  try{  
      const token=  jwt.sign({_id:this._id.toString()},"ecommercewebtoken", { expiresIn: '3d' })
  this.tokens = this.tokens.concat({token:token})
  await this.save()
  return token
  }
  catch(e){
      console.log(e)
  }



}
// Middleware to hash password before saving

accountSchema.pre("save",async function(next){
  if(this.isModified("password")){
   this.password= await bcrypt.hash(this.password,11);
   this.confirmpassword= await bcrypt.hash(this.confirmpassword,11);

  }
  else{
   next()
  }
})





const Auth = mongoose.model('Auth', accountSchema);
module.exports = Auth;
