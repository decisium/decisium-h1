const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://decisium-h1.vercel.app",
    ],
    methods: [
      "GET",
      "POST",
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on(
  "join-session",
  (data) => {

    console.log(
      "JOIN DATA:",
      data
    );

    let sessionId;
    let language;

    if (
      typeof data ===
      "string"
    ) {

      sessionId =
        data;

    } else {

      sessionId =
        data.sessionId;

      language =
        data.language;

    }

    socket.join(
      sessionId
    );

    console.log(
      `User joined session: ${sessionId}`
    );
  });

  socket.on("send-message", (data) => {
    console.log("Message received:", data);

    io.to(data.sessionId).emit(
      "receive-message",
      data
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT =
  process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(
    `Realtime server running on port ${PORT}`
  );
});