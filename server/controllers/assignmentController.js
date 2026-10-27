const Assignment = require('../models/Assignment');
const Subject = require('../models/Subject');

// @desc    Get assignments for student
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res, next) => {
  try {
    const { subjectId, status } = req.query;
    const query = { student: req.user._id };

    if (subjectId) query.subject = subjectId;
    if (status) query.status = status;

    const assignments = await Assignment.find(query)
      .populate('subject', 'name code faculty')
      .sort({ dueDate: 1 });

    const total = assignments.length;
    const completed = assignments.filter((a) => a.status === 'Completed').length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;

    res.json({
      success: true,
      stats: {
        total,
        completed,
        pending,
        percentage,
      },
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private
const createAssignment = async (req, res, next) => {
  try {
    const { subjectId, title, description, dueDate, status } = req.body;

    if (!subjectId || !title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subjectId, title and dueDate',
      });
    }

    const subject = await Subject.findOne({ _id: subjectId, student: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const assignment = await Assignment.create({
      subject: subjectId,
      student: req.user._id,
      title,
      description: description || '',
      dueDate,
      status: status || 'Pending',
    });

    await assignment.populate('subject', 'name code');

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private
const updateAssignment = async (req, res, next) => {
  try {
    let assignment = await Assignment.findOne({ _id: req.params.id, student: req.user._id });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const { title, description, dueDate, status } = req.body;

    if (title !== undefined) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = dueDate;
    if (status !== undefined) assignment.status = status;

    const updated = await assignment.save();
    await updated.populate('subject', 'name code');

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private
const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, student: req.user._id });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    await assignment.deleteOne();

    res.json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
