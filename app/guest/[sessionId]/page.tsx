"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { usePushToTalk } from "../../lib/usePushToTalk";
import { audioQueue } from "../../lib/audioQueue";
import {
  useParams,
  useSearchParams,
} from "next/navigation";

import {
  io,
  Socket,
} from "socket.io-client";

type Message = {
  sender: string;
  original: string;
  translated: string;
};
const HOST_BRAND = {

  name:
    "Grand Hotel Plaza",

  slogan:
    "Reception Live Translator",

  logo:
    "/brand/logo.png",

};

const uiTranslations: any = {

  en: {
    welcome:
      "Welcome",

    subtitle:
      "Communicate naturally with the property",

    activeLanguage:
      "Active language",

    placeholder:
      "Type your message...",

    send:
      "Send",

    listening:
      "Listening...",

    pressSpeak:
      "Speak naturally",

    waiting:
      "Waiting for conversation...",

    ended:
      "Session ended",

    receptionReady:
      "Reception online",

    connecting:
      "Connecting with reception...",

    occupied:
      "Reception busy",

    occupiedDescription:
  "Reception is currently assisting another guest. Please try again later and refresh the page.",
  receptionClosed:
  "Reception Closed",

receptionClosedDescription:
  "Please try again later.",

unavailable:
  "Reception Temporarily Unavailable",

unavailableDescription:
  "Please try again later.",

offlineBannerTitle:
  "Reception Temporarily Unavailable",

offlineBannerDescription:
  "Messages may not receive a reply.",

startNewConversation:
  "Start New Conversation",

original:
  "Original",

translation:
  "Translation",

endConversation:
  "End Conversation",
},

  fr: {
    welcome:
      "Bienvenue",

    subtitle:
      "Communiquez naturellement avec l'établissement",

    activeLanguage:
      "Langue active",

    placeholder:
      "Écrivez votre message...",

    send:
      "Envoyer",

    listening:
      "Écoute...",

    pressSpeak:
      "Parlez naturellement",

    waiting:
      "En attente de conversation...",

    ended:
      "Session terminée",

    receptionReady:
      "Réception en ligne",

    connecting:
      "Connexion avec la réception...",

    occupied:
      "Réception occupée",

    occupiedDescription:
  "La réception assiste actuellement un autre client. Veuillez réessayer plus tard et actualiser la page.",
receptionClosed:
  "Réception fermée",

receptionClosedDescription:
  "Veuillez réessayer plus tard.",

unavailable:
  "Réception temporairement indisponible",

unavailableDescription:
  "Veuillez réessayer plus tard.",

offlineBannerTitle:
  "Réception temporairement indisponible",

offlineBannerDescription:
  "Les messages pourraient ne pas recevoir de réponse.",

startNewConversation:
  "Commencer une nouvelle conversation",

original:
  "Original",

translation:
  "Traduction",

endConversation:
  "Terminer la conversation",  
},

  es: {
    welcome:
      "Bienvenido",

    subtitle:
      "Comuníquese naturalmente con la propiedad",

    activeLanguage:
      "Idioma activo",

    placeholder:
      "Escribe tu mensaje...",

    send:
      "Enviar",

    listening:
      "Escuchando...",

    pressSpeak:
      "Habla naturalmente",

    waiting:
      "Esperando conversación...",

    ended:
      "Sesión finalizada",

    receptionReady:
      "Recepción en línea",

    connecting:
      "Conectando con recepción...",

    occupied:
      "Recepción ocupada",

    occupiedDescription:
  "La recepción está asistiendo actualmente a otro huésped. Inténtelo de nuevo más tarde y actualice la página.",
  receptionClosed:
  "Recepción cerrada",

receptionClosedDescription:
  "Por favor, inténtelo más tarde.",

unavailable:
  "Recepción temporalmente no disponible",

unavailableDescription:
  "Por favor, inténtelo más tarde.",

offlineBannerTitle:
  "Recepción temporalmente no disponible",

offlineBannerDescription:
  "Es posible que los mensajes no reciban respuesta.",

startNewConversation:
  "Iniciar una nueva conversación",

original:
  "Original",

translation:
  "Traducción",

endConversation:
  "Finalizar conversación",
},

  de: {
    welcome:
      "Willkommen",

    subtitle:
      "Kommunizieren Sie natürlich mit der Unterkunft",

    activeLanguage:
      "Aktive Sprache",

    placeholder:
      "Nachricht eingeben...",

    send:
      "Senden",

    listening:
      "Hört zu...",

    pressSpeak:
      "Sprechen Sie natürlich",

    waiting:
      "Warten auf Unterhaltung...",

    ended:
      "Sitzung beendet",

    receptionReady:
      "Rezeption online",

    connecting:
      "Verbindung mit der Rezeption...",

    occupied:
      "Rezeption besetzt",

    occupiedDescription:
  "Die Rezeption betreut derzeit einen anderen Gast. Bitte versuchen Sie es später erneut und aktualisieren Sie die Seite.",
  receptionClosed:
  "Rezeption geschlossen",

receptionClosedDescription:
  "Bitte versuchen Sie es später erneut.",

unavailable:
  "Rezeption vorübergehend nicht verfügbar",

unavailableDescription:
  "Bitte versuchen Sie es später erneut.",

offlineBannerTitle:
  "Rezeption vorübergehend nicht verfügbar",

offlineBannerDescription:
  "Nachrichten erhalten möglicherweise keine Antwort.",

startNewConversation:
  "Neue Unterhaltung starten",

original:
  "Original",

translation:
  "Übersetzung",

endConversation:
  "Unterhaltung beenden",
},

  ja: {
    welcome:
      "ようこそ",

    subtitle:
      "あなたの言語で自然に会話できます",

    activeLanguage:
      "選択中の言語",

    placeholder:
      "メッセージを入力してください...",

    send:
      "送信",

    listening:
      "聞き取り中...",

    pressSpeak:
      "自然に話してください",

    waiting:
      "会話を待っています...",

    ended:
      "セッション終了",

    receptionReady:
      "受付オンライン",

    connecting:
      "受付に接続しています...",

    occupied:
      "受付対応中",

    occupiedDescription:
  "現在、別のお客様を対応しています。後でもう一度お試しになり、ページを更新してください。",
  receptionClosed:
  "受付は閉まっています",

receptionClosedDescription:
  "後でもう一度お試しください。",

unavailable:
  "受付は一時的に利用できません",

unavailableDescription:
  "後でもう一度お試しください。",

offlineBannerTitle:
  "受付は一時的に利用できません",

offlineBannerDescription:
  "メッセージに返信がない場合があります。",

startNewConversation:
  "新しい会話を開始",

original:
  "原文",

translation:
  "翻訳",

endConversation:
  "会話を終了",
},

  zh: {
    welcome:
      "欢迎",

    subtitle:
      "使用您的语言自然交流",

    activeLanguage:
      "当前语言",

    placeholder:
      "输入您的消息...",

    send:
      "发送",

    listening:
      "正在聆听...",

    pressSpeak:
      "自然说话",

    waiting:
      "等待对话...",

    ended:
      "会话结束",

    receptionReady:
      "前台在线",

    connecting:
      "正在连接前台...",

    occupied:
      "前台忙碌中",

    occupiedDescription:
  "前台当前正在接待其他客人。请稍后再试并刷新页面。",
  receptionClosed:
  "前台已关闭",

receptionClosedDescription:
  "请稍后再试。",

unavailable:
  "前台暂时不可用",

unavailableDescription:
  "请稍后再试。",

offlineBannerTitle:
  "前台暂时不可用",

offlineBannerDescription:
  "消息可能不会收到回复。",

startNewConversation:
  "开始新会话",

original:
  "原文",

translation:
  "翻译",

endConversation:
  "结束会话",
},

  ar: {
    welcome:
      "مرحباً",

    subtitle:
      "تواصل بشكل طبيعي بلغتك",

    activeLanguage:
      "اللغة النشطة",

    placeholder:
      "اكتب رسالتك...",

    send:
      "إرسال",

    listening:
      "جاري الاستماع...",

    pressSpeak:
      "تحدث بشكل طبيعي",

    waiting:
      "بانتظار المحادثة...",

    ended:
      "انتهت الجلسة",

    receptionReady:
      "الاستقبال متصل",

    connecting:
      "جارٍ الاتصال بالاستقبال...",

    occupied:
      "الاستقبال مشغول",

    occupiedDescription:
  "يقوم الاستقبال حالياً بمساعدة ضيف آخر. يرجى المحاولة لاحقاً وتحديث الصفحة.",
  receptionClosed:
  "الاستقبال مغلق",

receptionClosedDescription:
  "يرجى المحاولة مرة أخرى لاحقاً.",

unavailable:
  "الاستقبال غير متاح مؤقتاً",

unavailableDescription:
  "يرجى المحاولة مرة أخرى لاحقاً.",

offlineBannerTitle:
  "الاستقبال غير متاح مؤقتاً",

offlineBannerDescription:
  "قد لا تتلقى الرسائل رداً.",

startNewConversation:
  "بدء محادثة جديدة",

original:
  "النص الأصلي",

translation:
  "الترجمة",

endConversation:
  "إنهاء المحادثة",
},

};

