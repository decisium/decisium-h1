const { Server } =
  require("socket.io");

const io =
  new Server(4000, {
    cors: {
      origin: "*",
    },
  });

const sessions =
  {};
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
function logSession(
  label,
  sessionId
) {

  console.log(
    label,
    sessionId,
    JSON.stringify(
      sessions[
        sessionId
      ],
      null,
      2
    )
  );

}
  return sessions[
    sessionId
  ];

}
console.log(
  "Realtime server running on port 4000"
);

io.on(
  "connection",
  (socket) => {

    console.log(
      "User connected"
    );

    socket.on(
  "join-session",
  (data) => {

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

  const wasOffline =
    !session.hostOnline;

  session.hostOnline =
    true;

  session.hostSocketId =
    socket.id;

  session.receptionOpen =
    true;

  if (
    wasOffline
  ) {

    io.to(
      sessionId
    ).emit(
      "host-online"
    );

  }

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

    console.log(
      "HOST ONLINE CHECK:",
      sessionId,
      session.hostOnline
    );

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
  socket.isGuest =
    true;
socket.role =
  "guest";
  session.language =
  language;

  io.to(
    sessionId
  ).emit(
    "session-language",
    language
  );

  io.to(
    sessionId
  ).emit(
    "guest-connected"
  );

  socket.emit(
    "guest-approved"
  );

}

    console.log(
      "User joined session:",
      sessionId
    );

  }
);
socket.on(
  "leave-session",
  (sessionId) => {

    socket.leave(
      sessionId
    );

    const session =
      getSession(
        sessionId
      );

    resetConversation(
  session
);

    io.to(
      sessionId
    ).emit(
      "guest-disconnected"
    );

    console.log(
      "Guest left session:",
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
      "send-message",
      (data) => {

        console.log(
          "Message received:",
          data
        );

        io.to(
          data.sessionId
        ).emit(
          "receive-message",
          data
        );

      }
    );

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
console.log(
  "GUEST DISCONNECT:",
  socket.sessionId,
  socket.isGuest
);
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

  console.log(
    "HOST DISCONNECT:",
    socket.sessionId
  );

  const session =
    getSession(
      socket.sessionId
    );

session.hostOnline =
  false;

session.hostSocketId =
  null;

session.receptionOpen =
  false;

session.guestConnected =
  false;

session.guestSocketId =
  null;

session.language =
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
  }
);