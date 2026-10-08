// Synthesizes the original scores and sound effects for the Dream Raffle
// Year 9 videos (src/DreamRaffle), so there are no licensing concerns.
// No dependencies; writes 16-bit stereo WAVs.
//
//   node scripts/generate-raffle-audio.mjs <out-dir>
//
// Writes v1.wav … v4.wav (one score per version) and the SFX kit:
// whoosh, impact, pop, ting, coins, tick, riser, shimmer, stamp, heartbeat,
// scratch, jingle, creak, choir, click.
//
// Section times are in seconds and must match the scene starts in
// src/DreamRaffle/V*.tsx (frames / 30).

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const outDir = process.argv[2] ?? ".";
mkdirSync(outDir, { recursive: true });

let seed = 20260908;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 4294967296) * 2 - 1;
};
const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const saw = (p) => 2 * (p - Math.floor(p + 0.5));
const tri = (p) => 1 - 4 * Math.abs(p - Math.floor(p + 0.5));

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
  const run = (input, offset) => {
    const combs = [1557, 1617, 1491, 1422].map((d) => ({
      buf: new Float32Array(Math.floor((d + offset) * size)),
      i: 0,
    }));
    const aps = [225, 556].map((d) => ({ buf: new Float32Array(d + offset), i: 0 }));
    const out = new Float32Array(input.length);
    for (let n = 0; n < input.length; n++) {
      let s = 0;
      for (const c of combs) {
        const y = c.buf[c.i];
        c.buf[c.i] = input[n] + y * 0.82;
        c.i = (c.i + 1) % c.buf.length;
        s += y;
      }
      s *= 0.25;
      for (const a of aps) {
        const y = a.buf[a.i];
        const v = -s + y;
        a.buf[a.i] = s + y * 0.5;
        a.i = (a.i + 1) % a.buf.length;
        s = v;
      }
      out[n] = s;
    }
    return out;
  };
  const wl = run(tr.l, 0);
  const wr = run(tr.r, 23);
  for (let i = 0; i < tr.n; i++) {
    tr.l[i] += wl[i] * mix;
    tr.r[i] += wr[i] * mix;
  }
};

const writeWav = (tr, name, { fadeIn = 0, fadeOut = 0, drive = 1.1 } = {}) => {
  let peak = 0;
  const dur = tr.n / SR;
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    let g = 1;
    if (fadeIn && t < fadeIn) g *= t / fadeIn;
    if (fadeOut && t > dur - fadeOut) g *= (dur - t) / fadeOut;
    tr.l[i] = Math.tanh(tr.l[i] * drive) * g;
    tr.r[i] = Math.tanh(tr.r[i] * drive) * g;
    peak = Math.max(peak, Math.abs(tr.l[i]), Math.abs(tr.r[i]));
  }
  const norm = peak > 0 ? 0.89 / peak : 1;
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
  writeFileSync(join(outDir, `${name}.wav`), buf);
  console.log(`Wrote ${name}.wav (${dur.toFixed(1)}s)`);
};

// ---------------------------------------------------------------- music ---

