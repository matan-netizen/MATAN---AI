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
  night: "#0F1424",
  purple: "#2A1B4A",
  gold: "#D4AF37",
  brightGold: "#FFD700",
  amber: "#F2A541",
  parchment: "#FDFBF7",
};

export const GOLD_TEXT = `linear-gradient(180deg, #FFF3C4 0%, ${COLORS.brightGold} 40%, ${COLORS.gold} 70%, #9C7A1C 100%)`;

export const FPS = 30;
export const DURATION = 900;

// Scene start frames, straight from the script.
export const SCENES = {
  silence: { from: 0, duration: 120 },
  struggle: { from: 120, duration: 150 },
  turning: { from: 270, duration: 150 },
  zohar: { from: 420, duration: 210 },
  cta: { from: 630, duration: 270 },
};

// Crossfade length between scenes, in frames.
export const CROSSFADE = 15;

// Heartbeat period shared by the SFX and the visual pulse in Scene 2.
// Must match HEARTBEAT_PERIOD in scripts/generate-zohar-audio.mjs.
export const HEARTBEAT_PERIOD = 28;

// Image assets live in public/zohar. Set an entry to null to fall back to
// the CSS-crafted artwork in ZoharImageCard (e.g. while a file is missing).
export const IMAGES: Record<string, string | null> = {
  manThinking: "zohar/man-thinking.jpg",
  stormRoad: "zohar/storm-road.jpg",
  lightPath: "zohar/zohar-light-path.jpg",
  zoharMan: "zohar/zohar-man.jpg",
  studyHall: "zohar/study-hall.jpg",
  ringZohar: "zohar/ring-zohar.jpg",
  stormZohar: "zohar/storm-zohar.jpg",
};

// Drop a recorded voiceover at public/voiceover.mp3 and set this to
// "voiceover.mp3" to mix it in. Left null so renders work without it.
export const VOICEOVER_FILE: string | null = null;
