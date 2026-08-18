const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // allow anonymous / guest usage
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ['text', 'voice'],
      default: 'text',
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    sources: [
      {
        title: String,
        crop: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
