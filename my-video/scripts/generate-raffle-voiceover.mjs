// Generates the male Hebrew voiceover for DreamRaffle with ElevenLabs, one
// clip per scene, plus src/DreamRaffle/voiceover.json with each clip's
// length. The composition sizes every scene to fit its line.
//
//   npm run raffle-voiceover        (reads ELEVENLABS_API_KEY from .env)
//
// Optional: ELEVENLABS_VOICE_ID (default Brian, a deep male voice),
// ELEVENLABS_MODEL (default eleven_v3, which speaks Hebrew).
// Writes public/raffle/vo/<scene>.mp3.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Keys match the scene names in src/DreamRaffle/index.tsx. Numbers are
// spelled out so the TTS reads them correctly.
const LINES = [
  {
    scene: "hook",
    text: "הגרלת החלומות של עם ישראל חי – כבר השנה התשיעית ברציפות!",
  },
  {
    scene: "prize",
    text: "דירת יוקרה חדשה לגמרי בירושלים, בשווי מיליון ושלוש מאות אלף דולר.",
  },
  {
    scene: "super",
    text: "ובפעם הראשונה – עם כרטיס סופר, הדירה מגיעה מרוהטת, כולל מוצרי חשמל!",
  },
  {
    scene: "offer",
    text: "עכשיו כל הזמנה מוכפלת – אחד ועוד אחד מתנה!",
  },
  {
    scene: "bonus",
    text: "והמצטרפים עד ראש חודש כסלו נכנסים גם להגרלת בונוס של חמישה עשר אלף דולר במזומן.",
  },
  { scene: "cause", text: "כרטיס אחד. מאה דרכים לבנות את ארץ ישראל." },
  {
    scene: "cta",
    text: "היכנסו עכשיו לאתר הגרלת החלומות, וקחו חלק בחלום!",
  },
];

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error(
    "ELEVENLABS_API_KEY is not set. Put it in my-video/.env or the environment, then run again.",
  );
  process.exit(1);
}
const VOICE = process.env.ELEVENLABS_VOICE_ID ?? "nPczCjzI2devNBz1zQrb";
const MODEL = process.env.ELEVENLABS_MODEL ?? "eleven_v3";
const ONLY = process.argv[2];

const outDir = "public/raffle/vo";
mkdirSync(outDir, { recursive: true });

const lines = [];
for (const { scene, text } of LINES) {
  if (ONLY && scene !== ONLY) continue;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "xi-api-key": KEY },
      body: JSON.stringify({ text, model_id: MODEL, language_code: "he" }),
    },
  );
  if (!res.ok) {
    console.error(`${scene} failed: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const file = join(outDir, `${scene}.mp3`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
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
      file,
    ])
      .toString()
      .trim(),
  );
  console.log(`${scene.padEnd(7)} ${seconds.toFixed(2)}s  ${text}`);
  lines.push({ scene, text, seconds: Number(seconds.toFixed(3)) });
}

if (!ONLY) {
  writeFileSync(
    "src/DreamRaffle/voiceover.json",
    JSON.stringify({ voice: VOICE, model: MODEL, lines }, null, 2) + "\n",
  );
}
