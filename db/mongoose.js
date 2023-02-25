const mongoose = require("mongoose");

const connectionURL = process.env.MONGO_URL;

mongoose.connect(connectionURL, () => {
  console.log("Database is Connected");
});
