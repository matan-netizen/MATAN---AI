// Synthesizes the score and sound effects for DreamRaffle, so there are no
// licensing concerns. No dependencies; writes 16-bit WAVs.
//
//   node scripts/generate-dream-raffle-audio.mjs <out-dir>
//
// Writes: music.wav, whoosh.wav, chime.wav, click.wav, impact.wav, riser.wav,
// outro.wav
//
// Uplifting orchestral-pop in D major at 120 BPM (one beat = 0.5s), so every
// section change lands on a beat and on the scene cuts in src/DreamRaffle/theme.ts.
// It sits under continuous narration, so it stays out of the voice's range:
// the piano plays low, drums and horn are light, and the band hits between lines.
//   0 → 5s       hook:  strings pad + piano arpeggio, riser into the drop
//   5 → 12s      offer: drums, bass and plucks enter
//   12 → 21s     cause: half-time drums, warm horn melody over strings
//   21 → 25.5s   CTA:   full band, brass stabs, tambourine
//   25.5 → 27.5s final hit on the closing logo card, ringing out

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const outDir = process.argv[2] ?? ".";
mkdirSync(outDir, { recursive: true });

// Must match SCENES in src/DreamRaffle/theme.ts (seconds).
const OFFER = 5;
const CAUSE = 12;
const CTA = 21;
const FINAL_HIT = 25.5;
const TOTAL = 27.5;
const BEAT = 0.5;

let seed = 20261008;
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
    const aps = [225, 556].map((d) => ({ buf: new Float32Array(d + offset), i: 0 }));
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
const strings = (tr, start, dur, notes, gain, cutoff, attack = 0.5) => {
  const release = 0.6;
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
      const env = Math.min(1, t / attack) * (t > dur ? Math.max(0, 1 - (t - dur) / release) : 1);
      const vib = 1 + 0.003 * Math.sin(2 * Math.PI * 5.2 * t + k);
      let l = 0;
      let r = 0;
      detunes.forEach((d, v) => {
        ph[v] += (f * d * vib) / SR;
        const x = saw(ph[v]);
        if (v !== 2) l += x;
        if (v !== 0) r += x;
      });
      lpL += cutoff * (l - lpL);
      lpR += cutoff * (r - lpR);
      add(tr, s0 + j, lpL * env * gain, lpR * env * gain);
    }
  });
};

// Brass: brighter saws with a quick swell, for stabs and the final hit.
const brass = (tr, start, dur, notes, gain) => {
  const len = Math.floor((dur + 0.25) * SR);
  const s0 = Math.floor(start * SR);
  for (const note of notes) {
    const f = midiToHz(note);
    let p1 = 0;
    let p2 = 0.3;
    let lp = 0;
    for (let j = 0; j < len; j++) {
      const t = j / SR;
      const env = Math.min(1, t / 0.03) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.25) : 1 - 0.3 * Math.min(1, t / dur));
      p1 += f / SR;
      p2 += (f * 1.005) / SR;
      const c = 0.05 + 0.25 * Math.exp(-t * 6);
      lp += c * (saw(p1) + saw(p2) - lp);
      add(tr, s0 + j, lp * env * gain * 0.9, lp * env * gain);
    }
  }
};

// Piano / pluck: a few harmonics with exponential decay.
const pluck = (tr, start, note, gain, decay = 3, pan = 0) => {
  const f = midiToHz(note);
  const len = Math.floor(1.2 * SR);
  const s0 = Math.floor(start * SR);
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    const env = Math.min(1, t / 0.004) * Math.exp(-t * decay);
    const x =
      Math.sin(2 * Math.PI * f * t) +
      0.45 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 4) +
      0.2 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 7);
    add(tr, s0 + j, x * env * gain * (1 - pan), x * env * gain * (1 + pan));
  }
};

// Horn: soft sine-ish lead with vibrato, for the melody.
const horn = (tr, start, dur, note, gain) => {
  const f = midiToHz(note);
  const len = Math.floor((dur + 0.2) * SR);
  const s0 = Math.floor(start * SR);
  let p = 0;
  let lp = 0;
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    const env = Math.min(1, t / 0.08) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.2) : 1);
    p += (f * (1 + 0.004 * Math.sin(2 * Math.PI * 5 * t) * Math.min(1, t / 0.3))) / SR;
    lp += 0.12 * (saw(p) - lp);
    add(tr, s0 + j, lp * env * gain);
  }
};