// Instruments write into a track between two times.
const kick = (tr, t0, gain = 0.6) => {
  const start = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.35; j++) {
    const t = j / SR;
    ph += (48 + 110 * Math.exp(-t * 30)) / SR;
    add(tr, start + j, Math.sin(2 * Math.PI * ph) * Math.exp(-t * 9) * gain);
  }
};
const clap = (tr, t0, gain = 0.32) => {
  const start = Math.floor(t0 * SR);
  let lp = 0;
  for (let j = 0; j < SR * 0.2; j++) {
    const t = j / SR;
    const n = noise();
    lp += 0.35 * (n - lp);
    const env = Math.exp(-t * 22) * Math.min(1, t / 0.008);
    add(tr, start + j, (n - lp) * env * gain, (n - lp) * env * gain * 0.85);
  }
};
const hat = (tr, t0, gain = 0.08) => {
  const start = Math.floor(t0 * SR);
  let prev = 0;
  for (let j = 0; j < SR * 0.05; j++) {
    const n = noise();
    const hp = n - prev;
    prev = n;
    const env = Math.exp((-j / SR) * 80);
    add(tr, start + j, hp * env * gain * 0.8, hp * env * gain);
  }
};
// Timpani-like tom: low sine with a pitch drop and a noise skin.
const tom = (tr, t0, midi = 41, gain = 0.5) => {
  const start = Math.floor(t0 * SR);
  let ph = 0;
  const f = midiToHz(midi);
  for (let j = 0; j < SR * 1.2; j++) {
    const t = j / SR;
    ph += (f * (1 + 0.25 * Math.exp(-t * 20))) / SR;
    const v = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 3.2) + noise() * Math.exp(-t * 40) * 0.3;
    add(tr, start + j, v * gain);
  }
};
const snare = (tr, t0, gain = 0.18) => {
  const start = Math.floor(t0 * SR);
  for (let j = 0; j < SR * 0.18; j++) {
    const t = j / SR;
    const v = noise() * Math.exp(-t * 25) + Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 30) * 0.5;
    add(tr, start + j, v * gain);
  }
};
const pianoNote = (tr, t0, midi, len = 1.6, gain = 0.12, pan = 0.5) => {
  const start = Math.floor(t0 * SR);
  const f = midiToHz(midi);
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 2.6) * Math.min(1, t / 0.004);
    const v =
      (Math.sin(2 * Math.PI * f * t) +
        0.45 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 4) +
        0.2 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 6)) *
      env *
      gain;
    add(tr, start + j, v * (1 - pan) * 2 * 0.7, v * pan * 2 * 0.7);
  }
};
const pluck = (tr, t0, midi, gain = 0.06, pan = 0.5) => {
  const start = Math.floor(t0 * SR);
  const f = midiToHz(midi);
  for (let j = 0; j < SR * 0.22; j++) {
    const t = j / SR;
    const v = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) * Math.exp(-t * 16) * gain;
    add(tr, start + j, v * (1 - pan) * 2, v * pan * 2);
  }
};
const brass = (tr, t0, len, chord, gain = 0.05) => {
  const start = Math.floor(t0 * SR);
  const phases = chord.map(() => 0);
  let lp = 0;
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    let s = 0;
    chord.forEach((m, k) => {
      phases[k] += midiToHz(m) / SR;
      s += saw(phases[k]);
    });
    const env = Math.min(1, t / 0.08) * Math.min(1, (len - t) / 0.3);
    lp += (0.04 + 0.08 * Math.min(1, t / 0.2)) * (s - lp);
    add(tr, start + j, lp * env * gain);
  }
};
const riserInto = (tr, tEnd, len = 2, gain = 0.07) => {
  const start = Math.floor((tEnd - len) * SR);
  let ph = 0;
  let lp = 0;
  for (let j = 0; j < SR * len; j++) {
    const p = j / (SR * len);
    ph += (180 + 1500 * p * p) / SR;
    lp += (0.02 + 0.4 * p) * (noise() - lp);
    add(tr, start + j, saw(ph) * p * p * gain + lp * p * p * gain * 1.5);
  }
};
const hit = (tr, t0, gain = 0.8) => {
  const start = Math.floor(t0 * SR);
  let ph = 0;
  let lp = 0;
  for (let j = 0; j < SR * 1.6; j++) {
    const t = j / SR;
    ph += (38 + 70 * Math.exp(-t * 8)) / SR;
    lp += 0.12 * (noise() - lp);
    add(tr, start + j, (Math.sin(2 * Math.PI * ph) * Math.exp(-t * 2.6) + lp * Math.exp(-t * 6) * 0.7) * gain);
  }
};

