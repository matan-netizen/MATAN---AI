// Synthesizes the original score and sound effects for InvestorPromo, so
// there are no licensing concerns. No dependencies; writes 16-bit WAVs.
//
//   node scripts/generate-investor-audio.mjs <out-dir>
//
// Writes: music.wav, pencil.wav, paper.wav, cup.wav, ping.wav, check.wav
//
// Score: premium business beat, 120 BPM in F minor (one bar = 2s).
//   0 → 4s     pads + pluck intro, filter closed
//   4 → 27s    full groove (kick, clap, hats, bass, pluck)
//   27 → 32s   build: riser, 16th hats, filter opens
//   32s → end  drop on the end card, fade out over the last 2s

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const outDir = process.argv[2] ?? ".";
mkdirSync(outDir, { recursive: true });

// Must match src/InvestorPromo/theme.ts (seconds).
const TOTAL = 38;
const TRANSITIONS = [8, 17, 27];
const DROP = 32.3; // end card

const BPM = 120;
const BEAT = 60 / BPM;
const GROOVE_START = 4;
const BUILD_START = 27;

let seed = 24681357;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 4294967296) * 2 - 1;
};
const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const saw = (p) => 2 * (p - Math.floor(p + 0.5));

const makeTrack = (seconds) => {
  const n = Math.floor(SR * seconds);
  return { n, l: new Float32Array(n), r: new Float32Array(n) };
};
const add = (tr, i, l, r = l) => {
  if (i >= 0 && i < tr.n) {
    tr.l[i] += l;
    tr.r[i] += r;
  }
};

