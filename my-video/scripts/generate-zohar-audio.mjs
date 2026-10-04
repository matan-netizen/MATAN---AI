// Synthesizes the original score and sound effects for ZoharCampaign, so
// there are no licensing concerns. No dependencies; writes 16-bit WAVs.
//
//   node scripts/generate-zohar-audio.mjs <out-dir>
//
// Writes: music.wav, rumble.wav, heartbeat.wav, riser.wav, chime.wav, pop.wav
//
// Score layout (matches the video's script):
//   0–9s   soft piano arpeggios over gentle strings   (D minor)
//   9–14s  build: strings swell, timpani roll, filter opens
//   14–30s triumphant climax in F major, full strings, brass, timpani

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const outDir = process.argv[2] ?? ".";
mkdirSync(outDir, { recursive: true });

// Must match HEARTBEAT_PERIOD in src/ZoharCampaign/theme.ts (28 frames @30fps).
const HEARTBEAT_PERIOD = 28 / 30;

let seed = 987654321;
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
// Instruments
// ---------------------------------------------------------------------------

// Strings: detuned saws, slow attack, vibrato, one-pole low-pass.
const strings = (tr, start, dur, notes, gain, cutoff, attack = 0.8) => {
  const release = 1.0;
  const len = Math.floor((dur + release) * SR);
  const s0 = Math.floor(start * SR);
  notes.forEach((note, k) => {
    const f = midiToHz(note);
    const detunes = [0.996, 1, 1.004];
    const ph = detunes.map(() => Math.abs(noise()));
    let lpL = 0;
    let lpR = 0;
    for (let j = 0; j < len; j++) {
      const t = j / SR;
      const env =
        Math.min(1, t / attack) *
        (t > dur ? Math.max(0, 1 - (t - dur) / release) : 1);
      if (env <= 0) continue;
      const vib = 1 + 0.003 * Math.sin(2 * Math.PI * 5.2 * t + k);
      let l = 0;
      let r = 0;
      detunes.forEach((d, v) => {
        ph[v] += (f * d * vib) / SR;
        const x = saw(ph[v]);
        if (v !== 2) l += x;
        if (v !== 0) r += x;
      });
      const c = typeof cutoff === "function" ? cutoff(start + t) : cutoff;
      lpL += c * (l - lpL);
      lpR += c * (r - lpR);
      add(tr, s0 + j, lpL * env * gain, lpR * env * gain);
    }
  });
};

// Piano-ish: a few decaying harmonics with a soft hammer transient.
const piano = (tr, start, note, gain, pan = 0) => {
  const f = midiToHz(note);
  const s0 = Math.floor(start * SR);
  const len = Math.floor(2.5 * SR);
  const gl = gain * (1 - pan * 0.5);
  const gr = gain * (1 + pan * 0.5);
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 2.2) * Math.min(1, t / 0.004);
    const v =
      Math.sin(2 * Math.PI * f * t) +
      0.45 * Math.sin(2 * Math.PI * 2.001 * f * t) * Math.exp(-t * 2) +
      0.2 * Math.sin(2 * Math.PI * 3.003 * f * t) * Math.exp(-t * 4) +
      0.08 * Math.sin(2 * Math.PI * 4.01 * f * t) * Math.exp(-t * 6);
    add(tr, s0 + j, v * env * gl, v * env * gr);
  }
};

// Timpani hit: pitched sine with a noise skin, long-ish decay.
const timpani = (tr, start, note, gain) => {
  const f = midiToHz(note);
  const s0 = Math.floor(start * SR);
  let lp = 0;
  for (let j = 0; j < SR * 1.6; j++) {
    const t = j / SR;
    lp += 0.05 * (noise() - lp);
    const v =
      Math.sin(2 * Math.PI * f * (1 + 0.04 * Math.exp(-t * 20)) * t) *
        Math.exp(-t * 2.5) +
      lp * Math.exp(-t * 12) * 2;
    add(tr, s0 + j, v * gain);
  }
};

// Brass-ish: brighter saw stack with a swell.
const brass = (tr, start, dur, notes, gain) =>
  strings(
    tr,
    start,
    dur,
    notes,
    gain,
    (t) => 0.05 + 0.04 * Math.sin(t * 2),
    0.25,
  );

