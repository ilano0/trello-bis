const express = require('express');
const router = express.Router();
const controller = require('../controllers/boardController');

router.get('/', controller.getBoards);
router.post('/', controller.createBoard);
router.get('/:id', controller.getBoard);
router.put('/:id', controller.updateBoard);
router.delete('/:id', controller.deleteBoard);

router.post('/:id/columns', controller.addColumn);
router.delete('/:id/columns/:key', controller.removeColumn);

router.get('/:id/tasks', controller.getBoardTasks);

module.exports = router;