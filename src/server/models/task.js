const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
  author: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  assignee: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  board: { type: Schema.Types.ObjectId, ref: 'Board', default: null },
  status: { type: String, default: 'todo' },
  tags: [{ type: String }],
  dueDate: { type: Date },
  comments: [CommentSchema],
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);