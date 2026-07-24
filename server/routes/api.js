const express = require('express');
const router = express.Router();
const Target = require('../models/Target');
const Log = require('../models/Log');

// Get all targets
router.get('/targets', async (req, res) => {
  try {
    const targets = await Target.find({}).sort({ createdAt: -1 });
    res.json(targets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a target
router.post('/targets', async (req, res) => {
  try {
    const { name, url, interval } = req.body;
    const target = new Target({ name, url, interval });
    await target.save();
    res.status(201).json(target);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a target
router.delete('/targets/:id', async (req, res) => {
  try {
    await Target.findByIdAndDelete(req.params.id);
    await Log.deleteMany({ targetId: req.params.id });
    res.json({ message: 'Target deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get logs for a target
router.get('/targets/:id/logs', async (req, res) => {
  try {
    const logs = await Log.find({ targetId: req.params.id })
                          .sort({ createdAt: -1 })
                          .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
