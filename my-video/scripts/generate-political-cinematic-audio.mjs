// Synthesizes the trailer-style score and sound design for
// PoliticalCinematic (no licensing concerns). No dependencies; writes a WAV.
//
//   node scripts/generate-political-cinematic-audio.mjs <out.wav>
//
// D minor → D major. Timings (seconds) follow src/PoliticalAnimation/:
//   0 → 1.5    low drone; distant boom as he lands on the first cube (0.4s)
//   1.5 → 5    string ostinato building; whooshes on the hops, timpani on the
//              landings (2s, 3.5s)
//   5 → 7      the thought: high string tremolo, heartbeat pulses, riser
//   7          the golden cube lands: "braam", sub boom, cymbal
//   7.5 → 8    rising whoosh on the last hop
//   8 → 10     triumph in D major: brass, strings, choir pad, timpani roll,
//              fanfare, final hit at 9.5s

import { writeFileSync } from "node:fs";

const SR = 44100;
const out = process.argv[2] ?? "political-cinematic.wav";
const TOTAL = 10;
// Must match HOPS / GOLDEN / LANDED in src/PoliticalAnimation/index.tsx.
const FIRST_LANDING = 0.4;
const HOP_STARTS = [1.5, 3.0];
const HOP = 0.5;
const THINK = 5;
const GOLDEN = 7;
const FINAL_HOP = 7.5;
const LANDED = 8;
const FINAL = 9.5;

let seed = 777;
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

// Strings: detuned saws, attack/release, low-pass (number or function of time).
const strings = (t0, dur, notes, gain, cutoff, attack = 0.3, release = 0.6, tremolo = 0) => {
  const s0 = Math.floor(t0 * SR);
  notes.forEach((note, k) => {
    const f = hz(note);
    const ph = [0.996, 1, 1.004].map(() => Math.abs(noise()));
    let lpL = 0;
    let lpR = 0;
    for (let j = 0; j < (dur + release) * SR; j++) {
      const t = j / SR;
      let env = Math.min(1, t / attack) * (t > dur ? Math.max(0, 1 - (t - dur) / release) : 1);
      if (tremolo) env *= 0.6 + 0.4 * Math.sin(2 * Math.PI * tremolo * t + k);
      const vib = 1 + 0.003 * Math.sin(2 * Math.PI * 5.3 * t + k);
      let l = 0;
      let r = 0;
      [0.996, 1, 1.004].forEach((d, v) => {
        ph[v] += (f * d * vib) / SR;
        const x = saw(ph[v]);
        if (v !== 2) l += x;
        if (v !== 0) r += x;
      });
      const c = typeof cutoff === "function" ? cutoff(t0 + t) : cutoff;
      lpL += c * (l - lpL);
      lpR += c * (r - lpR);
      add(s0 + j, lpL * env * gain, lpR * env * gain);
    }
  });
};

const brass = (t0, dur, notes, gain, bright = 0.25, drive = 1) => {
  const s0 = Math.floor(t0 * SR);
  for (const note of notes) {
    const f = hz(note);
    let p1 = 0;
    let p2 = 0.3;
    let lp = 0;
    for (let j = 0; j < (dur + 0.6) * SR; j++) {
      const t = j / SR;
      p1 += f / SR;
      p2 += (f * 1.005) / SR;
      lp += (0.04 + bright * Math.exp(-t * 3)) * (saw(p1) + saw(p2) - lp);
      const env = Math.min(1, t / 0.04) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.6) : 1);
      const x = Math.tanh(lp * drive) * env * gain;
      add(s0 + j, x * 0.95, x);
    }
  }
};

