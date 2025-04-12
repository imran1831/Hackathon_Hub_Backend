// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const Event = require("./models/Event");
// const Ticket = require("./models/Ticket"); 
// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// require('dotenv').config();

// const app = express();
// const PORT = 8080;

// // Connect to MongoDB
// mongoose
//   .connect("mongodb://127.0.0.1:27017/Hackly")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.error("MongoDB Connection Error:", err));

// // Middleware
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     credentials: true
//   })
// );

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// // Routes

// // Get all events
// app.get("/api/events", async (req, res) => {
//   try {
//     const events = await Event.find();
//     res.json(events);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get single event by ID
// app.get("/api/event/:id", async (req, res) => {
//   try {
//     const event = await Event.findById(req.params.id);
//     if (!event) {
//       return res.status(404).json({ error: "Event not found" });
//     }
//     res.json(event);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Create a new event
// app.post("/api/create-event", async (req, res) => {
//   try {
//     const newEvent = new Event(req.body);
//     await newEvent.save();

//     res.status(201).json({
//       message: "Event created successfully!",
//       event: newEvent,
//       eventId: newEvent._id,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Edit/Update an event by ID
// app.put("/api/events/:id", async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, {
//       new: true,
//     });

//     if (!updatedEvent) {
//       return res.status(404).json({ error: "Event not found" });
//     }

//     res.json({ message: "Event updated successfully!", event: updatedEvent });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Delete an event by ID
// app.delete("/api/event/:id", async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     await Ticket.deleteMany({ eventId });
//     const deletedEvent = await Event.findByIdAndDelete(eventId);

//     if (!deletedEvent) {
//       return res.status(404).json({ error: "Event not found" });
//     }

//     res.json({ message: "Event and associated tickets deleted successfully!" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Create a new ticket for an event
// app.post("/api/tickets", async (req, res) => {
//   try {
//     const { eventId, ticketName, domains, quantity, description, ticketType } = req.body;

//     if (!eventId || !ticketName || !quantity || !ticketType) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const newTicket = new Ticket({
//       eventId,
//       ticketName,
//       domains,
//       quantity,
//       description,
//       ticketType,
//     });

//     await newTicket.save();
//     res.status(201).json({ message: "Ticket created successfully!", ticket: newTicket });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get all tickets for a specific event
// app.get("/api/tickets/:eventId", async (req, res) => {
//   try {
//     const eventId = req.params.eventId;
//     const tickets = await Ticket.find({ eventId });
//     if (!tickets || tickets.length === 0) {
//       return res.status(404).json({ error: "No tickets found for this event" });
//     }
//     res.json(tickets);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get a single ticket by ID
// app.get("/api/ticket/:ticketId", async (req, res) => {
//   try {
//     const ticketId = req.params.ticketId;
//     const ticket = await Ticket.findById(ticketId);
//     if (!ticket) {
//       return res.status(404).json({ error: "Ticket not found" });
//     }
//     res.json(ticket);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Edit/Update a ticket by ID
// app.put("/api/tickets/:ticketId", async (req, res) => {
//   try {
//     const ticketId = req.params.ticketId;
//     const { ticketName, domains, quantity, description, ticketType } = req.body;

//     if (!ticketName || !domains || !quantity || !ticketType) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const updatedTicket = await Ticket.findByIdAndUpdate(
//       ticketId,
//       {
//         ticketName,
//         domains,
//         quantity,
//         description,
//         ticketType,
//       },
//       { new: true }
//     );

//     if (!updatedTicket) {
//       return res.status(404).json({ error: "Ticket not found" });
//     }

//     res.json({ message: "Ticket updated successfully!", ticket: updatedTicket });
//   } catch (err) {
//     console.error("Error updating ticket:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get event with its tickets (combined data)
// app.get("/api/event-with-tickets/:eventId", async (req, res) => {
//   try {
//     const eventId = req.params.eventId;
//     const event = await Event.findById(eventId);
//     if (!event) {
//       return res.status(404).json({ error: "Event not found" });
//     }
    
//     const tickets = await Ticket.find({ eventId });
    
