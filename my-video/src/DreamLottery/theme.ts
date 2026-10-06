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

// Sales figures, from the campaign poster, the market footage, and terms
// the client confirmed (the apartment comes fully furnished).
// Update here if the campaign terms change.
export const FACTS = {
  prize: "1.3 מיליון דולר",
  ticket: 660, // ₪, as said in the footage
  perTicketWithGift: 660 / 2, // ₪, with the 1+1 offer
  bonus: "$15,000",
  bonusDeadline: "11/11",
  foundedYear: 2001, // Am Yisrael Chai foundation, per press coverage
};

// Scene lengths in frames. Footage scenes also give `src`, the start frame
// of the take inside public/dream/market.mp4 (30fps). The three takes cover
// the whole footage in order, and each cut sits on a pause in the speech:
// 13.43s (after "פייסבוק") and 22.33s (the change of speaker).
export const SCENES = {
  hook: { duration: 120 },
  askClip: { duration: 403, src: 0 },
  prize: { duration: 150 },
  causeClip: { duration: 267, src: 403 },
  bonus: { duration: 180 },
  followClip: { duration: 260, src: 670 },
  cta: { duration: 186 },
};
export type SceneKey = keyof typeof SCENES;

// The full cut, and the two standalone ads made from it.
export const CUTS = {
  full: ["hook", "askClip", "prize", "causeClip", "bonus", "followClip", "cta"],
  apartment: ["hook", "askClip", "prize", "cta"],
  chesed: ["prize", "causeClip", "bonus", "followClip", "cta"],
} satisfies Record<string, SceneKey[]>;
export type CutName = keyof typeof CUTS;

export const cutDuration = (cut: CutName) =>
  CUTS[cut].reduce((sum, key) => sum + SCENES[key].duration, 0);

export const MEDIA = {
  footage: "dream/market.mp4",
  poster: "dream/poster.jpg",
  music: "music/promo-beat.mp3",
  pop: "zohar/audio/pop.mp3",
  chime: "zohar/audio/chime.mp3",
  riser: "zohar/audio/riser.mp3",
  rumble: "zohar/audio/rumble.mp3",
};