// ---------------------------------------------------------------------------
// Music
// ---------------------------------------------------------------------------
{
  const tr = makeTrack(30);

  // Section A (0–9s): D minor, gentle. Dm – Bb – F – C, 2.25s each.
  const A = [
    [50, [62, 65, 69]],
    [46, [62, 65, 70]],
    [41, [60, 65, 69]],
    [48, [60, 64, 67]],
  ];
  A.forEach(([bass, chord], i) => {
    const t0 = i * 2.25;
    strings(tr, t0, 2.25, [bass, ...chord], 0.05, 0.02 + i * 0.004);
    // Piano arpeggio: up through the chord and back, 8th notes.
    const arp = [
      chord[0],
      chord[1],
      chord[2],
      chord[0] + 12,
      chord[2],
      chord[1],
    ];
    arp.forEach((n, k) =>
      piano(tr, t0 + k * 0.375, n, 0.11, k % 2 ? 0.4 : -0.4),
    );
  });

  // Section B (9–14s): build. Gm – Eb – Bb – C(sus→maj).
  const B = [
    [43, [62, 67, 70]],
    [39, [63, 67, 70]],
    [46, [62, 65, 70]],
    [48, [60, 65, 67]],
  ];
  B.forEach(([bass, chord], i) => {
    const t0 = 9 + i * 1.25;
    strings(
      tr,
      t0,
      1.25,
      [bass, bass + 12, ...chord, chord[2] + 12],
      0.055,
      (t) => 0.03 + 0.06 * ((t - 9) / 5),
    );
    [0, 0.3125, 0.625, 0.9375].forEach((d, k) =>
      piano(tr, t0 + d, chord[k % 3] + 12, 0.08 + 0.02 * i),
    );
  });
  // Timpani roll that accelerates into 14s.
  for (let t = 11; t < 14; ) {
    const p = (t - 11) / 3;
    timpani(tr, t, 38, 0.05 + 0.14 * p * p);
    t += 0.18 - 0.12 * p;
  }

  // Section C (14–30s): climax in F major. F – C – Dm – Bb, 2s each, twice.
  const C = [
    [41, [65, 69, 72]],
    [48, [64, 67, 72]],
    [50, [65, 69, 74]],
    [46, [65, 70, 74]],
  ];
  for (let rep = 0; rep < 2; rep++) {
    C.forEach(([bass, chord], i) => {
      const t0 = 14 + rep * 8 + i * 2;
      strings(
        tr,
        t0,
        2,
        [bass, bass + 12, ...chord, chord[0] + 12, chord[2] + 12],
        0.065,
        0.11,
        0.3,
      );
      brass(tr, t0, 2, [bass + 12, chord[0], chord[1]], 0.05);
      timpani(tr, t0, bass - 12 < 36 ? bass : bass - 12, 0.45);
      timpani(tr, t0 + 1, bass, 0.2);
      // Soaring piano melody in octaves.
      const melody = [
        chord[2] + 12,
        chord[1] + 12,
        chord[0] + 12,
        chord[1] + 12,
      ];
      melody.forEach((n, k) => {
        piano(tr, t0 + k * 0.5, n, 0.09, -0.3);
        piano(tr, t0 + k * 0.5, n - 12, 0.07, 0.3);
      });
    });
  }
  reverb(tr, 0.32, 1.2);
  writeWav(tr, "music.wav", { fadeOut: 2 });
}

// ---------------------------------------------------------------------------
// SFX
// ---------------------------------------------------------------------------

// Frame 0: deep cinematic rumble with a low sub whoosh.
{
  const tr = makeTrack(4);
  let lp = 0;
  let ph = 0;
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.4) * Math.exp(-t * 0.9);
    ph += (32 + 18 * Math.exp(-t * 1.5)) / SR;
    lp += 0.008 * (noise() - lp);
    const v = Math.sin(2 * Math.PI * ph) * 0.9 + lp * 6;
    add(tr, i, v * env * 0.8);
  }
  reverb(tr, 0.3, 1.5);
  writeWav(tr, "rumble.wav", { fadeOut: 0.5 });
}

