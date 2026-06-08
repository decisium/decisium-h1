"use client";

import {
useEffect,
useRef,
useState,
} from "react";

import { usePushToTalk } from "./lib/usePushToTalk";
import { audioQueue } from "./lib/audioQueue";

import QRCode from "react-qr-code";

import {
io,
Socket,
} from "socket.io-client";


type Message = {
  sender: string;
  original: string;
  translated: string;
};

declare global {

  interface Window {

    webkitSpeechRecognition: any;

    SpeechRecognition: any;

  }

}
const RECEPTION_ID =
  "reception";

export default function Home() {

  const socketRef =
    useRef<Socket | null>(null);

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const audioUnlockedRef =
    useRef(false);

  const hasPlayedNotificationRef =
    useRef(false);

  const [sessionId, setSessionId] =
    useState("");
const [isAuthenticated, setIsAuthenticated] =
  useState(false);
useEffect(() => {

  const savedAuth =
    localStorage.getItem(
      "hostAuthenticated"
    );

  if (
    savedAuth === "true"
  ) {

    setIsAuthenticated(
      true
    );

  }

}, []);
const [username, setUsername] =
  useState("");

const [password, setPassword] =
  useState("");
  const [guestConnected, setGuestConnected] =
    useState(false);
const [receptionClosed, setReceptionClosed] =
  useState(false);
  const [guestLanguage, setGuestLanguage] =
    useState("English");
  const [conversationId, setConversationId] =
  useState("");  
    const guestLanguageRef =
  useRef("English");

  const [soundEnabled, setSoundEnabled] =
  useState(true);
  const soundEnabledRef =
  useRef(true);

  const [input, setInput] =
    useState("");
    const [pendingVoiceMessage, setPendingVoiceMessage] =
  useState("");

  const {
  isRecording,
  startRecording,
  stopRecording,
} = usePushToTalk({

  onTranscript: (
    transcript
  ) => {

    setInput(
      transcript
    );

    setPendingVoiceMessage(
      transcript
    );

  },

});

const isListening =
  isRecording;
    const [showDisconnectedToast, setShowDisconnectedToast] =
  useState(false);

  const [messages, setMessages] =
    useState<Message[]>([
      {
        sender: "system",
        original:
          "Sessione attiva",
        translated:
          "L'ospite può ora comunicare",
      },
    ]);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [
    messages,
  ]);

  

  useEffect(() => {
  if (
    !isAuthenticated
  ) {
    return;
  }
    const initialSessionId =
  RECEPTION_ID;

    setSessionId(
      initialSessionId
    );

    const socket =
      io(
        "https://decisium-h1-production.up.railway.app"
      );

    socketRef.current =
      socket;

    socket.on(
      "connect",
      () => {

        socket.emit(
          "join-session",
          initialSessionId
        );

      }
    );

    socket.on(
  "session-language",
  (
    language
  ) => {

    console.log(
      "Guest language received:",
      language
    );

    if (
  language
) {

      setGuestLanguage(
        language
      );
      guestLanguageRef.current =
  language;

    }

  }
);

    socket.on(
  "guest-connected",
  async () => {

    console.log(
      "GUEST CONNECTED"
    );

    const newConversationId =
      Math.floor(
        1000 +
        Math.random() * 9000
      );

    setConversationId(
      `#${newConversationId}`
    );

    setGuestConnected(
      true
    );

    hasPlayedNotificationRef.current =
      false;

    if (
      soundEnabledRef.current &&
      audioUnlockedRef.current &&
      audioRef.current
    ) {

      console.log(
        "PLAYING SOUND"
      );

      try {

        audioRef.current.currentTime =
          0;

        await audioRef.current.play();

        hasPlayedNotificationRef.current =
          true;

      } catch (error) {

        console.log(
          "Audio blocked"
        );

      }

    }

    setMessages([
      {
        sender: "system",
        original:
          `Nuova conversazione ${newConversationId}`,
        translated:
          "Guest connected",
      },
    ]);

  }
);

    socket.on(
      "receive-message",
      async (data) => {
      console.log(
  "MESSAGE RECEIVED:",
  data
);
        setMessages(
(prev) => [
...prev,
data.message,
]
);

setGuestConnected(
true
);

const isGuestMessage =
data.message.sender ===
"guest";

if (
isGuestMessage &&
soundEnabledRef.current
) {

audioQueue.enqueue(
data.message.translated,
"it-IT"
);

}

          console.log(
  "Incoming message sender:",
  data.message.sender
);
console.log(
  "AUDIO CONDITIONS:",
  {
    soundEnabled,
    audioUnlocked:
      audioUnlockedRef.current,
    alreadyPlayed:
      hasPlayedNotificationRef.current,
  }
);
        if (
          soundEnabledRef.current &&
          audioUnlockedRef.current &&
          isGuestMessage &&
          !hasPlayedNotificationRef.current &&
          audioRef.current
        ) {

          console.log(
  "PLAYING SOUND"
);

setTimeout(
  async () => {

    try {

      audioRef.current!.currentTime =
        0;

      await audioRef.current!.play();

      hasPlayedNotificationRef.current =
        true;

    } catch (error) {

      console.log(
        "Audio blocked"
      );

    }

  },
  150
);

        }

      }
    );

    socket.on(
      "session-ended",
      () => {

        setGuestConnected(
          false
        );

      }
    );
socket.on(
  "guest-disconnected",
  () => {

    console.log(
      "GUEST DISCONNECTED"
    );

    setGuestConnected(
      false
    );
setConversationId(
  ""
);
    setShowDisconnectedToast(
      true
    );

    setTimeout(() => {

      setShowDisconnectedToast(
        false
      );

    }, 1500);

  }
);
    return () => {

      socket.disconnect();

      socketRef.current =
        null;

    };

  }, [isAuthenticated]);
  useEffect(() => {

  if (
    !pendingVoiceMessage
  ) {
    return;
  }

  sendHostMessage(
    pendingVoiceMessage
  );

  setPendingVoiceMessage(
    ""
  );

}, [
  pendingVoiceMessage,
]);

  const unlockAudio =
  () => {

    audioUnlockedRef.current =
      true;

    console.log(
      "AUDIO UNLOCKED"
    );

  };

  const handleToggleSound =
  async () => {

    if (
      !audioUnlockedRef.current
    ) {

      await unlockAudio();

    }

    setSoundEnabled(
  (prev) => {

    const next =
      !prev;

    soundEnabledRef.current =
      next;

    return next;

  }
);

  };

  const sendHostMessage =
    async (
      text: string
    ) => {

    if (
      !text.trim() ||
      !sessionId
    ) {
      return;
    }

    try {

      const response =
        await fetch(
          "/api/translate",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              text,
              targetLanguage:
  guestLanguageRef.current,
            }),
          }
        );

      const data =
        await response.json();

      const newMessage = {

        sender: "host",

        original: text,

        translated:
          data.translation,

      };

      socketRef.current?.emit(
        "send-message",
        {
          sessionId,
          message:
            newMessage,
        }
      );

      setInput("");

    } catch (error) {

      console.error(
        error
      );

    }
  };

  const handleSend =
    async () => {

    await sendHostMessage(
      input
    );

  };

  

  const handleEndSession =
    () => {

    if (!sessionId) {
      return;
    }

    socketRef.current?.emit(
      "end-session",
      sessionId
    );

    

    setGuestConnected(
      false
    );

    setGuestLanguage(
      "English"
    );

    hasPlayedNotificationRef.current =
      false;

    setMessages([
      {
        sender: "system",
        original:
          "Sessione attiva",
        translated:
          "L'ospite può ora comunicare",
      },
    ]);

    setInput("");

  };
  const handleToggleReception =
  () => {

    if (!sessionId) {
      return;
    }

    if (
      receptionClosed
    ) {

      socketRef.current?.emit(
        "open-reception",
        sessionId
      );

      setReceptionClosed(
        false
      );

    } else {

      socketRef.current?.emit(
        "close-reception",
        sessionId
      );

      setReceptionClosed(
        true
      );

    }

  };
  const handleLogout =
  () => {

    if (!sessionId) {
      return;
    }

    socketRef.current?.emit(
      "logout-host",
      sessionId
    );

    socketRef.current?.disconnect();

localStorage.removeItem(
  "hostAuthenticated"
);

window.location.reload();

  };
  const handleLogin =
  async () => {

    try {

      const response =
        await fetch(
          "/api/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              username,
              password,
            }),
          }
        );

      if (
  response.ok
) {

  unlockAudio();

  localStorage.setItem(
    "hostAuthenticated",
    "true"
  );

  setIsAuthenticated(
    true
  );

} else {

        alert(
          "Credenziali non valide"
        );

      }

    } catch (
      error
    ) {

      console.error(
        error
      );

      alert(
        "Errore di connessione"
      );

    }

  };
  const joinUrl =
    sessionId
      ? `http://localhost:3000/join/${sessionId}`
      : "";
