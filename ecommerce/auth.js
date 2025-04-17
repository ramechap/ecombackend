const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { body } = require('express-validator');
const jwt = require("jsonwebtoken");
const Auth = require("./accountscehma");
const Authm = require("./middleware");
const checkUserId = require("./adminmiddleware");
const router = express.Router();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Optional, for form data
app.use(cookieParser());
app.use(cors({ origin: 'https://ecommerce-food-nm6w.onrender.com', credentials: true }));



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
  next();
});

  
  app.use(cookieParser());
router.use(cors({ credentials: true, origin: 'https://ecommerce-food-nm6w.onrender.com' }));


router.use(cookieParser());










// Registration Route
router.post("/register", [
    body('username', 'Enter a valid name').isLength({ min: 5}),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 }),
], async (req, res) => {
    const { username, password, confirmpassword,  email } = req.body;
   
    if (password !== confirmpassword) {
        return res.status(400).send("Password mismatch"); // Ensure to return here
    }

    try {
        const existinguser = await Auth.findOne({ email });
        if (existinguser) {
            return res.status(400).json("Email already exists");
        }

        const user = new Auth({
            username, password, confirmpassword, email
        });

        await user.save();
        res.status(201).send({ user }); // Respond only once
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});



// Login Route
router.post("/login", async (req, res) => {
    const { password, email } = req.body;
    

    try {
        const existinguser = await Auth.findOne({ email });
        if (!existinguser) {
            return res.status(400).send("No user found");
        }

        const isMatch = await bcrypt.compare(password, existinguser.password);
        if (!isMatch) {
            return res.status(400).send("Password not matched");
        }
        const token = await existinguser.generateAuthToken();
     
      
        res.cookie("token", token, { httpOnly: true, sameSite: "None", secure: true })
            .status(200)
            .send({ info: existinguser });
            console.log(token)
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// Logout Route
router.get("/logout", Authm, async (req, res) => {
    try {
        res.clearCookie("token", { sameSite: "none", secure: true })
            .status(200)
            .send("Logout success");
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// Profile Route
router.get("/profile", Authm, async (req, res) => {
 
    try {
        const token = req.cookies.token;
        
        jwt.verify(token, 'ecommercewebtoken', async (err, data) => {
            if (err) {
                return res.status(400).send("Token is not valid");
            }
          

            const user = await Auth.findById(data._id);
            if (!user) {
                console.log("user not founf")
                return res.status(404).send("User not found");
            }
         
            const { password, confirmpassword, ...others } = user._doc;
            res.status(200).send(others); // Send user info, exclude sensitive data
        });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.get('/checkadmin', checkUserId("6800371f3846e0ad487731ee"), (req, res) => {
    // This route is protected and can only be accessed by the admin
    res.status(200).send('Welcome to the admin dashboard');
});
module.exports = router;
