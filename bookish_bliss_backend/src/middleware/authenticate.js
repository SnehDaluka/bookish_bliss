const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");

const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    
    // Fallback for API clients using Authorization header
    if (!token && req.header("Authorization") && req.header("Authorization").startsWith("Bearer ")) {
      token = req.header("Authorization").replace("Bearer ", "");
    }

    if (!token) {
      throw new Error("No token provided");
    }
    
    let verifyToken;
    try {
      verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        const decoded = jwt.decode(token);
        if (decoded && decoded._id) {
          await Customer.updateOne(
            { _id: decoded._id },
            { $pull: { tokens: { token: token } } }
          );
        }
      }
      throw err;
    }

    const rootUser = await Customer.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });

    if (!rootUser) throw new Error("User not found");
    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized: Invalid or missing token");
  }
};

module.exports = authenticate;
