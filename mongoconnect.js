const mongoose=require("mongoose")
mongoose.set('strictQuery', false)
var uri= process.env.MONGODB_CONNECT_URI
// mongoose.connect('mongodb://localhost:27017/ecom',{
  mongoose.connect(uri,{
  useNewUrlParser: true,
   useUnifiedTopology: true,
   // useCreateIndex:true

}
)
.then(()=>console.log("Connection successfully..."))
.catch((err)=> console.log(err));