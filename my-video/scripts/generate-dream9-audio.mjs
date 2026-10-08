// Synthesizes the original 120 BPM score and the sound effects for
// DreamRaffle9, so there are no licensing concerns. No dependencies.
//
//   node scripts/generate-dream9-audio.mjs <out-dir> [--anim]
//
// --anim writes only music-anim.wav: a 45s version of the same groove with
// no breakdown or countdown, used under the voiceover in DreamRaffle9Anim.
//
// Writes: music.wav, bassdrop.wav, swoosh.wav, cash.wav, pop.wav, ticker.wav,
//         stamp.wav, ticktock.wav, click.wav, riser.wav
//
// Score layout (seconds, must match SCENES in src/DreamRaffle9/theme.ts):
//   0 → 10   groove: kick, clap, hats, sub bass, chord stabs
//   10 → 20  full: adds a plucked lead (apartment and 1+1 scenes)
//   20 → 23  breakdown: soft piano and pads only (the fund's cause)
//   23 → 26  drums return under the countdown
//   26 → 35  full again, 2s fade-out

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const outDir = process.argv[2] ?? ".";
mkdirSync(outDir, { recursive: true });

const ANIM = process.argv.includes("--anim");
const TOTAL = ANIM ? 45 : 35;
const BEAT = 0.5; // 120 BPM
const BAR = BEAT * 4;
const BREAK_START = ANIM ? Infinity : 20;
const BREAK_END = ANIM ? Infinity : 23;
const COUNTDOWN_END = ANIM ? -Infinity : 26;
const LEAD_START = ANIM ? 3 : 10;

let seed = 246813579;
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

const kick = (tr, start, gain) => {
  const s0 = Math.floor(start * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.45; j++) {
    const t = j / SR;
    ph += (45 + 120 * Math.exp(-t * 30)) / SR;
    const env = Math.exp(-t * 7) * Math.min(1, t / 0.002);
    add(tr, s0 + j, Math.sin(2 * Math.PI * ph) * env * gain);
  }
};

const clap = (tr, start, gain) => {
  const s0 = Math.floor(start * SR);
  let prev = 0;
  for (let j = 0; j < SR * 0.25; j++) {
    const t = j / SR;
    const n = noise();
    const hp = n - prev;
    prev = n;
    // Three quick bursts, then a tail.
    const burst = t < 0.03 ? (Math.floor(t / 0.01) % 2 ? 0.6 : 1) : 1;
    const env = Math.exp(-t * 18) * burst;
    add(tr, s0 + j, hp * env * gain * 0.9, hp * env * gain);
  }
};

const hat = (tr, start, gain, open = false) => {
  const s0 = Math.floor(start * SR);
  let prev = 0;
  const decay = open ? 14 : 60;
  for (let j = 0; j < SR * (open ? 0.25 : 0.06); j++) {
    const t = j / SR;
    const n = noise();
    const hp = n - prev;
    prev = n;
    add(
      tr,
      s0 + j,
      hp * Math.exp(-t * decay) * gain * 0.7,
      hp * Math.exp(-t * decay) * gain,
    );
  }
};

const sub = (tr, start, dur, note, gain) => {
  const f = midiToHz(note);
  const s0 = Math.floor(start * SR);
  for (let j = 0; j < SR * dur; j++) {
    const t = j / SR;
    const env = Math.min(1, t / 0.01) * Math.min(1, (dur - t) / 0.05);
    const v = Math.tanh(Math.sin(2 * Math.PI * f * t) * 1.6);
    add(tr, s0 + j, v * env * gain);
  }
};

// Bright chord stab: detuned saws through a decaying low-pass.
const stab = (tr, start, dur, notes, gain) => {
  const s0 = Math.floor(start * SR);
  notes.forEach((note, k) => {
    const f = midiToHz(note);
    const ph = [Math.abs(noise()), Math.abs(noise())];
    let lpL = 0;
    let lpR = 0;
    for (let j = 0; j < SR * (dur + 0.15); j++) {
      const t = j / SR;
      const env = Math.exp(-t * 5) * Math.min(1, t / 0.003);
      ph[0] += (f * 0.997) / SR;
      ph[1] += (f * 1.003) / SR;
      const c = 0.04 + 0.25 * Math.exp(-t * 9);
      lpL += c * (saw(ph[0]) - lpL);
      lpR += c * (saw(ph[1]) - lpR);
      add(tr, s0 + j, lpL * env * gain, lpR * env * gain * (k % 2 ? 1 : 0.9));
    }
  });
};

const pad = (tr, start, dur, notes, gain) => {
  const s0 = Math.floor(start * SR);
  notes.forEach((note) => {
    const f = midiToHz(note);
    let lp = 0;
    let ph = Math.abs(noise());
    for (let j = 0; j < SR * (dur + 0.8); j++) {
      const t = j / SR;
      const env =
        Math.min(1, t / 0.6) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.8) : 1);
      ph += f / SR;
      lp += 0.02 * (saw(ph) - lp);
      add(tr, s0 + j, lp * env * gain);
    }
  });
};

