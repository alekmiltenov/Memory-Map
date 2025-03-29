const express = require('express');
const router = express.Router();

const User = require('../Schemas/userSchema');
const Post = require('../Schemas/postSchema');

const bcrypt = require('bcrypt');
const { accessCheckJWT } = require('../Utils/middleware');

// ! IMPORTANT NIGGER !!!!
// TODO Fix accessCheckJWT to also check if you are the user you are trying to access
// ! IMPORTANT NIGGER !!!!

// # MIDDLEWARE For Protected Routes
router.use(accessCheckJWT); 

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

      // Find User & Existence Check
      const currentUser = await User.findOne({id: req.params.id});
      if (!currentUser) {
          res.cookie('message', 'Invalid User', { maxAge: 6000, httpOnly: true });
          return res.redirect('/');
      }
      res.status(200).render('user', { currentUser, message: req.cookies.message || null });
      
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
        
        res.redirect('/');
        
    }catch (error) {
        res.cookie('message', (error.message), { maxAge: 6000, httpOnly: true });
        return res.redirect(`/user/${req.params.id}`);  // error handling 
    } 
});


// # ----------------------------------------POSTS MANAGMENT----------------------------------------# //

// # New Post Page 
router.get('/:id/posts/new', async (req, res) => {
  try {
    // Message managment
    const {message} = req.cookies || null;

    // Manage id param format 
    const id = parseInt(req.params.id);
    if (isNaN(id) || req.user.id !== id) {
      res.cookie('message', 'Unauthorized access', { maxAge: 6000, httpOnly: true });
      return res.redirect('/');
    }

    // Find User & Existence Check
    const currentUser = await User.findOne({ id });
    if (!currentUser) {
      res.cookie('message', 'Invalid User', { maxAge: 6000, httpOnly: true });
      return res.redirect('/');
    }

    return res.status(200).render('newPost', { currentUser });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Handle submission of new post
router.post('/:id/posts/new', async (req, res) => {
  try {
    // Parse int a
    const id = parseInt(req.params.id);

    // Check if id is a number
    if (isNaN(id) || req.user.id !== id) {
      res.cookie('message', 'Unauthorized access', { maxAge: 6000, httpOnly: true });
      return res.redirect('/');
    }
    // Existince check 
    const currentUser = await User.findOne({ id });
    if (!currentUser) {
      res.cookie('message', 'Invalid User', { maxAge: 6000, httpOnly: true });
      return res.redirect('/');
    }

    const {
      title,
      description,
      date,
      latitude,
      longitude,
      participants,
      accessGroups,
      picture
    } = req.body;  

    const post = new Post({
      title,
      description,
      date: new Date(date),
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      participants,
      accessGroups,
      picture: picture || '',
      author: currentUser._id
    });

    await post.save();

    res.cookie('message', 'Post created successfully', { maxAge: 6000, httpOnly: true });
    res.redirect('/');

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;