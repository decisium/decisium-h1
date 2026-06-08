export interface TTSProvider {
  speak(text: string, lang?: string): void;
  stop(): void;
  isSupported(): boolean;
}

export class SpeechSynthesisProvider
  implements TTSProvider {

  speak(
    text: string,
    lang: string = "it-IT"
  ): void {

    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.lang = lang;

    window.speechSynthesis.speak(
      utterance
    );

  }

  stop(): void {

    if (
      typeof window !== "undefined" &&
      window.speechSynthesis
    ) {
      window.speechSynthesis.cancel();
    }

  }

  isSupported(): boolean {

    return (
      typeof window !== "undefined" &&
      !!window.speechSynthesis
    );

  }

}

export const tts =
  new SpeechSynthesisProvider();