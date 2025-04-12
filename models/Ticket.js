const mongoose = require("mongoose");

const domainSchema = new mongoose.Schema({
  domainName: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    min: 0, 
  },
});

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event", 
      required: true,
    },
    ticketName: {
      type: String,
      required: true,
      trim: true,
    },
    domains: [domainSchema], 
    quantity: {
      type: Number,
      required: true,
      min: 0, 
    },
    description: {
      type: String,
      trim: true,
    },
    ticketType: {
      type: String,
      enum: ["paid", "free"], 
      default: "paid",
    },
    sold: {
      type: Number,
      default: 0,
      min: 0, 
    },
  },
  {
    timestamps: true, 
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;