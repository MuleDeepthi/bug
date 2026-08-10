const Bug = require("../models/Bug");
const Activity = require("../models/Activity");

// =====================================================
// CREATE BUG
// =====================================================
const createBug = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      severity,
      project,
      assignedTo,
      dueDate,
    } = req.body;

    if (!title || !description || !project) {
      return res.status(400).json({
        message: "Title, description and project are required",
      });
    }

    const bug = await Bug.create({
      title,
      description,
      priority,
      severity,
      project,
      reportedBy: req.user.id,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
    });

    // Create activity
    await Activity.create({
      bug: bug._id,
      user: req.user.id,
      action: "Bug Created",
      details: `Bug "${bug.title}" was created.`,
    });

    // Populate users before sending response
    const populatedBug = await Bug.findById(bug._id)
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role");

    res.status(201).json({
      message: "Bug created successfully",
      bug: populatedBug,
    });
  } catch (error) {
    console.error("Create bug error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// GET ALL BUGS
// =====================================================
const getBugs = async (req, res) => {
  try {
    const bugs = await Bug.find()
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: bugs.length,
      bugs,
    });
  } catch (error) {
    console.error("Get bugs error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// GET SINGLE BUG BY ID
// =====================================================
const getBugById = async (req, res) => {
  try {
    const { id } = req.params;

    const bug = await Bug.findById(id)
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    res.status(200).json({
      bug,
    });
  } catch (error) {
    console.error("Get bug by ID error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// UPDATE BUG
// =====================================================
const updateBug = async (req, res) => {
  try {
    const { id } = req.params;

    const bug = await Bug.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    // Create activity
    await Activity.create({
      bug: bug._id,
      user: req.user.id,
      action: "Bug Updated",
      details: `Bug "${bug.title}" was updated.`,
    });

    res.status(200).json({
      message: "Bug updated successfully",
      bug,
    });
  } catch (error) {
    console.error("Update bug error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// DELETE BUG
// =====================================================
const deleteBug = async (req, res) => {
  try {
    const { id } = req.params;

    const bug = await Bug.findById(id);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    // Create activity before deleting
    await Activity.create({
      bug: bug._id,
      user: req.user.id,
      action: "Bug Deleted",
      details: `Bug "${bug.title}" was deleted.`,
    });

    await Bug.findByIdAndDelete(id);

    res.status(200).json({
      message: "Bug deleted successfully",
    });
  } catch (error) {
    console.error("Delete bug error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// ASSIGN BUG
// =====================================================
const assignBug = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        message: "assignedTo is required",
      });
    }

    const bug = await Bug.findByIdAndUpdate(
      id,
      { assignedTo },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    // Create activity
    await Activity.create({
      bug: bug._id,
      user: req.user.id,
      action: "Bug Assigned",
      details: bug.assignedTo
        ? `Bug "${bug.title}" was assigned to ${bug.assignedTo.name}.`
        : `Bug "${bug.title}" was assigned.`,
    });

    res.status(200).json({
      message: "Bug assigned successfully",
      bug,
    });
  } catch (error) {
    console.error("Assign bug error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// GET ASSIGNED BUGS
// =====================================================
const getAssignedBugs = async (req, res) => {
  try {
    const bugs = await Bug.find({
      assignedTo: req.user.id,
    })
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: bugs.length,
      bugs,
    });
  } catch (error) {
    console.error("Get assigned bugs error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// UPDATE BUG STATUS
// =====================================================
const updateBugStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Open",
      "In Progress",
      "Resolved",
      "Closed",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const bug = await Bug.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    // Create activity
    await Activity.create({
      bug: bug._id,
      user: req.user.id,
      action: "Status Updated",
      details: `Bug status changed to "${status}".`,
    });

    res.status(200).json({
      message: "Bug status updated successfully",
      bug,
    });
  } catch (error) {
    console.error("Update bug status error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================
module.exports = {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  deleteBug,
  assignBug,
  getAssignedBugs,
  updateBugStatus,
};