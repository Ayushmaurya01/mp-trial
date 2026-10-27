const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { getUnits, createUnit } = require('../controllers/unitController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSubjects)
  .post(createSubject);

router.route('/:id')
  .get(getSubjectById)
  .put(updateSubject)
  .delete(deleteSubject);

// Nested routes for subject units
router.route('/:subjectId/units')
  .get(getUnits)
  .post(createUnit);

module.exports = router;
