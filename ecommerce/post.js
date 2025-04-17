const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const mongoose = require('mongoose');

const app = express()
const cors = require("cors")
const ProductPost = require("./postschema")
const Auth = require("./accountscehma")
const Authm = require("./middleware")
const router = express.Router();
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
    next();
});
router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
});
router.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json())
app.use(bodyParser.json())
router.use(cookieParser())
router.use(cors());
app.use(cors());
const corsOptions = {
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true, // Allow cookies or credentials
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  };
  
  app.use(cors(corsOptions));  // Apply CORS middleware


router.post("/createpost", async (req, res) => {
    try {
        const post = new ProductPost({
            photourl: req.body.photourl,
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            author: "6800371f3846e0ad487731ee"


        })
        await post.save()
        res.status(200).send({ post })
    } catch (error) {
        console.log(error)
        res.status(500).send(error)

    }

})


router.put("/update/:id", async (req, res) => {
    const id = req.params.id
    
    try {
        const post = await ProductPost.findById(id)
        if (post.author.toString() !== req.query.author) {
            return res.status(403).send("You don't have access to update this post");
        }
        const updatedPost  = await ProductPost.findByIdAndUpdate(id, { $set: req.body }, { new: true })
        res.status(200).send({ updatedPost  })

    } catch (error) {
        console.log(error)
        res.status(500).send(error)

    }

})

router.delete("/delete/:id", async (req, res) => {
    const id = req.params.id

    try {
        const posts = await ProductPost.findById(id)
        if (posts.author.toString() !== req.query.author) {
            return res.status(403).send("You don't have access to update this post");
        }
        await ProductPost.findByIdAndDelete(id);
        
       
        res.status(200).send({ message: "Post deleted successfully", postId: id });

    } catch (error) {
        res.status(500).send(error)

    }

})

router.get("/get/:id", async (req, res) => {
    const id = req.params.id

    try {

        const post = await ProductPost.findById(id)
        res.status(200).json(post)

    } catch (error) {
        res.status(500).send(error)

    }

})


router.get("/getallpost", async (req, res) => {
    try {
        const post = await ProductPost.find()
        res.status(200).json({ post })

    } catch (error) {
        res.status(500).send("internal error", error)

    }

})


router.put("/addtocart/:id",Authm, async (req, res) => {
    const id = req.params.id
    const authorid = req.body.author

    try {
        const post = await ProductPost.findById(id)
        if (!post) {
            return res.status(400).send("Invalid id")
        }
        const user = await Auth.findById(authorid)

        //we can also do like this
        // const cartItem = user.cart.find(cartItem => cartItem.product.toString() === id);

        // if (cartItem) {
        //     // If product is already in the cart, update the quantity
        //     await Auth.updateOne(
        //         { _id: authorid, "cart.product": id }, 
        //         { $inc: { "cart.$.quantity": 1 } } // Increment the quantity by 1
        //     );
        //     res.status(200).send("Product quantity updated in cart");
        // } else {
        //     // If product is not in the cart, add it with quantity 1
        //     await Auth.updateOne(
        //         { _id: authorid },
        //         { $push: { cart: { product: id, quantity: 1 } } }
        //     );
        //     res.status(200).send("Product added to cart");
        // }
        const existingProductIndex = user.cart.findIndex(cartItem => cartItem.product.toString() === id);

        if (existingProductIndex !== -1) {

            user.cart[existingProductIndex].quantity += 1;

            await user.save();
            res.status(200).send("Product quantity updated in cart");
        } else {

            user.cart.push({ product: id, quantity: 1 });
            await user.save();
            res.status(200).send("Product added to cart");
        }


    } catch (error) {
        console.log(error)
        res.status(500).send(error)

    }

})
router.get("/alladdtocart",Authm, async (req, res) => {
    const id = req.query.author;

    try {
        const user = await Auth.findById(id)
        if (!user) return res.status(400).send("User not found");
        
        const allrPosts = await Promise.all(
            user.cart.map(async (postId) => {
                
                const productId = postId.product;  
                const quantity = postId.quantity;
                // Check if productId is a valid ObjectId
                if (!mongoose.Types.ObjectId.isValid(productId)) {
                    return null; // Skip invalid IDs
                }

                const post = await ProductPost.findById(productId);
                if (!post) {
                    return null; 
                }
                return { product: post, quantity };
            }
        )
        );
        

        res.status(200).send({ post: allrPosts })

    } catch (error) {
        console.log(error)
        res.status(500).send(error)

    }

})

router.put("/deletefromcart/:id", Authm,async (req, res) => {
    const id = req.params.id

    try {
        const post = await ProductPost.findById(id)
        if (!post) {
            return res.status(400).send("Invalid id")
        }
        await Auth.updateOne(
            { _id: req.body.author },
            { $pull: { cart: { product: id } } }
        );
        res.status(200).send("Product has deleted from your cart")

    } catch (error) {
        console.log(error)
        res.status(500).send(error)

    }

})

module.exports = router