const mongoose = require('mongoose');

const QuantitySchema = new mongoose.Schema({
  eventId:{
    type: String,
  },
  username: {
    type: String,
  },
  quantity: {
    type: Number,
  },
});


const Quantity = mongoose.model('Quantity', QuantitySchema);
module.exports = Quantity;