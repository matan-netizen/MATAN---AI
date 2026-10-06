import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Heebo is bundled in public/fonts so renders don't depend on network access.
export const FONT = "Heebo";
for (const weight of ["400", "700", "900"]) {
  loadFont({
    family: FONT,
    url: staticFile(`fonts/Heebo-${weight}.ttf`),
    weight,
  });
}

// Navy and gold, sampled from the campaign poster.
export const COLORS = {
  navy: "#0B1A36",
  deep: "#060E20",
  gold: "#E8B64A",
  goldLight: "#FFE9A3",
  goldDark: "#9C6A1C",
  red: "#E5322D",
  white: "#FFFFFF",
};
export const GOLD_GRADIENT = `linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 45%, ${COLORS.goldDark} 100%)`;
export const NAVY_GRADIENT = `linear-gradient(180deg, #13284F 0%, ${COLORS.navy} 55%, ${COLORS.deep} 100%)`;

export const FPS = 30;

// Source footage (public/dream/market.mp4, 30fps) is cut into three takes.
// `src` is the start frame inside the footage.
export const SCENES = {
  hook: { from: 0, duration: 120 },
  askClip: { from: 120, duration: 297, src: 0 },
  prize: { from: 417, duration: 150 },
  causeClip: { from: 567, duration: 270, src: 402 },
  bonus: { from: 837, duration: 180 },
  followClip: { from: 1017, duration: 207, src: 672 },
  cta: { from: 1224, duration: 186 },
};
export const DURATION = SCENES.cta.from + SCENES.cta.duration;

export const MEDIA = {
  footage: "dream/market.mp4",
  poster: "dream/poster.jpg",
  music: "music/promo-beat.mp3",
  pop: "zohar/audio/pop.mp3",
  chime: "zohar/audio/chime.mp3",
  riser: "zohar/audio/riser.mp3",
  rumble: "zohar/audio/rumble.mp3",
};
