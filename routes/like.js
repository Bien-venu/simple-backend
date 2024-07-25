// Inside your routes file

const express = require("express");
const router = express.Router();
const { task } = require("../models/task");

// POST route to handle task likes
// Assuming you already have your express app and task model configured

// This route will toggle the like status for a specific user on a task
router.post("/task/:taskId/like", async (req, res) => {
  const { taskId } = req.params; // Extract the task ID from the URL params
  const { userId } = req.body; // Assuming you have the user ID available in the request body

  try {
    // Find the task by ID
    const task = await task.findById(taskId);
    console.log(task);

    if (!task) {
      return res.status(404).json({ error: "task not found" });
    }

    // Check if the user has already liked the task
    const alreadyLikedIndex = task.likes.indexOf(userId);

    if (alreadyLikedIndex === -1) {
      // User hasn't liked the task, so add the user ID to the likes array
      task.likes.push(userId);
    } else {
      // User has already liked the task, so remove the user ID from the likes array
      task.likes.splice(alreadyLikedIndex, 1);
    }

    // Save the updated task with the modified likes array
    const updatedtask = await task.save();

    res.status(200).json({
      message: "Like status updated successfully",
      task: updatedtask,
      pId: taskId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update like status" });
    console.error(error);
  }
});

module.exports = router;
