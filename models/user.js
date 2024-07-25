const mongoose = require("mongoose");
const uuid = require("uuid");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  image: String,
  user_token: {
    type: String,
    default: uuid.v4, // Generate a unique token using uuid
    unique: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
