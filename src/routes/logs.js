
import express from 'express';
import Joi from 'joi';
import Log from '../models/Log.js';
import Device from '../models/Device.js';
import auth from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

// Create log entry
router.post('/', auth, async (req, res) => {
  const schema = Joi.object({
    event: Joi.string().required(),
    value: Joi.number(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  try {
    // Check device ownership
    const device = await Device.findOne({ _id: req.params.id, owner_id: req.user.id });
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });
    const log = new Log({
      device_id: req.params.id,
      event: req.body.event,
      value: req.body.value,
      timestamp: new Date(),
    });
    await log.save();
    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Fetch last N logs
router.get('/', auth, async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    // Check device ownership
    const device = await Device.findOne({ _id: req.params.id, owner_id: req.user.id });
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });
    const logs = await Log.find({ device_id: req.params.id })
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Aggregated usage (e.g., total units in range)
router.get('/usage', auth, async (req, res) => {
  // Default: last 24h
  let range = req.query.range || '24h';
  let ms = 24 * 60 * 60 * 1000;
  if (range.endsWith('h')) ms = parseInt(range) * 60 * 60 * 1000;
  if (range.endsWith('d')) ms = parseInt(range) * 24 * 60 * 60 * 1000;
  const since = new Date(Date.now() - ms);
  try {
    // Check device ownership
    const device = await Device.findOne({ _id: req.params.id, owner_id: req.user.id });
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });
    const logs = await Log.aggregate([
      { $match: { device_id: device._id, event: 'units_consumed', timestamp: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);
    res.json({
      success: true,
      device_id: device._id,
      total_units_last_24h: logs[0] ? logs[0].total : 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
