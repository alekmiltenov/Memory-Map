require('dotenv').config();                                     // # npm i dotenv for Environment Variables
const express = require('express');                             // # npm i express for Express.js
const mongoose = require('mongoose');                           // # npm i mongoose for MongoDB
const expressLayouts = require("express-ejs-layouts");          // # npm i express-ejs-layouts for EJS Layouts
const cookieParser = require("cookie-parser");                  // # npm i cookie-parser for Cookies
const session = require('express-session');                     // # npm i express-session for Sessions ( oAuth2 with Google )
const passport = require('passport');                           // # npm i passport for Passport.js ( oAuth2 with Google )
const methodOverride = require('method-override');              // # npm i method-override for Method Override - PUT, PATCH, DELETE

const User = require('./Schemas/userSchema');                   // + Import User Schema
const Post = require('./Schemas/postSchema');                   // + Import Post Schema

const { logger, attachUser } = require('./Utils/middleware');   // + Import Custom Middleware For logging and attachinng user to frontend
const { verifyJWT } = require('./Utils/jwtUtils');              // + Import JWT verification function
require('./Utils/passportConfig');                              // + Import Passport Configuration

const app = express();                                          // # Initialize Express as app
const PORT = process.env.PORT || 5000;                          // # Define PORT

//#-------------------------------------------------------MIDDLEWARE--------------------------------------------------------//#
// .                                                                                                                        //#
// # View engine, layouts, public setup                                                                                     //#
app.set('view engine', 'ejs');                                  // # npm i ejs & Set EJS as view engine                     //
app.use(expressLayouts);                                        // # Use EJS Layouts                                        //#
app.use(express.static('public'));                              // # Set public folder for static files                     //#
// .                                                                                                                        //#
app.use(cookieParser());                                        // # Use Cookie Parser                                      //#
app.use(express.json());                                        // # Use JSON Parser                                        //#
app.use(express.urlencoded({extended: true}));                  // # Use URL Encoded Parser                                 //#
// .                                                                                                                        //#
// # Session & Passport setup                                                                                               //#
app.use(session({                                               // # Use Session                                            //#
  secret: 'your-session-secret',                                                                                            //#
  resave: false,                                                                                                            //#
  saveUninitialized: false                                                                                                  //#
}));                                                                                                                        //#
app.use(passport.initialize());                                 // # Use Passport Initialize                                //#
app.use(passport.session());                                    // # Use Passport Session                                   //#
// .                                                                                                                        //#
// # Method override                                                                                                        //#
app.use(methodOverride('_method'));                             // # Use Method Override                                    //#
// .                                                                                                                        //#
// # Custom middleware                                                                                                      //#
app.use(logger);                                                // # Use Logger                                             //#
app.use(attachUser);                                            // # Use Attach User                                        //#
// .                                                                                                                        //#
// .                                                                                                                        //#
// # Routes                                                                                                                 //#
const AuthRouter = require('./Routes/authRouter');              // # Import Auth Router                                     //#
const UserRouter = require('./Routes/userRouter');              // # Import User Router                                     //#
app.use('/auth', AuthRouter);                                   // # Use Auth Router                                        //#
app.use('/user', UserRouter);                                   // # Use User Router                                        //#
// .                                                                                                                        //#
// .                                                                                                                        //#
// #------------------------------------------------------------------------------------------------------------------------//#


// + MongoDB connection -----------------------------------------------------------------------------------------------------//+
mongoose.connect(process.env.MONGODB_URI)                                                                                   //+
.then(() => console.log('Connection to DB: Established✅'))                                                                //+
.catch((err) => console.error(`Connection to DB: Unsuccessful❌ : ${err}`));                                              //+
// + ---------------------------------------------------------------------------------------------------------------------//+


// # Home Page
app.get('/', async (req, res) => {
    try {
      const { message } = req.cookies || {};                                                    // # Message managment
      const token = req.cookies.jwt;                                                            // # Get token from cookies

      // # If token exists
      if (token) {
        const decoded = verifyJWT(token); // We verify it and store the decoded info (id, username) into decoded

        // # If decoded ( token is valid and has value )
        if (decoded) {
          req.user = decoded; // Custom variabe user gets the value of decoded
          const currentUser = await User.findOne({ id: decoded.id }); // we find it by the id we gave teh jwt token when we created it

          // # If currentUser exists
            if(currentUser){
                const posts = await Post.find({ author : currentUser._id }).sort({ date : "desc"}); // find the posts with author our guy
                return res.status(200).render('home', {message , currentUser , posts }); // render home with the data
            }
            else{
                res.cookie('message', 'User doesnt exist', { maxAge: 6000, httpOnly: true });
                return res.status(200).render('home', { message });
            }
        }
        else{
            res.cookie('message', 'Unauthorized access', { maxAge: 6000, httpOnly: true });
            return res.status(200).redirect('/');
        }
      }
      return res.status(200).render('home', { message });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
});
  
  

// # About Page
app.get('/about', (req,res) => {
    res.render('about');
});


// # Listen on port
app.listen(PORT, () =>{
    console.log(`Listening on Port ${PORT}`);
});
