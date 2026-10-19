// Synthesizes the cinematic score for DreamRaffleCine (32s), so there are no
// licensing concerns. No dependencies; writes a 16-bit stereo WAV.
//
//   node scripts/generate-dreamcine-score.mjs <out-dir>
//
// Sections (seconds, must match PARTS in src/DreamRaffleCine/index.tsx):
//   0 → 5     tension: low drone, muted pulse (rent)
//   5 → 19    the dream: warm strings, piano arpeggios, slow build
//   19 → 23   the cause: piano alone over a soft pad
//   23 → 27   urgency: string tremolo, accelerating timpani
//   27 → 32   climax: full strings, brass and timpani, then fade

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const TOTAL = 32;
const outDir = process.argv[2] ?? ".";
mkdirSync(outDir, { recursive: true });

let seed = 13579;
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

// Ensemble strings: detuned saws, slow attack, vibrato, low-pass.
const strings = (
  start,
  dur,
  notes,
  gain,
  cutoff = 0.05,
  attack = 0.8,
  trem = 0,
) => {
  const rel = 1.2;
  notes.forEach((note, k) => {
    const f = hz(note);
    const ph = [Math.abs(noise()), Math.abs(noise()), Math.abs(noise())];
    let lpL = 0;
    let lpR = 0;
    const s0 = Math.floor(start * SR);
    for (let j = 0; j < (dur + rel) * SR; j++) {
      const t = j / SR;
      let env =
        Math.min(1, t / attack) *
        (t > dur ? Math.max(0, 1 - (t - dur) / rel) : 1);
      if (trem) env *= 0.6 + 0.4 * Math.abs(Math.sin(Math.PI * trem * t));
      if (env <= 0) continue;
      const vib = 1 + 0.003 * Math.sin(2 * Math.PI * 5 * t + k);
      let l = 0;
      let r = 0;
      [0.996, 1, 1.004].forEach((d, v) => {
        ph[v] += (f * d * vib) / SR;
        const x = saw(ph[v]);
        if (v !== 2) l += x;
        if (v !== 0) r += x;
      });
      const c = typeof cutoff === "function" ? cutoff(start + t) : cutoff;
      lpL += c * (l - lpL);
      lpR += c * (r - lpR);
      add(s0 + j, lpL * env * gain, lpR * env * gain);
    }
  });
};

const piano = (start, note, gain, pan = 0) => {
  const f = hz(note);
  const s0 = Math.floor(start * SR);
  for (let j = 0; j < SR * 3; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 1.8) * Math.min(1, t / 0.004);
    const v =
      Math.sin(2 * Math.PI * f * t) +
      0.4 * Math.sin(2 * Math.PI * 2.001 * f * t) * Math.exp(-t * 2) +
      0.15 * Math.sin(2 * Math.PI * 3.003 * f * t) * Math.exp(-t * 4);
    add(
      s0 + j,
      v * env * gain * (1 - pan * 0.5),
      v * env * gain * (1 + pan * 0.5),
    );
  }
};

const timpani = (start, note, gain) => {
  const f = hz(note);
  const s0 = Math.floor(start * SR);
  let lp = 0;
  for (let j = 0; j < SR * 1.8; j++) {
    const t = j / SR;
    lp += 0.05 * (noise() - lp);
    const v =
      Math.sin(2 * Math.PI * f * (1 + 0.04 * Math.exp(-t * 20)) * t) *
        Math.exp(-t * 2.2) +
      lp * Math.exp(-t * 12) * 2;
    add(s0 + j, v * gain);
  }
};

// Deep "braam" hit for the climax.
const braam = (start, gain) => {
  strings(
    start,
    2.5,
    [26, 38, 45, 50],
    gain,
    (t) => 0.02 + 0.1 * Math.exp(-(t - start) * 1.5),
    0.02,
  );
  timpani(start, 38, gain * 6);
};

// 0–5: tension. D minor drone with a muted, heartbeat-like pulse.
strings(0, 5, [38, 45], 0.07, 0.025, 1.2);
for (let t = 0.2; t < 5; t += 0.8) timpani(t, 38, 0.18);

