import type React from "react";
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import voiceover from "./voiceover.json";

// Heebo for body copy, Frank Ruhl Libre for the big gold headlines. Both are
// bundled in public/fonts so renders don't depend on network access.
export const FONT = "Heebo";
export const SERIF = "Frank Ruhl Libre";
for (const weight of ["400", "700", "900"]) {
  loadFont({
    family: FONT,
    url: staticFile(`fonts/Heebo-${weight}.ttf`),
    weight,
  });
}
for (const weight of ["700", "900"]) {
  loadFont({
    family: SERIF,
    url: staticFile(`fonts/FrankRuhlLibre-${weight}.ttf`),
    weight,
  });
}

// Palette taken from thedreamraffle.co.il: its gold (#DEAF53 / #E8BF6D) and
// the brown of the logo badge.
export const COLORS = {
  gold: "#DEAF53",
  goldLight: "#F3D98B",
  goldDeep: "#B8862E",
  brown: "#4A2E1C",
  cocoa: "#2A1A10",
  cream: "#FBF5E8",
  white: "#FFFFFF",
  whatsapp: "#25D366",
};
export const GOLD_GRADIENT = `linear-gradient(135deg, ${COLORS.goldLight}, ${COLORS.gold} 45%, ${COLORS.goldDeep})`;
export const GOLD_TEXT: React.CSSProperties = {
  backgroundImage: `linear-gradient(180deg, #FFF3C4, ${COLORS.gold} 55%, ${COLORS.goldDeep})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

export const FPS = 30;
export const CROSSFADE = 10;
// Each scene starts LEAD before its line and holds TAIL after it.
const LEAD = 0.35;
const TAIL = 0.45;
// The end card stays up a little longer so the URL can be read.
const END_HOLD = 2.5;

export type SceneName =
  | "hook"
  | "prize"
  | "super"
  | "offer"
  | "bonus"
  | "cause"
  | "cta";

// Scene lengths come from the generated narration
// (scripts/generate-raffle-voiceover.mjs writes voiceover.json).
export const SCENES = (() => {
  const out = {} as Record<
    SceneName,
    { from: number; duration: number; voFrom: number }
  >;
  let from = 0;
  voiceover.lines.forEach(({ scene, seconds }, i) => {
    const isLast = i === voiceover.lines.length - 1;
    const duration = Math.ceil(
      (LEAD + seconds + (isLast ? END_HOLD : TAIL)) * FPS,
    );
    out[scene as SceneName] = {
      from,
      duration,
      voFrom: from + Math.round(LEAD * FPS),
    };
    from += duration;
  });
  return out;
})();

export const DURATION = Object.values(SCENES).reduce(
  (end, s) => Math.max(end, s.from + s.duration),
  0,
);

export const IMG = {
  logo: "raffle/logo.png",
  jerusalem: "raffle/jerusalem.jpg",
  living: "raffle/living.jpg",
  living2: "raffle/living-2.jpg",
  kitchen: "raffle/kitchen.jpg",
  balcony: "raffle/balcony.jpg",
  balconyView: "raffle/balcony-view.jpg",
  cash: "raffle/cash.png",
  mascotPointing: "raffle/mascot-pointing.png",
  mascotOpen: "raffle/mascot-open.png",
  mascotThumbs: "raffle/mascot-thumbs.png",
};
