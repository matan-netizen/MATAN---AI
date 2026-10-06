// Synthesizes an original 48s background track for OfficeAIDemo. Same
// engine as generate-uziel-music.mjs (120 BPM, C major); whooshes on the
// scene cuts, drums from the first cut, and a riser into the end card.
//
//   node scripts/generate-office-demo-music.mjs out/office-demo-music.wav

import { writeFileSync } from "node:fs";

const SR = 44100;
const DURATION = 48;
const BPM = 120;
const BEAT = 60 / BPM;
const N = SR * DURATION;
const TRANSITIONS = [5, 11, 16, 22, 32, 37, 43];
const CTA = 43;
const DRUMS_IN = 5;

const left = new Float32Array(N);
const right = new Float32Array(N);

// Deterministic noise so the track is identical on every run.
let seed = 1234567;
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

// C – G – Am – F, one chord per bar.
const CHORDS = [
  [60, 64, 67],
  [59, 62, 67],
  [57, 60, 64],
  [57, 60, 65],
];
const BASS = [36, 31, 33, 29];
const chordAt = (t) => Math.floor(t / (BEAT * 4)) % 4;

// Sidechain envelope: duck pads/bass right after each kick.
const duck = (t) => {
  if (t < DRUMS_IN) return 1;
  const sinceKick = t % BEAT;
  return 0.35 + 0.65 * Math.min(1, sinceKick / 0.22);
};

// --- Kick on every beat ---
for (let b = DRUMS_IN / BEAT; b * BEAT < DURATION; b++) {
  const start = Math.floor(b * BEAT * SR);
  let phase = 0;
  for (let j = 0; j < SR * 0.35; j++) {
    const t = j / SR;
    const freq = 50 + 110 * Math.exp(-t * 30);
    phase += freq / SR;
    const env = Math.exp(-t * 9);
    add(start + j, Math.sin(2 * Math.PI * phase) * env * 0.9);
  }
}

// --- Clap on beats 2 and 4 (noise burst through a crude band-pass) ---
for (let b = DRUMS_IN / BEAT + 1; b * BEAT < DURATION; b += 2) {
  const start = Math.floor(b * BEAT * SR);
  let lp = 0;
  for (let j = 0; j < SR * 0.2; j++) {
    const t = j / SR;
    const n = noise();
    lp += 0.35 * (n - lp);
    const env = Math.exp(-t * 22) * (t < 0.01 ? t / 0.01 : 1);
    add(start + j, (n - lp) * env * 0.35, (n - lp) * env * 0.3);
  }
}

// --- Hi-hats on 8th-note off-beats, 16ths in the last scene ---
for (let s = 0; s * (BEAT / 4) < DURATION; s++) {
  const t0 = s * (BEAT / 4);
  const isOffbeat8th = s % 4 === 2;
  const is16th = t0 >= CTA && s % 2 === 1;
  if (t0 < DRUMS_IN || (!isOffbeat8th && !is16th)) continue;
  const start = Math.floor(t0 * SR);
  let prev = 0;
  const gain = isOffbeat8th ? 0.16 : 0.08;
  for (let j = 0; j < SR * 0.06; j++) {
    const n = noise();
    const hp = n - prev;
    prev = n;
    const env = Math.exp((-j / SR) * 70);
    add(start + j, hp * env * gain * 0.8, hp * env * gain);
  }
}

// --- Bass: 8th-note pulse on the chord root, low-passed saw ---
{
  let phase = 0;
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const freq = midiToHz(BASS[chordAt(t)]);
    phase += freq / SR;
    const raw = saw(phase) * 0.7 + Math.sin(2 * Math.PI * phase) * 0.5;
    lp += 0.06 * (raw - lp);
    const in8th = t % (BEAT / 2);
    const env = Math.exp(-in8th * 5) * Math.min(1, in8th / 0.005);
    add(i, lp * env * 0.32 * duck(t) * Math.min(1, t / DRUMS_IN));
  }
}

// --- Pad: detuned saw chords, slightly wide, sidechained ---
{
  const phases = new Array(6).fill(0);
  let lpL = 0;
  let lpR = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const chord = CHORDS[chordAt(t)];
    let l = 0;
    let r = 0;
    chord.forEach((note, k) => {
      const f = midiToHz(note);
      phases[k * 2] += (f * 1.004) / SR;
      phases[k * 2 + 1] += (f * 0.996) / SR;
      l += saw(phases[k * 2]);
      r += saw(phases[k * 2 + 1]);
    });
    // Filter opens up as the video builds towards the CTA.
    const cutoff = 0.03 + 0.05 * Math.min(1, t / CTA);
    lpL += cutoff * (l - lpL);
    lpR += cutoff * (r - lpR);
    const g = 0.07 * duck(t);
    add(i, lpL * g, lpR * g);
  }
}

// --- Pluck arpeggio (16ths over chord tones) ---
for (let s = 0; s * (BEAT / 4) < DURATION; s++) {
  const t0 = s * (BEAT / 4);
  const chord = CHORDS[chordAt(t0)];
  const pattern = [0, 1, 2, 1];
  const note = chord[pattern[s % 4]] + 12;
  const f = midiToHz(note);
  const start = Math.floor(t0 * SR);
  const pan = s % 2 === 0 ? 0.7 : 1.0;
  for (let j = 0; j < SR * 0.18; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 18);
    const v =
      (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) *
      env *
      0.07;
    add(start + j, v * pan, v * (1.7 - pan));
  }
}

// --- Whoosh into each transition (noise swell with a rising filter) ---
for (const tc of TRANSITIONS) {
  const len = 0.6;
  const start = Math.floor((tc - 0.35) * SR);
  let lp = 0;
  for (let j = 0; j < SR * len; j++) {
    const p = j / (SR * len);
    const env = Math.sin(Math.PI * p) ** 2;
    lp += (0.02 + 0.3 * p) * (noise() - lp);
    add(
      start + j,
      lp * env * 0.5 * (1 - p * 0.5),
      lp * env * 0.5 * (0.5 + p * 0.5),
    );
  }
}

// --- Riser into the CTA ---
{
  const len = 1.5;
  const start = Math.floor((CTA - len) * SR);
  let phase = 0;
  for (let j = 0; j < SR * len; j++) {
    const p = j / (SR * len);
    phase += (200 + 1400 * p * p) / SR;
    const v = saw(phase) * p * p * 0.08 + noise() * p * p * 0.06;
    add(start + j, v);
  }
}

// --- Impacts: opening hit and CTA drop ---
for (const tc of [0, CTA]) {
  const start = Math.floor(tc * SR);
  let phase = 0;
  let lp = 0;
  for (let j = 0; j < SR * 1.2; j++) {
    const t = j / SR;
    phase += (40 + 60 * Math.exp(-t * 8)) / SR;
    lp += 0.1 * (noise() - lp);
    const v =
      Math.sin(2 * Math.PI * phase) * Math.exp(-t * 3) * 0.8 +
      lp * Math.exp(-t * 6) * 0.6;
    add(start + j, v);
  }
}

// --- Master: fade out, soft clip, normalize, write WAV ---
const fadeOut = 1.5;
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const g = t > DURATION - fadeOut ? (DURATION - t) / fadeOut : 1;
  left[i] = Math.tanh(left[i] * 1.2) * g;
  right[i] = Math.tanh(right[i] * 1.2) * g;
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
}
const norm = 0.89 / peak;

const out = process.argv[2] ?? "office-demo-music.wav";
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
console.log(`Wrote ${out}`);
