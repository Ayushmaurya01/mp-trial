const express = require('express');
const router = express.Router();
const {
  getLectures,
  createLecture,
  updateLecture,
  deleteLecture,
} = require('../controllers/lectureController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getLectures)
  .post(createLecture);

router.route('/:id')
  .put(updateLecture)
  .delete(deleteLecture);

module.exports = router;
