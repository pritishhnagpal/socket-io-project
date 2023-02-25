const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Channels = require("../models/channels");
const loginMiddleware = require("../middleware/login");

const SECRET = "ahjsdbcjdhsmbc";

const router = express.Router();
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
function validateBody(data) {
  const keys = Object.keys(data);

  let isError = keys.some((key) => data[key].length === 0);
  if (data.email) {
    isError = emailRegex.test(data.email);
  }

  if (isError) return false;
  return true;
}

router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log("mn", req.body);

  if (validateBody(req.body)) {
    return res.status(400).json({ error: "Invalid Fields" });
  }

  User.findOne({ email })
    .then(async (existingUser) => {
      if (existingUser) {
        return res.status(404).send("Email already exists");
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
          name,
          email,
          role,
          password: hashedPassword,
        });
        await user.save();
        res.json({ message: "Registered Successfully", redirect: "/" });
      } catch (e) {
        console.log("error", e);
      }
    })
    .catch((e) => {
      console.log(e);
    });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (validateBody(req.body)) {
    return res.status(404).json({ error: "Invalid Input" });
  }
  User.findOne({ email })
    .then(async (savedUser) => {
      if (!savedUser) {
        return res.status(404).json({ error: "Invalid email or password" });
      }
      try {
        const matched = await bcrypt.compare(password, savedUser.password);
        if (matched) {
          const token = jwt.sign({ _id: savedUser._id }, SECRET);
          const { _id, name, email, role } = savedUser;
          res.status(200).json({
            token,
            user: { name, email, role },
            redirect: role === "teacher" ? "/teacher" : "/student",
          });
        } else {
          res.status(404).json({ error: "Invalid email or password" });
        }
      } catch (e) {
        console.log("error", e);
      }
    })
    .catch((e) => {
      console.log(e);
    });
});

router.get("/get-previous-polls", loginMiddleware, async (req, res) => {
  const { _id } = req.user;
  const response = await Channels.find({ userId: _id });
  console.log("ress", response, _id);
  res.status(200).json({ data: response });
});

module.exports = router;
