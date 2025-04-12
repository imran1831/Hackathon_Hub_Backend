const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  tickets: [{
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    }
  }],
  user: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      index: true,
      validate: {
        validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Invalid email format'
      }
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: v => /^[6-9]\d{9}$/.test(v),
        message: 'Invalid Indian mobile number'
      }
    }
  },
  amount: {
    type: Number,
    required: true,
    min: 100 // In paise (₹1 = 100 paise)
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  cf_order_id: {
    type: String,
    index: true
  },
  cf_payment_id: {
    type: String,
    unique: true,
    sparse: true
  },
  payment_method: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', null],
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Virtuals
paymentSchema.virtual('formattedAmount').get(function() {
  return (this.amount / 100).toFixed(2); // Convert to rupees
});

// Indexes
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
