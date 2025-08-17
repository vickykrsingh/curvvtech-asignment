const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  device_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  event: { type: String, required: true },
  value: { type: Number, required: false },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model('Log', logSchema);
