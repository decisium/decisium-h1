import { Server } from "socket.io";

let io: Server;

export function getIO() {
  if (!io) {
    io = new Server({
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("User connected");

      socket.on("join-session", (sessionId) => {
        socket.join(sessionId);

        console.log(
          `User joined session ${sessionId}`
        );
      });

      socket.on("send-message", (data) => {
        io.to(data.sessionId).emit(
          "receive-message",
          data
        );
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  }

  return io;
}