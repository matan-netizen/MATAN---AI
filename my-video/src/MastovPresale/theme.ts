// Heebo is loaded (from public/fonts) by the RealEstatePromo theme module.
export { FONT_FAMILY } from "../RealEstatePromo/theme";

// Mastov Real Estate Group palette, sampled from the logo.
export const COLORS = {
  green: "#003818",
  greenMid: "#0D5530",
  greenDeep: "#00200E",
  gold: "#D8B870",
  goldLight: "#F1DDA6",
  goldDark: "#A88848",
  red: "#D93A3A",
  white: "#FFFFFF",
  ink: "#16231B",
};

export const GOLD_GRADIENT = `linear-gradient(100deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 45%, ${COLORS.goldDark} 100%)`;
export const GREEN_GRADIENT = `linear-gradient(100deg, ${COLORS.greenMid} 0%, ${COLORS.green} 100%)`;

// Project renders are shared with UzielLeadAd.
export const img = (name: string) => `uziel/${name}.jpg`;

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
