const express = require('express');
const router = express.Router();

const User = require('../Schemas/userSchema');

const { accessCheckJWT } = require('../Utils/middleware');
const PostRouter = require('./postRouter');

// # MIDDLEWARE For Protected Routes
router.use(accessCheckJWT);

// # MIDDLEWARE For Post Routes
router.use(PostRouter);


// # User Page
router.get('/:id', async(req, res) =>{
  try {
      // Message managment
      const {message} = req.cookies || null;

      // Manage id param format 
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
          res.cookie('message', 'User doesnt exist', { maxAge: 6000, httpOnly: true });
          return res.redirect('/');
      }

      // Verified user access only to his own account
      if (req.user.id !== id) {
      res.cookie('message', 'You do not have access to this account', { maxAge: 6000, httpOnly: true });
      return res.redirect('/');
      }

      // Find User & Existence Check
      const currentUser = await User.findOne({id: req.params.id});
      if (!currentUser) {
          res.cookie('message', 'Invalid User', { maxAge: 6000, httpOnly: true });
          return res.redirect('/');
      }
      res.status(200).render('user', { currentUser, message: message || null });
      
  }catch (error) {
      return res.status(500).json({ message: error.message}); // error handling 
  } 
});



// # Update User Info 
router.patch('/:id', async (req, res) => {
  try {
    // Message managment
    const {message} = req.cookies || null;

    // Manage id param format 
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.cookie('message', 'User doesnt exist', { maxAge: 6000, httpOnly: true });
        return res.redirect('/');
    }

    // Verified user access only to his own account
    if (req.user.id !== id) {
      res.cookie('message', 'You do not have access to this account', { maxAge: 6000, httpOnly: true });
      return res.redirect('/');
    }

    // Find User & Existence Check
    let currentUser = await User.findOne({ id });
    if (!currentUser) {
        res.cookie('message', 'Invalid User', { maxAge: 6000, httpOnly: true });
        return res.redirect('/');
    }

    const { username, displayName, email } = req.body;

    // Safely update fields
    const updateFields = {};
    if (username) updateFields.username = username.trim();
    if (displayName) updateFields.displayName = displayName.trim();
    if (email) updateFields.email = email.trim().toLowerCase();

    currentUser = await User.findOneAndUpdate({ id }, updateFields, { new: true });

    res.cookie('message', 'User updated successfully', { maxAge: 6000, httpOnly: true });
    return res.redirect(`/user/${id}`);
  } catch (error) {
      return res.status(500).json({ message: error.message });
  }
});


// # Delete User
router.delete('/:id', async(req, res) =>{
  try {
    // Message managment
    const {message} = req.cookies || null;

    // Manage id param format 
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
    res.cookie('message', 'User doesnt exist', { maxAge: 6000, httpOnly: true });
    return res.redirect('/');
    }

    // Verified user access only to his own account
    if (req.user.id !== id) {
    res.cookie('message', 'You do not have access to this account', { maxAge: 6000, httpOnly: true });
    return res.redirect('/');
    }

    // Find User & Existence Check
    await User.findOneAndDelete({id: req.params.id});
    
    res.cookie('message', 'User deleted successfully', { maxAge: 6000, httpOnly: true });
    res.redirect('/');
  }catch (error) {
      res.cookie('message', (error.message), { maxAge: 6000, httpOnly: true });
      return res.redirect(`/user/${req.params.id}`);  // error handling 
  } 
});


module.exports = router;