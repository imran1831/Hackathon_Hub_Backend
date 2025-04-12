const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  bannerImage: String,
  title: { type: String },
  dateOfConduct: { type: Date },
  description: { type: String },
  location: { type: String },
  city: { type: String }, 
  type: { type: String, enum: ["hackathon", "event"] }, 
  prizePool: { type: Number, min: 0 },
  maxTeams: { type: Number, min: 1 },
  maxTeamSize: { type: Number, min: 1 },
  minTeamSize: { type: Number, min: 1 },
  status: { type: String, enum: ["upcoming", "ongoing", "completed"], default: "upcoming" },
  createdBy: { type: String }, // Just store Google ID as string
  customSections: [
    {
      header: String,
      divs: [
        {
          image: String,
          title: String,
        },
      ],
    },
  ],
  sponsors: [
    {
      name: String,
      logo: String,
    },
  ],
  faqs: [
    {
      question: String,
      answer: String,
    },
  ],
  timeline: [
    {
      title: String,
      description: String,
      date: Date,
    },
  ],
  queries: {
    phone: String,
    whatsappGroup: String,
  },
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;