const piano = (tr, start, note, gain, pan = 0) => {
  const f = midiToHz(note);
  const s0 = Math.floor(start * SR);
  for (let j = 0; j < SR * 2.2; j++) {
    const t = j / SR;
    const env = Math.exp(-t * 2.4) * Math.min(1, t / 0.004);
    const v =
      Math.sin(2 * Math.PI * f * t) +
      0.45 * Math.sin(2 * Math.PI * 2.001 * f * t) * Math.exp(-t * 2) +
      0.2 * Math.sin(2 * Math.PI * 3.003 * f * t) * Math.exp(-t * 4);
    add(
      tr,
      s0 + j,
      v * env * gain * (1 - pan * 0.5),
      v * env * gain * (1 + pan * 0.5),
    );
  }
};

// Plucked lead (Karplus-Strong-ish via a decaying square with low-pass).
const pluck = (tr, start, note, gain) => {
  const f = midiToHz(note);
  const s0 = Math.floor(start * SR);
  let lp = 0;
  let ph = 0;
  for (let j = 0; j < SR * 0.4; j++) {
    const t = j / SR;
    ph += f / SR;
    const sq = ph % 1 < 0.5 ? 1 : -1;
    lp += (0.08 + 0.4 * Math.exp(-t * 20)) * (sq - lp);
    add(
      tr,
      s0 + j,
      lp * Math.exp(-t * 7) * gain * 0.8,
      lp * Math.exp(-t * 7) * gain,
    );
  }
};

// ---------------------------------------------------------------------------
// Music: F – C – Dm – Bb, one chord per bar.
// ---------------------------------------------------------------------------
{
  const tr = makeTrack(TOTAL);
  const PROG = [
    { root: 41, chord: [65, 69, 72] },
    { root: 36, chord: [64, 67, 72] },
    { root: 38, chord: [62, 65, 69] },
    { root: 34, chord: [62, 65, 70] },
  ];
  const LEAD = [0, 2, 1, 2, 0, 2, 1, 0]; // chord-tone indices, eighth notes

  for (let bar = 0; bar * BAR < TOTAL; bar++) {
    const t0 = bar * BAR;
    const { root, chord } = PROG[bar % 4];
    const inBreak = t0 >= BREAK_START && t0 < BREAK_END;

    if (inBreak || (t0 < BREAK_START && t0 + BAR > BREAK_START)) {
      // Breakdown: soft piano arpeggio over a pad.
      const from = Math.max(t0, BREAK_START);
      const until = Math.min(t0 + BAR, BREAK_END);
      pad(tr, from, until - from, [root + 12, ...chord], 0.05);
      for (let k = 0; from + k * BEAT < until; k++) {
        piano(tr, from + k * BEAT, chord[k % 3] + 12, 0.12, k % 2 ? 0.4 : -0.4);
      }
      if (inBreak) continue;
    }

    for (let b = 0; b < 4; b++) {
      const t = t0 + b * BEAT;
      if (t >= BREAK_START && t < BREAK_END) continue;
      const countdown = t >= BREAK_END && t < COUNTDOWN_END;
      kick(tr, t, 0.9);
      if (!countdown && b % 2 === 0) kick(tr, t + BEAT * 0.75, 0.5);
      if (b % 2 === 1) clap(tr, t, countdown ? 0.25 : 0.4);
      // Hats: eighths, sixteenths once the lead comes in.
      const subdiv = t >= LEAD_START && !countdown ? 4 : 2;
      for (let h = 0; h < subdiv; h++) {
        hat(
          tr,
          t + (h * BEAT) / subdiv,
          h === 0 ? 0.12 : 0.07,
          h === subdiv - 1 && b === 3,
        );
      }
      sub(tr, t, BEAT * 0.9, root, 0.32);
      if (!countdown) {
        stab(tr, t + BEAT * 0.5, BEAT * 0.4, chord, 0.06);
      }
      if (t >= LEAD_START && !countdown) {
        for (let e = 0; e < 2; e++) {
          const idx = LEAD[(b * 2 + e) % LEAD.length];
          pluck(tr, t + e * BEAT * 0.5, chord[idx] + 12, 0.07);
        }
      }
    }
  }
  reverb(tr, 0.18, 1.0);
  writeWav(tr, ANIM ? "music-anim.wav" : "music.wav", { fadeOut: 2 });
}
if (ANIM) process.exit(0);

// ---------------------------------------------------------------------------
// SFX
// ---------------------------------------------------------------------------

// Sub bass drop: deep pitched-down boom with a noise hit.
{
  const tr = makeTrack(2.5);
  let ph = 0;
  let lp = 0;
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    ph += (30 + 90 * Math.exp(-t * 6)) / SR;
    lp += 0.03 * (noise() - lp);
    const env = Math.exp(-t * 1.6) * Math.min(1, t / 0.003);
    const v =
      Math.tanh(Math.sin(2 * Math.PI * ph) * 2) + lp * Math.exp(-t * 10) * 4;
    add(tr, i, v * env);
  }
  writeWav(tr, "bassdrop.wav", { fadeOut: 0.4 });
}

