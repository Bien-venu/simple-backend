const express = require("express");
const app = express();
const mongoose = require("mongoose");

const cors = require("cors");

const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const userRouter = require("./routes/authRoutes");
const dashboardRouter = require("./routes/userDashboardRoutes");
const paymentRouter = require("./routes/paymentRoute");
const taskRouter = require("./routes/taskRoutes");
const like = require("./routes/like");
// const checkInRouter = require("./routes/checkInRoutes")

dotenv.config();
//database url
mongoose
  .connect(process.env.MONGO_ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });

require("./models/otpAuth");
require("./models/user");
require("./models/task");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(cors());

app.use("/", paymentRouter);
app.use("/", userRouter);
app.use("/", dashboardRouter);

app.use("/", taskRouter);
app.use(like);

app.get("/", (req, res) => {
  res.send("task Management micro services API.");
});

app.listen(process.env.PORT, () => {
  console.log(`Server Running on🚀: ${process.env.PORT}`);
});
