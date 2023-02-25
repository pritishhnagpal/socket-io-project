const express = require("express");
const app = express();
const http = require("http");
const router = require("./routes/auth");
const cors = require("cors");
const server = http.createServer(app);
require("./db/mongoose");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const Channel = require("./models/channels");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const SECRET = "ahjsdbcjdhsmbc";

app.use(express.json());

app.use(cors());

app.use(router);

app.get("/", (req, res) => {
  res.send("hello");
});

let responses = {};
let channels = [];
let students = {};
const chat = {};

async function getId(token) {
  const { _id } = await jwt.verify(token, SECRET);
  return _id;
}

async function updateResponsesInDb(payload) {
  const { channelId, token, selectedOption } = payload;
  const id = await getId(token);
  Channel.findOneAndUpdate(
    { channelId },
    {
      $push: {
        questions: {
          responses: {
            userId: id,
            response: selectedOption,
          },
        },
      },
    },
    { new: true }
  ).exec();
}

async function updateQuestionInDb(payload) {
  const { channelId, question, options, correctOption, token, result } =
    payload;
  if (token) {
    const id = await getId(token);
    Channel.findOneAndUpdate(
      { channelId },
      {
        $push: {
          questions: {
            question,
            options,
            correctOption,
            result,
          },
        },
      },
      { new: true }
    ).exec();
  }
}

async function createChannel(token, channelId) {
  const id = await getId(token);

  const channel = new Channel({
    channelId,
    userId: id,
  });

  channel.save();
}

async function updateParticipantsInDb(token, channelId) {
  const id = await getId(token);
  Channel.findOneAndUpdate(
    { channelId },
    {
      $push: {
        participants: id,
      },
    },
    { new: true }
  )
    .populate("userId", "name _id")
    .exec();
}

io.on("connection", (socket) => {
  socket.on("question", (payload) => {
    console.log("pay", payload);
    const { channelId } = payload;
    console.log("win", payload);
    socket.broadcast.to(channelId).emit("get-question", { ...payload });
    // responses[channelId] = {};
    // updateQuestionInDb(payload);
  });

  socket.on("question-response", (payload) => {
    const { selectedOption, channelId } = payload;
    console.log("payloo", payload);
    if (!responses.hasOwnProperty(channelId)) {
      responses[channelId] = { result: [0, 0, 0, 0], total: 0 };
    }
    responses[channelId].result[selectedOption] += 1;
    responses[channelId].total += 1;

    io.in(channelId).emit("result", {
      responses: responses[channelId].result,
      total: responses[channelId].total,
    });

    console.log("anss", responses);
    // updateResponsesInDb(payload);
  });

  socket.on("record-result", (payload) => {
    updateQuestionInDb(payload);
  });

  socket.on("create-room", ({ channelId, token }) => {
    const channelPresent = channels.some(
      (channel) => channel.channelId === channelId
    );

    socket.join(channelId);

    if (!channelPresent) {
      channels.push({ channelId, createdBy: socket.id });
      createChannel(token, channelId);
    }
    io.emit("new-channels", channels);
  });

  socket.on("join-channel", ({ channelId, userName, token }) => {
    socket.join(channelId);

    if (students.hasOwnProperty(channelId)) {
      students[channelId].push({ id: socket.id, userName });
    } else {
      students[channelId] = [{ id: socket.id, userName }];
    }

    const channelOwner = channels.find(
      (channel) => channel.channelId === channelId
    );
    if (channelOwner) {
      io.to(channelOwner.createdBy).emit("update-student-list", {
        students: students[channelId],
      });

      updateParticipantsInDb(token, channelId);
    }
  });

  socket.on("get-all-channels", (callback) => {
    console.log("chan", channels, students);
    callback({ channels });
  });

  socket.on("get-all-students-in-channel", (channelId, callback) => {
    callback({ students: students[channelId] });
  });

  socket.on("kick-student", ({ id, channelId }) => {
    io.sockets.sockets.forEach((socket) => {
      if (socket.id === id) {
        io.to(socket.id).emit("kicked", {
          message: "You have been kicked out of channel from teacher",
        });
        students[channelId] = students[channelId].filter(
          (student) => student.id !== id
        );
        socket.leave(channelId);
      }
    });
  });

  socket.on("send-chat", (payload) => {
    const { channelId, id, message } = payload;

    if (!chat.hasOwnProperty(channelId)) {
      chat[channelId] = {};
    }
    if (!chat[channelId].hasOwnProperty(id)) {
      chat[channelId][id] = [];
    }
    chat[channelId][id].push(message);

    const channelOwner = channels.find(
      (channel) => channel.channelId === channelId
    );

    io.to(channelOwner.createdBy).emit("chat", {
      chats: chat[channelId][id],
      id,
    });
    io.to(id).emit("chat", {
      chats: chat[channelId][id],
      id,
    });
  });

  socket.on("disconnect", () => {
    channels = channels.filter(({ channelId }) => channelId !== socket.id);
    socket.to(socket.id).emit("connection-over", "Connection Over");

    Object.keys(students).forEach((channelId) => {
      const listOfStudents = students[channelId];
      const isPresent = listOfStudents.some(({ id }) => id === socket.id);
      if (isPresent) {
        students[channelId] = students[channelId].filter(
          (student) => student.id !== socket.id
        );
        const channelOwner = channels.find(
          (channel) => channel.channelId === channelId
        );

        io.to(channelOwner.createdBy).emit("update-student-list", {
          students: students[channelId],
        });
      }
    });
  });
});

// socket.emit("chat");

server.listen(8010, () => {
  console.log("Listening at 8010");
});
