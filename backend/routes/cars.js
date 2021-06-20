const express = require('express');
const mongoose = require('mongoose');
const Vehicle = require('../models/vehicle');
const router = express.Router();
const toID = mongoose.Types.ObjectId;
const { nanoid } = require('nanoid');
const path = require('path');

const isAdmin = (req, res, next) => {
  const { user } = req;
  if (user) {
    User.findOne({ email: user.email }, (err, doc) => {
      if (err) throw err;
      if (doc.isAdmin) {
        next();
      } else res.send('only admin can peform this');
    });
  } else res.send('login required');
};

router.get('/', async (req, res) => {
  await Vehicle.find({}).exec((err, data) => {
    if (err) throw err;
    if (data) res.send(data);
  });
});

router.get('/model/:id', async (req, res) => {
  const id = toID(req.params.id);
  await Vehicle.findById(id, (err, data) => {
    if (err) throw err;
    if (data) res.send(data);
  });
});

router.post('/model/:id', async (req, res) => {
  let myFile;
  if (req.files) myFile = req.files.modelImg;
  const carModel = req.body.model;
  try {
    const id = toID(req.params.id);
    if (!carModel) throw res.status(400).send('model is required');
    await Vehicle.findById(id, async (err, doc) => {
      if (err) throw err;
      if (doc) {
        let newFile;
        if (myFile) {
          const extName = path.extname(myFile.name);
          const baseName = path.basename(myFile.name, extName);
          // Use the mv() method to place the file somewhere on your server
          newFile = baseName + nanoid(5) + extName;
          myFile.mv('./uploads/media/cars/' + newFile);
        }
        const car = {
          Name: carModel,
          ...(myFile && {
            Image: `http://localhost:5000/uploads/media/cars/${newFile}`,
          }),
        };
        doc.models.push(car);
        await doc.save();
        res.send('model Added');
      }
    });
  } catch (error) {
    res.send('no maker found for this id' + error);
  }
});

router.post('/addbrand', async (req, res) => {
  const brandName = req.body.name;
  let myFile;
  req.files && (myFile = req.files.brandIcon);
  try {
    Vehicle.findOne({ brand: brandName }, async (err, doc) => {
      if (err) throw err;
      if (doc) res.status(400).send(brandName + ' already exists');
      if (!doc) {
        let newFile;

        if (myFile) {
          const extName = path.extname(myFile.name);
          const baseName = path.basename(myFile.name, extName);
          // Use the mv() method to place the file somewhere on your server
          newFile = baseName + nanoid(5) + extName;
          myFile.mv('./uploads/media/brands/' + newFile);
        }

        const newBrand = new Vehicle({
          brand: brandName,
          brandImage: 'http://localhost:5000/uploads/media/brands/' + newFile,
        });

        await newBrand.save();
        res.send('Brand Added');
      }
    });
  } catch (error) {
    res.send('error' + error);
  }
});

module.exports = router;
