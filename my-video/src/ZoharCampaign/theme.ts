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

// Voiceover line timings in seconds (start/end of speech), measured from
// public/zohar/voiceover.mp3 by detecting the pauses between phrases.
// Everything on screen is cued from these, so re-measure if the
// recording changes.
export const VO_LINES = {
  l1: { start: 0.0, end: 5.71 }, // יש רגעים שאדם שואל את עצמו בשקט…
  l2: { start: 6.11, end: 7.58 }, // כמה עוד אפשר לחכות?
  l3: { start: 7.99, end: 12.39 }, // יש מי שכבר התפלל, קיווה, ניסה…
  l4: { start: 12.71, end: 16.23 }, // ועדיין הלב שלו נשאר…
  l5: { start: 16.45, end: 21.37 }, // דווקא מהמקום הזה…
  l6: { start: 21.62, end: 26.12 }, // נפתחת אפשרות קטנה…
  l7: { start: 26.39, end: 29.07 }, // להיות שותף בדף אחד…
  l8: { start: 29.34, end: 32.04 }, // השם נרשם בספר החבריא…
  l9: { start: 32.24, end: 35.89 }, // והדף נשלח כקמיע אישי…
  l10: { start: 35.99, end: 39.79 }, // זה הזמן שלך להתחבר לשפע…
  l11: { start: 40.19, end: 43.67 }, // להצטרפות וקבלת הדף האישי
};
export type VoLine = keyof typeof VO_LINES;

const f = (seconds: number) => Math.round(seconds * FPS);
export const voStart = (line: VoLine) => f(VO_LINES[line].start);
export const voEnd = (line: VoLine) => f(VO_LINES[line].end);

// Each scene opens a few frames before its first spoken line.
const LEAD = 8;
const HOLD_AFTER_VO = 2.3; // seconds the end card stays after the last word

export const DURATION = f(VO_LINES.l11.end + HOLD_AFTER_VO);

const starts = {
  silence: 0,
  struggle: voStart("l3") - LEAD,
  turning: voStart("l5") - LEAD,
  zohar: voStart("l7") - LEAD,
  cta: voStart("l10") - LEAD,
};
export const SCENES = {
  silence: { from: starts.silence, duration: starts.struggle },
  struggle: {
    from: starts.struggle,
    duration: starts.turning - starts.struggle,
  },
  turning: { from: starts.turning, duration: starts.zohar - starts.turning },
  zohar: { from: starts.zohar, duration: starts.cta - starts.zohar },
  cta: { from: starts.cta, duration: DURATION - starts.cta },
};
export type SceneId = keyof typeof SCENES;

// Text cue for a voiceover line, relative to its scene: words appear a
// moment before they're spoken and are spread across the spoken duration.
export const cue = (line: VoLine, scene: SceneId, words: number) => {
  const start = voStart(line) - SCENES[scene].from;
  const length = voEnd(line) - voStart(line);
  return {
    delay: Math.max(0, start - 4),
    stagger: Math.max(2, Math.round((length * 0.75) / Math.max(1, words))),
  };
};

// The CTA button pops in (with its SFX) as "להצטרפות" is spoken.
export const CTA_POP_FRAME = voStart("l11") - 4;

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

// Male Hebrew voiceover. Set to null to render without narration.
export const VOICEOVER_FILE: string | null = "zohar/voiceover.mp3";
