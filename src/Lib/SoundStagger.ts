import {Sound} from "excalibur";

type SoundStaggerProps = {
  volume: number;
  delayMs?: number;
}

export class SoundStagger {
  private queue: Sound[] = [];
  private isPlaying = false;
  private volume: number;
  private delayMs: number;

  constructor(props: SoundStaggerProps) {
    this.volume = props.volume;
    this.delayMs = props.delayMs ?? 150;
  }

  play(sound: Sound) {
    this.queue.push(sound);
    if (!this.isPlaying) {
      this.processQueue();
    }
  }

  private async processQueue() {
    this.isPlaying = true;
    while (this.queue.length > 0) {
      const sound = this.queue.shift();
      if (sound) {
        sound.play(this.volume);
        await this.delay(this.delayMs);
      }
    }
    this.isPlaying = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}