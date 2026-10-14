import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const FONT_FAMILY = "Heebo";

for (const weight of ["400", "700", "900"]) {
  loadFont({
    family: FONT_FAMILY,
    url: staticFile(`fonts/Heebo-${weight}.ttf`),
    weight,
  });
}

// Sampled from the source video so the English graphics sit in its palette.
export const COLORS = {
  patch: "#2D2017",
  walnut: "#3A2718",
  gold: "#D9A441",
  goldLight: "#F6DA8A",
  goldDark: "#A87822",
  cream: "#FBF3E2",
  ink: "#1A120B",
  white: "#FFFFFF",
};

export const GOLD_GRADIENT = `linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 55%, ${COLORS.goldDark} 100%)`;
