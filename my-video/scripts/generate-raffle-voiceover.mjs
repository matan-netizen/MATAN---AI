// Generates the male Hebrew voiceover for the Dream Raffle videos with
// ElevenLabs (eleven_v3 speaks Hebrew), one clip per caption line in
// src/DreamRaffle/script.json. Each clip starts at its caption's frame.
//
//   ELEVENLABS_API_KEY=sk_... npm run raffle-voiceover
//
// Optional: ELEVENLABS_VOICE_ID (pick a Hebrew-capable male voice in the
// ElevenLabs voice library), ELEVENLABS_MODEL (default eleven_v3).
// Writes public/raffle/vo/<version>-NN.mp3 and src/DreamRaffle/voiceover.json.
// A clip longer than its caption slot is sped up (max 1.25×) to fit.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY || !KEY.startsWith("sk_")) {
  console.error("ELEVENLABS_API_KEY is missing or not an ElevenLabs key (they start with sk_).");
  process.exit(1);
}
const VOICE = process.env.ELEVENLABS_VOICE_ID ?? "pNInz6obpgDQGcFmaJgB";
const MODEL = process.env.ELEVENLABS_MODEL ?? "eleven_v3";
const FPS = 30;

// Spoken forms for symbols and numbers the TTS might misread.
const SAY = [
  ["70 ₪", "שבעים שקל"],
  ["1.3 מיליון", "אחד נקודה שלוש מיליון"],
  ["15 אלף", "חמישה עשר אלף"],
  ["25 אלף", "עשרים וחמישה אלף"],
  ["שנה 8", "שנה שמונה"],
  ["—", ","],
];
const spoken = (text) => SAY.reduce((t, [a, b]) => t.split(a).join(b), text);

const script = JSON.parse(readFileSync("src/DreamRaffle/script.json", "utf8"));
const outDir = "public/raffle/vo";
const tmpDir = "scripts/raffle-vo-tmp";
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const seconds = (file) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());

const lines = {};
for (const [version, captions] of Object.entries(script)) {
  lines[version] = [];
  for (const [i, cap] of captions.entries()) {
    const id = `${version}-${String(i + 1).padStart(2, "0")}`;
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": KEY, "content-type": "application/json" },
      body: JSON.stringify({
        text: spoken(cap.text),
        model_id: MODEL,
        language_code: "he",
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.35 },
      }),
    });
    if (!res.ok) {
      console.error(`${id} failed: ${res.status} ${await res.text()}`);
      process.exit(1);
    }
    const raw = join(tmpDir, `${id}.mp3`);
    writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
    const slot = (cap.to - cap.from) / FPS;
    let len = seconds(raw);
    const out = join(outDir, `${id}.mp3`);
    const tempo = Math.min(1.25, Math.max(1, len / slot));
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-af", `atempo=${tempo.toFixed(3)}`, "-b:a", "160k", out]);
    len = seconds(out);
    const warn = len > slot ? `  ⚠ ${len.toFixed(2)}s > ${slot.toFixed(2)}s slot` : "";
    console.log(`${id}  ${len.toFixed(2)}s${tempo > 1 ? ` (×${tempo.toFixed(2)})` : ""}${warn}  ${cap.text}`);
    lines[version].push({ file: `raffle/vo/${id}.mp3`, seconds: Number(len.toFixed(3)) });
  }
}

writeFileSync("src/DreamRaffle/voiceover.json", JSON.stringify({ voice: VOICE, model: MODEL, lines }, null, 2) + "\n");
execFileSync("rm", ["-r", tmpDir]);
console.log("Wrote src/DreamRaffle/voiceover.json — re-render to include the voiceover.");
