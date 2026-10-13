// Synthesizes the score and sound effects for the DigitalMarketing videos,
// so there are no licensing concerns. No dependencies; writes 16-bit WAVs.
//
//   node scripts/generate-digital-audio.mjs <out-dir>
//
// Writes: music45.wav, music15.wav and the SFX
// (pop, whoosh, glitch, scratch, ring, ding, coins, click).
//
// Score layout (times must match src/DigitalMarketing/theme.ts):
//   0 → CHAOS            curious pizzicato plucks, light shaker     (C major)
//   CHAOS → TURN         same groove doubled up, detuned and noisy
//   TURN (+0.5s silence) warm ukulele-style groove with bass and kick

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const outDir = process.argv[2] ?? ".";
mkdirSync(outDir, { recursive: true });

let seed = 20261013;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 4294967296) * 2 - 1;
};
const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

const makeTrack = (seconds) => {
  const n = Math.floor(SR * seconds);
  return { n, l: new Float32Array(n), r: new Float32Array(n) };
};
const add = (tr, i, v, pan = 0) => {
  if (i >= 0 && i < tr.n) {
    tr.l[i] += v * (1 - Math.max(0, pan));
    tr.r[i] += v * (1 + Math.min(0, pan));
  }
};

const writeWav = (tr, name, { fadeOut = 0, peakTarget = 0.89 } = {}) => {
  let peak = 0;
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    const end = tr.n / SR;
    const g = fadeOut && t > end - fadeOut ? (end - t) / fadeOut : 1;
    tr.l[i] = Math.tanh(tr.l[i]) * g;
    tr.r[i] = Math.tanh(tr.r[i]) * g;
    peak = Math.max(peak, Math.abs(tr.l[i]), Math.abs(tr.r[i]));
  }
  const norm = peak > 0 ? peakTarget / peak : 1;
  const buf = Buffer.alloc(44 + tr.n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + tr.n * 4, 4);
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
  buf.writeUInt32LE(tr.n * 4, 40);
  for (let i = 0; i < tr.n; i++) {
    buf.writeInt16LE(Math.round(tr.l[i] * norm * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(tr.r[i] * norm * 32767), 46 + i * 4);
  }
  writeFileSync(join(outDir, name), buf);
  console.log(`Wrote ${join(outDir, name)}`);
};

// ---------------------------------------------------------------------------
// Instruments
// ---------------------------------------------------------------------------

// Karplus-Strong plucked string (ukulele / pizzicato).
const pluck = (
  tr,
  t,
  midi,
  gain,
  { pan = 0, decay = 0.996, len = 1.2, detune = 1 } = {},
) => {
  const f = midiToHz(midi) * detune;
  const period = Math.max(2, Math.round(SR / f));
  const buf = new Float32Array(period);
  for (let k = 0; k < period; k++) buf[k] = noise();
  const s0 = Math.floor(t * SR);
  let idx = 0;
  let prev = 0;
  for (let j = 0; j < len * SR; j++) {
    const y = buf[idx];
    const next = decay * 0.5 * (y + prev);
    prev = y;
    buf[idx] = next;
    idx = (idx + 1) % period;
    add(tr, s0 + j, y * gain, pan);
  }
};

const bass = (tr, t, midi, dur, gain) => {
  const f = midiToHz(midi);
  const s0 = Math.floor(t * SR);
  for (let j = 0; j < dur * SR; j++) {
    const tt = j / SR;
    const env = Math.min(1, tt / 0.01) * Math.exp(-tt * 2.2);
    const x =
      Math.sin(2 * Math.PI * f * tt) + 0.3 * Math.sin(4 * Math.PI * f * tt);
    add(tr, s0 + j, x * env * gain);
  }
};

const kick = (tr, t, gain) => {
  const s0 = Math.floor(t * SR);
  let ph = 0;
  for (let j = 0; j < 0.35 * SR; j++) {
    const tt = j / SR;
    ph += (45 + 110 * Math.exp(-tt * 30)) / SR;
    add(tr, s0 + j, Math.sin(2 * Math.PI * ph) * Math.exp(-tt * 9) * gain);
  }
};

