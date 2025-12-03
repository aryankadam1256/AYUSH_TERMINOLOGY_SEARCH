// src/models/ConceptMap.js

const mongoose = require('mongoose');

const ConceptMapSchema = new mongoose.Schema({
  source_code: { type: String, required: true },
  source_system: { type: String, required: true },
  target_code: { type: String, required: true },
  target_system: { type: String, required: true },
  relationship: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ConceptMap', ConceptMapSchema);








