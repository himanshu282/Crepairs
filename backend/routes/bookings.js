const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const Booking = require('../models/booking');
const router = express.Router();
const User = require('../models/user');
const toID = mongoose.Types.ObjectId;
const Razorpay = require('razorpay');
const crypto = require('crypto');

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

router.get('/', isAdmin, async (req, res) => {
  await Booking.find({})
    .populate('user_id')
    .exec((err, data) => {
      if (err) throw err;
      if (data) res.send(data);
    });
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  await Booking.find({ user_id: toID(id) })
    .populate('user_id')
    .sort({ bookedOn: -1 })
    .exec((err, data) => {
      if (err) throw err;
      if (data) res.send(data);
    });
});

router.get('/find/:id', async (req, res) => {
  const id = req.params.id;
  await Booking.findById(toID(id))
    .populate('user_id')
    .sort({ bookedOn: -1 })
    .exec((err, data) => {
      if (err) throw err;
      if (data) res.send(data);
    });
});

router.post('/:id/markdone', async (req, res) => {
  const id = req.params.id;

  Booking.findByIdAndUpdate(
    toID(id),

    {
      $set: {
        'payment.Paid': true,
        'payment.amount': req.body.newPrice,
        completed: true,
      },
    },

    (err, done) => {
      if (err) res.send(err).status(400);
      if (done) res.send('Marked Completed');
      else res.send('booking not found').status(400);
    }
  );
});

router.post('/add', async (req, res) => {
  try {
    const id = toID(req.user.id);

    await User.findById(id, async (err, doc) => {
      if (err) throw err;
      if (doc) {
        let isPaid = false;
        console.log(req.body);
        console.log(isPaid);

        if (req.body.paymentMethod === 'Online') {
          let expectedSignature = crypto
            .createHmac('sha256', 'mPXvcK4LTbamGbBqGEP9wA0N')
            .update(
              req.body.razorpay_order_id + '|' + req.body.razorpay_payment_id
            )
            .digest('hex');
          console.log('sig' + req.body.razorpay_signature);
          console.log('sig' + expectedSignature);

          if (expectedSignature === req.body.razorpay_signature) isPaid = true;
          else res.status(400).send('Payment verification failed');
        }

        const newBooking = new Booking({
          service: {
            serviceType: req.body.serviceType,
            plan: req.body.plan,
            repair: req.body.repair && req.body.repair,
          },
          vehicle: {
            name: req.body.vehicle && req.body.vehicle,
            brand: req.body.vehicleBrand,
            reg: req.body.reg && req.body.reg,
            vehicleType: req.body.vehicleType,
            model: req.body.vehicleModel && req.body.vehicleModel,
          },
          descBox: req.body.descBox && req.body.descBox,
          scheduleDate: req.body.date,
          scheduleTime: req.body.time,
          location: `${req.body.houseNo}, ${req.body.locality}, ${req.body.city}, ${req.body.pincode}, ${req.body.country}`,
          payment: {
            amount: req.body.price,
            mode: req.body.paymentMethod,
            Paid: isPaid ? true : false,
          },
          user_id: id,
        });
        await newBooking.save();
        res.send('Booking made');
      }
    });
  } catch (error) {
    res.send('error not loggedin' + error);
  }
});

const razorpay = new Razorpay({
  key_id: 'rzp_test_G4UmS4waS0JFhP',
  key_secret: 'mPXvcK4LTbamGbBqGEP9wA0N',
});

router.post('/razorpay', async (req, res) => {
  const payment_capture = 1;
  const amount = req.body.amount;
  const currency = 'INR';

  const options = {
    amount: amount * 100,
    currency,
    receipt: nanoid(10),
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log(response);
    res.send({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
