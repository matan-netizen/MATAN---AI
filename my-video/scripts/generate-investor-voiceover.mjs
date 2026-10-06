// Generates the male Hebrew voiceover for InvestorPromo with Google Cloud
// Text-to-Speech, one clip per script line, and records each clip's length
// in src/InvestorPromo/voiceover.json. The composition plays clip N at the
// start of VO_SLOTS[N] in src/InvestorPromo/theme.ts.
//
//   GOOGLE_TTS_API_KEY=... npm run investor-voiceover
//
// Optional: TTS_VOICE (default he-IL-Wavenet-B, male), TTS_RATE, TTS_PITCH.
// To use a studio recording instead, save it as public/investor/vo/01.mp3 …
// 05.mp3 (one per line) and list them in voiceover.json the same way.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Line text and slot length in seconds; keep in sync with VO_SLOTS.
const LINES = [
  ['כמשקיעים, אתם יודעים שהסוד של השקעה מנצחת בנדל"ן מתחיל במיקום מנצח!', 7.5],
  [
    "מיקום מנצח וביקוש שיא! צמוד לבני ברק ולגבעתיים — לוקיישן מבוקש במיוחד שיוצר פוטנציאל אדיר לעליית ערך ולשכירות גבוהה וזמינה בכל ימות השנה!",
    8.6,
  ],
  [
    "מחירי פרי-סייל חסרי תקדים ל-5 הדירות הראשונות, תנאי תשלום נוחים ומפרט פרימיום.",
    9.6,
  ],
  ["זה הזמן לתפוס את ההזדמנות ולהבטיח את העתיד הכלכלי שלכם.", 4.7],
  ["לחצו כאן להשארת פרטים!", 4.2],
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
const BASE_RATE = Number(process.env.TTS_RATE ?? 1.08);
const PITCH = Number(process.env.TTS_PITCH ?? -2);
const SAMPLE_RATE = 24000;

const outDir = "public/investor/vo";
const tmpDir = "scripts/investor-vo-wav";
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const synthesize = async (text, rate) => {
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
          speakingRate: rate,
          pitch: PITCH,
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const wav = Buffer.from((await res.json()).audioContent, "base64");
  // LINEAR16 mono: 2 bytes per sample after the 44-byte header.
  return { wav, seconds: (wav.length - 44) / (SAMPLE_RATE * 2) };
};

const lines = [];
for (const [i, [text, slot]] of LINES.entries()) {
  // Speed a line up (to at most 1.3x) if it would overrun its slot.
  let rate = BASE_RATE;
  let clip = await synthesize(text, rate);
  if (clip.seconds > slot) {
    rate = Math.min(1.3, (rate * clip.seconds) / (slot - 0.1));
    clip = await synthesize(text, rate);
  }
  const id = String(i + 1).padStart(2, "0");
  const wavPath = join(tmpDir, `${id}.wav`);
  writeFileSync(wavPath, clip.wav);
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
  const seconds = Number(clip.seconds.toFixed(3));
  lines.push({ id, seconds });
  const warn = seconds > slot ? `  ⚠ longer than its ${slot}s slot` : "";
  console.log(
    `${id}  ${seconds.toFixed(2)}s @${rate.toFixed(2)}x  ${text}${warn}`,
  );
}

writeFileSync(
  "src/InvestorPromo/voiceover.json",
  JSON.stringify({ voice: VOICE, lines }, null, 2) + "\n",
);
execFileSync("rm", ["-r", tmpDir]);
