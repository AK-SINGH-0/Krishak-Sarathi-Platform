const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true }, // Financial, Insurance, Farming Assistance, Infrastructure
    description: { type: String, required: true },
    deadline: { type: String, default: 'Ongoing' },
    link: { type: String, required: true }, // real official government link
    eligibility: { type: String, default: '' },
    benefits: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scheme', schemeSchema);
