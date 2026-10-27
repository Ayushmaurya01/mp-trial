const Unit = require('../models/Unit');
const Topic = require('../models/Topic');
const Subject = require('../models/Subject');

// @desc    Get all units for a subject
// @route   GET /api/subjects/:subjectId/units
// @access  Private
const getUnits = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findOne({ _id: subjectId, student: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const units = await Unit.find({ subject: subjectId, student: req.user._id }).sort({ unitNumber: 1 });

    const unitsWithTopics = await Promise.all(
      units.map(async (u) => {
        const topics = await Topic.find({ unit: u._id, student: req.user._id }).sort({ createdAt: 1 });
        return {
          ...u.toObject(),
          topics,
        };
      })
    );

    res.json({
      success: true,
      count: unitsWithTopics.length,
      data: unitsWithTopics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create unit for a subject
// @route   POST /api/subjects/:subjectId/units
// @access  Private
const createUnit = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { unitNumber, title, isCompleted } = req.body;

    const subject = await Subject.findOne({ _id: subjectId, student: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide unit title' });
    }

    // Auto-calculate unit number if not passed
    let assignedUnitNumber = unitNumber;
    if (!assignedUnitNumber) {
      const existingUnitsCount = await Unit.countDocuments({ subject: subjectId, student: req.user._id });
      assignedUnitNumber = existingUnitsCount + 1;
    }

    const unit = await Unit.create({
      subject: subjectId,
      student: req.user._id,
      unitNumber: assignedUnitNumber,
      title,
      isCompleted: isCompleted || false,
    });

    res.status(201).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update unit
// @route   PUT /api/units/:id
// @access  Private
const updateUnit = async (req, res, next) => {
  try {
    let unit = await Unit.findOne({ _id: req.params.id, student: req.user._id });

    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    const { unitNumber, title, isCompleted } = req.body;

    if (unitNumber !== undefined) unit.unitNumber = unitNumber;
    if (title !== undefined) unit.title = title;
    if (isCompleted !== undefined) {
      unit.isCompleted = isCompleted;

      // If unit marked completed/uncompleted manually, update all topics under it if requested or sync status
      if (isCompleted) {
        await Topic.updateMany({ unit: unit._id, student: req.user._id }, { isCompleted: true });
      }
    }

    const updatedUnit = await unit.save();

    res.json({
      success: true,
      data: updatedUnit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete unit
// @route   DELETE /api/units/:id
// @access  Private
const deleteUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findOne({ _id: req.params.id, student: req.user._id });

    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    // Delete topics inside this unit
    await Topic.deleteMany({ unit: unit._id, student: req.user._id });
    await unit.deleteOne();

    res.json({
      success: true,
      message: 'Unit and associated topics deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
};
