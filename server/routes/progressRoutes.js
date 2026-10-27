const express = require('express');
const router = express.Router();
const {
  getOverallProgress,
  getSubjectProgress,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getOverallProgress);
router.get('/:subjectId', getSubjectProgress);

module.exports = router;
