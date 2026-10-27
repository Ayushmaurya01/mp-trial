const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

// @desc    Get attendance records for student
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res, next) => {
  try {
    const attendanceRecords = await Attendance.find({ student: req.user._id })
      .populate('subject', 'name code faculty semester')
      .sort({ createdAt: -1 });

    // Format with percentage and status warning
    const formatted = attendanceRecords.map((rec) => {
      const total = rec.totalLectures || 0;
      const present = rec.presentLectures || 0;
      const absent = rec.absentLectures || 0;
      const percentage = total > 0 ? Math.round((present / total) * 1000) / 10 : 0;
      const minRequired = rec.minRequiredPercentage || 75;

      return {
        _id: rec._id,
        subject: rec.subject,
        totalLectures: total,
        presentLectures: present,
        absentLectures: absent,
        percentage,
        minRequiredPercentage: minRequired,
        isLowAttendance: total > 0 && percentage < minRequired,
        updatedAt: rec.updatedAt,
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance entry by ID or subjectId
// @route   PUT /api/attendance/:id
// @access  Private
const updateAttendance = async (req, res, next) => {
  try {
    let attendance = await Attendance.findOne({
      _id: req.params.id,
      student: req.user._id,
    });

    if (!attendance) {
      // Check if parameter is subjectId
      attendance = await Attendance.findOne({
        subject: req.params.id,
        student: req.user._id,
      });
    }

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    const { presentLectures, absentLectures, totalLectures, minRequiredPercentage } = req.body;

    if (presentLectures !== undefined) attendance.presentLectures = Number(presentLectures);
    if (absentLectures !== undefined) attendance.absentLectures = Number(absentLectures);

    if (totalLectures !== undefined) {
      attendance.totalLectures = Number(totalLectures);
    } else if (presentLectures !== undefined || absentLectures !== undefined) {
      attendance.totalLectures = attendance.presentLectures + attendance.absentLectures;
    }

    if (minRequiredPercentage !== undefined) {
      attendance.minRequiredPercentage = Number(minRequiredPercentage);
    }

    const updated = await attendance.save();
    await updated.populate('subject', 'name code faculty semester');

    const total = updated.totalLectures;
    const present = updated.presentLectures;
    const percentage = total > 0 ? Math.round((present / total) * 1000) / 10 : 0;

    res.json({
      success: true,
      data: {
        ...updated.toObject(),
        percentage,
        isLowAttendance: total > 0 && percentage < updated.minRequiredPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick increment present or absent for a subject
// @route   POST /api/attendance/log
// @access  Private
const logQuickAttendance = async (req, res, next) => {
  try {
    const { subjectId, status } = req.body; // status: 'Present' | 'Absent'

    if (!subjectId || !['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid subjectId and status ('Present' or 'Absent')",
      });
    }

    let attendance = await Attendance.findOne({
      subject: subjectId,
      student: req.user._id,
    });

    if (!attendance) {
      const subject = await Subject.findOne({ _id: subjectId, student: req.user._id });
      if (!subject) {
        return res.status(404).json({ success: false, message: 'Subject not found' });
      }
      attendance = new Attendance({
        subject: subjectId,
        student: req.user._id,
        totalLectures: 0,
        presentLectures: 0,
        absentLectures: 0,
      });
    }

    if (status === 'Present') {
      attendance.presentLectures += 1;
    } else {
      attendance.absentLectures += 1;
    }
    attendance.totalLectures = attendance.presentLectures + attendance.absentLectures;

    const saved = await attendance.save();
    await saved.populate('subject', 'name code');

    const total = saved.totalLectures;
    const present = saved.presentLectures;
    const percentage = total > 0 ? Math.round((present / total) * 1000) / 10 : 0;

    res.json({
      success: true,
      data: {
        ...saved.toObject(),
        percentage,
        isLowAttendance: total > 0 && percentage < saved.minRequiredPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  updateAttendance,
  logQuickAttendance,
};
