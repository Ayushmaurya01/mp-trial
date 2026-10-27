const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a subject name'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please add a subject code'],
      trim: true,
      uppercase: true,
    },
    faculty: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subject', SubjectSchema);
