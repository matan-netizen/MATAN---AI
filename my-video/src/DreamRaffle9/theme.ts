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

// Neon yellow / green for kinetic captions, gold and brown from the logo.
export const COLORS = {
  yellow: "#FFE600",
  green: "#39FF14",
  gold: "#D9A441",
  goldLight: "#F3D58A",
  brown: "#4A3426",
  red: "#FF3B30",
  ink: "#0D0A07",
  white: "#FFFFFF",
};
export const GOLD_GRADIENT = `linear-gradient(135deg, ${COLORS.goldLight}, ${COLORS.gold} 55%, #A8741F)`;
export const GREEN_GRADIENT = "linear-gradient(135deg, #7CFF5B, #1DB80A)";

export const FPS = 30;
export const DURATION = 1050;

// Scene start frames (seconds × 30), following the script's timecodes.
// The score in scripts/generate-dream9-audio.mjs is laid out on these too.
export const SCENES = {
  hook: { from: 0, duration: 90 },
  surprise: { from: 90, duration: 210 },
  apartment: { from: 300, duration: 180 },
  offer: { from: 480, duration: 120 },
  cause: { from: 600, duration: 90 },
  urgency: { from: 690, duration: 90 },
  cta: { from: 780, duration: 120 },
  end: { from: 900, duration: 150 },
};

// Photos from thedreamraffle.co.il (the Dream Raffle 9 apartment gallery and
// the fund's activity photos), plus the campaign logo and mascot.
export const IMG = {
  kotel: "dream9/kotel.jpg",
  view: "dream9/view.jpg",
  living: "dream9/living.jpg",
  dining: "dream9/dining.jpg",
  kitchen: "dream9/kitchen.jpg",
  bedroom: "dream9/bedroom.jpg",
  balcony: "dream9/balcony.jpg",
  soldiers: "dream9/soldiers.jpg",
  ambulance: "dream9/ambulance.jpg",
  torah: "dream9/torah.jpg",
  logo: "dream9/logo.png",
  cash: "dream9/cash.png",
  mascotPoint: "dream9/mascot-point.png",
};
