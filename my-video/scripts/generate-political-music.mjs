// Synthesizes the playful score for PoliticalAnimation (no licensing
// concerns). No dependencies; writes a 16-bit WAV.
//
//   node scripts/generate-political-music.mjs <out.wav>
//
// Cartoon march in F major at 120 BPM (one beat = 0.5s = 15 frames), so the
// hops and landings in src/PoliticalAnimation/index.tsx fall on beats:
//   0 → 5s     bouncy oom-pah: tuba bass, pizzicato chords, marimba tune,
//              a slide whistle on every hop (1.5s, 3s)
//   5 → 7s     the thought bubble: everything drops out except tiptoeing
//              pizzicato and a questioning whistle
//   7s         the golden cube lands: cymbal and fanfare chord
//   7.5 → 8s   slide whistle on the last, big hop; "ta-da" on landing (8s)
//   8 → 10s    triumphant march to a final button at 9.5s

import { writeFileSync } from "node:fs";

const SR = 44100;
const out = process.argv[2] ?? "political-music.wav";
const BEAT = 0.5;
const TOTAL = 10;
// Must match HOPS / THOUGHT / GOLDEN in src/PoliticalAnimation/index.tsx (s).
const HOP_STARTS = [1.5, 3.0];
const HOP_LENGTH = 0.5;
const THINK = 5;
const GOLDEN = 7;
const FINAL_HOP = 7.5;
const LANDED = 8;

let seed = 4242;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 4294967296) * 2 - 1;
};
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const saw = (p) => 2 * (p - Math.floor(p + 0.5));

const n = Math.floor(SR * TOTAL);
const L = new Float32Array(n);
const R = new Float32Array(n);
const add = (i, l, r = l) => {
  if (i >= 0 && i < n) {
    L[i] += l;
    R[i] += r;
  }
};

// Marimba: fundamental plus the 4th harmonic, fast decay.
const marimba = (t0, note, gain, pan = 0) => {
  const f = hz(note);
  const s0 = Math.floor(t0 * SR);
  for (let j = 0; j < 0.5 * SR; j++) {
    const t = j / SR;
    const x =
      (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t * 30)) *
      Math.exp(-t * 9) *
      Math.min(1, t / 0.002);
    add(s0 + j, x * gain * (1 - pan), x * gain * (1 + pan));
  }
};

// Pizzicato strings: short plucked saw through a falling low-pass.
const pizz = (t0, note, gain, pan = 0) => {
  const f = hz(note);
  const s0 = Math.floor(t0 * SR);
  let p = Math.abs(noise());
  let lp = 0;
  for (let j = 0; j < 0.35 * SR; j++) {
    const t = j / SR;
    p += f / SR;
    lp += (0.05 + 0.3 * Math.exp(-t * 25)) * (saw(p) - lp);
    const x = lp * Math.exp(-t * 14) * Math.min(1, t / 0.003);
    add(s0 + j, x * gain * (1 - pan), x * gain * (1 + pan));
  }
};

// Tuba: round, short "oom" notes.
const tuba = (t0, note, gain, dur = 0.28) => {
  const f = hz(note);
  const s0 = Math.floor(t0 * SR);
  let p = 0;
  let lp = 0;
  for (let j = 0; j < dur * SR; j++) {
    const t = j / SR;
    p += f / SR;
    lp += 0.08 * (saw(p) - lp);
    const env = Math.min(1, t / 0.015) * Math.min(1, (dur - t) / 0.05);
    add(s0 + j, (lp * 0.7 + Math.sin(2 * Math.PI * p) * 0.6) * env * gain * 0.45);
  }
};

// Slide whistle: a sine gliding between two pitches with vibrato.
const whistle = (t0, from, to, dur, gain) => {
  const s0 = Math.floor(t0 * SR);
  let p = 0;
  for (let j = 0; j < dur * SR; j++) {
    const t = j / SR;
    const k = t / dur;
    const f = hz(from + (to - from) * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2));
    p += (f * (1 + 0.01 * Math.sin(2 * Math.PI * 6 * t))) / SR;
    const env = Math.min(1, t / 0.03) * Math.min(1, (dur - t) / 0.06);
    const x = (Math.sin(2 * Math.PI * p) + 0.08 * noise()) * env * gain;
    add(s0 + j, x * 0.9, x);
  }
};

const snare = (t0, gain) => {
  const s0 = Math.floor(t0 * SR);
  let prev = 0;
  for (let j = 0; j < 0.15 * SR; j++) {
    const t = j / SR;
    const x = noise();
    const hp = x - prev * 0.6;
    prev = x;
    add(s0 + j, (hp * 0.7 + Math.sin(2 * Math.PI * 190 * t) * 0.4) * Math.exp(-t * 28) * gain);
  }
};

const cymbal = (t0, gain, dur = 1.6) => {
  const s0 = Math.floor(t0 * SR);
  let prev = 0;
  for (let j = 0; j < dur * SR; j++) {
    const t = j / SR;
    const x = noise();
    const hp = x - prev;
    prev = x;
    add(s0 + j, hp * Math.exp(-t * 2.5) * gain, noise() * 0.5 * Math.exp(-t * 2.5) * gain);
  }
};

