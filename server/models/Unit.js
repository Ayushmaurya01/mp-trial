const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema(
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
    unitNumber: {
      type: Number,
      required: [true, 'Please specify unit number'],
    },
    title: {
      type: String,
      required: [true, 'Please add unit title'],
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Unit', UnitSchema);
