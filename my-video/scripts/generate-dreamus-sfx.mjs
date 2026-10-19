// Synthesizes the two extra sound effects used by DreamRaffleUS:
// buzzer.wav ("wrong answer" on "forever") and keys.wav (a key-ring jingle).
//
//   node scripts/generate-dreamus-sfx.mjs <out-dir>

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const outDir = process.argv[2] ?? ".";
mkdirSync(outDir, { recursive: true });

const write = (name, samples) => {
  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  const norm = peak ? 0.89 / peak : 1;
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) =>
    buf.writeInt16LE(Math.round(s * norm * 32767), 44 + i * 2),
  );
  writeFileSync(join(outDir, name), buf);
  console.log(`Wrote ${join(outDir, name)}`);
};

// Buzzer: two detuned square waves, low-passed, with a short decay.
{
  const n = Math.floor(SR * 0.7);
  const out = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const sq =
      Math.sign(Math.sin(2 * Math.PI * 130 * t)) * 0.6 +
      Math.sign(Math.sin(2 * Math.PI * 196 * t)) * 0.4;
    lp += 0.25 * (sq - lp);
    out[i] = lp * Math.min(1, t / 0.01) * Math.exp(-1.6 * t);
  }
  write("buzzer.wav", out);
}

// Keys: a handful of bright metallic pings at irregular offsets.
{
  const n = Math.floor(SR * 0.9);
  const out = new Float32Array(n);
  const hits = [
    [0, 3100, 1],
    [0.07, 4700, 0.7],
    [0.11, 3600, 0.9],
    [0.19, 2800, 0.8],
    [0.27, 5200, 0.6],
    [0.33, 3900, 0.5],
  ];
  for (const [start, f, amp] of hits) {
    const s0 = Math.floor(start * SR);
    for (let j = 0; s0 + j < n; j++) {
      const t = j / SR;
      const env = Math.exp(-t * 22) * Math.min(1, t / 0.0008);
      out[s0 + j] +=
        amp *
        env *
        (Math.sin(2 * Math.PI * f * t) +
          0.5 * Math.sin(2 * Math.PI * f * 2.37 * t) * Math.exp(-t * 10));
    }
  }
  write("keys.wav", out);
}
