// Generates the English voiceover for DreamRaffle with ElevenLabs
// (multilingual v2) through fal.ai, one clip per script line, plus a timings
// file so the scenes can be fitted to the narration.
//
//   npm run dream-voiceover
//
// Needs FAL_KEY, or a proxy that injects fal.ai credentials.
// Optional: TTS_VOICE (default Brian), TTS_SPEED.
// Writes public/dream/vo/NN.mp3 and src/DreamRaffle/voiceover-timings.json.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Every claim here is checked against thedreamraffle.co.il (home + FAQ).
// Numbers are spelled out so the voice reads them naturally.
const LINES = [
  "Imagine winning a brand-new, one-point-three-million-dollar apartment in Jerusalem.",
  "Last year, Aryeh Luria got the call.",
  "This year, it could be you.",
  "Dream Raffle Nine: a brand-new luxury apartment in Givat Mordechai, Jerusalem.",
  "Two bedrooms, two full baths, a large balcony, private parking, and a Shabbat elevator.",
  "Right now, every order is doubled. Buy one, get one free!",
  "Order by November eleventh, and you're also in the fifteen-thousand-dollar cash bonus drawing.",
  "Every ticket helps build the Land of Israel.",
  "The grand prize drawing is March eleventh. Enter now at thedreamraffle.com.",
];

const VOICE = process.env.TTS_VOICE ?? "Brian";
const SPEED = Number(process.env.TTS_SPEED ?? 1.05);
const KEY = process.env.FAL_KEY;

const outDir = "public/dream/vo";
mkdirSync(outDir, { recursive: true });

const timings = [];
for (const [i, text] of LINES.entries()) {
  const res = await fetch(
    "https://fal.run/fal-ai/elevenlabs/tts/multilingual-v2",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(KEY ? { authorization: `Key ${KEY}` } : {}),
      },
      body: JSON.stringify({
        text,
        voice: VOICE,
        stability: 0.45,
        similarity_boost: 0.8,
        style: 0.35,
        speed: SPEED,
      }),
    },
  );
  if (!res.ok) {
    console.error(`Line ${i + 1} failed: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const { audio } = await res.json();
  const mp3 = Buffer.from(await (await fetch(audio.url)).arrayBuffer());
  const id = String(i + 1).padStart(2, "0");
  const path = join(outDir, `${id}.mp3`);
  writeFileSync(path, mp3);
  const seconds = Number(
    execFileSync("npx", [
      "remotion",
      "ffprobe",
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      path,
    ])
      .toString()
      .trim(),
  );
  timings.push({ id, text, seconds: Number(seconds.toFixed(3)) });
  console.log(`${id}  ${seconds.toFixed(2)}s  ${text}`);
}

writeFileSync(
  "src/DreamRaffle/voiceover-timings.json",
  JSON.stringify({ voice: VOICE, lines: timings }, null, 2) + "\n",
);
console.log(
  `Total speech: ${timings.reduce((s, t) => s + t.seconds, 0).toFixed(1)}s`,
);
