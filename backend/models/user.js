const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  profileImg: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  registerDate: { type: Date, default: Date.now },
  phone: { type: String, default: null },
  address: {
    houseNo: { type: String, default: null },
    locality: { type: String, default: null },
    city: { type: String, default: null },
    pincode: { type: String, default: null },
    country: { type: String, default: 'INDIA' },
  },
  resetToken: { type: String },
  resetTime: { type: String },
});

module.exports = mongoose.model('User', userSchema);
