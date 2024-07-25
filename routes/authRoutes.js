const express = require("express");
const router = express.Router();
const {
  verifyOtp,
  verifyLogin,
  getAllUsers,
} = require("../controllers/authController");

router.route("/signup").post(verifyOtp);
router.route("/login").post(verifyLogin);
router.route("/users").get(getAllUsers);

module.exports = router;
