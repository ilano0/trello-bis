const mongoose = require('mongoose');
const { Schema } = mongoose;

const ColumnSchema = new Schema({
  key: { type: String, required: true },
  name: { type: String, required: true },
  order: { type: Number, default: 0 }
});

const BoardSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  columns: [ColumnSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Board', BoardSchema);