//     const response = {
//       event: {
//         _id: event._id,
//         title: event.title,
//         type: event.type,
//       },
//       tickets: tickets
//     };
    
//     res.json(response);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Payment Routes
// app.post("/api/create-razorpay-order", async (req, res) => {
//   try {
//     const options = {
//       amount: req.body.amount, // amount in paise
//       currency: req.body.currency || 'INR',
//       receipt: `receipt_${Date.now()}`
//     };

//     const order = await razorpay.orders.create(options);
//     res.json(order);
//   } catch (error) {
//     console.error('Error creating order:', error);
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// });

// app.post("/api/verify-payment", async (req, res) => {
//   try {
//     const { razorpay_payment_id, razorpay_order_id, razorpay_signature, eventId, tickets } = req.body;
    
//     // Verify payment signature
//     const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
//     const generated_signature = hmac.digest('hex');
    
//     if (generated_signature !== razorpay_signature) {
//       return res.status(400).json({ success: false, error: 'Payment verification failed' });
//     }

//     // Update ticket quantities in database
//     for (const ticket of tickets) {
//       await Ticket.findByIdAndUpdate(
//         ticket.ticketId,
//         { $inc: { sold: ticket.quantity } },
//         { new: true }
//       );
//     }

//     res.json({ 
//       success: true,
//       message: 'Payment verified and tickets booked',
//       paymentId: razorpay_payment_id
//     });
//   } catch (error) {
//     console.error('Payment verification error:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to verify payment'
//     });
//   }
// });

// app.post("/api/register-free", async (req, res) => {
//   try {
//     const { eventId, tickets } = req.body;
    
//     // Update ticket quantities for free registration
//     for (const ticket of tickets) {
//       await Ticket.findByIdAndUpdate(
//         ticket.ticketId,
//         { $inc: { sold: ticket.quantity } },
//         { new: true }
//       );
//     }

//     res.json({ 
//       success: true,
//       message: 'Registered for free event'
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to register'
//     });
//   }
// });

// // Start the server
// app.listen(PORT, () =>
//   console.log(`Server running on http://localhost:${PORT}`)
// );


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const crypto = require("crypto");
const Event = require("./models/Event");
const Ticket = require("./models/Ticket"); 
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();
const PORT = 8080;

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/Hackly")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Google Strategy Configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// Serialize just the ID to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize - we won't actually fetch user data since we're only storing ID
passport.deserializeUser((id, done) => {
  done(null, { id });
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ======================
// Authentication Routes
// ======================
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: true
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/auth-success`);
  }
);

app.get('/api/current-user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ id: req.user.id });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect(process.env.FRONTEND_URL);
});

// ======================
// Middleware
// ======================
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Authentication required' });
};

const ensureEventOwner = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// Event Routes (Updated)
// ======================
app.post("/api/create-event", ensureAuthenticated, async (req, res) => {
  try {
    const newEvent = new Event({
      ...req.body,
      createdBy: req.user.id // Only storing Google ID
    });
    
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/events/:id", ensureAuthenticated, ensureEventOwner, async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/event/:id", ensureAuthenticated, ensureEventOwner, async (req, res) => {
  try {
    await Ticket.deleteMany({ eventId: req.params.id });
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// Existing Routes (Keep all your other routes as-is)
// ======================
// ... [Keep all your existing ticket and payment routes unchanged]

// ==============================================
// Ticket Routes
// ==============================================
app.get("/api/events/:eventId/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find({ eventId: req.params.eventId });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/events/:eventId/tickets", ensureAuthenticated, ensureEventOwner, async (req, res) => {
  try {
    const newTicket = new Ticket({
      ...req.body,
      eventId: req.params.eventId
    });
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================
// Payment Routes
// ==============================================
app.post("/api/payments/create-order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: req.body.amount * 100, // Convert to paise
      currency: req.body.currency || 'INR',
      receipt: `order_${Date.now()}`
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/payments/verify", async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');
    
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Update ticket quantities here if needed
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================
// Error Handling
// ==============================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start the server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);