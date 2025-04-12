const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: String,
  email: { type: String, required: true, unique: true },
  username: String
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