const languageNames: any = {
  en: "English",
  fr: "French",
  es: "Spanish",
  de: "German",
  ja: "Japanese",
  zh: "Chinese",
  ar: "Arabic",
};

declare global {

  interface Window {

    webkitSpeechRecognition: any;

    SpeechRecognition: any;

  }

}

export default function GuestPage() {

  const params =
    useParams();

  const searchParams =
    useSearchParams();

  const sessionId =
    params.sessionId as string;

  const selectedLanguage =
    searchParams.get(
      "lang"
    ) || "en";

  const t =
    uiTranslations[
      selectedLanguage
    ] || uiTranslations.en;

  const socketRef =
    useRef<Socket | null>(null);

  

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const {
  isRecording,
  startRecording,
  stopRecording,
} = usePushToTalk({

  onTranscript: async (
    transcript
  ) => {

    await sendGuestMessage(
      transcript
    );

  },

});

const isListening =
  isRecording;

  const [sessionEnded, setSessionEnded] =
    useState(false);
const [sessionOccupied, setSessionOccupied] =
  useState(false);
  const [receptionClosed, setReceptionClosed] =
  useState(false);
  const [hostUnavailable, setHostUnavailable] =
  useState(false);
  const [hostOffline, setHostOffline] =
  useState(false);

const [soundEnabled, setSoundEnabled] =
  useState(true);

const [isConnecting, setIsConnecting] =
  useState(true);
  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [
    messages,
  ]);

  

  useEffect(() => {
setSessionOccupied(
  false
);

setHostUnavailable(
  false
);

setReceptionClosed(
  false
);
    const socket =

    socket.on(
  "receive-message",
  (data) => {

    setMessages(
      (prev) => [
        ...prev,
        data.message,
      ]
    );

    const isHostMessage =
      data.message.sender ===
      "host";

    if (
  isHostMessage &&
  soundEnabled
) {

  audioQueue.enqueue(
        data.message.translated,
        selectedLanguage === "en" ? "en-US" :
        selectedLanguage === "fr" ? "fr-FR" :
        selectedLanguage === "es" ? "es-ES" :
        selectedLanguage === "de" ? "de-DE" :
        selectedLanguage === "ja" ? "ja-JP" :
        selectedLanguage === "zh" ? "zh-CN" :
        selectedLanguage === "ar" ? "ar-SA" :
        "en-US"
      );

    }

  }
);


socket.on(
  "guest-approved",
  () => {

    setTimeout(
      () => {

        setIsConnecting(
          false
        );

      },
      2500
    );

  }
);

socket.on(
  "session-occupied",
  () => {

    socket.disconnect();
    
    setIsConnecting(
      false
    );

    setSessionOccupied(
      true
    );

  }
);
socket.on(
  "reception-closed",
  () => {

    socket.disconnect();

    setIsConnecting(
      false
    );

    setReceptionClosed(
      true
    );

  }
);
socket.on(
  "host-unavailable",
  () => {

    socket.disconnect();

    setIsConnecting(
      false
    );

    setHostUnavailable(
      true
    );

  }
);
socket.on(
  "host-offline",
  () => {

    setHostOffline(
      true
    );

  }
);
socket.on(
  "host-online",
  () => {

    setHostOffline(
      false
    );

  }
);

socket.on(
  "guest-connected",
  () => {

    setIsConnecting(
      false
    );

  }
);

socket.on(
  "session-ended",
  () => {

    socket.emit(
      "leave-session",
      sessionId
    );

    socket.disconnect();

    setSessionEnded(
      true
    );

  }
);

    return () => {

  

  socket.disconnect();

};

  }, [
    sessionId,
    selectedLanguage,
  ]);

  const sendGuestMessage =
    async (
      text: string
    ) => {

    if (
      !text.trim() ||
      sessionEnded
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
                "Italian",
            }),
          }
        );

      const data =
        await response.json();

      const newMessage = {

        sender: "guest",

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

    await sendGuestMessage(
      input
    );

  };

  
