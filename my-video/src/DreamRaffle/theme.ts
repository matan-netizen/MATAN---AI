import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled in public/fonts so renders don't depend on network access.
export const FONT = "Heebo";
export const SERIF = "Frank Ruhl Libre";
for (const weight of ["400", "700", "900"]) {
  loadFont({
    family: FONT,
    url: staticFile(`fonts/Heebo-${weight}.ttf`),
    weight,
  });
}
for (const weight of ["500", "700", "900"]) {
  loadFont({
    family: SERIF,
    url: staticFile(`fonts/FrankRuhlLibre-${weight}.ttf`),
    weight,
  });
}

// Palette sampled from the Dream Raffle source video (dark cocoa + gold).
export const COLORS = {
  cocoa: "#2B1F17",
  ink: "#1A120C",
  bronze: "#8A5A36",
  gold: "#E2B04A",
  goldLight: "#F6D88A",
  cream: "#F5E9D6",
  white: "#FFFFFF",
};
export const GOLD_GRADIENT = `linear-gradient(180deg, ${COLORS.goldLight}, ${COLORS.gold} 55%, #B9832C)`;

export const FPS = 30;
export const CROSSFADE = 8;

// Scene lengths in frames; start frames are derived so a scene can be
// lengthened without retiming everything after it.
const LENGTHS = {
  host: 156,
  hook: 136,
  winner: 68,
  quote: 128,
  turn: 46,
  prize: 294,
  offer: 246,
  impact: 63,
  cta: 199,
};
type SceneName = keyof typeof LENGTHS;
let cursor = 0;
export const SCENES = Object.fromEntries(
  (Object.keys(LENGTHS) as SceneName[]).map((name) => {
    const scene = { from: cursor, duration: LENGTHS[name] };
    cursor += LENGTHS[name];
    return [name, scene];
  }),
) as Record<SceneName, { from: number; duration: number }>;
export const DURATION = cursor;

const at = (scene: SceneName, offset: number) => SCENES[scene].from + offset;

// Voiceover clips (public/dream/vo, made by scripts/generate-dream-voiceover.mjs)
// and the frame each one starts on.
export const VO = [
  { file: "01", at: at("hook", 6) },
  { file: "02", at: at("winner", 6) },
  { file: "03", at: at("turn", 4) },
  { file: "04", at: at("prize", 9) },
  { file: "05", at: at("prize", 138) },
  { file: "06", at: at("offer", 6) },
  { file: "07", at: at("offer", 105) },
  { file: "08", at: at("impact", 4) },
  { file: "09", at: at("cta", 6) },
];

// Music starts under the prize reveal, after the host's opening lines.
export const MUSIC_FROM = SCENES.hook.from;

// Sound effects (public/dream/audio, made by scripts/generate-dream-audio.mjs).
const cut = (scene: SceneName) => ({
  file: "whoosh",
  at: at(scene, -9),
  volume: 0.45,
});
export const SFX = [
  cut("hook"),
  { file: "impact", at: at("hook", 4), volume: 0.6 },
  cut("winner"),
  cut("quote"),
  cut("turn"),
  { file: "shimmer", at: at("turn", 6), volume: 0.5 },
  cut("prize"),
  ...[62, 138, 165, 195, 225, 262].map((f) => ({
    file: "whoosh",
    at: at("prize", f - 8),
    volume: 0.22,
  })),
  cut("offer"),
  { file: "ding", at: at("offer", 8), volume: 0.5 },
  { file: "impact", at: at("offer", 103), volume: 0.45 },
  { file: "ding", at: at("offer", 116), volume: 0.4 },
  cut("impact"),
  { file: "riser", at: at("cta", -78), volume: 0.45 },
  { file: "impact", at: at("cta", 0), volume: 0.7 },
  { file: "shimmer", at: at("cta", 12), volume: 0.45 },
];

// Dream Raffle 8 apartment, from the gallery on thedreamraffle.co.il.
export const PHOTO = {
  balconyView: "dream/photos/balcony-view.jpg",
  livingRoom: "dream/photos/living-room.jpg",
  livingDining: "dream/photos/living-dining.jpg",
  bedroom: "dream/photos/bedroom.jpg",
  bathroom: "dream/photos/bathroom.jpg",
  balcony: "dream/photos/balcony.jpg",
  kitchen: "dream/photos/kitchen.jpg",
  lounge: "dream/photos/lounge.jpg",
};

// The supplied edit (DreamRaffle_EN_NoHebrew_1.mp4), 1080x1920 @ 30fps.
export const SOURCE = "dream/source.mp4";

// Regions of the source frame that hold clean footage.
export const CROP = {
  // Interview / balcony footage inside the gold frame (English subtitles burned in).
  box: { x: 45, y: 565, w: 990, h: 552 },
};

// Source timestamps (seconds) of the moments we use.
export const CLIP = {
  balcony: 23.1,
};

// Aryeh Luria interview (supplied WhatsApp clip, 848x474), upscaled 2x with
// Real-ESRGAN frame by frame. The crop drops the screen-recording border and
// a cut-off watermark. Speech is in English.
export const INTERVIEW = {
  src: "dream/winner-interview.mp4",
  size: { w: 1696, h: 948 },
  crop: { x: 8, y: 26, w: 1610, h: 816 },
  // Luria talking (muted under the narration).
  intro: 2.4,
  // "You won this apartment. How do you feel?" / "I'm very happy, very happy."
  quote: 6.6,
};

// Captions for the quote, in seconds from INTERVIEW.quote.
export const QUOTE_CAPTIONS = [
  { from: 0.15, to: 1.9, text: "You won this apartment." },
  { from: 1.9, to: 2.85, text: "How do you feel?" },
  { from: 2.9, to: 4.27, text: "I'm very happy — very happy!" },
];
