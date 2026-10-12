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

export const COLORS = {
  navy: "#0B1F3A",
  deep: "#06111F",
  gold: "#D9B45A",
  goldLight: "#F5DE9A",
  goldDark: "#9C7A2B",
  cream: "#FFF8E7",
  white: "#FFFFFF",
};
export const GOLD_GRADIENT = `linear-gradient(90deg, ${COLORS.goldLight}, ${COLORS.gold} 50%, ${COLORS.goldDark})`;

export const FPS = 30;
export const DURATION = 750; // 25s
export const CROSSFADE = 10;

// Feed (4:5) is the primary Facebook placement; Story (9:16) reuses the
// same centre-framed shots for Stories/Reels.
export const FEED = { width: 1080, height: 1350 };
export const STORY = { width: 1080, height: 1920 };

export const SCENES = {
  hook: { from: 0, duration: 90 },
  y2018: { from: 90, duration: 90 },
  y2019: { from: 180, duration: 90 },
  y2020: { from: 270, duration: 90 },
  more: { from: 360, duration: 120 },
  ninth: { from: 480, duration: 90 },
  double: { from: 570, duration: 90 },
  cta: { from: 660, duration: 90 },
};
