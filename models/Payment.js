// const mongoose = require('mongoose');

// const paymentSchema = new mongoose.Schema({
//   eventId: {
//     type: String,
//     required: true
//   },
//   username: {
//     type: String,
//     required: true
//   },
//   amount: {
//     type: Number,
//     required: true
//   },
//   payment_id: {
//     type: String,
//     required: true,
//     unique: true
//   }
// });

// module.exports = mongoose.model('Payment', paymentSchema);


const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  payment_id: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['verified', 'pending', 'rejected'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
