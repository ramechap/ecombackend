const jwt = require("jsonwebtoken");
const checkUserId = (authorizedId) => {
    return (req, res, next) => {
        try {
            const token = req.cookies.token;
            if (!token) return res.status(401).send("Access Denied");
        
            jwt.verify(token,"ecommercewebtoken", async(err, user) => {
                if (err) return res.sendStatus(403).send("Token is not valis");
               
                // If the logged-in user doesn't match the authorized ID, deny access
                if (user._id !== authorizedId) {
                    return res.status(403).send("Access Denied: You don't have permission to access this resource");
                }
                next(); // User is authorized, allow access
            });
           } catch (error) {
            res.status(401).send(error)
           }
       
    };
};

module.exports = checkUserId;
