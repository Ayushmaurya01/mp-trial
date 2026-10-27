const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema(
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
    lectureDate: {
      type: Date,
      default: Date.now,
    },
    topicCovered: {
      type: String,
      required: [true, 'Please specify the topic covered in lecture'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending'],
      default: 'Completed',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lecture', LectureSchema);
