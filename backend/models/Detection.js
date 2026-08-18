const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    crop: { type: String, required: true, trim: true },
    disease: { type: String, required: true, trim: true },
    confidence: { type: String, default: '' },
    severity: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Detection', detectionSchema);
