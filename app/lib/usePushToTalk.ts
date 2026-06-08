import {
  useEffect,
  useRef,
  useState,
} from "react";

type UsePushToTalkProps = {
  onTranscript: (
    text: string
  ) => void;
};

export function usePushToTalk(
  props: UsePushToTalkProps
) {

  const recognitionRef =
    useRef<any>(null);

  const transcriptRef =
    useRef("");

  const pendingStopRef =
    useRef(false);

  const [
    isRecording,
    setIsRecording,
  ] = useState(false);

  const startRecording =
    () => {

      if (
        recognitionRef.current
      ) {
        return;
      }

      const SpeechRecognition =
        (window as any)
          .SpeechRecognition ||
        (window as any)
          .webkitSpeechRecognition;

      if (
        !SpeechRecognition
      ) {

        console.warn(
          "SpeechRecognition not supported"
        );

        return;

      }

      transcriptRef.current =
        "";

      pendingStopRef.current =
        false;

      const recognition =
        new SpeechRecognition();

      recognition.continuous =
  false;

      recognition.interimResults =
  false;

      recognition.lang =
        "it-IT";

      recognition.onstart =
  () => {

    console.log(
      "PTT START"
    );

    setIsRecording(
      true
    );

  };

      recognition.onresult =
        (
          event: any
        ) => {

          let text = "";

          for (
            let i = 0;
            i <
            event.results.length;
            i++
          ) {

            text +=
              event.results[i][0]
                .transcript +
              " ";

          }

          console.log(
  "RAW RESULT:",
  text
);

transcriptRef.current =
  text.trim();

console.log(
  "STORED:",
  transcriptRef.current
);
console.log(
  "PTT RESULT:",
  transcriptRef.current
);
        };

      recognition.onend =
        () => {

            console.log(
  "PTT END"
);
          setIsRecording(
            false
          );

          recognitionRef.current =
            null;
console.log(
  "FINAL TRANSCRIPT:",
  transcriptRef.current
);
          if (
            pendingStopRef.current
          ) {

            pendingStopRef.current =
              false;

            const transcript =
              transcriptRef.current
                .trim();

            if (
              transcript.length >
              0
            ) {

              props.onTranscript(
                transcript
              );

            }

          }

        };

      recognition.onerror =
        (
          error: any
        ) => {

          console.error(
            error
          );

          setIsRecording(
            false
          );

          recognitionRef.current =
            null;

          pendingStopRef.current =
            false;

        };

      recognition.start();

      recognitionRef.current =
        recognition;

    };

  const stopRecording =
    () => {

      const recognition =
        recognitionRef.current;

      if (
        !recognition
      ) {
        return;
      }

      pendingStopRef.current =
        true;

        console.log(
  "PTT STOP REQUEST"
);
      setTimeout(
  () => {
    recognition.stop();
  },
  1000
);

    };

  useEffect(
    () => {

      return () => {

        try {

          recognitionRef.current?.stop();

        } catch {}

        recognitionRef.current =
          null;

      };

    },
    []
  );

  return {

    isRecording,

    startRecording,

    stopRecording,

  };

}