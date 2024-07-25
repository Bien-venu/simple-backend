const express = require("express");
const router = express.Router();

const {
  posttask,
  alltasks,
  particulartask,
  deletetask,
  checkin,
  updatetask,
} = require("../controllers/taskController");

router.route("/post/task").post(posttask);
router.route("/getalltasks").get(alltasks);
router.route("/gettask").post(particulartask);
router.route("/deletetask").post(deletetask);
router.route("/updatetask").post(updatetask);
router.route("/task/checkin").post(checkin);

module.exports = router;
