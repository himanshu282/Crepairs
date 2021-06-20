const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  brandImage: { type: String },
  models: [
    {
      Name: { type: String, required: true },
      Image: { type: String },
      periodicService: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          highlights: [{ type: String, required: true }],
          validity: { type: String, required: true },
        },
      ],
    },
  ],
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