const bass = (tr, start, dur, note, gain) => {
  const f = midiToHz(note);
  const len = Math.floor(dur * SR);
  const s0 = Math.floor(start * SR);
  let p = 0;
  let lp = 0;
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    const env = Math.min(1, t / 0.005) * Math.exp(-t * 2.5) * Math.min(1, (dur - t) / 0.02);
    p += f / SR;
    lp += 0.06 * (saw(p) - lp);
    add(tr, s0 + j, (lp + 0.6 * Math.sin(2 * Math.PI * f * t)) * env * gain);
  }
};

const kick = (tr, start, gain) => {
  const s0 = Math.floor(start * SR);
  let ph = 0;
  for (let j = 0; j < 0.35 * SR; j++) {
    const t = j / SR;
    ph += (45 + 110 * Math.exp(-t * 30)) / SR;
    add(tr, s0 + j, Math.sin(2 * Math.PI * ph) * Math.exp(-t * 9) * gain);
  }
};

const clap = (tr, start, gain) => {
  const s0 = Math.floor(start * SR);
  let bp = 0;
  let lp = 0;
  for (let j = 0; j < 0.25 * SR; j++) {
    const t = j / SR;
    // Three quick bursts then a tail, band-passed around 1.5 kHz.
    const env = (t < 0.03 ? 0.6 + 0.4 * Math.cos(t * 2 * Math.PI * 100) : 1) * Math.exp(-t * 18);
    const x = noise();
    lp += 0.35 * (x - lp);
    bp += 0.5 * (lp - bp);
    add(tr, s0 + j, (lp - bp) * env * gain * 1.4, (lp - bp) * env * gain * 1.2);
  }
};

const hat = (tr, start, gain, decay = 60) => {
  const s0 = Math.floor(start * SR);
  let prev = 0;
  for (let j = 0; j < 0.08 * SR; j++) {
    const x = noise();
    const hp = x - prev;
    prev = x;
    add(tr, s0 + j, hp * Math.exp((-j / SR) * decay) * gain * 0.8, hp * Math.exp((-j / SR) * decay) * gain);
  }
};

const cymbal = (tr, start, gain, dur = 2.5) => {
  const s0 = Math.floor(start * SR);
  let prev = 0;
  for (let j = 0; j < dur * SR; j++) {
    const t = j / SR;
    const x = noise();
    const hp = x - prev;
    prev = x;
    add(tr, s0 + j, hp * Math.exp(-t * 2.2) * gain, noise() * 0.5 * Math.exp(-t * 2.2) * gain);
  }
};

const timpani = (tr, start, note, gain) => {
  const f = midiToHz(note);
  const s0 = Math.floor(start * SR);
  for (let j = 0; j < 1.5 * SR; j++) {
    const t = j / SR;
    const x = Math.sin(2 * Math.PI * f * t * (1 + 0.04 * Math.exp(-t * 10))) + 0.3 * noise() * Math.exp(-t * 40);
    add(tr, s0 + j, x * Math.exp(-t * 2.8) * gain);
  }
};

// Filtered noise sweep (for the riser into the drop and the riser SFX).
const noiseRise = (tr, start, dur, gain) => {
  const s0 = Math.floor(start * SR);
  let lp = 0;
  for (let j = 0; j < dur * SR; j++) {
    const t = j / SR;
    const p = t / dur;
    lp += (0.01 + 0.5 * p * p) * (noise() - lp);
    add(tr, s0 + j, lp * p * p * gain, lp * p * p * gain * 0.9);
  }
};

// ---------------------------------------------------------------------------
// Score
// ---------------------------------------------------------------------------

// I–V–vi–IV in D major, one chord per second (two beats).
const CHORDS = [
  { root: 38, notes: [62, 66, 69] }, // D
  { root: 33, notes: [61, 64, 69] }, // A
  { root: 35, notes: [62, 66, 71] }, // Bm
  { root: 31, notes: [62, 67, 71] }, // G
];
const chordAt = (t) => CHORDS[Math.floor(t + 1e-6) % 4];

const music = makeTrack(TOTAL + 0.5);

