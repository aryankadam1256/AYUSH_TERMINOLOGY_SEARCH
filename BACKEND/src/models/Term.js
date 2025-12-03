// src/models/Term.js

const mongoose = require('mongoose');

const TermSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: String,
  description: String,
  synonyms: String,
  source: { type: String, required: true, enum: ['NAMASTE', 'ICD-11'] },
  is_active: { type: Boolean, default: true },
  version: String
}, { timestamps: true });

TermSchema.index({ code: 1, source: 1 }, { unique: true });

module.exports = mongoose.model('Term', TermSchema);