// One score. Sections:
//   [0, intro)        piano arpeggios over a soft pad (no drums)
//   [intro, drop)     build: pad opens, toms or pulse, riser into the drop
//   [drop, resolve)   full groove: kick, clap, hats, bass, plucks
//   [resolve, end)    held final chord with a soft tail
// `gap` = [from, to] mutes everything for a dramatic stop.
const score = (cfg) => {
  const { duration, bpm, chords, bass, intro, drop, resolve, gap, march, choirAt } = cfg;
  const tr = makeTrack(duration);
  const beat = 60 / bpm;
  const bar = beat * 4;
  const chordAt = (t) => Math.floor(t / bar) % chords.length;
  const inGap = (t) => gap && t >= gap[0] && t < gap[1];

  // Pad: detuned saws, filter opens through the build.
  {
    const ph = new Array(8).fill(0);
    let lpL = 0;
    let lpR = 0;
    for (let i = 0; i < tr.n; i++) {
      const t = i / SR;
      if (inGap(t)) continue;
      const ch = t >= resolve ? chords[0] : chords[chordAt(t)];
      let l = 0;
      let r = 0;
      ch.forEach((m, k) => {
        const f = midiToHz(m);
        ph[k * 2] += (f * 1.004) / SR;
        ph[k * 2 + 1] += (f * 0.996) / SR;
        l += saw(ph[k * 2]);
        r += saw(ph[k * 2 + 1]);
      });
      const open = t < intro ? 0.015 : t < drop ? 0.015 + 0.04 * ((t - intro) / Math.max(0.1, drop - intro)) : 0.06;
      lpL += open * (l - lpL);
      lpR += open * (r - lpR);
      const sinceBeat = t % beat;
      const duck = t >= drop && t < resolve ? 0.4 + 0.6 * Math.min(1, sinceBeat / 0.2) : 1;
      const g = (t < drop ? 0.06 : 0.075) * duck;
      add(tr, i, lpL * g, lpR * g);
    }
  }

  // Piano arpeggios through the intro (and softly over the resolve).
  for (let s = 0; s * (beat / 2) < duration; s++) {
    const t0 = s * (beat / 2);
    const soft = t0 >= resolve;
    if ((t0 >= intro && !soft) || inGap(t0)) continue;
    const ch = soft ? chords[0] : chords[chordAt(t0)];
    const pattern = [0, 1, 2, 1, 2, 3, 2, 1];
    const idx = pattern[s % 8] % ch.length;
    const octave = pattern[s % 8] === 3 ? 12 : 0;
    pianoNote(tr, t0, ch[idx] + 12 + octave, 1.8, soft ? 0.07 : 0.1, s % 2 ? 0.35 : 0.65);
  }

  // Build: toms on each beat, accelerating, or a marching snare.
  for (let b = 0; b * beat < drop; b++) {
    const t0 = b * beat;
    if (t0 < intro || inGap(t0)) continue;
    if (march) {
      snare(tr, t0, 0.12);
      snare(tr, t0 + beat * 0.5, 0.06);
      if (b % 2 === 0) tom(tr, t0, 38, 0.35);
    } else {
      tom(tr, t0, 40 + (b % 2) * 3, 0.32);
    }
  }

  // Groove.
  for (let b = 0; b * beat < resolve; b++) {
    const t0 = b * beat;
    if (t0 < drop || inGap(t0)) continue;
    if (march) {
      tom(tr, t0, 38, 0.4);
      snare(tr, t0 + beat * 0.5, 0.1);
      snare(tr, t0 + beat * 0.75, 0.07);
    } else {
      kick(tr, t0);
      if (b % 2 === 1) clap(tr, t0);
    }
    hat(tr, t0 + beat / 2);
  }
  // Bass pulse + plucks in the groove.
  {
    let ph = 0;
    let lp = 0;
    for (let i = 0; i < tr.n; i++) {
      const t = i / SR;
      if (t < drop || t >= resolve || inGap(t)) continue;
      ph += midiToHz(bass[chordAt(t)]) / SR;
      const raw = saw(ph) * 0.7 + Math.sin(2 * Math.PI * ph) * 0.5;
      lp += 0.06 * (raw - lp);
      const in8 = t % (beat / 2);
      add(tr, i, lp * Math.exp(-in8 * 5) * Math.min(1, in8 / 0.005) * 0.3);
    }
    for (let s = 0; s * (beat / 4) < resolve; s++) {
      const t0 = s * (beat / 4);
      if (t0 < drop || inGap(t0)) continue;
      const ch = chords[chordAt(t0)];
      pluck(tr, t0, ch[[0, 1, 2, 1][s % 4] % ch.length] + 12, 0.05, s % 2 ? 0.3 : 0.7);
    }
    if (march) {
      for (let b = 0; b * bar < resolve; b++) {
        const t0 = b * bar;
        if (t0 < drop || inGap(t0)) continue;
        brass(tr, t0, bar * 0.9, chords[chordAt(t0)].map((m) => m - 12), 0.035);
      }
    }
  }

  // Choir-ish swell (formant-filtered saw chord) at the reveal.
  for (const at of choirAt ?? []) {
    const len = 3;
    const start = Math.floor(at * SR);
    const ch = chords[chordAt(at)];
    const ph = ch.map(() => 0);
    let b1 = 0;
    let b2 = 0;
    for (let j = 0; j < SR * len; j++) {
      const t = j / SR;
      let s = 0;
      ch.forEach((m, k) => {
        ph[k] += (midiToHz(m + 12) * (1 + 0.004 * Math.sin(2 * Math.PI * 5 * t + k))) / SR;
        s += saw(ph[k]);
      });
      b1 += 0.05 * (s - b1);
      b2 += 0.2 * (b1 - b2);
      const env = Math.min(1, t / 0.6) * Math.min(1, (len - t) / 1.2);
      add(tr, start + j, (b1 - b2 * 0.6) * env * 0.09);
    }
  }

  riserInto(tr, drop, Math.min(2, drop - intro || 2));
  hit(tr, drop);
  hit(tr, resolve, 0.5);
  reverb(tr, 0.25);
  return tr;
};

