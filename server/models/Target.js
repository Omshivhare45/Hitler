const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  interval: {
    type: Number,
    default: 8, // Default 8 minutes
  },
  status: {
    type: String,
    enum: ['Awake', 'Sleeping', 'Down', 'Unknown'],
    default: 'Unknown',
  },
  lastPing: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Target', targetSchema);
