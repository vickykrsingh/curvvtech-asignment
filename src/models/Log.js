
import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  device_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  event: { type: String, required: true },
  value: { type: Number, required: false },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

const Log = mongoose.model('Log', logSchema);
export default Log;
