// Synthesizes an original festive background track for DreamRaffle: a
// simcha-style "oom-pah" groove in D freygish with a clarinet-like lead.
// No dependencies; writes a WAV. Scene cuts (whooshes) and the end-card
// drop are read from src/DreamRaffle/voiceover.json so they stay in sync.
//
//   node scripts/generate-raffle-music.mjs out.wav
import { readFileSync, writeFileSync } from "node:fs";

// Same timing rules as src/DreamRaffle/theme.ts.
const FPS = 30;
const LEAD = 0.35;
const TAIL = 0.45;
const END_HOLD = 2.5;
const { lines } = JSON.parse(
  readFileSync("src/DreamRaffle/voiceover.json", "utf8"),
);
const CUTS = [];
let frames = 0;
lines.forEach(({ seconds }, i) => {
  const isLast = i === lines.length - 1;
  frames += Math.ceil((LEAD + seconds + (isLast ? END_HOLD : TAIL)) * FPS);
  if (!isLast) CUTS.push(frames / FPS);
});
const DURATION = frames / FPS;
const CTA = CUTS[CUTS.length - 1];

const SR = 44100;
const BPM = 140;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const N = Math.ceil(SR * DURATION);

const left = new Float32Array(N);
const right = new Float32Array(N);

// Deterministic noise so the track is identical on every run.
let seed = 7654321;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 4294967296) * 2 - 1;
};
const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const saw = (phase) => 2 * (phase - Math.floor(phase + 0.5));
const add = (i, l, r = l) => {
  if (i >= 0 && i < N) {
    left[i] += l;
    right[i] += r;
  }
};

// D – Gm – Cm – D, one chord per bar (the classic freygish turn).
const CHORDS = [
  [57, 62, 66],
  [55, 58, 62],
  [55, 60, 63],
  [57, 62, 66],
];
const ROOTS = [38, 43, 36, 38];
const chordAt = (t) => Math.floor(t / BAR) % 4;

// D freygish: D Eb F# G A Bb C D.
const SCALE = [62, 63, 66, 67, 69, 70, 72, 74, 75, 78];
// Eight 8th-notes per bar, scale indices (-1 = rest), one row per chord.
const MELODY = [
  [4, 4, 3, 2, 1, 2, 0, -1],
  [3, 5, 4, 3, 2, 3, 4, -1],
  [6, 6, 5, 4, 5, 4, 3, 2],
  [1, 2, 3, 2, 1, 0, 0, -1],
  [7, 7, 6, 5, 4, 5, 6, -1],
  [5, 7, 6, 5, 4, 3, 4, -1],
  [6, 8, 7, 6, 5, 4, 3, 2],
  [1, 2, 3, 4, 2, 1, 0, -1],
];

// Sidechain: duck the bed right after each kick.
const duck = (t) => 0.4 + 0.6 * Math.min(1, (t % (BEAT * 2)) / 0.25);

// --- Kick on beats 1 and 3, clap on 2 and 4 (the oom-pah backbone) ---
for (let b = 0; b * BEAT < DURATION; b++) {
  const start = Math.floor(b * BEAT * SR);
  if (b % 2 === 0) {
    let phase = 0;
    for (let j = 0; j < SR * 0.3; j++) {
      const t = j / SR;
      phase += (55 + 100 * Math.exp(-t * 30)) / SR;
      add(start + j, Math.sin(2 * Math.PI * phase) * Math.exp(-t * 10) * 0.55);
    }
  } else {
    let lp = 0;
    for (let j = 0; j < SR * 0.18; j++) {
      const t = j / SR;
      const n = noise();
      lp += 0.35 * (n - lp);
      const env = Math.exp(-t * 24) * Math.min(1, t / 0.004);
      add(start + j, (n - lp) * env * 0.3, (n - lp) * env * 0.26);
    }
  }
}

// --- Tambourine on every 8th, accented on the off-beats ---
for (let s = 0; s * (BEAT / 2) < DURATION; s++) {
  const start = Math.floor(s * (BEAT / 2) * SR);
  const gain = s % 2 === 1 ? 0.09 : 0.045;
  let prev = 0;
  for (let j = 0; j < SR * 0.08; j++) {
    const n = noise();
    const hp = n - prev;
    prev = n;
    const env = Math.exp((-j / SR) * 45);
    add(start + j, hp * env * gain, hp * env * gain * 0.8);
  }
}

// --- Bass: root on 1, fifth on 3 ("oom"), plucky low-passed saw ---
for (let b = 0; b * BEAT < DURATION; b += 2) {
  const t0 = b * BEAT;
  const root = ROOTS[chordAt(t0)];
  const note = b % 4 === 0 ? root : root + 7;
  const f = midiToHz(note);
  const start = Math.floor(t0 * SR);
  let phase = 0;
  let lp = 0;
  for (let j = 0; j < SR * BEAT * 1.6; j++) {
    const t = j / SR;
    phase += f / SR;
    const raw = saw(phase) * 0.6 + Math.sin(2 * Math.PI * phase) * 0.7;
    lp += 0.08 * (raw - lp);
    add(start + j, lp * Math.exp(-t * 3.5) * 0.4);
  }
}

