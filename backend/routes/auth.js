const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const { nanoid } = require('nanoid');

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('success');
  console.log('success auth');
});

router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.status(400).send('email already exists');
    if (!doc) {
      const encryptedPass = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: encryptedPass,
      });
      await newUser.save();
      res.send('user created');
    }
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.post('/forgot', (req, res) => {
  try {
    let mailer = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: 'crepairs@hotmail.com',
        pass: 'carMCA21',
      },
    });

    User.findOne({ email: req.body.email }, async (err, doc) => {
      if (err) throw err;
      if (!doc)
        res.status(401).send('No account with that email address exists.');
      if (doc) {
        const resetToken = nanoid();
        doc.resetToken = resetToken;
        doc.resetTime = Date.now() + 3600000;
        doc.save();
        mailer.sendMail(
          {
            from: 'crepairs@hotmail.com',
            to: req.body.email,
            subject: 'Crepairs Password Reset',
            html:
              'Click the following link to reset your password <br>' +
              `http://localhost:3000/signin/createnew/${resetToken}`,
          },
          (err, info) => {
            if (err) res.send(err);
            res.send('Message Sent');
          }
        );
      }
    });
  } catch (error) {
    res.send('error');
  }
});

router.post('/reset/', (req, res) => {
  try {
    User.findOne(
      { resetToken: req.body.token, resetTime: { $gt: Date.now() } },
      async (err, doc) => {
        if (err) throw err;
        if (!doc) {
          res
            .status(401)
            .send('Password reset link is invalid or has expired.');
        }
        const encryptedPass = await bcrypt.hash(req.body.password, 10);
        doc.password = encryptedPass;
        doc.resetTime = undefined;
        doc.resetToken = undefined;
        doc.save();
        res.send('Password changed');
      }
    );
  } catch (error) {
    res.send(error);
  }
});
module.exports = router;
