// Generates the English (American male) voiceover for DreamRaffleCine with
// ElevenLabs on fal.ai, one clip per line, plus a timings file with each
// clip's length so the shots can be stretched to fit the narration.
//
//   FAL_KEY=... node scripts/dreamcine-voiceover.mjs
//
// Read a little faster than conversational, with high-energy promo delivery
// (low stability, high style), and loudness-normalized so it sits well above
// the score. Optional: VO_VOICE (default Brian), VO_SPEED (default 1.12).
// Writes public/dreamcine/vo/<id>.mp3 and src/DreamRaffleCine/vo-timings.json.
// Line ids match the shot ids in src/DreamRaffleCine/index.tsx.

import { execFileSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINES = {
  rent: "Twenty-five hundred dollars a month... for a home that will never be yours?",
  jerusalem: "Now imagine this: No mortgage! No rent! Ever!",
  promoWin:
    "A brand-new, one-point-three-million-dollar apartment, right in Jerusalem!",
  living: "Fully furnished, down to the last detail! Just bring your suitcase!",
  winner: "Last year, Aryeh from New York got the call!",
  promoYou: "And this year... it could be you!",
  features:
    "Givat Mordechai, Jerusalem! Two bedrooms, two full baths, a large balcony, and a Shabbat elevator!",
  offer:
    "And right now, every order is doubled! Buy one ticket, get one free! Order by November eleventh, and you're in for the fifteen-thousand-dollar cash bonus!",
  cause:
    "Every ticket helps build the Land of Israel, and supports IDF soldiers!",
  couch: "Worst case? You helped Israel's heroes! Best case? You get the keys!",
  end: "Don't wait! Tap the link, double your tickets, and enter today, at the dream raffle dot com!",
};

const KEY = process.env.FAL_KEY;
if (!KEY) {
  console.error("FAL_KEY is not set.");
  process.exit(1);
}
const MODEL = "fal-ai/elevenlabs/tts/multilingual-v2";
const VOICE = process.env.VO_VOICE ?? "Brian";
const SPEED = Number(process.env.VO_SPEED ?? 1.12);
const headers = {
  Authorization: `Key ${KEY}`,
  "Content-Type": "application/json",
};

const run = async (input) => {
  const sub = await fetch(`https://queue.fal.run/${MODEL}`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  if (!sub.ok) throw new Error(`${sub.status} ${await sub.text()}`);
  const { status_url, response_url } = await sub.json();
  for (;;) {
    await new Promise((r) => setTimeout(r, 1500));
    const st = await (await fetch(status_url, { headers })).json();
    if (st.status === "COMPLETED") break;
    if (st.status === "FAILED" || st.error) throw new Error(JSON.stringify(st));
  }
  return (await fetch(response_url, { headers })).json();
};

const OUT = "public/dreamcine/vo";
mkdirSync(OUT, { recursive: true });
const timings = {};
for (const [id, text] of Object.entries(LINES)) {
  const out = await run({
    text,
    voice: VOICE,
    stability: 0.3,
    similarity_boost: 0.8,
    style: 0.65,
    speed: SPEED,
  });
  const path = join(OUT, `${id}.mp3`);
  const r = await fetch(out.audio.url);
  const raw = join(OUT, `${id}.raw.mp3`);
  writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    raw,
    "-af",
    "loudnorm=I=-14:TP=-1.5:LRA=7",
    "-ar",
    "44100",
    "-b:a",
    "192k",
    path,
  ]);
  unlinkSync(raw);
  const sec = Number(
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      path,
    ]).toString(),
  );
  timings[id] = Math.round(sec * 1000) / 1000;
  console.log(`${id}: ${timings[id]}s`);
}
writeFileSync(
  "src/DreamRaffleCine/vo-timings.json",
  JSON.stringify(timings, null, 2) + "\n",
);
