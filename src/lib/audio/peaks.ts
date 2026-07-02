/**
 * Real audio → waveform peaks. Everything here runs in the browser (Web Audio).
 * The same `extractPeaks` powers both a loaded file and the synthesized demo,
 * so the waveform is ALWAYS generated from actual sample data — never faked.
 */

let sharedCtx: AudioContext | null = null;

/** A lazily-created, reused AudioContext (browsers cap how many you can open). */
export function getAudioContext(): AudioContext {
  if (!sharedCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    sharedCtx = new Ctx();
  }
  return sharedCtx;
}

/** Decode encoded audio bytes (mp3/wav/…) into raw samples. */
export async function decodeAudio(bytes: ArrayBuffer): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  // decodeAudioData detaches its input, so hand it a copy.
  return ctx.decodeAudioData(bytes.slice(0));
}

/**
 * Reduce an AudioBuffer to `buckets` normalized peak values (0..1) by taking the
 * max absolute amplitude of each slice — the classic waveform reduction.
 */
export function extractPeaks(buffer: AudioBuffer, buckets = 200): number[] {
  const channels = buffer.numberOfChannels;
  const length = buffer.length;
  const blockSize = Math.max(1, Math.floor(length / buckets));
  const data: Float32Array[] = [];
  for (let c = 0; c < channels; c++) data.push(buffer.getChannelData(c));

  const peaks: number[] = new Array(buckets).fill(0);
  for (let b = 0; b < buckets; b++) {
    const start = b * blockSize;
    let max = 0;
    for (let i = 0; i < blockSize; i++) {
      const idx = start + i;
      if (idx >= length) break;
      let sample = 0;
      for (let c = 0; c < channels; c++) sample += Math.abs(data[c]?.[idx] ?? 0);
      sample /= channels;
      if (sample > max) max = sample;
    }
    peaks[b] = max;
  }

  // Normalize so the loudest moment reaches 1, then apply a gentle curve so
  // quiet detail stays visible (perceptual, not linear).
  const loudest = Math.max(...peaks, 0.0001);
  return peaks.map((p) => Math.pow(p / loudest, 0.78));
}

/**
 * Synthesize a short, evolving track (intro → build → drop → breakdown → outro)
 * as a real AudioBuffer. Gives the room an instant, genuinely-peaked waveform
 * with zero backend — and the same buffer is encoded to WAV for playback.
 */
export function createDemoBuffer(seconds = 24): AudioBuffer {
  const ctx = getAudioContext();
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * seconds);
  const buffer = ctx.createBuffer(1, len, sr);
  const ch = buffer.getChannelData(0);

  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const prog = t / seconds;

    // Bassline + harmonic, slowly drifting.
    const f = 110 * (1 + 0.4 * Math.sin(t * 0.25));
    let s = Math.sin(2 * Math.PI * f * t) * 0.5 + Math.sin(2 * Math.PI * f * 2 * t) * 0.22;

    // Four-on-the-floor kick.
    const beat = t % 0.5;
    s += Math.exp(-beat * 32) * Math.sin(2 * Math.PI * 58 * beat) * 0.9;

    // Section envelope — this is what gives the waveform its shape.
    let amp: number;
    if (prog < 0.14) amp = 0.16 * (prog / 0.14);
    else if (prog < 0.4) amp = 0.16 + ((prog - 0.14) / 0.26) * 0.55;
    else if (prog < 0.68) amp = 0.9 + 0.08 * Math.sin(t * 9); // the drop
    else if (prog < 0.85) amp = 0.34;
    else amp = 0.34 * (1 - (prog - 0.85) / 0.15);

    const noise = prog > 0.4 && prog < 0.68 ? (Math.random() * 2 - 1) * 0.12 : 0;
    ch[i] = Math.max(-1, Math.min(1, (s * 0.32 + noise) * amp));
  }
  return buffer;
}

/** Encode an AudioBuffer to a 16-bit PCM WAV Blob so an <audio> element can play it. */
export function bufferToWavBlob(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const total = buffer.length * numCh * 2 + 44;
  const ab = new ArrayBuffer(total);
  const view = new DataView(ab);

  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, total - 8, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, total - 44, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));

  let off = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numCh; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c]?.[i] ?? 0));
      view.setInt16(off, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      off += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}
