const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../database');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

router.get('/signup', isNotLoggedIn, (req, res) => {
  res.render('auth/signup');
});
router.post(
  '/signup',
  isNotLoggedIn,
  passport.authenticate('local.signup', {
    //if (err) return next(err);
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true,
  })
);

router.get('/signin', isNotLoggedIn, (req, res) => {
  res.render('auth/signin');
});

router.post('/signin', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local.signin', {
    successRedirect: './profile',
    failureRedirect: '/signin',
    failureFlash: true,
  })(req, res, next);
});

router.get('/profile', isLoggedIn, async (req, res) => {
  const notifs = await pool.query(
    'SELECT * FROM notifs WHERE user_id = ?',
    req.user.id
  );
  res.render('profile', { notifs });
});

router.get('/logout', isLoggedIn, (req, res, next) => {
  req.logOut(req.user, err => {
    if (err) return next(err);
    res.redirect('/signin');
  });
});

module.exports = router;