const Am = [57, 60, 64, 69];
const F = [57, 60, 65, 69];
const C = [55, 60, 64, 67];
const G = [55, 59, 62, 67];
const Dm = [57, 62, 65, 69];
const Em = [55, 59, 64, 67];
const Bb = [58, 62, 65, 70];

// V1 Success Story: piano intro, drop on "Year 9" (8s), resolve on the endcard (23s).
writeWav(
  score({ duration: 28, bpm: 110, chords: [Am, F, C, G], bass: [33, 29, 36, 31], intro: 6.5, drop: 8, resolve: 23 }),
  "v1",
  { fadeIn: 0.05, fadeOut: 2 },
);
// V2 Eyes on the Dream: ambient pad, choir on the penthouse (7s), groove from 17s.
writeWav(
  score({ duration: 25, bpm: 120, chords: [Dm, Bb, F, C], bass: [26, 34, 29, 36], intro: 7, drop: 17, resolve: 21, choirAt: [7] }),
  "v2",
  { fadeIn: 1, fadeOut: 2 },
);
// V3 Next Winner: minimal, drop on "it could be you" (8s).
writeWav(
  score({ duration: 25, bpm: 115, chords: [Em, C, G, [57, 62, 66, 69]], bass: [28, 24, 31, 26], intro: 5, drop: 8, resolve: 21 }),
  "v3",
  { fadeIn: 0.05, fadeOut: 2 },
);
// V4 Hall of Winners: regal march, full stop at the door (14–16s), reveal at 21s.
writeWav(
  score({ duration: 30, bpm: 96, chords: [C, Am, F, G], bass: [24, 33, 29, 31], intro: 1, drop: 16, resolve: 25, gap: [14, 16], march: true, choirAt: [21] }),
  "v4",
  { fadeIn: 0.05, fadeOut: 2 },
);

// ------------------------------------------------------------------ SFX ---

const sfx = (seconds, fn, name, opts) => {
  const tr = makeTrack(seconds);
  fn(tr);
  writeWav(tr, name, opts);
};

