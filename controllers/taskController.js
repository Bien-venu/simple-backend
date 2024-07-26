const { task } = require("../models/task");
const User = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const nodemailer = require("nodemailer");

function sendCheckInMail(data) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let mailOptions = {
    from: process.env.NODE_MAILER_USER,
    to: data.email,
    subject: `${data.name} You have unread notification on Simple.`,
    html: `Dear ${data.name},<br><br>
           <strong>Congratulations, you've assigned the issue!</strong><br><br>
           Click the button to check you task!<br><br>
           <button>Open Your Inbox</button><br>`,
  };

  transporter.sendMail(mailOptions, function (err, success) {
    if (err) {
      console.log(err);
    } else {
      console.log("Checked In Email sent successfully");
    }
  });
}

const posttask = async (req, res) => {
  const Name = req.body.name;
  const Team = req.body.team;
  const Task = req.body.task;
  const Status = req.body.status;
  const Priority = req.body.priority;
  const Labels = req.body.labels;
  const Message = req.body.message;
  const Assigner = req.body.assigner;
  const Worker = req.body.worker;
  const Date = req.body.date;
  const Activities = req.body.activities;

  const secret = JWT_SECRET;
  const payload = {
    email: Name,
  };

  const token = await jwt.sign(payload, secret);

  const new_task = new task({
    task_id: token,
    name: Name,
    team: Team,
    task: Task,
    status: Status,
    priority: Priority,
    labels: Labels,
    message: Message,
    assigner: Assigner,
    worker: Worker,
    date: Date,
    activities: Activities,
  });

  try {
    new_task.save((error, success) => {
      if (error) console.log(error);
      else console.log("Saved::New task::created.");
    });
  } catch (err) {
    console.log(err);
  }

  res.status(200).send({ msg: "task created", task_id: token });
};

const alltasks = async (req, res) => {
  task
    .find({})
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(400).send({ msg: "Error fetching data", error: err });
    });
};

const particulartask = async (req, res) => {
  const taskId = req.body.task_id;
  task
    .find({ _id: taskId })
    .then((data) => {
      res.status(200).send(data[0]);
      console.log(data);
    })
    .catch((err) => {
      res.status(400).send({ msg: "Error fetching task", error: err });
    });
};

const deletetask = async (req, res) => {
  const taskId = req.body.task_id;
  console.log(taskId);

  try {
    const result = await task.deleteOne({ _id: taskId });
    if (result.deletedCount === 1) {
      console.log("task deleted successfully.");
      res.status(200).send({ msg: "success" });
    } else {
      console.log("task not found or not deleted.");
      res.status(404).send({ msg: "task not found or not deleted." });
    }
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).send({ msg: "Error deleting task", error: err });
  }
};

const updatetask = async (req, res) => {
  const taskId = req.body.task_id;
  const updatedtaskData = {
    name: req.body.name,
    team: req.body.team,
    task: req.body.task,
    status: req.body.status,
    priority: req.body.priority,
    labels: req.body.labels,
    message: req.body.message,
    assigner: req.body.assigner,
    worker: req.body.worker,
    date: req.body.date,
    activities: req.body.activities,
  };

  try {
    const result = await task.updateOne({ _id: taskId }, updatedtaskData);
    if (result.nModified === 1) {
      console.log("task updated successfully.");
      res.status(200).send({ msg: "success" });
    } else {
      console.log("task not found or not updated.");
      res.status(404).send({ msg: "task not found or not updated." });
    }
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).send({ msg: "Error updating task", error: err });
  }
};

const checkin = async (req, res) => {
  const taskId = req.body.task_id;
  const userList = req.body.checkInList;

  let taskName = "";

  task
    .find({ task_id: taskId })
    .then((data) => {
      taskName = data[0].name;
      console.log(taskName);
    })
    .catch((err) => {
      res.status(400).send({ msg: "Error fetching task", error: err });
    });

  for (let i = 0; i < userList.length; i++) {
    task.updateOne(
      { task_id: taskId, "participants.id": userList[i] },
      { $set: { "participants.$.entry": true } },
      function (err) {
        if (err) return handleError(err);
        else {
          console.log(`user :: checked-in`);
        }
      }
    );
  }

  for (let i = 0; i < userList.length; i++) {
    User.find({ user_token: userList[i] })
      .then((data) => {
        const data_obj = {
          name: data[0].username,
          regNo: data[0].reg_number,
          email: data[0].email,
          number: data[0].contactNumber,
          task: taskName,
        };

        sendCheckInMail(data_obj);
      })
      .catch((err) => {
        // console.log({ msg: "Error fetching task", error: err });
      });
  }

  res.status(200).send({ msg: "success" });
};

module.exports = {
  posttask,
  alltasks,
  particulartask,
  deletetask,
  checkin,
  updatetask,
};
