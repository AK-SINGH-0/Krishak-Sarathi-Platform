const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    fullName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    primaryCrop: { type: String, required: true },
    biggestChallenge: { type: String, required: true },
    advisorUsefulness: {
      type: String,
      enum: ['very', 'somewhat', 'not_very', 'havent_used'],
      required: true,
    },
    suggestions: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Survey', surveySchema);