const shaker = (tr, t, gain, pan = 0.3) => {
  const s0 = Math.floor(t * SR);
  let lp = 0;
  for (let j = 0; j < 0.07 * SR; j++) {
    const tt = j / SR;
    const x = noise();
    lp += 0.5 * (x - lp);
    add(tr, s0 + j, (x - lp) * Math.exp(-tt * 60) * gain, pan);
  }
};

const clap = (tr, t, gain) => {
  const s0 = Math.floor(t * SR);
  let lp = 0;
  for (let j = 0; j < 0.18 * SR; j++) {
    const tt = j / SR;
    const x = noise();
    lp += 0.3 * (x - lp);
    const burst = tt < 0.03 ? (Math.floor(tt / 0.01) % 2 ? 0.6 : 1) : 1;
    add(tr, s0 + j, (x - lp) * Math.exp(-tt * 22) * gain * burst);
  }
};

// ---------------------------------------------------------------------------
// Score
// ---------------------------------------------------------------------------

const BPM = 112;
const BEAT = 60 / BPM;
// C – Am – F – G, one bar each. [bass root, chord tones]
const PROGRESSION = [
  [36, [60, 64, 67, 72]],
  [33, [57, 60, 64, 69]],
  [29, [57, 60, 65, 69]],
  [31, [59, 62, 67, 71]],
];

const score = (total, chaos, turn) => {
  const tr = makeTrack(total);
  const warm = turn + 0.5; // a beat of silence after the record scratch
  for (let beat = 0; beat * BEAT < total; beat++) {
    const t = beat * BEAT;
    const bar = Math.floor(beat / 4);
    const [root, chord] = PROGRESSION[bar % 4];
    if (t < chaos) {
      // Curious: staccato pizzicato on the off-beats, sparse shaker.
      pluck(tr, t, chord[beat % 4] + 12, 0.22, {
        pan: beat % 2 ? 0.3 : -0.3,
        decay: 0.985,
        len: 0.4,
      });
      if (beat % 2 === 1)
        pluck(tr, t + BEAT / 2, chord[(beat + 2) % 4], 0.14, {
          decay: 0.985,
          len: 0.3,
        });
      if (beat % 4 === 0) bass(tr, t, root + 12, BEAT * 0.9, 0.18);
      shaker(tr, t + BEAT / 2, 0.08);
    } else if (t < turn) {
      // Chaos: doubled tempo, wobbly detune, glitchy noise bursts.
      for (let k = 0; k < 4; k++) {
        const wob = 1 + 0.03 * Math.sin(beat * 2.1 + k);
        pluck(
          tr,
          t + (k * BEAT) / 4,
          chord[(k + beat) % 4] + 12 + (k % 2) * 7,
          0.16,
          {
            pan: k % 2 ? 0.6 : -0.6,
            decay: 0.98,
            len: 0.25,
            detune: wob,
          },
        );
        shaker(tr, t + (k * BEAT) / 4, 0.12, k % 2 ? -0.5 : 0.5);
      }
      kick(tr, t, 0.35);
      bass(tr, t, root + 12 + (beat % 2) * 1, BEAT * 0.5, 0.16);
    } else if (t >= warm) {
      // Warm groove: ukulele strum, bass, kick on 1 & 3, clap on 2 & 4.
      chord.forEach((n, k) =>
        pluck(tr, t + k * 0.012, n, 0.11, { pan: -0.2 + k * 0.12 }),
      );
      pluck(tr, t + BEAT / 2, chord[3] + 12, 0.08, { pan: 0.35, len: 0.6 });
      if (beat % 2 === 0) kick(tr, t, 0.45);
      else clap(tr, t, 0.12);
      bass(tr, t, root + 12, BEAT * 0.95, beat % 4 === 0 ? 0.26 : 0.18);
      shaker(tr, t + BEAT / 2, 0.07);
    }
  }
  return tr;
};

