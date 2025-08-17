
import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  last_active_at: { type: Date, default: null },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Device = mongoose.model('Device', deviceSchema);
export default Device;