for (let t = 0; t + 1 <= FINAL_HIT; t += 1) {
  const c = chordAt(t);
  const section = t < OFFER ? 0 : t < CAUSE ? 1 : t < CTA ? 2 : 3;

  // Strings: soft in the hook, fuller later, an octave up for the CTA.
  const voicing = section === 3 ? [...c.notes, c.notes[0] + 12, c.notes[2] + 12] : c.notes;
  strings(music, t, 1, voicing, [0.05, 0.06, 0.07, 0.07][section], [0.04, 0.07, 0.06, 0.11][section], 0.15);

  // Piano arpeggio, 8ths, through every section.
  const arp = [c.notes[0], c.notes[1], c.notes[2], c.notes[1] + 12];
  for (let k = 0; k < 4; k++) {
    pluck(music, t + k * 0.25, arp[k], section === 2 ? 0.06 : 0.08, 4, k % 2 ? 0.3 : -0.3);
  }

  if (section >= 1) {
    // Bass 8ths.
    for (let k = 0; k < 4; k++) bass(music, t + k * 0.25, 0.24, c.root, section === 2 ? 0.16 : 0.22);
  }
  if (section === 1 || section === 3) {
    // Four-on-the-floor with claps on 2 and 4, hats on the off-beats.
    for (let b = 0; b < 2; b++) {
      const beat = t + b * BEAT;
      kick(music, beat, 0.7);
      hat(music, beat + 0.25, 0.16);
      if (b === 1) clap(music, beat, 0.3);
    }
  }
  if (section === 2) {
    // Half-time: kick on the bar, clap on beat 3 of each two-second bar.
    if (t % 2 === 1) kick(music, t, 0.6);
    else clap(music, t, 0.28);
    hat(music, t + 0.5, 0.12);
  }
  if (section === 3) {
    // Tambourine 16ths and brass stabs on every chord change.
    for (let k = 0; k < 8; k++) hat(music, t + k * 0.125, k % 2 ? 0.08 : 0.14, 90);
    brass(music, t, 0.18, c.notes, 0.06);
    brass(music, t + 0.75, 0.12, c.notes, 0.04);
  }
}

// Horn melody over the cause section and repeated, higher, for the CTA.
const MELODY = [
  [0, 1.0, 78], [1, 0.5, 76], [1.5, 0.5, 74], [2, 1.0, 76], [3, 1.0, 74],
  [4, 0.5, 78], [4.5, 0.5, 81], [5, 1.0, 79],
];
// The cause melody plays twice to fill the longer scene.
for (const rep of [0, 6]) {
  for (const [at, dur, note] of MELODY) {
    if (CAUSE + rep + at + dur <= CTA) horn(music, CAUSE + rep + at, dur * 0.95, note - 12, 0.055);
  }
}
for (const [at, dur, note] of MELODY.slice(0, 5)) horn(music, CTA + at, dur * 0.9, note, 0.04);

// Section accents.
noiseRise(music, OFFER - 1, 1, 0.25);
cymbal(music, OFFER, 0.12);
timpani(music, CAUSE, 38, 0.35);
noiseRise(music, CTA - 1, 1, 0.3);
cymbal(music, CTA, 0.16);
timpani(music, CTA, 38, 0.4);

// Final hit: full D major chord, cymbal and timpani, ringing out.
brass(music, FINAL_HIT, 0.9, [50, 57, 62, 66, 69], 0.08);
strings(music, FINAL_HIT, 1.0, [50, 62, 66, 69, 74, 78], 0.06, 0.12, 0.02);
kick(music, FINAL_HIT, 0.8);
timpani(music, FINAL_HIT, 38, 0.5);
cymbal(music, FINAL_HIT, 0.18, 1.5);

reverb(music, 0.22, 1.1);
writeWav(music, "music.wav", { fadeOut: 0.5 });

// ---------------------------------------------------------------------------
// Sound effects
// ---------------------------------------------------------------------------

