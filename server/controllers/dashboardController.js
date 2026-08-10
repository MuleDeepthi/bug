const Bug = require("../models/Bug");

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalBugs = await Bug.countDocuments();

    const openBugs = await Bug.countDocuments({
      status: "Open",
    });

    const inProgressBugs = await Bug.countDocuments({
      status: "In Progress",
    });

    const resolvedBugs = await Bug.countDocuments({
      status: "Resolved",
    });

    const closedBugs = await Bug.countDocuments({
      status: "Closed",
    });

    const criticalBugs = await Bug.countDocuments({
      priority: "Critical",
    });

    const highPriorityBugs = await Bug.countDocuments({
      priority: "High",
    });

    res.status(200).json({
      totalBugs,
      openBugs,
      inProgressBugs,
      resolvedBugs,
      closedBugs,
      criticalBugs,
      highPriorityBugs,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getDashboardStats,
};