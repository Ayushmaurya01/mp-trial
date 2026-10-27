const express = require('express');
const router = express.Router();
const { updateUnit, deleteUnit } = require('../controllers/unitController');
const { getTopics, createTopic } = require('../controllers/topicController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/:id')
  .put(updateUnit)
  .delete(deleteUnit);

// Nested routes for unit topics
router.route('/:unitId/topics')
  .get(getTopics)
  .post(createTopic);

module.exports = router;
