const Lecture = require('../models/Lecture');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');

// @desc    Get lectures for student (optional subject filter)
// @route   GET /api/lectures
// @access  Private
const getLectures = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    const query = { student: req.user._id };

    if (subjectId) {
      query.subject = subjectId;
    }

    const lectures = await Lecture.find(query)
      .populate('subject', 'name code faculty')
      .sort({ lectureDate: -1 });

    res.json({
      success: true,
      count: lectures.length,
      data: lectures,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a new lecture
// @route   POST /api/lectures
// @access  Private
const createLecture = async (req, res, next) => {
  try {
    const { subjectId, topicCovered, lectureDate, status, notes, updateAttendance } = req.body;

    if (!subjectId || !topicCovered) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subjectId and topicCovered',
      });
    }

    const subject = await Subject.findOne({ _id: subjectId, student: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const lecture = await Lecture.create({
      subject: subjectId,
      student: req.user._id,
      topicCovered,
      lectureDate: lectureDate || Date.now(),
      status: status || 'Completed',
      notes: notes || '',
    });

    // Optionally update attendance automatically
    if (updateAttendance) {
      let attendance = await Attendance.findOne({ subject: subjectId, student: req.user._id });
      if (!attendance) {
        attendance = new Attendance({
          subject: subjectId,
          student: req.user._id,
          totalLectures: 0,
          presentLectures: 0,
          absentLectures: 0,
        });
      }

      if (status === 'Completed' || status === 'Present') {
        attendance.presentLectures += 1;
      } else {
        attendance.absentLectures += 1;
      }
      attendance.totalLectures = attendance.presentLectures + attendance.absentLectures;
      await attendance.save();
    }

    await lecture.populate('subject', 'name code');

    res.status(201).json({
      success: true,
      data: lecture,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lecture
// @route   PUT /api/lectures/:id
// @access  Private
const updateLecture = async (req, res, next) => {
  try {
    let lecture = await Lecture.findOne({ _id: req.params.id, student: req.user._id });

    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    const { topicCovered, lectureDate, status, notes } = req.body;

    if (topicCovered !== undefined) lecture.topicCovered = topicCovered;
    if (lectureDate !== undefined) lecture.lectureDate = lectureDate;
    if (status !== undefined) lecture.status = status;
    if (notes !== undefined) lecture.notes = notes;

    const updated = await lecture.save();
    await updated.populate('subject', 'name code');

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lecture
// @route   DELETE /api/lectures/:id
// @access  Private
const deleteLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findOne({ _id: req.params.id, student: req.user._id });

    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    await lecture.deleteOne();

    res.json({
      success: true,
      message: 'Lecture record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLectures,
  createLecture,
  updateLecture,
  deleteLecture,
};
