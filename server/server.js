const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5473",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;


// =========================
// BASIC ROUTE
// =========================

app.get("/", (req, res) => {
  res.send("ChatX server is running 🚀");
});


// =========================
// SOCKET CONNECTION
// =========================

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);


  // RECEIVE MESSAGE
  socket.on("send_message", (message) => {

    console.log("Message received:", message);

    // Add timestamp if frontend didn't provide one
    const messageWithTime = {
      ...message,
      time:
        message.time ||
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
    };

    // Send message to everyone
    io.emit("receive_message", messageWithTime);
  });


  // USER DISCONNECTED
  socket.on("disconnect", () => {

    console.log("User disconnected:", socket.id);

  });

});


// =========================
// START SERVER
// =========================

server.listen(PORT, "0.0.0.0", () => {

  console.log(`ChatX server running on http://localhost:${PORT}`);

});