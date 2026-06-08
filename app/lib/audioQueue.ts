import { tts } from "./tts";

type AudioTask = {
  text: string;
  lang?: string;
};

export class AudioQueue {

  private queue: AudioTask[] = [];

  private playing = false;

  enqueue(
    text: string,
    lang?: string
  ) {

    this.queue.push({
      text,
      lang,
    });

    this.process();

  }

  clear() {

    this.queue = [];

    this.playing = false;

    tts.stop();

  }

  interrupt() {

    tts.stop();

    this.playing = false;

  }

  private process() {

    if (
      this.playing ||
      this.queue.length === 0
    ) {
      return;
    }

    if (
      typeof window === "undefined" ||
      !window.speechSynthesis ||
      typeof SpeechSynthesisUtterance ===
        "undefined"
    ) {

      this.queue = [];

      this.playing = false;

      return;

    }

    const task =
      this.queue.shift();

    if (!task) {
      return;
    }

    this.playing = true;

    const utterance =
      new SpeechSynthesisUtterance(
        task.text
      );

    if (task.lang) {

      utterance.lang =
        task.lang;

    }

    const releaseQueue =
      () => {

        this.playing = false;

        this.process();

      };

    utterance.onend =
      releaseQueue;

    utterance.onerror =
      releaseQueue;

    window.speechSynthesis.speak(
      utterance
    );

  }

}

export const audioQueue =
  new AudioQueue();