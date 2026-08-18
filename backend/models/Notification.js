const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = broadcast to all
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['weather', 'scheme', 'market', 'system', 'ai'],
      default: 'system',
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
