import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled in public/fonts so renders don't depend on network access.
export const SERIF = "Frank Ruhl Libre";
export const SANS = "Heebo";
for (const weight of ["500", "700", "900"]) {
  loadFont({
    family: SERIF,
    url: staticFile(`fonts/FrankRuhlLibre-${weight}.ttf`),
    weight,
  });
}
for (const weight of ["400", "700", "900"]) {
  loadFont({
    family: SANS,
    url: staticFile(`fonts/Heebo-${weight}.ttf`),
    weight,
  });
}

export const COLORS = {
  navy: "#0B1F3A",
  navyDeep: "#06122A",
  gold: "#C9A14A",
  goldLight: "#F3DE9C",
  goldDark: "#8C6A22",
  stone: "#E8DCC4",
  white: "#FFFFFF",
};
export const GOLD_GRADIENT = `linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 55%, ${COLORS.goldDark} 100%)`;

export const FPS = 30;
export const DURATION = 1380;
export const CROSSFADE = 10;

// Scene start frames, cut to the voiceover below.
export const SCENES = {
  hook: { from: 0, duration: 135 },
  jerusalem: { from: 135, duration: 144 },
  interior: { from: 279, duration: 117 },
  offer: { from: 396, duration: 228 },
  earlyBird: { from: 624, duration: 161 },
  mission: { from: 785, duration: 286 },
  cta: { from: 1071, duration: 309 },
};

// ElevenLabs v3 ("Brian") lines from dream-raffle-promo-script.md, sped up
// 4% with ffmpeg atempo. `from` is the start frame.
export const VO = [
  { src: "dreamraffle/vo/01.mp3", from: 9 },
  { src: "dreamraffle/vo/02.mp3", from: 193 },
  { src: "dreamraffle/vo/03.mp3", from: 279 },
  { src: "dreamraffle/vo/04.mp3", from: 396 },
  { src: "dreamraffle/vo/05.mp3", from: 624 },
  { src: "dreamraffle/vo/06.mp3", from: 785 },
  { src: "dreamraffle/vo/07.mp3", from: 1071 },
];

// fal.ai stills (FLUX 1.1 Ultra / Nano Banana 2). A shot listed in CLIPS
// plays its Kling 3.0 clip (public/dreamraffle/clips/<name>.mp4, length in
// seconds) instead of a slow push-in on the still.
export type Shot =
  | "s1-key"
  | "s2-jerusalem"
  | "s3-interior"
  | "s6a-torah"
  | "s6b-medic"
  | "s6c-idf"
  | "s7-lock";

export const STILLS: Record<Shot, string> = {
  "s1-key": "dreamraffle/stills/s1-key-v2.jpg",
  "s2-jerusalem": "dreamraffle/stills/s2b-jerusalem-v1.jpg",
  "s3-interior": "dreamraffle/stills/s3-interior-v1.jpg",
  "s6a-torah": "dreamraffle/stills/s6a-torah-v1.jpg",
  "s6b-medic": "dreamraffle/stills/s6b-medic-v2.jpg",
  "s6c-idf": "dreamraffle/stills/s6c-idf-v1.jpg",
  "s7-lock": "dreamraffle/stills/s7b-lock-v1.jpg",
};

export const CLIPS: Partial<Record<Shot, number>> = {};
