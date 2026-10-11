// Generates the Hebrew voiceover for DreamRaffle, one clip per scene, fitted
// to the scene slots, plus src/DreamRaffle/voiceover.json which places them.
//
//   ELEVENLABS_API_KEY=... npm run dreamraffle-vo           # ElevenLabs eleven_v3 (default)
//   GOOGLE_TTS_API_KEY=... npm run dreamraffle-vo -- google  # Google Cloud he-IL-Wavenet-B
//
// Optional: ELEVENLABS_VOICE_ID (pick a native Hebrew voice from the ElevenLabs
// voice library for the best accent), ELEVENLABS_MODEL, TTS_VOICE (Google).
// Needs ffmpeg/ffprobe on PATH. Writes public/dreamraffle/vo/NN.mp3.

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FPS = 30;
// [slot start s, slot end s, text as spoken]. Kept in step with VO_SCRIPT in
// src/DreamRaffle/theme.ts; the spoken text spells out what TTS would misread
// (the domain, "1.3", "א' ועד ת'").
const LINES = [
  [0, 3, "מדמיינים את עצמכם נכנסים לדירת יוקרה מרוהטת מאלף ועד תו, בלב ירושלים?"],
  [3, 7, "הגרלת החלומות 2026 של קרן 'עם ישראל חי' כבר כאן! קונים כרטיס אחד – ומקבלים עוד כרטיס במתנה!"],
  [7, 13, 'מעבר להזדמנות לזכות בדירה בשווי אחת נקודה שלוש מיליון דולר, כל כרטיס תורם ישירות לחיילי צה"ל ולציוד חירום מציל חיים בחזית!'],
  [13, 20, "הזמן אוזל והמלאי מוגבל! היכנסו עכשיו לדה דרים רפל דוט קו דוט איי אל, והבטיחו את המקום שלכם בהגרלה!"],
];
const VIDEO_END = 20;
const MAX_TEMPO = 1.25; // never speed speech up beyond this
const GAP = 0.12; // minimum pause between lines, seconds

const engine = process.argv[2] ?? "elevenlabs";
const outDir = "public/dreamraffle/vo";
const tmpDir = "scripts/dr-vo-tmp";
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const synthElevenLabs = async (text) => {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not set.");
  const voice = process.env.ELEVENLABS_VOICE_ID ?? "TX3LPaxmHKxFdv7VOQHJ";
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_192`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL ?? "eleven_v3",
        language_code: "he",
        // Lower stability = livelier, more energetic read.
        voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.45, use_speaker_boost: true },
      }),
    },
  );
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return { data: Buffer.from(await res.arrayBuffer()), ext: "mp3", voice };
};

const synthGoogle = async (text) => {
  const key = process.env.GOOGLE_TTS_API_KEY;
  if (!key) throw new Error("GOOGLE_TTS_API_KEY is not set.");
  const voice = process.env.TTS_VOICE ?? "he-IL-Wavenet-B";
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: "he-IL", name: voice },
      audioConfig: { audioEncoding: "LINEAR16", sampleRateHertz: 48000, speakingRate: 1.1, pitch: -1 },
    }),
  });
  if (!res.ok) throw new Error(`Google TTS ${res.status}: ${await res.text()}`);
  const { audioContent } = await res.json();
  return { data: Buffer.from(audioContent, "base64"), ext: "wav", voice };
};

const synth = { elevenlabs: synthElevenLabs, google: synthGoogle }[engine];
if (!synth) {
  console.error(`Unknown engine "${engine}" (use elevenlabs or google).`);
  process.exit(1);
}

const ffmpeg = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args]);
const seconds = (file) =>
  Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file])
      .toString()
      .trim(),
  );
const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05";

const lines = [];
let prevEnd = 0;
let voiceName = "";
try {
  for (const [i, [slotStart, slotEnd, text]] of LINES.entries()) {
    const id = String(i + 1).padStart(2, "0");
    const { data, ext, voice } = await synth(text);
    voiceName = voice;
    const raw = join(tmpDir, `${id}.${ext}`);
    const clean = join(tmpDir, `${id}.wav`);
    writeFileSync(raw, data);
    ffmpeg("-i", raw, "-ac", "1", "-ar", "48000", "-af", `${trim},areverse,${trim},areverse`, clean);

    const length = seconds(clean);
    const start = i === 0 ? slotStart : Math.max(slotStart, prevEnd + GAP);
    const tempo = Math.min(Math.max(length / Math.max(slotEnd - start, 0.1), 1), MAX_TEMPO);
    ffmpeg("-i", clean, "-af", `atempo=${tempo.toFixed(4)}`, "-c:a", "libmp3lame", "-b:a", "192k", join(outDir, `${id}.mp3`));
    const end = start + length / tempo;
    const over = end - slotEnd > 0.05 ? `  ⚠ runs ${(end - slotEnd).toFixed(2)}s past its slot` : "";
    console.log(`${id}  ${length.toFixed(2)}s ×${tempo.toFixed(2)} → ${start.toFixed(2)}–${end.toFixed(2)}s${over}`);
    lines.push({ file: `dreamraffle/vo/${id}.mp3`, from: Math.round(start * FPS), frames: Math.ceil((end - start) * FPS) });
    prevEnd = end;
  }
} catch (err) {
  console.error(err.message);
  process.exit(1);
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}

if (prevEnd > VIDEO_END) {
  console.warn(`⚠ Voiceover ends at ${prevEnd.toFixed(2)}s, after the video (${VIDEO_END}s). Shorten a line.`);
}
writeFileSync(
  "src/DreamRaffle/voiceover.json",
  JSON.stringify({ engine, voice: voiceName, lines }, null, 2) + "\n",
);
console.log("Wrote src/DreamRaffle/voiceover.json");