// Small Schroeder reverb (4 combs + 2 all-passes per channel).
const reverb = (tr, mix, size = 1) => {
  const process = (input, offset) => {
    const combs = [1557, 1617, 1491, 1422].map((d) => ({
      buf: new Float32Array(Math.floor((d + offset) * size)),
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
      out[s] = input[s] * (1 - mix) + acc * mix;
    }
    return out;
  };
  tr.l = process(tr.l, 0);
  tr.r = process(tr.r, 23);
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
// Music
// ---------------------------------------------------------------------------

{
  const tr = makeTrack(TOTAL);
  // Fm – Db – Ab – Eb, one chord per bar.
  const CHORDS = [
    [65, 68, 72],
    [61, 65, 68],
    [63, 68, 72],
    [63, 67, 70],
  ];
  const BASS = [41, 37, 44, 39];
  const chordAt = (t) => Math.floor(t / (BEAT * 4)) % 4;
  const grooveOn = (t) => t >= GROOVE_START;
  // Sidechain: duck pads/bass right after each kick once the groove is on.
  const duck = (t) =>
    grooveOn(t) ? 0.35 + 0.65 * Math.min(1, (t % BEAT) / 0.22) : 1;
  // Overall energy: lifts through the build, peaks on the drop.
  const energy = (t) =>
    t < BUILD_START
      ? 0.8
      : t < DROP
        ? 0.8 + 0.2 * ((t - BUILD_START) / (DROP - BUILD_START))
        : 1;

  // Kick on every beat (skips the bar before the drop for a gap).
  for (let b = 0; b * BEAT < TOTAL; b++) {
    const t0 = b * BEAT;
    if (!grooveOn(t0) || (t0 > DROP - 1.0 && t0 < DROP - 0.05)) continue;
    const s0 = Math.floor(t0 * SR);
    let ph = 0;
    for (let j = 0; j < SR * 0.35; j++) {
      const t = j / SR;
      ph += (48 + 120 * Math.exp(-t * 32)) / SR;
      add(tr, s0 + j, Math.sin(2 * Math.PI * ph) * Math.exp(-t * 9) * 0.85);
    }
  }

  // Clap on 2 and 4.
  for (let b = 1; b * BEAT < TOTAL; b += 2) {
    const t0 = b * BEAT;
    if (!grooveOn(t0) || (t0 > DROP - 1.0 && t0 < DROP)) continue;
    const s0 = Math.floor(t0 * SR);
    let lp = 0;
    for (let j = 0; j < SR * 0.22; j++) {
      const t = j / SR;
      const n = noise();
      lp += 0.35 * (n - lp);
      const env = Math.exp(-t * 20) * Math.min(1, t / 0.008);
      add(tr, s0 + j, (n - lp) * env * 0.3, (n - lp) * env * 0.26);
    }
  }

  // Hats: off-beat 8ths, 16ths in the build and after the drop.
  for (let s = 0; s * (BEAT / 4) < TOTAL; s++) {
    const t0 = s * (BEAT / 4);
    if (!grooveOn(t0)) continue;
    const off8 = s % 4 === 2;
    const dense = t0 >= BUILD_START && s % 2 === 1;
    if (!off8 && !dense) continue;
    const s0 = Math.floor(t0 * SR);
    let prev = 0;
    const gain = off8 ? 0.14 : 0.07;
    for (let j = 0; j < SR * 0.05; j++) {
      const n = noise();
      const hp = n - prev;
      prev = n;
      const env = Math.exp((-j / SR) * 75);
      add(tr, s0 + j, hp * env * gain * 0.8, hp * env * gain);
    }
  }

  // Bass: 8th-note pulse on the root, low-passed saw + sine.
  {
    let ph = 0;
    let lp = 0;
    for (let i = 0; i < tr.n; i++) {
      const t = i / SR;
      if (!grooveOn(t)) continue;
      ph += midiToHz(BASS[chordAt(t)] - 12) / SR;
      const raw = saw(ph) * 0.6 + Math.sin(2 * Math.PI * ph) * 0.6;
      lp += 0.05 * (raw - lp);
      const in8 = t % (BEAT / 2);
      const env = Math.exp(-in8 * 4) * Math.min(1, in8 / 0.005);
      add(tr, i, lp * env * 0.34 * duck(t) * energy(t));
    }
  }

  // Pad: wide detuned saw chords; the filter opens across the video.
  {
    const phases = new Array(6).fill(0);
    let lpL = 0;
    let lpR = 0;
    for (let i = 0; i < tr.n; i++) {
      const t = i / SR;
      const chord = CHORDS[chordAt(t)];
      let l = 0;
      let r = 0;
      chord.forEach((note, k) => {
        const f = midiToHz(note - 12);
        phases[k * 2] += (f * 1.005) / SR;
        phases[k * 2 + 1] += (f * 0.995) / SR;
        l += saw(phases[k * 2]);
        r += saw(phases[k * 2 + 1]);
      });
      const cutoff = 0.02 + 0.06 * Math.min(1, t / DROP);
      lpL += cutoff * (l - lpL);
      lpR += cutoff * (r - lpR);
      const g = 0.075 * duck(t) * Math.min(1, t / 1.5);
      add(tr, i, lpL * g, lpR * g);
    }
  }

  // Bell pluck arpeggio, 16ths over chord tones.
  for (let s = 0; s * (BEAT / 4) < TOTAL; s++) {
    const t0 = s * (BEAT / 4);
    const chord = CHORDS[chordAt(t0)];
    const note = chord[[0, 1, 2, 1, 2, 0, 1, 2][s % 8]] + 12;
    const f = midiToHz(note);
    const s0 = Math.floor(t0 * SR);
    const pan = s % 2 === 0 ? 0.65 : 1.05;
    const gain = t0 < GROOVE_START ? 0.05 : 0.06;
    for (let j = 0; j < SR * 0.25; j++) {
      const t = j / SR;
      const env = Math.exp(-t * 14);
      const v =
        (Math.sin(2 * Math.PI * f * t) +
          0.35 * Math.sin(2 * Math.PI * f * 3.01 * t) * Math.exp(-t * 20)) *
        env *
        gain;
      add(tr, s0 + j, v * pan, v * (1.7 - pan));
    }
  }

  // Whoosh into each scene change.
  for (const tc of TRANSITIONS) {
    const len = 0.7;
    const s0 = Math.floor((tc - 0.45) * SR);
    let lp = 0;
    for (let j = 0; j < SR * len; j++) {
      const p = j / (SR * len);
      const env = Math.sin(Math.PI * p) ** 2;
      lp += (0.02 + 0.3 * p) * (noise() - lp);
      add(
        tr,
        s0 + j,
        lp * env * 0.45 * (1 - p * 0.5),
        lp * env * 0.45 * (0.5 + p * 0.5),
      );
    }
  }

  // Riser into the drop.
  {
    const len = DROP - BUILD_START;
    const s0 = Math.floor(BUILD_START * SR);
    let ph = 0;
    let lp = 0;
    for (let j = 0; j < SR * len; j++) {
      const p = j / (SR * len);
      ph += (180 + 1200 * p * p) / SR;
      lp += (0.02 + 0.4 * p) * (noise() - lp);
      const v = (saw(ph) * 0.05 + lp * 0.25) * p * p * p;
      add(tr, s0 + j, v, v * 0.9);
    }
  }

  // Impacts: soft opening hit and the drop.
  for (const [tc, gain] of [
    [0, 0.5],
    [DROP, 0.9],
  ]) {
    const s0 = Math.floor(tc * SR);
    let ph = 0;
    let lp = 0;
    for (let j = 0; j < SR * 1.4; j++) {
      const t = j / SR;
      ph += (38 + 70 * Math.exp(-t * 7)) / SR;
      lp += 0.05 * (noise() - lp);
      const env = Math.exp(-t * 2.6);
      add(tr, s0 + j, (Math.sin(2 * Math.PI * ph) + lp * 2) * env * gain);
    }
  }

  reverb(tr, 0.18, 1.1);
  writeWav(tr, "music.wav", { fadeOut: 2 });
}

// ---------------------------------------------------------------------------
// SFX
// ---------------------------------------------------------------------------

// Band-passed noise helper: one-pole high-pass then low-pass.
const bandNoise = () => {
  let hpPrev = 0;
  let lp = 0;
  return (hpCoef, lpCoef) => {
    const n = noise();
    const hp = n - hpPrev * hpCoef;
    hpPrev = n;
    lp += lpCoef * (hp - lp);
    return lp;
  };
};

// Pencil writing on paper: a few scratchy strokes.
{
  const tr = makeTrack(1.8);
  const bn = bandNoise();
  const strokes = [
    [0.0, 0.22],
    [0.28, 0.16],
    [0.5, 0.3],
    [0.9, 0.14],
    [1.1, 0.35],
  ];
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    const s = strokes.find(([a, d]) => t >= a && t < a + d);
    const v = bn(0.98, 0.45);
    if (!s) continue;
    const p = (t - s[0]) / s[1];
    // Grainy texture: fast amplitude flutter like graphite on paper.
    const grain =
      0.6 + 0.4 * Math.abs(Math.sin(2 * Math.PI * 38 * t + noise() * 0.6));
    const env = Math.sin(Math.PI * p) ** 0.7;
    add(tr, i, v * env * grain * 0.8, v * env * grain * 0.7);
  }
  writeWav(tr, "pencil.wav", { peakTarget: 0.7 });
}

// Paper rustle: flipping plans on the table.
{
  const tr = makeTrack(1.4);
  const bn = bandNoise();
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    const env =
      Math.min(1, t / 0.05) *
      Math.exp(-t * 2.4) *
      (0.6 + 0.4 * Math.sin(2 * Math.PI * 3 * t));
    const crackle = Math.abs(noise()) > 0.985 ? noise() * 2.5 : 0;
    const v = bn(0.9, 0.6) * 0.7 + crackle * 0.3;
    add(tr, i, v * env * 0.9, v * env * 0.75);
  }
  reverb(tr, 0.12, 0.6);
  writeWav(tr, "paper.wav", { peakTarget: 0.75, fadeOut: 0.3 });
}

// Coffee cup set down on a wooden table: thud + short ceramic ring.
{
  const tr = makeTrack(1.0);
  let ph = 0;
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    ph += (110 + 60 * Math.exp(-t * 40)) / SR;
    const thud = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 28);
    const ring =
      (Math.sin(2 * Math.PI * 1830 * t) +
        0.6 * Math.sin(2 * Math.PI * 2970 * t) +
        0.3 * Math.sin(2 * Math.PI * 4410 * t)) *
      Math.exp(-t * 16) *
      0.25;
    const click = t < 0.004 ? noise() * (1 - t / 0.004) : 0;
    add(tr, i, thud * 0.9 + ring + click * 0.6);
  }
  reverb(tr, 0.15, 0.5);
  writeWav(tr, "cup.wav", { peakTarget: 0.75 });
}