// --- Chord stabs on 2 and 4 ("pah"), accordion-ish detuned saws ---
for (let b = 1; b * BEAT < DURATION; b += 2) {
  const t0 = b * BEAT;
  const chord = CHORDS[chordAt(t0)];
  const start = Math.floor(t0 * SR);
  const phases = new Array(chord.length * 2).fill(0);
  let lpL = 0;
  let lpR = 0;
  for (let j = 0; j < SR * BEAT * 0.7; j++) {
    const t = j / SR;
    let l = 0;
    let r = 0;
    chord.forEach((note, k) => {
      const f = midiToHz(note);
      phases[k * 2] += (f * 1.005) / SR;
      phases[k * 2 + 1] += (f * 0.995) / SR;
      l += saw(phases[k * 2]);
      r += saw(phases[k * 2 + 1]);
    });
    lpL += 0.12 * (l - lpL);
    lpR += 0.12 * (r - lpR);
    const env = Math.exp(-t * 7) * Math.min(1, t / 0.01);
    add(start + j, lpL * env * 0.07, lpR * env * 0.07);
  }
}

// --- Soft pad underneath, opening up towards the end card ---
{
  const phases = new Array(3).fill(0);
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let v = 0;
    CHORDS[chordAt(t)].forEach((note, k) => {
      phases[k] += midiToHz(note - 12) / SR;
      v += Math.sin(2 * Math.PI * phases[k]);
    });
    lp += 0.2 * (v - lp);
    const g = (0.025 + 0.025 * Math.min(1, t / CTA)) * duck(t);
    add(i, lp * g);
  }
}

// --- Clarinet-like lead: odd harmonics, vibrato, a little scoop ---
// It plays every other 8-bar phrase so the narration has room, and fully
// over the end card.
for (let s = 0; s * (BEAT / 2) < DURATION; s++) {
  const t0 = s * (BEAT / 2);
  const bar = Math.floor(t0 / BAR);
  const phrase = Math.floor(bar / 8);
  if (t0 < CTA && phrase % 2 === 1) continue;
  const idx = MELODY[bar % 8][s % 8];
  if (idx < 0) continue;
  const f = midiToHz(SCALE[idx]);
  const start = Math.floor(t0 * SR);
  const len = BEAT / 2;
  const gain = t0 >= CTA ? 0.11 : 0.06;
  let phase = 0;
  let lp = 0;
  for (let j = 0; j < SR * len * 1.05; j++) {
    const t = j / SR;
    const scoop = 1 - 0.03 * Math.exp(-t * 40);
    const vib = 1 + 0.006 * Math.sin(2 * Math.PI * 5.5 * t);
    phase += (f * scoop * vib) / SR;
    const p = 2 * Math.PI * phase;
    const raw = Math.sin(p) + 0.45 * Math.sin(3 * p) + 0.2 * Math.sin(5 * p);
    lp += 0.25 * (raw - lp);
    const env = Math.min(1, t / 0.015) * Math.min(1, (len * 1.05 - t) / 0.03);
    add(start + j, lp * env * gain * 0.9, lp * env * gain);
  }
}

// --- Whoosh into each scene cut ---
for (const tc of CUTS) {
  const len = 0.55;
  const start = Math.floor((tc - 0.35) * SR);
  let lp = 0;
  for (let j = 0; j < SR * len; j++) {
    const p = j / (SR * len);
    const env = Math.sin(Math.PI * p) ** 2;
    lp += (0.02 + 0.3 * p) * (noise() - lp);
    add(
      start + j,
      lp * env * 0.4 * (1 - p * 0.5),
      lp * env * 0.4 * (0.5 + p * 0.5),
    );
  }
}

// --- Riser into the end card, then a festive hit ---
{
  const len = 1.4;
  const start = Math.floor((CTA - len) * SR);
  let phase = 0;
  for (let j = 0; j < SR * len; j++) {
    const p = j / (SR * len);
    phase += (220 + 1300 * p * p) / SR;
    add(start + j, saw(phase) * p * p * 0.06 + noise() * p * p * 0.05);
  }
}
for (const tc of [0, CTA]) {
  const start = Math.floor(tc * SR);
  let phase = 0;
  let lp = 0;
  for (let j = 0; j < SR * 1.0; j++) {
    const t = j / SR;
    phase += (45 + 60 * Math.exp(-t * 8)) / SR;
    lp += 0.12 * (noise() - lp);
    add(
      start + j,
      Math.sin(2 * Math.PI * phase) * Math.exp(-t * 3) * 0.7 +
        lp * Math.exp(-t * 6) * 0.5,
    );
  }
}

// --- Master: fade in/out, soft clip, normalize, write WAV ---
const fadeOut = 1.5;
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const g = Math.min(1, t / 0.05, (DURATION - t) / fadeOut);
  left[i] = Math.tanh(left[i] * 1.2) * Math.max(0, g);
  right[i] = Math.tanh(right[i] * 1.2) * Math.max(0, g);
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
}
const norm = 0.89 / peak;

const out = process.argv[2] ?? "raffle-music.wav";
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
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
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(left[i] * norm * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(right[i] * norm * 32767), 46 + i * 4);
}
writeFileSync(out, buf);
console.log(`Wrote ${out} (${DURATION.toFixed(2)}s)`);
