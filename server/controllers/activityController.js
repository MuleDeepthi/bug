const Activity = require("../models/Activity");

// Get activity history for a bug
const getBugActivities = async (req, res) => {
  try {
    const { bugId } = req.params;

    const activities = await Activity.find({
      bug: bugId,
    })
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Get bug activities error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Add an activity to a bug
const addActivity = async (req, res) => {
  try {
    const { bugId } = req.params;
    const { action, details } = req.body;

    if (!action) {
      return res.status(400).json({
        message: "Action is required",
      });
    }

    const activity = await Activity.create({
      bug: bugId,
      user: req.user.id,
      action,
      details,
    });

    const populatedActivity = await Activity.findById(activity._id)
      .populate("user", "name email role");

    res.status(201).json({
      message: "Activity added successfully",
      activity: populatedActivity,
    });
  } catch (error) {
    console.error("Add activity error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getBugActivities,
  addActivity,
};