// Soft incoming-message ping: two gentle bell tones.
{
  const tr = makeTrack(1.6);
  [
    [0, 88],
    [0.12, 93],
  ].forEach(([start, note]) => {
    const f = midiToHz(note);
    const s0 = Math.floor(start * SR);
    for (let j = 0; j < SR * 1.3; j++) {
      const t = j / SR;
      const env = Math.exp(-t * 4.5) * Math.min(1, t / 0.004);
      const v =
        Math.sin(2 * Math.PI * f * t) +
        0.25 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 8);
      add(tr, s0 + j, v * env * 0.4);
    }
  });
  reverb(tr, 0.25, 0.8);
  writeWav(tr, "ping.wav", { peakTarget: 0.8 });
}

// Check mark: quick pen tick (two short strokes).
{
  const tr = makeTrack(0.6);
  const bn = bandNoise();
  const strokes = [
    [0.0, 0.08],
    [0.1, 0.18],
  ];
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    const v = bn(0.97, 0.5);
    const s = strokes.find(([a, d]) => t >= a && t < a + d);
    if (!s) continue;
    const p = (t - s[0]) / s[1];
    add(tr, i, v * Math.sin(Math.PI * p) * 0.9);
  }
  writeWav(tr, "check.wav", { peakTarget: 0.7 });
}
