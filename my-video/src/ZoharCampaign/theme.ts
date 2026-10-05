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

// Voiceover phrase timings in seconds (start/end of speech), measured from
// public/zohar/voiceover.mp3 by detecting the pauses between phrases and
// matching them to the narration text by syllable count. Everything on
// screen is cued from these, so re-measure if the recording changes.
export const VO_LINES = {
  hook: { start: 0.0, end: 4.03 }, // יש רגעים שאתה יושב לבד, מסתכל למעלה ושואל בשקט:
  quote: { start: 4.4, end: 7.58 }, // "כמה עוד אפשר לחכות? מתי כבר יגיע התור שלי?"
  tried: { start: 7.99, end: 12.39 }, // ניסית הכל, התפללת, קיווית, לפעמים כמעט נשברת –
  rose: { start: 12.71, end: 14.98 }, // ואז אספת את עצמך וקמת שוב.
  heart: { start: 15.35, end: 19.4 }, // אבל מבפנים, הלב עדיין מחכה…
  faith: { start: 19.76, end: 23.28 }, // דווקא עכשיו, כשקשה אבל האמונה…
  path: { start: 23.48, end: 26.12 }, // נפתחת דרך פשוטה שיכולה להזיז הרים:
  partner: { start: 26.39, end: 29.07 }, // להיות שותף בדף אחד מתוך הזוהר הקדוש.
  name: { start: 29.34, end: 32.04 }, // השם שלך נרשם בספר החבריא של הרשב״י,
  home: { start: 32.24, end: 34.45 }, // והדף נשלח אליך הביתה.
  amulet: { start: 34.59, end: 36.93 }, // זה קמיע עוצמתי אישי שפותח את המחסומים.
  alone: { start: 37.17, end: 39.77 }, // אל תישאר עם זה לבד. תן לזה הזדמנות לשנות.
  click: { start: 40.19, end: 40.88 }, // לחץ כאן,
  register: { start: 40.99, end: 43.67 }, // רשום את השם שלך וקבל את הדף האישי שלך:
};
// "הלב" is spoken here, just after "אבל מבפנים,".
export const HEART_WORD = 16.45;
export type VoLine = keyof typeof VO_LINES;

export const f = (seconds: number) => Math.round(seconds * FPS);
export const voStart = (line: VoLine) => f(VO_LINES[line].start);
export const voEnd = (line: VoLine) => f(VO_LINES[line].end);

// Each scene opens a few frames before its first spoken line.
const LEAD = 8;
const HOLD_AFTER_VO = 2.3; // seconds the end card stays after the last word

export const DURATION = f(VO_LINES.register.end + HOLD_AFTER_VO);

const starts = {
  silence: 0,
  struggle: voStart("tried") - LEAD,
  turning: voStart("faith") - LEAD,
  zohar: voStart("partner") - LEAD,
  cta: voStart("alone") - LEAD,
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

// The CTA button pops in (with its SFX) as "לחץ כאן" is spoken.
export const CTA_POP_FRAME = voStart("click") - 4;

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
