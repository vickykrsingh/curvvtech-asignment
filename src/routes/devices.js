const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Device = require('../models/Device');
const auth = require('../middlewares/auth');

// Register new device
router.post('/', auth, async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    status: Joi.string().valid('active', 'inactive').default('active'),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  try {
    const { name, type, status } = req.body;
    const device = new Device({
      name,
      type,
      status,
      owner_id: req.user.id,
    });
    await device.save();
    res.status(201).json({ success: true, device });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// List devices (filter by type, status)
router.get('/', auth, async (req, res) => {
  const { type, status } = req.query;
  const filter = { owner_id: req.user.id };
  if (type) filter.type = type;
  if (status) filter.status = status;
  try {
    const devices = await Device.find(filter);
    res.json({ success: true, devices });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update device details
router.patch('/:id', auth, async (req, res) => {
  const schema = Joi.object({
    name: Joi.string(),
    type: Joi.string(),
    status: Joi.string().valid('active', 'inactive'),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  try {
    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, owner_id: req.user.id },
      req.body,
      { new: true }
    );
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });
    res.json({ success: true, device });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete device
router.delete('/:id', auth, async (req, res) => {
  try {
    const device = await Device.findOneAndDelete({ _id: req.params.id, owner_id: req.user.id });
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });
    res.json({ success: true, message: 'Device removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Heartbeat
router.post('/:id/heartbeat', auth, async (req, res) => {
  const schema = Joi.object({
    status: Joi.string().valid('active', 'inactive'),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  try {
    const update = { last_active_at: new Date() };
    if (req.body.status) update.status = req.body.status;
    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, owner_id: req.user.id },
      update,
      { new: true }
    );
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });
    res.json({
      success: true,
      message: 'Device heartbeat recorded',
      last_active_at: device.last_active_at,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
