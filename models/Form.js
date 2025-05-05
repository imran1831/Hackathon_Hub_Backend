const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  fieldType: { 
    type: String, 
    required: true,
    enum: [
      'short-answer',
      'paragraph',
      'multiple-choice', 
      'checkboxes',
      'dropdown'
    ],
    default: 'short-answer'
  },
  options: [{
    text: { type: String, required: true },
    value: { type: String, required: true }
  }],
  required: { type: Boolean, default: false },
  minLength: { type: Number },
  maxLength: { type: Number }
});

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [questionSchema],
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', formSchema);