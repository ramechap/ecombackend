const express=require("express")
const cors=require("cors")
const cookieParser=require("cookie-parser")
const app = express()
const bodyParser=require("body-parser")
require('dotenv').config();

const port=process.env.PORT
require("./mongoconnect")
const corsOptions = {
  origin: 'https://ecommerce-food-nm6w.onrender.com', // Your frontend URL
  credentials: true, // Allow cookies or credentials
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
};

app.use(cors(corsOptions));  // Apply CORS middleware
app.use(express.json()); // ✅ Required for parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // Optional, for form data
app.use(cookieParser());
app.use(cors({ origin: 'https://ecommerce-food-nm6w.onrender.com', credentials: true }));

app.use(cookieParser())
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://ecommerce-food-nm6w.onrender.com/');
      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
  });

  app.use("/product",require("./ecommerce/post"))
  app.use("/auth",require("./ecommerce/auth"))
  
  app.listen(port,()=> console.log(`Connecting to port ${port}`))