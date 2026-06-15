# Backend README.md

```md
# Hackly - Backend

Backend API for Hackly Hackathon Management Platform.

Provides:

- Authentication
- Event Management
- Registration Management
- Ticket System
- Payment Processing
- Dashboard APIs

---

## Live API

https://hackathon-hub-backend.onrender.com

---

## Features

### Authentication

- Google OAuth Login
- Passport.js
- Express Session

### Event Management

- Create Event
- Edit Event
- Delete Event
- Fetch Events

### Registration Management

- Create Registration Forms
- Register Participants
- View Responses

### Payments

- Razorpay Integration
- Payment Verification
- Ticket Generation

### Dashboard

- Event Analytics
- Registration Tracking

---

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Passport.js
- Google OAuth 2.0
- Razorpay
- Express Session
- Cloudinary

---

## Folder Structure

backend/

├── models/

├── routes/

├── controllers/

├── middleware/

├── uploads/

├── app.js

└── package.json

---

## Environment Variables

Create a `.env` file.

```env
PORT=8080

MONGO_URI=your_mongodb_connection_string

SESSION_SECRET=your_session_secret

FRONTEND_URL=https://hackathon-hub-frontend.vercel.app

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

GOOGLE_CALLBACK_URL=https://hackathon-hub-backend.onrender.com/auth/google/callback

RAZORPAY_KEY_ID=your_razorpay_key

RAZORPAY_KEY_SECRET=your_razorpay_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret
Installation

Clone Repository

git clone https://github.com/imran1831/Hackathon_Hub_Backend.git

Move into project

cd Hackathon_Hub_Backend

Install dependencies

npm install

Run server

npm start

Development mode

npm run dev
API Endpoints
Authentication
GET /auth/google
GET /auth/google/callback
GET /auth/current-user
GET /auth/logout
Events
GET /api/events
GET /api/event/:id

POST /api/create-event
PUT /api/events/:id
DELETE /api/events/:id
Payments
POST /api/payments
POST /api/verify-payment
Deployment

Backend deployed on:

Render

Database:

MongoDB Atlas
Security
Environment Variables
OAuth Authentication
Session Management
Protected Routes