if (
  receptionClosed
) {

  return (

    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-[36px] p-10 shadow-2xl text-center max-w-md w-full">

        <div className="text-6xl">

          🔴

        </div>

        <h1 className="mt-6 text-4xl font-bold text-slate-900">

  {t.receptionClosed}

</h1>

<p className="mt-5 text-slate-500 text-lg leading-8">

  {t.receptionClosedDescription}

</p>

      </div>

    </main>

  );

}
if (
  hostUnavailable
) {

  return (

    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-[36px] p-10 shadow-2xl text-center max-w-md w-full">

        <div className="text-6xl">

          🟠

        </div>

        <h1 className="mt-6 text-4xl font-bold text-slate-900">

          {t.unavailable}

        </h1>

        <p className="mt-5 text-slate-500 text-lg leading-8">

          {t.unavailableDescription}

        </p>

      </div>

    </main>

  );

}
if (
  sessionOccupied
) {

  return (

    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-[36px] p-10 shadow-2xl text-center max-w-md w-full">

        <div className="text-6xl">

          ⏳

        </div>

        <h1 className="mt-6 text-4xl font-bold text-slate-900">

          {t.occupied}

        </h1>

        <p className="mt-5 text-slate-500 text-lg leading-8">

          {t.occupiedDescription}

        </p>

      </div>

    </main>

  );

}
 if (
  isConnecting
) {

  return (

    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-[36px] p-10 shadow-2xl text-center max-w-md w-full">

        <img
          src={HOST_BRAND.logo}
          alt="Hotel Logo"
          className="w-24 h-24 object-contain mx-auto"
        />

        <h1 className="mt-8 text-4xl font-bold text-slate-900">

          {HOST_BRAND.name}

        </h1>

        <p className="mt-6 text-slate-500 text-xl leading-9">

          {t.connecting}

        </p>

        <div className="mt-10 flex justify-center">

          <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />

        </div>

      </div>

    </main>

  );

}
  if (
    sessionEnded
  ) {

    return (

      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

        <div className="bg-white rounded-[36px] p-10 shadow-2xl text-center max-w-md w-full">

          <div className="text-6xl">

            🔒

          </div>

          <h1 className="mt-6 text-4xl font-bold text-slate-900">

            {t.ended}

          </h1>

          <button
            onClick={() => {
              window.location.href =
                "/join/reception";
            }}
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 text-lg font-bold transition"
          >

            {t.startNewConversation}

          </button>

        </div>

      </main>

    );

  }

  return (

    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-white rounded-[36px] overflow-hidden shadow-2xl border border-slate-200">

        <div className="bg-slate-950 p-6 text-white">
          <div className="flex flex-col items-center">

  <img
    src={HOST_BRAND.logo}
    alt="Hotel Logo"
    className="w-20 h-20 object-contain rounded-2xl bg-white p-2"
  />

  <h2 className="mt-4 text-3xl font-bold text-center">

    {HOST_BRAND.name}

  </h2>

  <p className="mt-2 text-slate-300 text-center text-lg">

    {HOST_BRAND.slogan}

  </p>
  <div className="mt-5 flex items-center justify-center">

  <div className="bg-green-500/20 border border-green-400/30 px-5 py-2 rounded-full flex items-center gap-3">

    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

    <span className="text-green-300 text-sm font-medium">

      {t.receptionReady}

    </span>

  </div>

</div>

</div>

          <p className="text-sm tracking-[0.2em] text-slate-400">

            DECISIUM

          </p>
<button
  onClick={() =>
    setSoundEnabled(
      (prev) => !prev
    )
  }
  className="mt-4 bg-slate-800 rounded-2xl px-5 py-3 text-sm font-semibold"
>
  {soundEnabled
    ? "🔔 ON"
    : "🔕 OFF"}
</button>
          <h1 className="mt-3 text-5xl font-bold tracking-tight text-blue-500">

            {t.welcome}

          </h1>

          <p className="mt-5 text-slate-300 text-xl leading-8">

            {t.subtitle}

          </p>

          <div className="mt-6 bg-slate-900 rounded-3xl p-5 border border-white/10 animate-fadeIn">

            <p className="text-slate-400 text-sm">

              {t.activeLanguage}

            </p>

            <p className="mt-3 text-2xl font-bold">

              {
                languageNames[
                  selectedLanguage
                ]
              }

            </p>

          </div>

        </div>

        <div className="p-6">

          <div className="flex flex-col gap-4 h-[340px] overflow-y-auto mb-6 pr-1">
{hostOffline && (

  <div className="bg-orange-100 border border-orange-300 rounded-3xl p-4 text-orange-900 text-center font-medium">

    🟠 {t.offlineBannerTitle}

    <div className="text-sm mt-2">

      {t.offlineBannerDescription}

    </div>

  </div>

)}
            {messages.length === 0 ? (

  <div className="bg-slate-100 rounded-3xl p-5 text-center text-slate-500">

    {t.waiting}

  </div>

) : (

  messages.map(
    (
      message,
      index
    ) => (

      <div
        key={index}

        className={`rounded-3xl p-5 ${
          message.sender ===
          "guest"
            ? "bg-blue-600 text-white"
            : "bg-slate-100"
        }`}
      >

        <p
          className={`text-sm mb-3 ${
            message.sender ===
            "guest"
              ? "text-white/70"
              : "text-slate-500"
          }`}
        >

          {t.original}

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
              "guest"
                ? "text-white/70"
                : "text-slate-500"
            }`}
          >

            {t.translation}

          </p>

          <p className="text-lg font-semibold leading-7">

            {
              message.translated
            }

          </p>

        </div>

      </div>

    )
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
                ? t.listening
                : t.pressSpeak}

            </div>

          </button>
<button
  onClick={() => {

    socketRef.current?.emit(
  "leave-session",
  sessionId
);

socketRef.current?.disconnect();

setSessionEnded(
  true
);

  }}

  className="w-full mb-4 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-2xl py-4 text-lg font-semibold transition"
>

{t.endConversation}
</button>
          <div className="mt-5 flex gap-3">

            <input
              value={input}

              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }

              placeholder={
                t.placeholder
              }

              className="flex-1 border border-slate-300 rounded-2xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={
                handleSend
              }

              className="bg-slate-950 text-white px-6 rounded-2xl text-lg font-bold hover:bg-black transition"
            >

              {t.send}

            </button>

          </div>

        </div>

      </div>

    </main>

  );
}