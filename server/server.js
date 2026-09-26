const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL , "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Store connected users
const users = {};

app.get("/", (req, res) => {
  res.send("ChatX server is running 🚀");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // USER JOINS
  socket.on("join_chat", (username) => {
    users[socket.id] = username;

    console.log(`${username} joined the chat`);

    // Send updated user list to everyone
    io.emit("users_update", Object.values(users));
  });

  // MESSAGE
  socket.on("send_message", (message) => {
    console.log("Message received:", message);

    const messageWithTime = {
      ...message,
      time:
        message.time ||
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
    };

    io.emit("receive_message", messageWithTime);
  });

  // USER DISCONNECTS
  socket.on("disconnect", () => {
    const username = users[socket.id];

    delete users[socket.id];

    console.log("User disconnected:", username || socket.id);

    // Send updated user list
    io.emit("users_update", Object.values(users));
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ChatX server running on http://localhost:${PORT}`);
});