// Generates the male Hebrew voiceover for ZoharCampaign with Google Cloud
// Text-to-Speech, one clip per script line, plus a timings file with each
// clip's length so the scenes can be stretched to fit the narration.
//
//   GOOGLE_TTS_API_KEY=... npm run voiceover
//
// Optional: TTS_VOICE (default he-IL-Wavenet-B, male), TTS_RATE, TTS_PITCH.
// Writes public/zohar/vo/NN.mp3 and src/ZoharCampaign/voiceover-timings.json.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINES = [
  "יש רגעים שאדם שואל את עצמו בשקט, בלי שאף אחד ישמע…",
  "כמה עוד אפשר לחכות?",
  "יש מי שכבר התפלל, קיווה, ניסה, נשבר וקם שוב –",
  "ועדיין הלב שלו נשאר עם אותה בקשה שלא זזה.",
  "דווקא מהמקום הזה, של כאב אמיתי ותקווה שלא כבתה,",
  "נפתחת אפשרות קטנה – אבל עם משמעות גדולה:",
  "להיות שותף בדף אחד מתוך הזוהר הקדוש,",
  "השם נרשם בספר החבריא של הרשב״י,",
  "והדף נשלח כקמיע אישי שפורץ את כל המחסומים.",
  "זה הזמן שלך להתחבר לשפע ולהגשים את כל החלומות.",
  "להצטרפות וקבלת הדף האישי – לחצו עכשיו.",
];

const KEY = process.env.GOOGLE_TTS_API_KEY;
if (!KEY) {
  console.error(
    "GOOGLE_TTS_API_KEY is not set. Add a Google Cloud API key restricted to the " +
      "Text-to-Speech API as an environment variable, then run again.",
  );
  process.exit(1);
}
const VOICE = process.env.TTS_VOICE ?? "he-IL-Wavenet-B";
const RATE = Number(process.env.TTS_RATE ?? 1.0);
const PITCH = Number(process.env.TTS_PITCH ?? -2);
const SAMPLE_RATE = 24000;

const outDir = "public/zohar/vo";
const tmpDir = "scripts/vo-wav";
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const timings = [];
for (const [i, text] of LINES.entries()) {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "he-IL", name: VOICE },
        audioConfig: {
          audioEncoding: "LINEAR16",
          sampleRateHertz: SAMPLE_RATE,
          speakingRate: RATE,
          pitch: PITCH,
        },
      }),
    },
  );
  if (!res.ok) {
    console.error(`Line ${i + 1} failed: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const { audioContent } = await res.json();
  const wav = Buffer.from(audioContent, "base64");
  const id = String(i + 1).padStart(2, "0");
  const wavPath = join(tmpDir, `${id}.wav`);
  writeFileSync(wavPath, wav);
  execFileSync("npx", [
    "remotion",
    "ffmpeg",
    "-y",
    "-loglevel",
    "error",
    "-i",
    wavPath,
    "-c:a",
    "libmp3lame",
    "-b:a",
    "160k",
    join(outDir, `${id}.mp3`),
  ]);
  // LINEAR16 mono: 2 bytes per sample after the 44-byte header.
  const seconds = (wav.length - 44) / (SAMPLE_RATE * 2);
  timings.push({ id, text, seconds: Number(seconds.toFixed(3)) });
  console.log(`${id}  ${seconds.toFixed(2)}s  ${text}`);
}

writeFileSync(
  "src/ZoharCampaign/voiceover-timings.json",
  JSON.stringify({ voice: VOICE, lines: timings }, null, 2) + "\n",
);
execFileSync("rm", ["-r", tmpDir]);
console.log(
  `Total speech: ${timings.reduce((s, t) => s + t.seconds, 0).toFixed(1)}s`,
);
