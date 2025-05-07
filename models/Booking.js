const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Event',
  },
  eventName: {
    type: String,
    required: true,
  },
  eventBannerImage: {
    type: String,
    required: false,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  holderName: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
}, {
  timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
