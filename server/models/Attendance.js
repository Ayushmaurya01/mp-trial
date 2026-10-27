const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    totalLectures: {
      type: Number,
      default: 0,
      min: 0,
    },
    presentLectures: {
      type: Number,
      default: 0,
      min: 0,
    },
    absentLectures: {
      type: Number,
      default: 0,
      min: 0,
    },
    minRequiredPercentage: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one attendance record per subject per student
AttendanceSchema.index({ student: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
