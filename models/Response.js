const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  submittedBy: {
    type: String
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      required: true,
      enum: [
        'short-answer',
        'paragraph',
        'multiple-choice', 
        'checkboxes',
        'dropdown'
      ]
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  }],
  submissionDate: {
    type: Date,
    default: Date.now
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String,
    duration: Number // Time taken to complete in seconds
  }
}, {
  timestamps: true
});

// Indexes for faster querying
responseSchema.index({ formId: 1 });
responseSchema.index({ eventId: 1 });
responseSchema.index({ respondent: 1 });

module.exports = mongoose.model('Response', responseSchema);