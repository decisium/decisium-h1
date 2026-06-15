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
  "http://localhost:3000",
  "https://decisium-h1.vercel.app",
  "https://decisium-h1-rbjqgduji-decisium-3254s-projects.vercel.app",
],
    methods: [
      "GET",
      "POST",
    ],
    credentials: true,
  },
});
const sessions = {};

function resetConversation(
  session
) {

  session.guestConnected =
    false;

  session.guestSocketId =
    null;

  session.language =
    null;

}

function getSession(
  sessionId
) {

  if (
    !sessions[
      sessionId
    ]
  ) {

    sessions[
      sessionId
    ] = {

      hostOnline:
        false,

      receptionOpen:
        true,

      guestConnected:
        false,

      language:
        null,

      hostSocketId:
        null,

      guestSocketId:
        null

    };

  }

  return sessions[
    sessionId
  ];

}
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
    socket.sessionId =
  sessionId;

socket.role =
  "unknown";

socket.isGuest =
  false;

if (
  !language
) {

  socket.role =
    "host";

  const session =
    getSession(
      sessionId
    );

  session.hostOnline =
    true;

  session.hostSocketId =
    socket.id;
  io.to(
    sessionId
  ).emit(
    "host-online"
  );
} else {

  socket.role =
    "guest";

  socket.isGuest =
    true;

}
if (
  language
) {

  const session =
    getSession(
      sessionId
    );
if (
  !session.receptionOpen
) {

  socket.emit(
    "reception-closed"
  );

  return;

}
  if (
    !session.hostOnline
  ) {

    socket.emit(
      "host-unavailable"
    );

    return;

  }

  if (
    session.guestConnected
  ) {

    socket.emit(
      "session-occupied"
    );

    return;

  }

  session.guestConnected =
    true;

  session.guestSocketId =
    socket.id;

session.language =
  language;

io.to(
  sessionId
).emit(
  "session-language",
  language
);

socket.emit(
  "guest-approved"
);
}
if (
  language
) {

  io.to(
    sessionId
  ).emit(
    "guest-connected"
  );

}
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
socket.on(
  "end-session",
  (sessionId) => {

    io.to(
      sessionId
    ).emit(
      "session-ended"
    );

    console.log(
      "Session ended:",
      sessionId
    );

  }
);
socket.on(
  "open-reception",
  (sessionId) => {

    const session =
      getSession(
        sessionId
      );

    session.receptionOpen =
      true;

    console.log(
      "OPEN RECEPTION STATE:",
      sessionId,
      session
    );

    console.log(
      "Reception opened:",
      sessionId
    );

  }
);
socket.on(
  "close-reception",
  (sessionId) => {

    const session =
      getSession(
        sessionId
      );

    resetConversation(
      session
    );

    session.receptionOpen =
      false;

    io.to(
      sessionId
    ).emit(
      "session-ended"
    );

    console.log(
      "Reception closed:",
      sessionId
    );

  }
);
socket.on(
  "logout-host",
  (sessionId) => {

    const session =
      getSession(
        sessionId
      );

    io.to(
      sessionId
    ).emit(
      "session-ended"
    );

    session.hostOnline =
      false;

    session.receptionOpen =
      false;

    session.guestConnected =
      false;

    session.hostSocketId =
      null;

    session.guestSocketId =
      null;

    session.language =
      null;

    console.log(
      "Host logout:",
      sessionId
    );

  }
);
  socket.on(
  "disconnect",
  () => {

    if (
      socket.isGuest &&
      socket.sessionId
    ) {

      const session =
        getSession(
          socket.sessionId
        );

      resetConversation(
        session
      );

      io.to(
        socket.sessionId
      ).emit(
        "guest-disconnected"
      );

    }
if (
  socket.role ===
  "host" &&
  socket.sessionId
) {

  const session =
    getSession(
      socket.sessionId
    );

  session.hostOnline =
    false;

  session.hostSocketId =
    null;

  io.to(
    socket.sessionId
  ).emit(
    "host-offline"
  );

}
    console.log(
      "User disconnected"
    );

  }
);

});

const PORT =
  process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(
    `Realtime server running on port ${PORT}`
  );
});