// Brass-ish fanfare chord.
const fanfare = (t0, notes, dur, gain) => {
  const s0 = Math.floor(t0 * SR);
  for (const note of notes) {
    const f = hz(note);
    let p1 = 0;
    let p2 = 0.25;
    let lp = 0;
    for (let j = 0; j < (dur + 0.3) * SR; j++) {
      const t = j / SR;
      p1 += f / SR;
      p2 += (f * 1.006) / SR;
      lp += (0.06 + 0.2 * Math.exp(-t * 5)) * (saw(p1) + saw(p2) - lp);
      const env = Math.min(1, t / 0.02) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.3) : 1);
      add(s0 + j, lp * env * gain * 0.9, lp * env * gain);
    }
  }
};

// ---------------------------------------------------------------------------
// Score
// ---------------------------------------------------------------------------

// Chords per bar (2s): [bass root, chord tones].
const CHORDS = {
  F: [41, [65, 69, 72]],
  C7: [36, [64, 67, 70]],
  Bb: [34, [65, 70, 74]],
  Dm: [38, [62, 65, 69]],
  G7: [43, [62, 65, 71]],
};
const BARS = ["F", "C7", "F"]; // 0–5s (bar 3 only half), then the thought bubble

// Oom-pah: tuba on beats 1 and 3, pizzicato chord stabs on 2 and 4.
for (let beat = 0; beat < THINK / BEAT; beat++) {
  const t = beat * BEAT;
  const [root, tones] = CHORDS[BARS[Math.floor(t / 2)]];
  if (beat % 2 === 0) tuba(t, beat % 4 === 0 ? root : root + 7, 0.32);
  else {
    tones.forEach((note, k) => pizz(t, note, 0.12, (k - 1) * 0.3));
    snare(t, 0.12);
  }
}

// Bouncy marimba tune (beats, midi, gain), cheeky grace notes included.
const TUNE = [
  [0, 72], [0.5, 77], [1, 81], [1.5, 77], [2, 79], [2.75, 77], [3, 76], [3.5, 72],
  [4, 76], [4.5, 79], [5, 82], [5.5, 79], [6, 77], [6.5, 76], [7, 74], [7.5, 72],
  [8, 72], [8.5, 77], [9, 81],
];
for (const [beat, note] of TUNE) marimba(beat * BEAT, note, 0.22, beat % 1 ? 0.25 : -0.25);

// Slide whistle up on each hop, a little "plip" on each landing.
for (const start of HOP_STARTS) {
  whistle(start, 72, 86, HOP_LENGTH * 0.9, 0.1);
  marimba(start + HOP_LENGTH, 89, 0.12);
}

// Thought bubble: tiptoe pizzicato on Dm → G7, and a questioning whistle.
for (let k = 0; k < 8; k++) {
  const t = THINK + k * 0.25;
  const [, tones] = CHORDS[k < 4 ? "Dm" : "G7"];
  pizz(t, tones[k % 3] - (k % 2 ? 0 : 12), 0.1, k % 2 ? 0.3 : -0.3);
}
whistle(THINK + 0.2, 74, 79, 0.35, 0.07);
whistle(THINK + 1.2, 74, 81, 0.45, 0.07); // "...?" rising higher
tuba(THINK, 38, 0.18, 0.4);
tuba(THINK + 1, 43, 0.18, 0.4);

// Snare roll into the golden cube.
for (let k = 0; k < 12; k++) snare(GOLDEN - 0.5 + k * (0.5 / 12), 0.04 + k * 0.012);

// Golden cube lands: cymbal and fanfare.
cymbal(GOLDEN, 0.2);
fanfare(GOLDEN, [53, 60, 65, 69, 72], 0.4, 0.05);
tuba(GOLDEN, 41, 0.35, 0.4);

// The big hop onto the golden cube: long slide whistle, then "ta-da".
whistle(FINAL_HOP, 70, 94, LANDED - FINAL_HOP, 0.11);
fanfare(LANDED, [60, 65, 69], 0.12, 0.05);
fanfare(LANDED + 0.18, [65, 69, 72, 77], 0.5, 0.06);
cymbal(LANDED, 0.15);

// Triumphant march to the end.
for (let beat = LANDED / BEAT; beat < 19; beat++) {
  const t = beat * BEAT;
  const [root, tones] = CHORDS[t < 9 ? "F" : t < 9.5 ? "C7" : "F"];
  if (beat % 2 === 0) tuba(t, root, 0.3);
  else {
    tones.forEach((note, k) => pizz(t, note + 12, 0.11, (k - 1) * 0.3));
    snare(t, 0.14);
  }
  marimba(t, tones[beat % 3] + 12, 0.12);
}
// Final button: "ta-dum!"
tuba(9.5, 36, 0.3, 0.15);
tuba(9.75, 41, 0.38, 0.22);
fanfare(9.75, [65, 69, 72, 77], 0.15, 0.05);
snare(9.75, 0.2);

// Normalise and write.
let peak = 0;
for (let i = 0; i < n; i++) {
  const fade = i > n - 0.08 * SR ? (n - i) / (0.08 * SR) : 1;
  L[i] = Math.tanh(L[i]) * fade;
  R[i] = Math.tanh(R[i]) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;
const buf = Buffer.alloc(44 + n * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + n * 4, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(n * 4, 40);
for (let i = 0; i < n; i++) {
  buf.writeInt16LE(Math.round(L[i] * norm * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(R[i] * norm * 32767), 46 + i * 4);
}
writeFileSync(out, buf);
console.log(`Wrote ${out}`);