// Whoosh: noise through a band-pass sweeping up then down, panned across.
{
  const tr = makeTrack(0.7);
  let low = 0;
  let band = 0;
  for (let j = 0; j < tr.n; j++) {
    const t = j / SR;
    const p = t / 0.7;
    const fc = 300 + 5000 * Math.sin(Math.PI * Math.min(1, p * 1.2));
    const f = 2 * Math.sin((Math.PI * fc) / SR);
    const x = noise();
    low += f * band;
    const high = x - low - 0.6 * band;
    band += f * high;
    const env = Math.sin(Math.PI * p) ** 2;
    add(tr, j, band * env * (1 - p), band * env * p);
  }
  writeWav(tr, "whoosh.wav", { peakTarget: 0.7 });
}

// Chime: bell partials on D6 and A6 with a sparkle.
{
  const tr = makeTrack(1.6);
  for (const [note, delay, g] of [[86, 0, 1], [93, 0.06, 0.6]]) {
    const f = midiToHz(note);
    for (const [ratio, amp, decay] of [[1, 1, 3], [2.76, 0.4, 6], [5.4, 0.2, 10], [8.9, 0.1, 14]]) {
      const s0 = Math.floor(delay * SR);
      for (let j = 0; j < tr.n - s0; j++) {
        const t = j / SR;
        const x = Math.sin(2 * Math.PI * f * ratio * t) * amp * Math.exp(-t * decay) * Math.min(1, t / 0.002);
        add(tr, s0 + j, x * g * 0.3, x * g * 0.3 * (note === 93 ? 1.2 : 0.8));
      }
    }
  }
  reverb(tr, 0.3, 1.2);
  writeWav(tr, "chime.wav", { peakTarget: 0.7 });
}

// Click: crisp UI tick with a soft body, for the CTA button press.
{
  const tr = makeTrack(0.2);
  for (let j = 0; j < tr.n; j++) {
    const t = j / SR;
    const tick = Math.sin(2 * Math.PI * 3200 * t) * Math.exp(-t * 400);
    const body = Math.sin(2 * Math.PI * (180 + 200 * Math.exp(-t * 60)) * t) * Math.exp(-t * 45);
    add(tr, j, tick * 0.6 + body * 0.7);
  }
  writeWav(tr, "click.wav", { peakTarget: 0.8 });
}

// Impact: low boom with a noise burst, for the flash transition into the CTA.
{
  const tr = makeTrack(1.8);
  kick(tr, 0, 1);
  timpani(tr, 0, 26, 0.6);
  cymbal(tr, 0, 0.3, 1.5);
  reverb(tr, 0.35, 1.3);
  writeWav(tr, "impact.wav", { peakTarget: 0.85 });
}

// Riser: one second of rising noise and pitch, lands on the CTA flash.
{
  const tr = makeTrack(1.0);
  noiseRise(tr, 0, 1, 0.7);
  let p = 0;
  for (let j = 0; j < tr.n; j++) {
    const t = j / SR;
    p += (200 + 1400 * t * t) / SR;
    add(tr, j, Math.sin(2 * Math.PI * p) * t * t * 0.25);
  }
  writeWav(tr, "riser.wav", { peakTarget: 0.6 });
}

// Outro: closing sound for the logo card. A bell arpeggio rising through
// D major (D–F#–A–D) over a soft low chord, ringing out.
{
  const tr = makeTrack(2.6);
  const bell = (start, note, gain) => {
    const f = midiToHz(note);
    const s0 = Math.floor(start * SR);
    for (const [ratio, amp, decay] of [[1, 1, 2.2], [2.76, 0.35, 5], [5.4, 0.15, 9], [8.9, 0.07, 13]]) {
      for (let j = 0; j < tr.n - s0; j++) {
        const t = j / SR;
        const x = Math.sin(2 * Math.PI * f * ratio * t) * amp * Math.exp(-t * decay) * Math.min(1, t / 0.002);
        add(tr, s0 + j, x * gain * (note % 2 ? 0.8 : 1), x * gain * (note % 2 ? 1 : 0.8));
      }
    }
  };
  [[0, 74], [0.1, 78], [0.2, 81], [0.3, 86]].forEach(([at, note], k) => bell(at, note, 0.22 + k * 0.04));
  bell(0.3, 74, 0.15); // the octave below rings under the top note
  strings(tr, 0.28, 1.1, [50, 57, 62, 66], 0.05, 0.07, 0.06);
  reverb(tr, 0.35, 1.3);
  writeWav(tr, "outro.wav", { fadeOut: 0.6, peakTarget: 0.8 });
}
