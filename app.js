const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const Event = require("./models/Event");
const Ticket = require("./models/Ticket");
const Payment = require("./models/Payment");
const Form = require('./models/Form');
const Response = require('./models/Response');
const Quantity = require("./models/Quantity");
const Booking = require("./models/Booking");
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = 8080;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
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
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/auth/google/callback'
},
  (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0]?.value
    };
    return done(null, user);
  }
));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-success`);
  }
);

// Updated logout route
app.get('/auth/logout', (req, res) => {
  if (req.user) {
  }
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    // Clear the session cookie
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ error: 'Session destruction failed' });
      }

      // Clear the passport cookie
      res.clearCookie('connect.sid');

      // Send success response
      res.json({ success: true });
    });
  });
});

app.get('/auth/current-user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: req.user
    });
  } else {
    res.json({
      isAuthenticated: false,
      user: null
    });
  }
});


// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify if user has already paid for an event
// Enhanced verification endpoint
app.post('/api/verify-payment-status', async (req, res) => {
  try {
    const { eventId, username } = req.body;

    if (!eventId || !username) {
      return res.status(400).json({
        success: false,
        message: 'Both eventId and username are required'
      });
    }

    // Find a payment document that contains both the eventId and username
    const payment = await Payment.findOne({
      eventId: eventId,
      username: username
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for the given eventId and username combination'
      });
    }

    // If found, return success with payment details
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        eventId: payment.eventId,
        username: payment.username,
        amount: payment.amount,
        payment_id: payment.payment_id
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while verifying payment'
    });
  }
});
// Get single event by ID
app.get("/api/event/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/create-event", ensureAuthenticated, async (req, res) => {
  try {
    // Log the incoming request body and user for debugging
    console.log('Creating event with data:', req.body);
    console.log('Created by user:', req.user.email);

    const newEvent = new Event({
      ...req.body,
      createdBy: req.user.email // This will store the authenticated user's email
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      message: "Event created successfully!",
      event: savedEvent,
      eventId: savedEvent._id,
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: err.message });
  }
});
// Edit/Update an event by ID
app.put("/api/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, {
      new: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event updated successfully!", event: updatedEvent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an event by ID
app.delete("/api/event/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    await Ticket.deleteMany({ eventId });
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event and associated tickets deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new ticket for an event (protected)
app.post("/api/tickets", ensureAuthenticated, async (req, res) => {
  try {
    const { eventId, ticketName, domains, quantity, description, ticketType } = req.body;

    if (!eventId || !ticketName || !quantity || !ticketType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTicket = new Ticket({
      eventId,
      ticketName,
      domains,
      quantity,
      description,
      ticketType,
      createdBy: req.user.email // Store creator email
    });

    await newTicket.save();
    console.log('Ticket created by:', req.user.email); // Log who created the ticket
    res.status(201).json({
      message: "Ticket created successfully!",
      ticket: newTicket
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tickets for a specific event
app.get("/api/tickets/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const tickets = await Ticket.find({ eventId });
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: "No tickets found for this event" });
    }
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single ticket by ID
app.get("/api/ticket/:ticketId", async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit/Update a ticket by ID
app.put("/api/tickets/:ticketId", async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const { ticketName, domains, quantity, description, ticketType } = req.body;

    if (!ticketName || !domains || !quantity || !ticketType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        ticketName,
        domains,
        quantity,
        description,
        ticketType,
      },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ message: "Ticket updated successfully!", ticket: updatedTicket });
  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get event with its tickets (combined data)
app.get("/api/event-with-tickets/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const tickets = await Ticket.find({ eventId });

    const response = {
      event: {
        _id: event._id,
        title: event.title,
        type: event.type,
      },
      tickets: tickets
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/quantities", async (req, res) => {
  try {
    const { eventId, username, quantity } = req.body;

    // Validate required fields
    if (!eventId || !username || quantity === undefined) {
      return res.status(400).json({ error: 'eventId, username, and quantity are required' });
    }

    const quantityData = new Quantity({ eventId, username, quantity });
    const savedQuantity = await quantityData.save();

    res.status(201).json(savedQuantity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment Routes
app.post("/api/create-razorpay-order", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount, // amount in paise
      currency: req.body.currency || 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});


// app.post("/api/verify-payment", async (req, res) => {
//   try {
//     const { razorpay_payment_id, razorpay_order_id, razorpay_signature, eventId, tickets, user, amount } = req.body;

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

//     // Create payment record
//     const paymentRecord = new Payment({
//       eventId,
//       username: user,
//       amount,
//       payment_id: razorpay_payment_id
//     });
//     await paymentRecord.save();

//     res.json({ 
//       success: true,
//       message: 'Payment verified and tickets booked',
//       paymentId: razorpay_payment_id,
//     });
//   } catch (error) {
//     console.error('Payment verification error:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to verify payment'
//     });
//   }
// });

app.post("/api/verify-payment", async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, eventId, tickets, user, amount } = req.body;

    // Verify payment signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment verification failed' });
    }

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Update ticket quantities in database
    for (const ticket of tickets) {
      await Ticket.findByIdAndUpdate(
        ticket.ticketId,
        { $inc: { sold: ticket.quantity } },
        { new: true }
      );
    }

    // Create payment record
    const paymentRecord = new Payment({
      eventId,
      username: user,
      amount,
      payment_id: razorpay_payment_id
    });
    await paymentRecord.save();

    // Create booking record
    const booking = new Booking({
      eventId: event._id,
      eventName: event.title,
      eventBannerImage: event.bannerImage,
      eventDate: event.dateOfConduct,
      holderName: user, // Use provided name or fallback to username
      transactionId: razorpay_payment_id
    });
    await booking.save();

    res.json({
      success: true,
      message: 'Payment verified and tickets booked',
      paymentId: razorpay_payment_id,
      bookingId: booking._id
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    });
  }
});


// GET all payments for a specific eventId
app.get("/api/payments/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Find all payments with the given eventId
    const payments = await Payment.find({ eventId: eventId });

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No payments found for this event'
      });
    }

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving payments'
    });
  }
});

app.put("/api/payments/:paymentId", async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const { status } = req.body;

    if (!['verified', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updatedPayment = await Payment.findOneAndUpdate(
      { payment_id: paymentId },
      { status: status },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedPayment
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating payment status'
    });
  }
});

app.post("/api/register-free", async (req, res) => {
  try {
    const { eventId, tickets } = req.body;

    // Update ticket quantities for free registration
    for (const ticket of tickets) {
      await Ticket.findByIdAndUpdate(
        ticket.ticketId,
        { $inc: { sold: ticket.quantity } },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: 'Registered for free event'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register'
    });
  }
});

// Create a new form for an event
app.post('/api/events/:eventId/forms', async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    const { eventId } = req.params;

    const form = new Form({
      title,
      description,
      questions,
      eventId
    });

    const savedForm = await form.save();
    res.status(201).json({
      success: true,
      data: savedForm,
      message: 'Form created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create form',
      error: error.message
    });
  }
});

// Get all forms for a specific event
app.get('/api/events/:eventId/forms', async (req, res) => {
  try {
    const forms = await Form.find({ eventId: req.params.eventId })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: forms.length,
      data: forms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forms',
      error: error.message
    });
  }
});

// Get details of a specific form
app.get('/api/forms/:formId', async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId)
      .populate('eventId', 'name date');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form',
      error: error.message
    });
  }
});

// Update a specific form
app.put('/api/events/:eventId/forms/:formId', async (req, res) => {
  try {
    const { eventId, formId } = req.params;
    const { title, description, questions } = req.body;

    // Verify the form belongs to the specified event
    const form = await Form.findOne({ _id: formId, eventId });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found in this event'
      });
    }

    // Update the form
    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      {
        title,
        description,
        questions,
        updatedAt: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedForm,
      message: 'Form updated successfully'
    });
  } catch (error) {
    console.error('Error updating form:', error);

    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating form',
      error: error.message
    });
  }
});

// Delete a specific form
app.delete('/api/forms/:formId', async (req, res) => {
  try {
    const deletedForm = await Form.findByIdAndDelete(req.params.formId);

    if (!deletedForm) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete form',
      error: error.message
    });
  }
});

app.post('/api/responses', ensureAuthenticated, async (req, res) => {
  try {
    const { formId, eventId, answers } = req.body;

    // Basic validation
    if (!formId || !eventId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: formId, eventId, and answers array are required'
      });
    }

    // Create a new response document
    const newResponse = new Response({
      formId,
      eventId,
      submittedBy: req.user?.email, // Using your default value
      answers,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceType: req.get('User-Agent')?.includes('Mobile') ? 'Mobile' : 'Desktop',
        // Duration would typically come from the frontend
        duration: req.body.duration || 0
      }
    });

    // Save to database
    const savedResponse = await newResponse.save();

    res.status(201).json({
      success: true,
      message: 'Response saved successfully',
      data: savedResponse
    });

  } catch (error) {
    console.error('Error saving response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save response',
      error: error.message
    });
  }
});

// Get all responses for a specific event
app.get('/api/events/:eventId/responses', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Get responses with form details populated
    const responses = await Response.find({ eventId })
      .populate({
        path: 'formId',
        select: 'title description'
      })
      .sort({ createdAt: -1 });

    if (!responses.length) {
      return res.status(404).json({
        success: false,
        message: 'No responses found for this event'
      });
    }

    res.json({
      success: true,
      count: responses.length,
      data: responses
    });

  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch responses',
      error: error.message
    });
  }
});

// Get response statistics for an event
app.get('/api/events/:eventId/responses/stats', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const objectId = new mongoose.Types.ObjectId(eventId);

    const stats = {
      totalResponses: await Response.countDocuments({ eventId: objectId }),
      byDevice: await Response.aggregate([
        { $match: { eventId: objectId } },
        {
          $group: {
            _id: "$metadata.deviceType",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            deviceType: "$_id",
            count: 1,
            _id: 0
          }
        }
      ]),
      byDate: await Response.aggregate([
        { $match: { eventId: objectId } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: "$_id",
            count: 1,
            _id: 0
          }
        }
      ])
    };

    // Handle empty results
    if (stats.totalResponses === 0) {
      return res.json({
        success: true,
        message: 'No responses found for this event',
        data: {
          totalResponses: 0,
          byDevice: [],
          byDate: []
        }
      });
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching response stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch response statistics',
      error: error.message
    });
  }
});

app.post("/api/check-submission", async (req, res) => {
  try {
    const { eventId, username } = req.body;

    // Validate required parameters
    if (!eventId || !username) {
      return res.status(400).json({
        success: false,
        message: 'Both eventId and username are required parameters'
      });
    }

    // Check if the submission exists
    const submission = await Response.findOne({
      eventId: eventId,
      submittedBy: username
    });

    res.status(200).json({
      success: true,
      exists: !!submission,
      submission: submission || null
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error while checking submission',
      error: error.message
    });
  }
});

// app.get('/api/bookings/:username', async (req, res) => {
//   try {
//     const { username } = req.params;

//     // Validate the username parameter
//     if (!username || typeof username !== 'string') {
//       return res.status(400).json({ message: 'Invalid username provided' });
//     }

//     console.log("Touched");

//     // Find all bookings for the given holderName
//     const bookings = await Booking.find({ holderName: username })
//       .sort({ createdAt: -1 }); // Sort by most recent first

//     if (!bookings || bookings.length === 0) {
//       return res.status(404).json({ message: 'No bookings found for this user' });
//     }

//     res.status(200).json(bookings);
//   } catch (error) {
//     console.error('Error fetching bookings:', error);
//     res.status(500).json({ message: 'Server error while fetching bookings' });
//   }
// });

app.get('/api/bookings', async (req, res) => {
  try {
    const { holderName } = req.query;

    if (!holderName) {
      return res.status(400).json({ message: 'holderName is required' });
    }

    const bookings = await Booking.find({ holderName }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Start the server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);