// Choir pad: stacked sines with formant-like upper partials and slow vibrato.
const choir = (t0, dur, notes, gain) => {
  const s0 = Math.floor(t0 * SR);
  notes.forEach((note, k) => {
    const f = hz(note);
    for (let j = 0; j < (dur + 1) * SR; j++) {
      const t = j / SR;
      const env = Math.min(1, t / 0.5) * (t > dur ? Math.max(0, 1 - (t - dur)) : 1);
      const v = 1 + 0.005 * Math.sin(2 * Math.PI * 4.8 * t + k);
      const x =
        Math.sin(2 * Math.PI * f * v * t) +
        0.5 * Math.sin(2 * Math.PI * 2 * f * v * t) +
        0.3 * Math.sin(2 * Math.PI * 3 * f * v * t) +
        0.15 * Math.sin(2 * Math.PI * 5 * f * v * t);
      add(s0 + j, x * env * gain * (k % 2 ? 0.8 : 1), x * env * gain * (k % 2 ? 1 : 0.8));
    }
  });
};

const timpani = (t0, note, gain) => {
  const f = hz(note);
  const s0 = Math.floor(t0 * SR);
  for (let j = 0; j < 1.6 * SR; j++) {
    const t = j / SR;
    const x = Math.sin(2 * Math.PI * f * t * (1 + 0.05 * Math.exp(-t * 12))) + 0.3 * noise() * Math.exp(-t * 40);
    add(s0 + j, x * Math.exp(-t * 2.6) * gain);
  }
};

// Sub boom: a deep sine drop, for impacts.
const boom = (t0, gain, dur = 2) => {
  const s0 = Math.floor(t0 * SR);
  let p = 0;
  for (let j = 0; j < dur * SR; j++) {
    const t = j / SR;
    p += (32 + 70 * Math.exp(-t * 8)) / SR;
    add(s0 + j, Math.sin(2 * Math.PI * p) * Math.exp(-t * 2.2) * gain + noise() * Math.exp(-t * 30) * gain * 0.3);
  }
};

const cymbal = (t0, gain, dur = 2.5) => {
  const s0 = Math.floor(t0 * SR);
  let prev = 0;
  for (let j = 0; j < dur * SR; j++) {
    const t = j / SR;
    const x = noise();
    const hp = x - prev;
    prev = x;
    add(s0 + j, hp * Math.exp(-t * 1.8) * gain, noise() * 0.5 * Math.exp(-t * 1.8) * gain);
  }
};

// Whoosh: band-passed noise sweeping up (or up then down).
const whoosh = (t0, dur, gain, rise = false) => {
  const s0 = Math.floor(t0 * SR);
  let low = 0;
  let band = 0;
  for (let j = 0; j < dur * SR; j++) {
    const t = j / SR;
    const p = t / dur;
    const fc = rise ? 300 + 7000 * p * p : 300 + 4500 * Math.sin(Math.PI * p);
    const f = 2 * Math.sin((Math.PI * fc) / SR);
    low += f * band;
    const high = noise() - low - 0.7 * band;
    band += f * high;
    const env = rise ? p * p : Math.sin(Math.PI * p) ** 2;
    add(s0 + j, band * env * gain * (1 - p * 0.6), band * env * gain * (0.4 + p * 0.6));
  }
};

const heartbeat = (t0, gain) => {
  for (const [dt, g] of [[0, 1], [0.16, 0.7]]) {
    const s0 = Math.floor((t0 + dt) * SR);
    for (let j = 0; j < 0.25 * SR; j++) {
      const t = j / SR;
      add(s0 + j, Math.sin(2 * Math.PI * (45 + 30 * Math.exp(-t * 20)) * t) * Math.exp(-t * 16) * gain * g);
    }
  }
};

// Schroeder reverb over the whole mix.
const reverb = (input, mix, offset) => {
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ buf: new Float32Array(Math.floor((d + offset) * 1.3)), i: 0, lp: 0 }));
  const aps = [225, 556].map((d) => ({ buf: new Float32Array(d + offset), i: 0 }));
  const res = new Float32Array(input.length);
  for (let s = 0; s < input.length; s++) {
    let acc = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.lp = y * 0.6 + c.lp * 0.4;
      c.buf[c.i] = input[s] + c.lp * 0.86;
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
    res[s] = input[s] * (1 - mix) + acc * mix;
  }
  return res;
};

