const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Target',
    required: true,
  },
  status: {
    type: String,
    enum: ['Success', 'Failed'],
    required: true,
  },
  statusCode: {
    type: Number,
    default: null,
  },
  latency: {
    type: Number, // Latency in ms
    default: 0,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Log', logSchema);
