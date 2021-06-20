const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const toID = mongoose.Types.ObjectId;
const path = require('path');
const { nanoid } = require('nanoid');
const { unlinkSync, statSync, accessSync, access, existsSync } = require('fs');
const { constants } = require('buffer');
const bcrypt = require('bcryptjs');

const isAdmin = (req, res, next) => {
  const { user } = req;
  if (user) {
    User.findOne({ email: user.email }, (err, doc) => {
      if (err) throw err;
      if (doc.isAdmin) {
        next();
      } else {
        res.status(404).send('only admin can peform this');
      }
    });
  } else res.status(500).send('Login required');
};

router.post('/deleteuser', isAdmin, async (req, res) => {
  const { id } = req.body;
  await User.findByIdAndDelete(id, (err) => {
    if (err) throw err;
  });
  res.send('success');
  console.log('deleted!');
});

router.get('/all', isAdmin, async (req, res) => {
  await User.find({}, (err, data) => {
    if (err) throw err;
    if (data) res.send(data);
  });
});

// get own data
router.get('/', async (req, res) => {
  try {
    await User.findById(toID(req.user.id), (err, data) => {
      if (err) throw err;
      if (data) res.send(data);
    });
  } catch {
    res.status(400).send('not loggedin');
  }
});

// edit with full rights for admin
router.patch('/edit/:id', isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, isAdmin } = req.body;
    await User.findByIdAndUpdate(id, { name, email, isAdmin });
    res.send('success');
    console.log('updated!');
  } catch (error) {
    console.log(error);
  }
});

// edit own account
router.patch('/edit', async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      houseNo,
      locality,
      city,
      pincode,
      country,
    } = req.body.form;

    const id = toID(req.user.id);
    await User.findByIdAndUpdate(id, {
      name: fullName,
      phone,
      address: {
        houseNo,
        locality,
        city,
        pincode,
        country,
      },
    });
    res.send('success');
  } catch (error) {
    console.log(error);
    res.status(400).send('error');
  }
});

router.post('/setdp', async (req, res) => {
  try {
    const id = toID(req.user.id);
    const myPic = req.files.pic;
    await User.findById(id, async (err, doc) => {
      if (err) res.status(400).send(err);
      if (!myPic) res.status(400).send('Select picture first');
      if (doc) {
        let newFile;
        if (myPic) {
          const extName = path.extname(myPic.name); //.png
          const baseName = path.basename(myPic.name, extName); // xx.
          // Use the mv() method to place the file somewhere on your server
          newFile = baseName + nanoid(5) + extName; // xx randomint .png
          myPic.mv('./uploads/media/' + newFile);
          doc.profileImg = `http://localhost:5000/uploads/media/${newFile}`;
          doc.save();
          res.send('Uploaded');
        }
      }
    });
  } catch (error) {
    console.log('no file found or not loggedin');
  }
});

router.post('/rmvdp', async (req, res) => {
  const image = req.body.img;
  User.findOne({ profileImg: image }, (err, doc) => {
    if (err) throw err;
    if (doc) {
      var IMGpath = image.replace('http://localhost:5000/', './');
      doc.profileImg = null;
      doc.save();
      try {
        accessSync(IMGpath);
        unlinkSync(IMGpath);
        res.send('Removed');
      } catch (error) {
        res.send('Removed');
      }
    }
  });
});

router.post('/changepass', async (req, res) => {
  const id = toID(req.user.id);
  let oldpass = req.body.pass.current;
  let newpass = req.body.pass.new;
  try {
    User.findById(id, async (err, doc) => {
      if (err) throw err;
      if (!doc) res.status(400).send('not found');
      if (doc) {
        let compared = await bcrypt.compare(oldpass, doc.password);
        if (compared) {
          const newEncrypted = await bcrypt.hash(newpass, 10);
          doc.password = newEncrypted;
          doc.save();
          res.send('done');
        } else res.status(400).send('old password not match');
      }
    });
  } catch (err) {
    res.status(400).send('login required');
  }
});

module.exports = router;
