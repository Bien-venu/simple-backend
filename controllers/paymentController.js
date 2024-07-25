const { sendTicket } = require("./smsController");
const express = require("express");
const app = express();
const User = require("../models/user");
const { task } = require("../models/task");
const dotenv = require("dotenv");
dotenv.config();

const cookieParser = require("cookie-parser");
app.use(cookieParser());
const stripe = require("stripe")(process.env.STRIPE_KEY);

const uuid = require("uuid").v4;

const payment = async (req, res) => {
  let charge, status, check;
  var { product, token, user, task } = req.body;

  var key = uuid();

  try {
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    charge = await stripe.charges.create(
      {
        amount: product.price * 100,
        currency: "INR",
        customer: customer.id,
        receipt_email: token.email,
        description: `Booked Ticket for ${product.name}`,
        shipping: {
          name: token.billing_name,
          address: {
            line1: token.shipping_address_line1,
            line2: token.shipping_address_line2,
            city: token.shipping_address_city,
            country: token.shipping_address_country,
            postal_code: token.shipping_address_zip,
          },
        },
      },
      {
        idempotencyKey: key,
      }
    );

    console.log("Charge: ", { charge });
    status = "success";
  } catch (error) {
    console.log(error);
    status = "success";
  }

  // collecting ticket details
  User.find({ user_token: user.user_id }, async function (err, docs) {
    console.log(docs);
    if (docs.length !== 0) {
      var Details = {
        email: docs[0].email,
        task_name: product.name,
        name: token.billing_name,
        pass: key,
        price: product.price,
        address1: token.shipping_address_line1,
        city: token.shipping_address_city,
        zip: token.shipping_address_zip,
      };

      console.log("All details before email: ", Details);

      try {
        task.findOne(
          {
            task_id: task.task_id,
            "participants.id": user.user_id,
          },
          function (err, doc) {
            if (err) return handleError(err);
            if (doc) {
              console.log("Element already exists in array");
              check = "alreadyregistered";
            } else {
              task.updateOne(
                { task_id: task.task_id },
                {
                  $push: {
                    participants: {
                      id: user.user_id,
                      name: docs[0].username,
                      email: docs[0].email,
                      passID: key,
                      regno: docs[0].reg_number,
                      entry: false,
                    },
                  },
                },
                function (err) {
                  if (err) {
                    console.log(err);
                  }
                }
              );
            }
          }
        );
      } catch (err) {
        console.log(err);
      }
      if (check !== "alreadyregistered") {
        sendTicket(Details);
      }
    } else {
      status = "error";
      res.status(401).send({ msg: "User is unauthorized" });
    }
  });

  task.find({ task_id: task.task_id }, async function (err, tasks) {
    if (tasks.length !== 0) {
      User.updateOne(
        { user_token: user.user_id },

        { $push: { registeredtasks: tasks[0] } },
        function (err) {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  });
  res.send({ status });
};

module.exports = {
  payment,
};
