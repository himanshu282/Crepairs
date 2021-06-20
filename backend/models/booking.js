const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  service: {
    serviceType: { type: String, required: true },
    plan: { type: String },
    repair: { type: Array },
  },
  vehicle: {
    name: { type: String },
    brand: { type: String },
    model: { type: String, default: '' },
    vehicleType: { type: String },
    reg: { type: String },
  },
  descBox: { type: String },
  completed: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  bookedOn: { type: Date, default: Date.now },
  scheduleDate: { type: Date, required: true },
  scheduleTime: { type: String, required: true },
  location: { type: String, required: true },
  payment: {
    amount: { type: Number },
    mode: { type: String },
    Paid: { type: Boolean, default: false },
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
