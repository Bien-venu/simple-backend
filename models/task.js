const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  icon: { type: String, required: true },
  creator: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, required: true },
});

const taskSchema = new mongoose.Schema(
  {
    task_id: {
      type: String,
    },
    name: {
      type: String,
    },
    team: {
      type: String,
    },
    task: {
      type: String,
    },
    status: {
      type: String,
    },
    priority: {
      type: String,
    },
    labels: {
      type: String,
    },
    message: {
      type: String,
    },
    assigner: {
      type: String,
    },
    worker: {
      type: String,
    },
    date: {
      type: String,
    },
    activities: [activitySchema],
  },
  { timestamps: true }
);

const task = mongoose.model("task", taskSchema);

module.exports = {
  task,
  taskSchema,
};
