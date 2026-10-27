const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Topic = require('../models/Topic');
const Attendance = require('../models/Attendance');
const Lecture = require('../models/Lecture');
const Assignment = require('../models/Assignment');
const { calculateSubjectProgress } = require('../services/progressService');

// @desc    Get all subjects for logged in student
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ student: req.user._id }).sort({ createdAt: -1 });
    
    // Attach calculated progress for each subject
    const subjectsWithProgress = await Promise.all(
      subjects.map(async (subject) => {
        const progress = await calculateSubjectProgress(req.user._id, subject._id);
        return {
          ...subject.toObject(),
          progress: progress || {},
        };
      })
    );

    res.json({
      success: true,
      count: subjectsWithProgress.length,
      data: subjectsWithProgress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject details by ID
// @route   GET /api/subjects/:id
// @access  Private
const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      student: req.user._id,
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const units = await Unit.find({ subject: subject._id, student: req.user._id }).sort({ unitNumber: 1 });
    
    // Fetch topics grouped by unit
    const unitsWithTopics = await Promise.all(
      units.map(async (unit) => {
        const topics = await Topic.find({ unit: unit._id, student: req.user._id }).sort({ createdAt: 1 });
        return {
          ...unit.toObject(),
          topics,
        };
      })
    );

    const attendance = await Attendance.findOne({
      subject: subject._id,
      student: req.user._id,
    });

    const assignments = await Assignment.find({
      subject: subject._id,
      student: req.user._id,
    }).sort({ dueDate: 1 });

    const lectures = await Lecture.find({
      subject: subject._id,
      student: req.user._id,
    }).sort({ lectureDate: -1 });

    const progress = await calculateSubjectProgress(req.user._id, subject._id);

    res.json({
      success: true,
      data: {
        subject,
        units: unitsWithTopics,
        attendance: attendance || { totalLectures: 0, presentLectures: 0, absentLectures: 0 },
        assignments,
        lectures,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res, next) => {
  try {
    const { name, code, faculty, semester, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject name and code',
      });
    }

    const subject = await Subject.create({
      student: req.user._id,
      name,
      code,
      faculty: faculty || '',
      semester: semester || req.user.semester || '',
      description: description || '',
    });

    // Auto-initialize Attendance record for this subject
    await Attendance.create({
      subject: subject._id,
      student: req.user._id,
      totalLectures: 0,
      presentLectures: 0,
      absentLectures: 0,
      minRequiredPercentage: 75,
    });

    res.status(201).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res, next) => {
  try {
    let subject = await Subject.findOne({
      _id: req.params.id,
      student: req.user._id,
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const { name, code, faculty, semester, description } = req.body;

    subject.name = name || subject.name;
    subject.code = code || subject.code;
    subject.faculty = faculty !== undefined ? faculty : subject.faculty;
    subject.semester = semester !== undefined ? semester : subject.semester;
    subject.description = description !== undefined ? description : subject.description;

    const updatedSubject = await subject.save();

    res.json({
      success: true,
      data: updatedSubject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject and all related records
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      student: req.user._id,
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Cascade delete related entities
    await Unit.deleteMany({ subject: subject._id, student: req.user._id });
    await Topic.deleteMany({ subject: subject._id, student: req.user._id });
    await Attendance.deleteMany({ subject: subject._id, student: req.user._id });
    await Lecture.deleteMany({ subject: subject._id, student: req.user._id });
    await Assignment.deleteMany({ subject: subject._id, student: req.user._id });

    await subject.deleteOne();

    res.json({
      success: true,
      message: 'Subject and all associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
