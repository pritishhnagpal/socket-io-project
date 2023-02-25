const mongoose = require("mongoose");

const connectionURL =
  "mongodb+srv://pritishnagpal:SgpQl5uHffyxe0iW@cluster-polling.1ugr771.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(connectionURL, () => {
  console.log("Database is Connected");
});
