const express = require('express');
const router = express.Router();
const { updateTopic, deleteTopic } = require('../controllers/topicController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/:id')
  .put(updateTopic)
  .delete(deleteTopic);

module.exports = router;
