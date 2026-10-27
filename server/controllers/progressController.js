const {
  calculateStudentOverallProgress,
  calculateSubjectProgress,
} = require('../services/progressService');

// @desc    Get overall student academic progress metrics
// @route   GET /api/progress
// @access  Private
const getOverallProgress = async (req, res, next) => {
  try {
    const progressData = await calculateStudentOverallProgress(req.user._id);
    res.json({
      success: true,
      data: progressData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subject specific progress metrics
// @route   GET /api/progress/:subjectId
// @access  Private
const getSubjectProgress = async (req, res, next) => {
  try {
    const progressData = await calculateSubjectProgress(
      req.user._id,
      req.params.subjectId
    );

    if (!progressData) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.json({
      success: true,
      data: progressData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverallProgress,
  getSubjectProgress,
};
