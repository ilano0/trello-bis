const Board = require('../models/board');
const Task = require('../models/task');

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find().sort({ createdAt: 1 }).exec();
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).exec();
    if (!board) return res.status(404).json({ error: 'Board not found' });
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const board = new Board(req.body);
    await board.save();
    res.status(201).json(board);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const updated = await Board.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
    if (!updated) return res.status(404).json({ error: 'Board not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBoardTasks = async (req, res) => {
  try {
    const boardId = req.params.id;
    const tasks = await Task.find({ board: boardId }).sort({ order: 1, createdAt: 1 }).exec();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addColumn = async (req, res) => {
  try {
    const boardId = req.params.id;
    const { key, name, order } = req.body;
    if (!key || !name) return res.status(400).json({ error: 'key and name required' });

    const board = await Board.findById(boardId).exec();
    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (board.columns.some(c => c.key === key)) return res.status(409).json({ error: 'Column key already exists' });

    board.columns.push({ key, name, order: typeof order === 'number' ? order : board.columns.length });
    await board.save();
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeColumn = async (req, res) => {
  try {
    const boardId = req.params.id;
    const colKey = req.params.key;
    const board = await Board.findById(boardId).exec();
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const colExists = board.columns.some(c => c.key === colKey);
    if (!colExists) return res.status(404).json({ error: 'Column not found' });

    const remaining = board.columns.filter(c => c.key !== colKey).map(c => c.key);
    const fallbackStatus = remaining[0] || 'todo';

    await Task.updateMany({ board: board._id, status: colKey }, { $set: { status: fallbackStatus } }).exec();

    board.columns = board.columns.filter(c => c.key !== colKey);
    await board.save();

    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const boardId = req.params.id;
    const board = await Board.findById(boardId).exec();
    if (!board) return res.status(404).json({ error: 'Board not found' });
    await Task.deleteMany({ board: board._id }).exec();
    await Board.findByIdAndDelete(board._id).exec();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};