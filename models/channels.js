const mongoose = require("mongoose");
const User = require("./user");

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const channelsSchema = new Schema({
  channelId: {
    type: String,
    required: true,
  },
  userId: {
    type: ObjectId,
    ref: User,
  },
  participants: [
    {
      type: ObjectId,
      ref: User,
    },
  ],
  questions: [
    {
      question: {
        type: String,
      },
      options: [{ type: String }],
      correctOption: Number,
      result: [{ type: Number }],
    },
  ],
});

const channels = mongoose.model("Channels", channelsSchema);

module.exports = channels;
