import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Heebo is bundled in public/fonts so renders don't depend on network access.
export const FONT_FAMILY = "Heebo";

for (const weight of ["400", "700", "900"]) {
  loadFont({
    family: FONT_FAMILY,
    url: staticFile(`fonts/Heebo-${weight}.ttf`),
    weight,
  });
}

export const COLORS = {
  bg: "#06080e",
  slate: "#111827",
  gold: "#F5C451",
  goldLight: "#FFE7A3",
  goldDark: "#B8860B",
  blue: "#1FB6FF",
  blueDeep: "#0A5BFF",
  red: "#FF3B4E",
  white: "#FFFFFF",
};

export const GOLD_GRADIENT = `linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 45%, ${COLORS.goldDark} 100%)`;
export const BLUE_GRADIENT = `linear-gradient(180deg, #8BE3FF 0%, ${COLORS.blue} 50%, ${COLORS.blueDeep} 100%)`;
