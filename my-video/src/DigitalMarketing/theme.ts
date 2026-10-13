import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled in public/fonts so renders don't depend on network access.
export const FONT = "Heebo";
for (const weight of ["400", "700", "900"]) {
  loadFont({
    family: FONT,
    url: staticFile(`fonts/Heebo-${weight}.ttf`),
    weight,
  });
}
// Amatic SC ships Hebrew and Latin as separate subsets; the handwritten
// lines list both families so each glyph falls back to the one that has it.
export const HAND = "'Amatic SC Hebrew', 'Amatic SC Latin', Heebo";
loadFont({
  family: "Amatic SC Hebrew",
  url: staticFile("fonts/AmaticSC-700-hebrew.woff"),
  weight: "700",
});
loadFont({
  family: "Amatic SC Latin",
  url: staticFile("fonts/AmaticSC-700-latin.woff"),
  weight: "700",
});

// Palette from the storyboard: trust navy, sunflower yellow, chat green.
export const COLORS = {
  navy: "#1E3A8A",
  deepNavy: "#0F1B3D",
  yellow: "#FACC15",
  green: "#25D366",
  darkGreen: "#128C4A",
  blue: "#1D4ED8",
  paper: "#F8FAFC",
  sky: "#E0ECFA",
  ink: "#1F2937",
  white: "#FFFFFF",
};

export const PHONE = "058-5235855";

export const FPS = 30;
export const CROSSFADE = 12;

// Scene timings in frames. The music in scripts/generate-digital-audio.mjs
// switches from chaos to the warm groove on the `turn` scene, so keep the
// two in sync (45s: turn at 20s; 15s: turn at 3s).
export const LONG = {
  duration: 1350,
  scenes: {
    hook: { from: 0, duration: 150 },
    questions: { from: 150, duration: 210 },
    jargon: { from: 360, duration: 240 },
    turn: { from: 600, duration: 210 },
    benefits: { from: 810, duration: 300 },
    cta: { from: 1110, duration: 240 },
  },
};

export const SHORT = {
  duration: 450,
  scenes: {
    jargon: { from: 0, duration: 90 },
    turn: { from: 90, duration: 180 },
    cta: { from: 270, duration: 180 },
  },
};

// Storyboard panels, cropped and upscaled from the client's reference sheet.
export const IMG = {
  desk: "digital/desk.jpg",
  bubbles: "digital/bubbles.jpg",
  jargon: "digital/jargon.jpg",
  curious: "digital/curious.jpg",
  smile: "digital/smile.jpg",
};

export const sfx = (name: string) => `digital/audio/${name}.mp3`;
