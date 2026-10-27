const express = require('express');
const router = express.Router();
const {
  getAttendance,
  updateAttendance,
  logQuickAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAttendance);
router.post('/log', logQuickAttendance);
router.put('/:id', updateAttendance);

module.exports = router;