sfx(0.8, (tr) => {
  let lp = 0;
  for (let j = 0; j < tr.n; j++) {
    const p = j / tr.n;
    const env = Math.sin(Math.PI * p) ** 2;
    lp += (0.02 + 0.35 * p) * (noise() - lp);
    add(tr, j, lp * env * (1 - p * 0.5), lp * env * (0.5 + p * 0.5));
  }
}, "whoosh");
sfx(2, (tr) => {
  hit(tr, 0, 1);
  reverb(tr, 0.3, 1.3);
}, "impact");
sfx(0.25, (tr) => {
  let ph = 0;
  for (let j = 0; j < tr.n; j++) {
    const t = j / SR;
    ph += (300 + 900 * Math.exp(-t * 40)) / SR;
    add(tr, j, Math.sin(2 * Math.PI * ph) * Math.exp(-t * 22));
  }
}, "pop");
const bell = (tr, t0, f, gain = 0.4, decay = 3) => {
  const start = Math.floor(t0 * SR);
  for (let j = 0; j < SR * 1.5; j++) {
    const t = j / SR;
    const v = (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 6) + 0.25 * Math.sin(2 * Math.PI * f * 5.4 * t) * Math.exp(-t * 10)) * Math.exp(-t * decay);
    add(tr, start + j, v * gain);
  }
};
sfx(1.6, (tr) => {
  bell(tr, 0, 1760, 0.5);
  reverb(tr, 0.3);
}, "ting");
sfx(2, (tr) => {
  for (let k = 0; k < 26; k++) {
    const t0 = 0.05 + Math.abs(noise()) * 1.2;
    bell(tr, t0, 2400 + Math.abs(noise()) * 2600, 0.12, 14);
  }
  reverb(tr, 0.2);
}, "coins");
sfx(2, (tr) => {
  for (let k = 0; k < 4; k++) {
    const start = Math.floor(k * 0.5 * SR);
    for (let j = 0; j < SR * 0.03; j++) {
      const t = j / SR;
      add(tr, start + j, (Math.sin(2 * Math.PI * (k % 2 ? 2400 : 3000) * t) + noise() * 0.3) * Math.exp(-t * 200));
    }
  }
}, "tick");
sfx(2.5, (tr) => riserInto(tr, 2.5, 2.5, 0.5), "riser");
sfx(2, (tr) => {
  [2093, 2637, 3136, 4186, 3520].forEach((f, k) => bell(tr, k * 0.07, f, 0.18, 4));
  reverb(tr, 0.4, 1.2);
}, "shimmer");
sfx(0.6, (tr) => {
  tom(tr, 0, 33, 1);
  for (let j = 0; j < SR * 0.05; j++) add(tr, j, noise() * Math.exp((-j / SR) * 80) * 0.6);
}, "stamp");
sfx(0.9, (tr) => {
  tom(tr, 0, 28, 1);
  tom(tr, 0.22, 27, 0.7);
}, "heartbeat");
sfx(0.6, (tr) => {
  let ph = 0;
  let lp = 0;
  for (let j = 0; j < tr.n; j++) {
    const p = j / tr.n;
    const f = 200 + 1600 * Math.abs(Math.sin(Math.PI * p * 2.5));
    ph += f / SR;
    lp += 0.3 * (noise() - lp);
    add(tr, j, (saw(ph) * 0.4 + lp) * (1 - p) * 0.8);
  }
}, "scratch");
sfx(0.9, (tr) => {
  for (let k = 0; k < 9; k++) bell(tr, Math.abs(noise()) * 0.45, 3500 + Math.abs(noise()) * 3500, 0.15, 20);
}, "jingle");
sfx(1.4, (tr) => {
  let ph = 0;
  let bp1 = 0;
  let bp2 = 0;
  for (let j = 0; j < tr.n; j++) {
    const p = j / tr.n;
    const f = 90 + 60 * Math.sin(p * 9) + 30 * noise();
    ph += f / SR;
    const pulse = ph % 1 < 0.08 ? 1 : 0;
    bp1 += 0.08 * (pulse - bp1);
    bp2 += 0.08 * (bp1 - bp2);
    add(tr, j, (bp1 - bp2) * Math.sin(Math.PI * p) * 3);
  }
  reverb(tr, 0.2);
}, "creak");
sfx(3.2, (tr) => {
  const ph = [0, 0, 0, 0];
  let b1 = 0;
  let b2 = 0;
  for (let j = 0; j < tr.n; j++) {
    const t = j / SR;
    let s = 0;
    [60, 64, 67, 72].forEach((m, k) => {
      ph[k] += (midiToHz(m) * (1 + 0.005 * Math.sin(2 * Math.PI * 5.5 * t + k))) / SR;
      s += saw(ph[k]);
    });
    b1 += 0.06 * (s - b1);
    b2 += 0.25 * (b1 - b2);
    const env = Math.min(1, t / 0.8) * Math.min(1, (3.2 - t) / 1.2);
    add(tr, j, (b1 - b2 * 0.6) * env);
  }
  reverb(tr, 0.4, 1.3);
}, "choir");
sfx(0.15, (tr) => {
  for (let j = 0; j < tr.n; j++) {
    const t = j / SR;
    add(tr, j, tri(1200 * t) * Math.exp(-t * 60));
  }
}, "click");