// Must match SCENE starts in src/DigitalMarketing/theme.ts (seconds).
writeWav(score(45, 12, 20), "music45.wav", { fadeOut: 1.5 });
writeWav(score(15, 0, 3), "music15.wav", { fadeOut: 1.0 });

// ---------------------------------------------------------------------------
// SFX
// ---------------------------------------------------------------------------

const sfx = (seconds, fn, name) => {
  const tr = makeTrack(seconds);
  for (let i = 0; i < tr.n; i++) fn(tr, i, i / SR);
  writeWav(tr, name, { peakTarget: 0.8 });
};

let ph = 0;
sfx(
  0.18,
  (tr, i, t) => {
    ph += (380 + 900 * (t / 0.18)) / SR;
    add(tr, i, Math.sin(2 * Math.PI * ph) * Math.exp(-t * 28));
  },
  "pop.wav",
);

let lpW = 0;
sfx(
  0.7,
  (tr, i, t) => {
    const c = 0.02 + 0.25 * Math.sin((Math.PI * t) / 0.7);
    lpW += c * (noise() - lpW);
    add(
      tr,
      i,
      lpW * Math.sin((Math.PI * t) / 0.7) ** 2,
      Math.cos((Math.PI * t) / 0.7) * 0.6,
    );
  },
  "whoosh.wav",
);

sfx(
  0.35,
  (tr, i, t) => {
    const step = Math.floor(t * 40);
    const f = [220, 1760, 440, 3520, 330, 880][step % 6];
    const sq = Math.sign(Math.sin(2 * Math.PI * f * t));
    add(tr, i, (sq * 0.5 + noise() * 0.5) * (step % 3 === 1 ? 0.2 : 1) * 0.6);
  },
  "glitch.wav",
);

ph = 0;
let lpS = 0;
sfx(
  0.55,
  (tr, i, t) => {
    // Record scratch: a fast pitch wobble on a buzzy, band-limited tone.
    const f =
      180 + 900 * Math.abs(Math.sin(2 * Math.PI * 3.2 * t)) * (1 - t / 0.55);
    ph += f / SR;
    const x = 2 * (ph - Math.floor(ph + 0.5)) + noise() * 0.6;
    lpS += 0.35 * (x - lpS);
    add(tr, i, lpS * Math.min(1, t / 0.01) * (1 - t / 0.55));
  },
  "scratch.wav",
);

sfx(
  1.3,
  (tr, i, t) => {
    const on = t % 0.65 < 0.5;
    const trem = Math.sign(Math.sin(2 * Math.PI * 20 * t)) * 0.3 + 0.7;
    const x = Math.sin(2 * Math.PI * 440 * t) + Math.sin(2 * Math.PI * 480 * t);
    add(tr, i, on ? x * trem * 0.4 : 0);
  },
  "ring.wav",
);

sfx(
  1.2,
  (tr, i, t) => {
    const x = [1, 2.76, 5.4].reduce(
      (s, m, k) =>
        s +
        (Math.sin(2 * Math.PI * 1318.5 * m * t) * Math.exp(-t * (3 + k * 3))) /
          (k + 1),
      0,
    );
    add(tr, i, x * 0.6);
  },
  "ding.wav",
);

sfx(
  0.6,
  (tr, i, t) => {
    // Coins: a few bright metallic pings.
    [0, 0.08, 0.17].forEach((d, k) => {
      const tt = t - d;
      if (tt < 0) return;
      const f = [2637, 3136, 3520][k];
      add(
        tr,
        i,
        (Math.sin(2 * Math.PI * f * tt) +
          0.5 * Math.sin(2 * Math.PI * f * 2.41 * tt)) *
          Math.exp(-tt * 14) *
          0.45,
      );
    });
  },
  "coins.wav",
);

sfx(
  0.06,
  (tr, i, t) => {
    add(
      tr,
      i,
      noise() * Math.exp(-t * 120) +
        Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t * 90),
    );
  },
  "click.wav",
);
