const express = require('express');
const router = express.Router();

const User = require('../Schemas/userSchema');
const Post = require('../Schemas/postSchema');

const { accessCheckJWT , attachUser} = require('../Utils/middleware');


// ! -------------------------------------------------
// TODO Make PATCH and DELETE Routes                 |
// ! -------------------------------------------------

// ! -------------------------------------------------
// TODO FIX POST SCHEMA                              |
// ! -------------------------------------------------

// # New Post Page 
router.get('/:id/posts/new', async (req, res) => {
  try {
    // Message managment
    const {message} = req.cookies || null;

    // Manage id param format 
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
    res.cookie('message', 'Unauthorized access', { maxAge: 6000, httpOnly: true });
    return res.redirect('/');
    }

    // Verified user access only to his own account
    if (req.user.id !== id) {
    res.cookie('message', 'You do not have access to this account', { maxAge: 6000, httpOnly: true });
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



// # Creat New Post
router.post('/:id/posts/new', async (req, res) => {
  try {
    // Parse int a
    const id = parseInt(req.params.id);

    // Check if id is a number
    if (isNaN(id)) {
    res.cookie('message', 'Unauthorized access', { maxAge: 6000, httpOnly: true });
    return res.redirect('/');
    }

    // Verified user access only to his own account
    if (req.user.id !== id) {
    res.cookie('message', 'You do not have access to this account', { maxAge: 6000, httpOnly: true });
    return res.redirect('/');
    }


    // User Existince check 
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