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
export const DURATION = 1290;
export const CROSSFADE = 8;

// Scene start frames. The narration below is placed inside these windows.
export const SCENES = {
  hook: { from: 0, duration: 156 },
  winner: { from: 156, duration: 72 },
  quote: { from: 228, duration: 96 },
  turn: { from: 324, duration: 66 },
  prize: { from: 390, duration: 294 },
  offer: { from: 684, duration: 246 },
  impact: { from: 930, duration: 84 },
  cta: { from: 1014, duration: 276 },
};

// Voiceover clips (public/dream/vo, made by scripts/generate-dream-voiceover.mjs)
// and the frame each one starts on.
export const VO = [
  { file: "01", at: 10 },
  { file: "02", at: 162 },
  { file: "03", at: 330 },
  { file: "04", at: 399 },
  { file: "05", at: 528 },
  { file: "06", at: 690 },
  { file: "07", at: 789 },
  { file: "08", at: 936 },
  { file: "09", at: 1020 },
];

// Sound effects (public/dream/audio, made by scripts/generate-dream-audio.mjs).
const cut = (f: number) => ({ file: "whoosh", at: f - 9, volume: 0.45 });
export const SFX = [
  { file: "ring", at: 0, volume: 0.55 },
  { file: "impact", at: 42, volume: 0.6 },
  cut(SCENES.winner.from),
  cut(SCENES.quote.from),
  cut(SCENES.turn.from),
  { file: "shimmer", at: 336, volume: 0.5 },
  cut(SCENES.prize.from),
  { file: "whoosh", at: 444, volume: 0.25 },
  { file: "whoosh", at: 520, volume: 0.25 },
  { file: "whoosh", at: 547, volume: 0.22 },
  { file: "whoosh", at: 577, volume: 0.22 },
  { file: "whoosh", at: 607, volume: 0.22 },
  { file: "whoosh", at: 644, volume: 0.22 },
  cut(SCENES.offer.from),
  { file: "ding", at: 692, volume: 0.5 },
  { file: "impact", at: 787, volume: 0.45 },
  { file: "ding", at: 800, volume: 0.4 },
  cut(SCENES.impact.from),
  { file: "riser", at: SCENES.cta.from - 78, volume: 0.45 },
  { file: "impact", at: SCENES.cta.from, volume: 0.7 },
  { file: "shimmer", at: SCENES.cta.from + 12, volume: 0.45 },
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
  wonThis: 8.55,
  phoneCall: 19.85,
  balcony: 23.1,
};