if (
  !isAuthenticated
) {

  return (

    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-[36px] p-10 shadow-2xl w-full max-w-md">

        <div className="text-center">

          <h1 className="text-4xl font-bold text-slate-900">

            DECISIUM

          </h1>

          <p className="mt-3 text-slate-500">

            Host Login

          </p>

        </div>

        <input
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          placeholder="Username"
          className="mt-8 w-full border border-slate-300 rounded-2xl px-5 py-4"
        />

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          placeholder="Password"
          className="mt-4 w-full border border-slate-300 rounded-2xl px-5 py-4"
        />

        <button
          onClick={
            handleLogin
          }
          className="mt-6 w-full bg-blue-600 text-white rounded-2xl py-4 font-bold"
        >

          Login

        </button>

      </div>

    </main>

  );

}
  return (

    <main
  className="min-h-screen bg-slate-100 flex items-center justify-center p-4"
  onClick={() => {

  if (
    !audioUnlockedRef.current
  ) {

    unlockAudio();

  }

}}
>

      <audio
        ref={audioRef}
        preload="auto"
        src="/sounds/notification.mp3"
      />
{showDisconnectedToast && (

  <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-950 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-fadeIn">

    Guest disconnected · Session available again

  </div>

)}
      <div className="w-full max-w-md bg-white rounded-[36px] overflow-hidden shadow-2xl border border-slate-200">

        <div className="bg-slate-950 p-6 text-white">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm tracking-[0.2em] text-slate-400">

                DECISIUM

              </p>

              <h1 className="mt-3 text-5xl font-bold tracking-tight text-blue-500">

                HOST

              </h1>

            </div>

            <button
              onClick={
                handleToggleSound
              }

              className="bg-slate-800 rounded-2xl px-5 py-4 text-lg font-semibold"
            >

              {soundEnabled
                ? "🔔 ON"
                : "🔕 OFF"}

            </button>

          </div>

          <div className="mt-6 bg-slate-900 rounded-3xl p-5 border border-white/10">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-400 text-sm">

                  Stato

                </p>

                <div className="mt-3 text-2xl font-bold">

  {guestConnected &&
    !receptionClosed && (
      <p>
        🟢 Ospite connesso
      </p>
  )}

  {!guestConnected &&
    !receptionClosed && (
      <p>
        🟡 In attesa
      </p>
  )}

  {!guestConnected &&
    receptionClosed && (
      <p>
        🔴 Reception Closed
      </p>
  )}

  {guestConnected &&
    receptionClosed && (
      <>
        <p>
          🟢 Ospite connesso
        </p>

        <p className="mt-2 text-red-400">
          🔴 Reception Closed
        </p>
      </>
  )}

</div>

              </div>

              <div className="text-right">

                <p className="text-slate-400 text-sm">

  Sessione

</p>

<p className="mt-3 text-2xl font-bold">

  {sessionId}

</p>

<p className="mt-4 text-slate-400 text-sm">

  Lingua guest

</p>

<p className="mt-2 text-lg font-semibold">

  {guestLanguage}

</p>
<p className="mt-4 text-slate-400 text-sm">

  Conversation

</p>

<p className="mt-2 text-lg font-semibold text-blue-400">

  {conversationId || "-"}

</p>
              </div>

            </div>

          </div>

        </div>

        <div className="bg-slate-50 p-6 border-b border-slate-200">

          <div className="bg-white rounded-3xl p-6 flex flex-col items-center shadow-sm">

            {sessionId && (

              <QRCode
                value={joinUrl}
                size={220}
              />

            )}

            <p className="mt-6 text-center text-slate-600 text-lg leading-8">

              Scansiona il QR code per avviare la conversazione

            </p>

            <button
              onClick={
                handleEndSession
              }

              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-4 text-lg font-bold transition"
            >

              Termina Sessione

            </button>
<button
  onClick={
    handleToggleReception
  }

  className={`mt-4 w-full text-white rounded-2xl py-4 text-lg font-bold transition ${
    receptionClosed
      ? "bg-green-600 hover:bg-green-700"
      : "bg-slate-700 hover:bg-slate-800"
  }`}
>

  {receptionClosed
    ? "Open Reception"
    : "Close Reception"}

</button>
<button
  onClick={
    handleLogout
  }

  className="mt-4 w-full bg-black hover:bg-slate-900 text-white rounded-2xl py-4 text-lg font-bold transition"
>

  Logout

</button>
          </div>

        </div>

        <div className="p-6">

          <div className="flex flex-col gap-4 max-h-[320px] overflow-y-auto mb-6">

            {messages.map(
              (
                message,
                index
              ) => (

                <div
                  key={index}

                  className={`rounded-3xl p-5 ${
                    message.sender ===
                    "host"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100"
                  }`}
                >

                  <p
                    className={`text-sm mb-3 ${
                      message.sender ===
                      "host"
                        ? "text-white/70"
                        : "text-slate-500"
                    }`}
                  >

                    Originale

                  </p>

                  <p className="text-lg font-semibold leading-7">

                    {
                      message.original
                    }

                  </p>

                  <div className="mt-5 pt-5 border-t border-black/10">

                    <p
                      className={`text-sm mb-3 ${
                        message.sender ===
                        "host"
                          ? "text-white/70"
                          : "text-slate-500"
                    }`}
                    >

                      Traduzione

                    </p>

                    <p className="text-lg font-semibold leading-7">

                      {
                        message.translated
                      }

                    </p>

                  </div>

                </div>

              )
            )}

            <div
              ref={
                messagesEndRef
              }
            />

          </div>

          <button
  onMouseDown={
  startRecording
}

onMouseUp={
  stopRecording
}

onMouseLeave={
  stopRecording
}

onTouchStart={
  startRecording
}

onTouchEnd={
  stopRecording
}

  className={`w-full h-32 rounded-[32px] transition text-white flex flex-col items-center justify-center shadow-xl ${
    isListening
      ? "bg-red-600 animate-pulse"
      : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
  }`}
>

            <div className="text-5xl">

              🎤

            </div>

            <div className="mt-3 text-2xl font-bold">

              {isListening
                ? "Ascolto..."
                : "Premi e Parla"}

            </div>

          </button>

          <div className="mt-5 flex gap-3">

            <input
              value={input}

              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }

              placeholder="Scrivi un messaggio..."

              className="flex-1 border border-slate-300 rounded-2xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={
                handleSend
              }

              className="bg-slate-950 text-white px-6 rounded-2xl text-lg font-bold hover:bg-black transition"
            >

              Invia

            </button>

          </div>

        </div>

      </div>

    </main>

  );
}