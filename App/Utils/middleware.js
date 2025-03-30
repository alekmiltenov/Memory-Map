const { verifyJWT } = require("./jwtUtils");
const jwt = require('jsonwebtoken');
const User = require('../Schemas/userSchema'); // require the User Schema

// # Log url and method
function logger(req,res,next){
    console.log(`${req.originalUrl} : ${req.method}`);
    next();
};

// # Check user JWT & ACCESSS
const accessCheckJWT = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token){
        return res.status(401).redirect('/');
    }
    const decoded = verifyJWT(token);
    if (!decoded) return res.status(403).redirect('/'); 
    
    req.user = decoded;
    
    // Verified user access only to his own account
    const id = parseInt(req.params.id);
    if (req.user.id !== id) {
      res.cookie('message', 'You do not have access to this account', { maxAge: 6000, httpOnly: true });
      return res.redirect('/');
    }
    next();
};

// # Pass currentUser to the frontend
async function attachUser(req, res, next) {
  if (req.cookies.jwt) {
    try {
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
      const currentUser = await User.findOne({ id: decoded.id });
      res.locals.currentUser = currentUser;
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
}

module.exports = {accessCheckJWT , logger, attachUser};