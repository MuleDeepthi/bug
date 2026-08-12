const Bug = require("../models/Bug");
const User = require("../models/user");

// =====================================================
// SUGGEST DEVELOPER
// Suggests the developer with the lowest active workload
// =====================================================

const suggestDeveloper = async (req, res) => {
  try {
    const developers = await User.find(
      { role: "developer" },
      "name email role"
    );

    if (developers.length === 0) {
      return res.status(404).json({
        message: "No developers available",
      });
    }

    const suggestions = [];

    for (const developer of developers) {
      const activeBugCount = await Bug.countDocuments({
        assignedTo: developer._id,
        status: {
          $in: ["Open", "In Progress"],
        },
      });

      suggestions.push({
        developer,
        activeBugCount,
      });
    }

    // Sort by lowest workload
    suggestions.sort(
      (a, b) => a.activeBugCount - b.activeBugCount
    );

    const recommended = suggestions[0];

    res.status(200).json({
      message: "Developer suggested successfully",
      recommendation: recommended,
      allDevelopers: suggestions,
    });
  } catch (error) {
    console.error("Suggest developer error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  suggestDeveloper,
};