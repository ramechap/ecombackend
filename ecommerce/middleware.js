const jwt = require("jsonwebtoken");
const Authm = async(req, res, next) => {
   try {
    const token = req.cookies.token;
    if (!token) return res.status(401).send("Access Denied");

    jwt.verify(token,"ecommercewebtoken", async(err, user) => {
        if (err) return res.sendStatus(403).send("Token is not valis");
        req.author = user._id
        req.user = user
        next();
    });
   } catch (error) {
    res.status(401).send(error)
   }
};
module.exports= Authm;