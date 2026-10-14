// Young, upbeat, sales-style Hebrew voiceover for the Driver IVR/ad script,
// generated with ElevenLabs eleven_v3 (speaks Hebrew, follows [audio tags]).
//
//   ELEVENLABS_API_KEY=sk_... NODE_USE_ENV_PROXY=1 node voiceovers/driver/generate.mjs
//
// Optional: ELEVENLABS_VOICE_ID (a young male voice from the ElevenLabs
// voice library). Writes voiceovers/driver/driver-voiceover.mp3 (+ .wav,
// mastered to -16 LUFS for phone and web playback).

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY || !KEY.startsWith("sk_")) {
  console.error("ELEVENLABS_API_KEY is missing or not an ElevenLabs key (they start with sk_).");
  process.exit(1);
}
const VOICE = process.env.ELEVENLABS_VOICE_ID ?? "pNInz6obpgDQGcFmaJgB";
const dir = dirname(fileURLToPath(import.meta.url));

// Delivery direction via v3 audio tags; "1" spelled out so it is read
// "אחת" (the key to press), and the brand gets a short pause before it.
const TEXT = [
  "[excited] צריכים נסיעה? [confident] אל תחפשו את המספר ברגע האחרון!",
  "[friendly] שמרו עכשיו את דרייבר באנשי הקשר, ותוכלו לחזור למספר כשתצטרכו.",
  "[curious] רוצים לשמור את המספר?",
  "[upbeat] לחצו אחת, קבלו צלצול קצר — ושמרו אותו בטלפון.",
  "[short pause] [excited] דרייבר! המספר שלכם לנסיעה הבאה!",
].join("\n\n");

const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_192`, {
  method: "POST",
  headers: { "xi-api-key": KEY, "content-type": "application/json" },
  body: JSON.stringify({
    text: TEXT,
    model_id: "eleven_v3",
    language_code: "he",
    // Lower stability = livelier, more varied sales read.
    voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true },
  }),
});
if (!res.ok) {
  console.error(`ElevenLabs failed: ${res.status} ${await res.text()}`);
  process.exit(1);
}
const raw = join(dir, "raw.mp3");
writeFileSync(raw, Buffer.from(await res.arrayBuffer()));

// Light mastering: trim silence at the ends, gentle compression, loudness.
const chain =
  "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse," +
  "acompressor=threshold=-18dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=7";
for (const [ext, codec] of [["mp3", ["-c:a", "libmp3lame", "-b:a", "192k"]], ["wav", ["-c:a", "pcm_s16le"]]]) {
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-af", chain, "-ar", "44100", ...codec, join(dir, `driver-voiceover.${ext}`)]);
}
execFileSync("rm", [raw]);
console.log("Wrote voiceovers/driver/driver-voiceover.mp3 and .wav");
