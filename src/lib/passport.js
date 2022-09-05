const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use(
  'local.signin',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      //console.log(req.body);
      const rows = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        username
      );
      if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(
          password,
          user.password
        );
        if (validPassword) {
          done(null, user, req.flash('success', 'welcome' + user.username));
        } else done(null, false, req.flash('message', 'incorrect password'));
      } else
        return done(null, false, req.flash('message', "user doesn't exist"));
    }
  )
);

passport.use(
  'local.signup',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      const { fullname, drivingId, cellphone } = req.body;
      let newUser = {
        fullname,
        username,
        password,
        drivingId,
        cellphone,
      };
      newUser.password = await helpers.encryptPassword(password);
      // Saving in the Database
      const dbConsult = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        newUser.username
      );
      console.log(dbConsult);
      if (dbConsult.length === 0) {
        const result = await pool.query('INSERT INTO users SET ?', newUser);
        newUser.id = result.insertId;
        return done(null, newUser);
      } else
        return done(
          null,
          false,
          req.flash('message', 'USer with given username exists already.')
        );
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  //const rows = await pool.query("SELECT * FROM users");
  done(null, rows[0]);
});