// Frame 120: heartbeat (lub-dub) for ~5s, fading out.
{
  const tr = makeTrack(5);
  for (let b = 0; b * HEARTBEAT_PERIOD < 4.6; b++) {
    const fade = 1 - (b * HEARTBEAT_PERIOD) / 5.2;
    [
      [0, 1],
      [0.2, 0.7],
    ].forEach(([offset, amp]) => {
      const s0 = Math.floor((b * HEARTBEAT_PERIOD + offset) * SR);
      let ph = 0;
      for (let j = 0; j < SR * 0.25; j++) {
        const t = j / SR;
        ph += (48 + 30 * Math.exp(-t * 25)) / SR;
        const env = Math.exp(-t * 16) * Math.min(1, t / 0.006);
        add(tr, s0 + j, Math.sin(2 * Math.PI * ph) * env * amp * fade);
      }
    });
  }
  writeWav(tr, "heartbeat.wav", { peakTarget: 0.95 });
}

// Frame 270: reverse cymbal / ambient riser, 5s, peaking on the reveal.
{
  const tr = makeTrack(5);
  let prev = 0;
  let lp = 0;
  let ph = 0;
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    const p = t / 5;
    const n = noise();
    const hp = n - prev;
    prev = n;
    lp += (0.05 + 0.5 * p) * (hp - lp);
    ph += (110 * Math.pow(4, p)) / SR;
    const swell = Math.pow(p, 3);
    const tone =
      (Math.sin(2 * Math.PI * ph) + 0.5 * Math.sin(4 * Math.PI * ph)) * 0.25;
    add(tr, i, (lp * 1.2 + tone) * swell, (lp * 1.2 + tone * 0.8) * swell);
  }
  writeWav(tr, "riser.wav");
}

// Frame 420: heavenly chime cascade with shimmering light dust.
{
  const tr = makeTrack(5);
  const notes = [77, 81, 84, 89, 93, 96];
  notes.forEach((note, k) => {
    const f = midiToHz(note);
    const s0 = Math.floor(k * 0.09 * SR);
    const pan = k % 2 ? 0.5 : -0.5;
    for (let j = 0; j < SR * 4; j++) {
      const t = j / SR;
      const env = Math.exp(-t * 1.4) * Math.min(1, t / 0.002);
      const v =
        Math.sin(2 * Math.PI * f * t) +
        0.5 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 3) +
        0.25 * Math.sin(2 * Math.PI * f * 5.4 * t) * Math.exp(-t * 5);
      add(tr, s0 + j, v * env * 0.12 * (1 - pan), v * env * 0.12 * (1 + pan));
    }
  });
  // Sparkle: sparse random high pings.
  for (let k = 0; k < 40; k++) {
    const start = 0.1 + Math.abs(noise()) * 3;
    const f = 3000 + Math.abs(noise()) * 5000;
    const s0 = Math.floor(start * SR);
    const pan = noise();
    for (let j = 0; j < SR * 0.15; j++) {
      const t = j / SR;
      const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 30) * 0.04;
      add(tr, s0 + j, v * (1 - pan), v * (1 + pan));
    }
  }
  reverb(tr, 0.45, 1.4);
  writeWav(tr, "chime.wav", { fadeOut: 1 });
}

// Frame 630: crisp golden button pop + bright ding.
{
  const tr = makeTrack(1.5);
  let ph = 0;
  for (let j = 0; j < SR * 0.12; j++) {
    const t = j / SR;
    ph += (900 * Math.exp(-t * 30) + 180) / SR;
    add(tr, j, Math.sin(2 * Math.PI * ph) * Math.exp(-t * 35) * 0.9);
  }
  [88, 95].forEach((note, k) => {
    const f = midiToHz(note);
    const s0 = Math.floor((0.03 + k * 0.06) * SR);
    for (let j = 0; j < SR * 1.2; j++) {
      const t = j / SR;
      const v =
        (Math.sin(2 * Math.PI * f * t) +
          0.3 * Math.sin(2 * Math.PI * f * 3 * t)) *
        Math.exp(-t * 4) *
        0.35;
      add(tr, s0 + j, v);
    }
  });
  reverb(tr, 0.25);
  writeWav(tr, "pop.wav", { fadeOut: 0.3 });
}
