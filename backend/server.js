const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const user = require('./models/user');
const fileUpload = require('express-fileupload');

//----------------------------------------- END OF IMPORTS---------------------------------------------------

// db connection
connectDB();

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(cookieParser('secret'));
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload({ createParentPath: true }));

app.use('/uploads', express.static('uploads'));

// passport
passport.use(
  new localStrategy(
    { usernameField: 'email', passwordField: 'password' },
    (email, password, done) => {
      user.findOne({ email: email }, (err, user) => {
        if (err) throw err;
        if (!user) return done(null, false);
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) throw err;
          if (result === true) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      });
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});
passport.deserializeUser((id, cb) => {
  user.findOne({ _id: id }, (err, user) => {
    const userInformation = {
      id: user._id,
      email: user.email,
    };
    cb(err, userInformation);
  });
});

//----------------------------------------- END OF MIDDLEWARE---------------------------------------------------

//Define routes
app.use('/api/auth/', require('./routes/auth'));
app.use('/api/user/', require('./routes/users'));
app.use('/api/book/', require('./routes/bookings'));
app.use('/api/cars/', require('./routes/cars'));

//----------------------------------------- END OF ROUTES---------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server is running at ' + PORT);
});
