const express = require("express");
const app = express();
const OtpAuth = require("../models/otpAuth");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const otpGenerator = require("otp-generator");

const { sendSMS } = require("./smsController");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const verifyLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Get the user's image and name from the database
      const { image, name, username, id, email } = user; // Assuming the User model has fields for image and name.

      res.cookie("jwt", token, { httpOnly: true });

      // Send the user's image and name along with the success message
      return res.json({
        message: "Login successful!",
        image,
        name,
        username,
        id,
        email,
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const verifyOtp = async (req, res) => {
  const { name, username, email, password } = req.body;
  console.log(name, username, email, password);
  try {
    // Simple validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: "Please enter all fields." });
    }

    // Check if the email is already registered
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(401).json({ error: "Email is already registered." });
    }

    // Check if the username is already taken
    const existingUserByUsername = await User.findOne({ username });
    console.log(existingUserByEmail);
    if (existingUserByUsername) {
      return res.status(403).json({ error: "Username is already taken." });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the hashed password and image
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();
    res.status(200).json({ message: "Registration successful!" });
    console.log(savedUser);
  } catch (error) {
    res.status(402).json({ error: "Registration failed. Please try again." });
    console.error(error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  verifyOtp,
  verifyLogin,
  getAllUsers,
};
