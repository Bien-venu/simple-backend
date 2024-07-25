const express = require("express");
const router = express.Router();
const {
  verifyOtp,
  verifyLogin,
  getAllUsers,
} = require("../controllers/authController");

router.route("/signup/verify").post(verifyOtp);
router.route("/signin/verify").post(verifyLogin);
router.route("/users").get(getAllUsers);

module.exports = router;
