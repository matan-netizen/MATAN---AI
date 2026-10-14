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
export const DURATION = 1260;
export const CROSSFADE = 8;

// Scene start frames. The narration below is placed inside these windows,
// and scripts/generate-dream-music.mjs puts a whoosh on every cut.
export const SCENES = {
  hook: { from: 0, duration: 144 },
  winner: { from: 144, duration: 72 },
  quote: { from: 216, duration: 96 },
  turn: { from: 312, duration: 66 },
  prize: { from: 378, duration: 294 },
  offer: { from: 672, duration: 246 },
  impact: { from: 918, duration: 84 },
  cta: { from: 1002, duration: 258 },
};

// Voiceover clips (public/dream/vo, made by scripts/generate-dream-voiceover.mjs)
// and the frame each one starts on.
export const VO = [
  { file: "01", at: 8 },
  { file: "02", at: 150 },
  { file: "03", at: 318 },
  { file: "04", at: 387 },
  { file: "05", at: 516 },
  { file: "06", at: 678 },
  { file: "07", at: 777 },
  { file: "08", at: 924 },
  { file: "09", at: 1008 },
];

// The supplied edit (DreamRaffle_EN_NoHebrew_1.mp4), 1080x1920 @ 30fps.
export const SOURCE = "dream/source.mp4";

// Regions of the source frame that hold clean footage.
export const CROP = {
  // Interview / balcony footage inside the gold frame (English subtitles burned in).
  box: { x: 45, y: 565, w: 990, h: 552 },
  // Apartment interior between the logo and the burned-in caption.
  room: { x: 0, y: 380, w: 1080, h: 660 },
  // Left of the balcony shot: Jerusalem skyline from the apartment.
  view: { x: 45, y: 565, w: 640, h: 391 },
};

// Source timestamps (seconds) of the moments we use.
export const CLIP = {
  roomOpen: 0,
  roomPan: 2.6,
  wonThis: 8.55,
  phoneCall: 19.85,
  balcony: 23.1,
};
