"use client";

import {
  useRouter,
  useParams,
} from "next/navigation";

const languages = [

  {
    code: "en",
    label: "English",
    flag: "🇬🇧",
  },

  {
    code: "fr",
    label: "Français",
    flag: "🇫🇷",
  },

  {
    code: "es",
    label: "Español",
    flag: "🇪🇸",
  },

  {
    code: "de",
    label: "Deutsch",
    flag: "🇩🇪",
  },

  {
    code: "ja",
    label: "日本語",
    flag: "🇯🇵",
  },

  {
    code: "zh",
    label: "中文",
    flag: "🇨🇳",
  },

  {
    code: "ar",
    label: "العربية",
    flag: "🇸🇦",
  },

];

export default function JoinPage() {

  const router =
    useRouter();

  const params =
    useParams();

  const sessionId =
    params.sessionId as string;

  const handleSelectLanguage =
    (
      languageCode: string
    ) => {
console.log(
  "LANGUAGE CLICK",
  languageCode,
  sessionId
);
      router.push(
        `/guest/${sessionId}?lang=${languageCode}`
      );

    };

  return (

    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-white rounded-[36px] overflow-hidden shadow-2xl border border-slate-200">

        <div className="bg-slate-950 px-8 py-10 text-white text-center">

          <p className="text-sm tracking-[0.25em] text-slate-400">

            DECISIUM

          </p>

          <h1 className="mt-4 text-5xl font-bold text-blue-500 tracking-tight">

            WELCOME

          </h1>

          <p className="mt-5 text-slate-300 text-xl leading-9">

            Communicate naturally
            with the property
            in your own language

          </p>

        </div>

        <div className="p-6">

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">

            <h2 className="text-2xl font-bold text-slate-900">

              Choose your language

            </h2>

            <p className="mt-3 text-slate-500 text-lg leading-8">

              Select the language
              you prefer for your conversation.

            </p>

          </div>

          <div className="mt-6 flex flex-col gap-4">

            {languages.map(
              (
                language
              ) => (

                <button
                  key={
                    language.code
                  }

                  onClick={() =>
                    handleSelectLanguage(
                      language.code
                    )
                  }

                  className="bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition rounded-3xl px-6 py-5 flex items-center justify-between shadow-sm"
                >

                  <div className="flex items-center gap-4">

                    <div className="text-3xl">

                      {
                        language.flag
                      }

                    </div>

                    <div className="text-xl font-semibold text-slate-900">

                      {
                        language.label
                      }

                    </div>

                  </div>

                  <div className="text-slate-400 text-2xl">

                    →

                  </div>

                </button>

              )
            )}

          </div>

        </div>

      </div>

    </main>

  );
}