// Whoosh: band-swept noise that rises and falls, panning across.
{
  const tr = makeTrack(0.5);
  let lp = 0;
  let bp = 0;
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    const p = t / 0.5;
    const env = Math.sin(Math.PI * Math.pow(p, 0.8));
    const c = 0.02 + 0.3 * Math.sin(Math.PI * p);
    lp += c * (noise() - lp);
    bp += c * (lp - bp);
    const v = (lp - bp) * env * 3;
    add(tr, i, v * (1 - p), v * p);
  }
  writeWav(tr, "swoosh.wav");
}

// Cash register: mechanical clunk, then a bright two-bell "ka-ching".
{
  const tr = makeTrack(1.3);
  let lp = 0;
  for (let j = 0; j < SR * 0.06; j++) {
    const t = j / SR;
    lp += 0.2 * (noise() - lp);
    add(tr, j, lp * Math.exp(-t * 60) * 1.4);
  }
  [
    [0.07, 2637],
    [0.13, 3136],
  ].forEach(([start, f]) => {
    const s0 = Math.floor(start * SR);
    for (let j = 0; j < SR * 1.1; j++) {
      const t = j / SR;
      const env = Math.exp(-t * 4) * Math.min(1, t / 0.001);
      const v =
        Math.sin(2 * Math.PI * f * t) +
        0.6 * Math.sin(2 * Math.PI * f * 2.41 * t) * Math.exp(-t * 6) +
        0.3 * Math.sin(2 * Math.PI * f * 3.9 * t) * Math.exp(-t * 10);
      add(tr, s0 + j, v * env * 0.35);
    }
  });
  reverb(tr, 0.2, 0.8);
  writeWav(tr, "cash.wav", { fadeOut: 0.2 });
}

// Pop: short pitched bubble.
{
  const tr = makeTrack(0.2);
  let ph = 0;
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    ph += (300 + 900 * Math.exp(-t * 40)) / SR;
    const env = Math.exp(-t * 35) * Math.min(1, t / 0.001);
    add(tr, i, Math.sin(2 * Math.PI * ph) * env);
  }
  writeWav(tr, "pop.wav");
}

// Ticker: fast mechanical counter clicks speeding up, for 3 seconds.
{
  const tr = makeTrack(3);
  for (let t = 0; t < 2.9; ) {
    const s0 = Math.floor(t * SR);
    for (let j = 0; j < SR * 0.012; j++) {
      const tt = j / SR;
      const v =
        Math.sin(2 * Math.PI * 4200 * tt) * Math.exp(-tt * 500) +
        noise() * Math.exp(-tt * 900) * 0.4;
      add(tr, s0 + j, v * 0.6);
    }
    t += 0.09 - 0.06 * (t / 2.9);
  }
  writeWav(tr, "ticker.wav", { peakTarget: 0.7 });
}

// Stamp: heavy thud + paper slap.
{
  const tr = makeTrack(0.6);
  let ph = 0;
  let lp = 0;
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    ph += (70 + 80 * Math.exp(-t * 40)) / SR;
    lp += 0.4 * (noise() - lp);
    const v =
      Math.sin(2 * Math.PI * ph) * Math.exp(-t * 12) +
      lp * Math.exp(-t * 50) * 0.8;
    add(tr, i, v);
  }
  writeWav(tr, "stamp.wav");
}

// Tick-tock clock for 3 seconds (one tick per beat), with a low heartbeat.
{
  const tr = makeTrack(3);
  for (let b = 0; b * BEAT < 3; b++) {
    const s0 = Math.floor(b * BEAT * SR);
    const f = b % 2 ? 1800 : 2400;
    for (let j = 0; j < SR * 0.03; j++) {
      const t = j / SR;
      add(tr, s0 + j, Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 200) * 0.7);
    }
    let ph = 0;
    for (let j = 0; j < SR * 0.25; j++) {
      const t = j / SR;
      ph += (50 + 30 * Math.exp(-t * 25)) / SR;
      add(tr, s0 + j, Math.sin(2 * Math.PI * ph) * Math.exp(-t * 14) * 0.6);
    }
  }
  writeWav(tr, "ticktock.wav");
}

// Click: crisp UI tap.
{
  const tr = makeTrack(0.12);
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    add(
      tr,
      i,
      (Math.sin(2 * Math.PI * 1500 * t) + noise() * 0.5) * Math.exp(-t * 180),
    );
  }
  writeWav(tr, "click.wav");
}

// Riser: filtered noise + rising tone, 2 seconds.
{
  const tr = makeTrack(2);
  let prev = 0;
  let lp = 0;
  let ph = 0;
  for (let i = 0; i < tr.n; i++) {
    const t = i / SR;
    const p = t / 2;
    const n = noise();
    const hp = n - prev;
    prev = n;
    lp += (0.05 + 0.5 * p) * (hp - lp);
    ph += (200 * Math.pow(4, p)) / SR;
    const swell = Math.pow(p, 2.5);
    add(tr, i, (lp + Math.sin(2 * Math.PI * ph) * 0.3) * swell);
  }
  writeWav(tr, "riser.wav");
}
