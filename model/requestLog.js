// models/RequestLog.js
const mongoose = require("mongoose");

const requestLogSchema = new mongoose.Schema({
  ip: String,
  timestamps: [Date],
});

module.exports = mongoose.model("RequestLog", requestLogSchema);
