const jwt = require("jsonwebtoken");
const User = require("../models/user");
const SECRET = "ahjsdbcjdhsmbc";
const validToken = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "You are not logged in" });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "You are not logged in" });
    }
    const { _id } = payload;
    User.findById(_id).then((userInfo) => {
      req.user = userInfo;
      next();
    });
  });
};

module.exports = validToken;
