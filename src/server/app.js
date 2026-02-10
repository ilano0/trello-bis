const express = require('express');
const cors = require('cors');

const tasksRouter = require('./routes/tasks');
const boardsRouter = require('./routes/boards');

const app = express();

app.use(cors());
app.use(express.json());


app.get('/api/ping', (req, res) => res.json({ ok: true }));
app.use('/api/tasks', tasksRouter);
app.use('/api/boards', boardsRouter);

module.exports = app;