// 5–19: the dream. D – Bm – G – A, 3.5s each, filter opening as it builds.
const DREAM = [
  [38, [62, 66, 69]],
  [35, [62, 66, 71]],
  [31, [62, 67, 71]],
  [33, [61, 64, 69]],
];
DREAM.forEach(([bass, chord], i) => {
  const t0 = 5 + i * 3.5;
  strings(
    t0,
    3.5,
    [bass, bass + 12, ...chord],
    0.05,
    (t) => 0.03 + 0.05 * ((t - 5) / 14),
    0.9,
  );
  const arp = [
    chord[0],
    chord[1],
    chord[2],
    chord[0] + 12,
    chord[2],
    chord[1],
    chord[0] + 12,
    chord[2] + 12,
  ];
  arp.forEach((note, k) =>
    piano(t0 + k * 0.4375, note, 0.08, k % 2 ? 0.4 : -0.4),
  );
});

// 19–23: the cause. Piano alone over a soft pad.
strings(19, 4, [38, 50, 57], 0.035, 0.02, 1.5);
[
  [19, [62, 66, 69]],
  [21, [59, 62, 66]],
].forEach(([t0, chord]) =>
  chord.forEach((note, k) => piano(t0 + k * 0.12, note, 0.12)),
);
piano(22.4, 74, 0.1);

// 23–27: urgency. Tremolo strings and accelerating timpani.
strings(
  23,
  4,
  [33, 45, 57, 64],
  0.05,
  (t) => 0.03 + 0.08 * ((t - 23) / 4),
  0.4,
  8,
);
for (let t = 23; t < 27; ) {
  const p = (t - 23) / 4;
  timpani(t, 33, 0.12 + 0.3 * p * p);
  t += 0.5 - 0.38 * p;
}

// 27–32: climax. D major, full strings, brass-like stack, timpani.
braam(27, 0.06);
strings(27, 4.5, [38, 50, 62, 66, 69, 74, 78], 0.055, 0.12, 0.25);
strings(27, 4.5, [50, 57, 62], 0.05, (t) => 0.05 + 0.04 * Math.sin(t * 2), 0.2);
[27, 28, 29, 30].forEach((t, i) => timpani(t, i % 2 ? 45 : 38, 0.35));
[74, 78, 81, 86].forEach((note, k) => piano(27.5 + k * 0.5, note, 0.08));

// Reverb (small Schroeder) and write.
const verb = (input, offset) => {
  const combs = [1557, 1617, 1491, 1422].map((d) => ({
    buf: new Float32Array(Math.floor((d + offset) * 1.3)),
    i: 0,
    lp: 0,
  }));
  const aps = [225, 556].map((d) => ({
    buf: new Float32Array(d + offset),
    i: 0,
  }));
  const out = new Float32Array(input.length);
  for (let s = 0; s < input.length; s++) {
    let acc = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.lp = y * 0.7 + c.lp * 0.3;
      c.buf[c.i] = input[s] + c.lp * 0.84;
      c.i = (c.i + 1) % c.buf.length;
      acc += y;
    }
    acc *= 0.25;
    for (const a of aps) {
      const y = a.buf[a.i];
      a.buf[a.i] = acc + y * 0.5;
      a.i = (a.i + 1) % a.buf.length;
      acc = y - acc * 0.5;
    }
    out[s] = input[s] * 0.65 + acc * 0.35;
  }
  return out;
};
const l = verb(L, 0);
const r = verb(R, 23);
let peak = 0;
for (let i = 0; i < n; i++) {
  const fade =
    i > n - SR * 1.5 ? (n - i) / (SR * 1.5) : Math.min(1, i / (SR * 0.3));
  l[i] = Math.tanh(l[i]) * fade;
  r[i] = Math.tanh(r[i]) * fade;
  peak = Math.max(peak, Math.abs(l[i]), Math.abs(r[i]));
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
  buf.writeInt16LE(Math.round(l[i] * norm * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(r[i] * norm * 32767), 46 + i * 4);
}
writeFileSync(join(outDir, "score.wav"), buf);
console.log(`Wrote ${join(outDir, "score.wav")}`);
