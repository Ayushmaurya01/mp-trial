const Topic = require('../models/Topic');
const Unit = require('../models/Unit');

// Helper to update unit completion status based on topic completion
const syncUnitCompletion = async (unitId, studentId) => {
  const topics = await Topic.find({ unit: unitId, student: studentId });
  if (topics.length > 0) {
    const allCompleted = topics.every((t) => t.isCompleted);
    await Unit.findByIdAndUpdate(unitId, { isCompleted: allCompleted });
  }
};

// @desc    Get topics for a unit
// @route   GET /api/units/:unitId/topics
// @access  Private
const getTopics = async (req, res, next) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findOne({ _id: unitId, student: req.user._id });
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    const topics = await Topic.find({ unit: unitId, student: req.user._id }).sort({ createdAt: 1 });

    res.json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create topic inside a unit
// @route   POST /api/units/:unitId/topics
// @access  Private
const createTopic = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const { title, isCompleted } = req.body;

    const unit = await Unit.findOne({ _id: unitId, student: req.user._id });
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide topic title' });
    }

    const topic = await Topic.create({
      unit: unitId,
      subject: unit.subject,
      student: req.user._id,
      title,
      isCompleted: isCompleted || false,
    });

    await syncUnitCompletion(unitId, req.user._id);

    res.status(201).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Private
const updateTopic = async (req, res, next) => {
  try {
    let topic = await Topic.findOne({ _id: req.params.id, student: req.user._id });

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const { title, isCompleted } = req.body;

    if (title !== undefined) topic.title = title;
    if (isCompleted !== undefined) topic.isCompleted = isCompleted;

    const updatedTopic = await topic.save();

    await syncUnitCompletion(topic.unit, req.user._id);

    res.json({
      success: true,
      data: updatedTopic,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Private
const deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, student: req.user._id });

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const unitId = topic.unit;
    await topic.deleteOne();

    await syncUnitCompletion(unitId, req.user._id);

    res.json({
      success: true,
      message: 'Topic deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,
};