// ---------------------------------------------------------------------------
// Score
// ---------------------------------------------------------------------------

// Low drone under everything until the reveal.
strings(0, GOLDEN, [26, 33, 38], 0.07, (t) => 0.01 + 0.02 * Math.min(1, t / GOLDEN), 1.2, 0.4);
boom(FIRST_LANDING, 0.35, 1.5);

// Ostinato: D minor 8ths, opening up as he climbs.
const OSTINATO = [50, 50, 53, 50, 57, 50, 53, 55];
for (let k = 0; k < (THINK - HOP_STARTS[0]) / 0.25; k++) {
  const t = HOP_STARTS[0] + k * 0.25;
  const note = OSTINATO[k % 8] + (t >= HOP_STARTS[1] ? 12 : 0);
  strings(t, 0.18, [note], 0.06, 0.04 + 0.06 * ((t - HOP_STARTS[0]) / (THINK - HOP_STARTS[0])), 0.01, 0.08);
}
// Whooshes on the hops, timpani on the landings.
for (const start of HOP_STARTS) {
  whoosh(start, HOP, 0.35);
  timpani(start + HOP, 38, 0.5);
  boom(start + HOP, 0.2, 1);
}

// The thought: tremolo cluster, heartbeat, riser into the reveal.
strings(THINK, GOLDEN - THINK, [81, 82], 0.03, (t) => 0.03 + 0.08 * ((t - THINK) / 2), 0.5, 0.1, 12);
for (let t = THINK; t < GOLDEN - 0.2; t += 0.75) heartbeat(t, 0.5);
whoosh(GOLDEN - 1.5, 1.5, 0.3, true);

// The reveal: braam, boom, cymbal.
brass(GOLDEN, 0.9, [26, 33, 38, 41, 45], 0.06, 0.12, 2.5);
boom(GOLDEN, 0.6, 2.5);
cymbal(GOLDEN, 0.14);

// The final hop and the landing.
whoosh(FINAL_HOP, LANDED - FINAL_HOP, 0.45, true);
for (let k = 0; k < 6; k++) timpani(LANDED - 0.3 + k * 0.05, 38, 0.12 + k * 0.04);

// Triumph in D major.
boom(LANDED, 0.45, 2);
cymbal(LANDED, 0.18);
brass(LANDED, 1.4, [50, 57, 62, 66, 69], 0.05, 0.3, 1.5);
strings(LANDED, 2, [62, 66, 69, 74, 78], 0.05, 0.12, 0.2, 0.5);
choir(LANDED, 2, [62, 66, 69, 74], 0.025);
// Fanfare: A4 → D5 → F#5 → A5.
[[0.0, 69], [0.25, 74], [0.5, 78], [0.75, 81]].forEach(([dt, note], k) =>
  brass(LANDED + 0.25 + dt, k === 3 ? 0.6 : 0.2, [note], 0.06, 0.35, 1.2),
);
for (const t of [8.5, 9.0]) timpani(t, 33, 0.35);

// Final hit.
brass(FINAL, 0.4, [38, 45, 50, 57, 62, 66], 0.06, 0.3, 1.8);
timpani(FINAL, 38, 0.6);
boom(FINAL, 0.5, 0.5);
cymbal(FINAL, 0.12, 0.5);

// Reverb, fade, normalise, write.
const wetL = reverb(L, 0.25, 0);
const wetR = reverb(R, 0.25, 23);
let peak = 0;
for (let i = 0; i < n; i++) {
  const fade = i > n - 0.4 * SR ? (n - i) / (0.4 * SR) : 1;
  wetL[i] = Math.tanh(wetL[i]) * fade;
  wetR[i] = Math.tanh(wetR[i]) * fade;
  peak = Math.max(peak, Math.abs(wetL[i]), Math.abs(wetR[i]));
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
  buf.writeInt16LE(Math.round(wetL[i] * norm * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(wetR[i] * norm * 32767), 46 + i * 4);
}
writeFileSync(out, buf);
console.log(`Wrote ${out}`);
