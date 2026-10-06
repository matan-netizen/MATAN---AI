import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import voiceover from "./voiceover.json";

// Fonts are bundled in public/fonts so renders don't depend on network access.
export const SANS = "Heebo";
export const SERIF = "Frank Ruhl Libre";

for (const weight of ["400", "700", "900"]) {
  loadFont({
    family: SANS,
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

export const COLORS = {
  navy: "#0B1526",
  gold: "#C9A24B",
  lightGold: "#F1D9A0",
  cream: "#FBF7EE",
  green: "#2FBF71",
};

export const GOLD_GRADIENT = `linear-gradient(180deg, #FFF1C9 0%, ${COLORS.lightGold} 35%, ${COLORS.gold} 75%, #9A7A2E 100%)`;

export const FPS = 30;
export const f = (seconds: number) => Math.round(seconds * FPS);

// 38s total: four story segments that follow the voiceover script.
export const DURATION = f(38);

export const SEGMENTS = {
  field: { from: 0, to: f(8) },
  meeting: { from: f(8), to: f(17) },
  plans: { from: f(17), to: f(27) },
  closing: { from: f(27), to: DURATION },
};

// Footage: two source files (24fps, 1920x1080, 15.1s each) with several
// shots apiece. `src` is the source time in seconds where the shot starts
// and `rate` its playback rate; every shot ends before the next cut in its
// source file (cuts: street 4.71/9.04/10.75s, office 3.88/8.88s).
export type Shot = {
  name: string;
  file: "street" | "office";
  from: number; // composition frame
  duration: number; // frames
  src: number;
  rate: number;
  // Ken Burns: scale at start and end, and drift in px.
  zoom: [number, number];
  drift?: [number, number];
};

export const SHOTS: Shot[] = [
  // 1 – In the field: scouting the neighbourhood.
  {
    name: "Park – looking up",
    file: "street",
    from: 0,
    duration: 108,
    src: 0,
    rate: 1,
    zoom: [1.12, 1.02],
  },
  {
    name: "Street – notebook",
    file: "street",
    from: 108,
    duration: 132,
    src: 4.75,
    rate: 0.97,
    zoom: [1.0, 1.08],
    drift: [0, -20],
  },
  // 2 – Meeting: plans and notebook on the table.
  {
    name: "Table – plans",
    file: "office",
    from: 240,
    duration: 196,
    src: 3.95,
    rate: 0.75,
    zoom: [1.04, 1.12],
  },
  {
    name: "Side – writing",
    file: "office",
    from: 436,
    duration: 74,
    src: 9.0,
    rate: 1,
    zoom: [1.06, 1.0],
    drift: [30, 0],
  },
  // 3 – Analysing the floor plans and signing off.
  {
    name: "Blueprint close-up",
    file: "office",
    from: 510,
    duration: 165,
    src: 0,
    rate: 0.7,
    zoom: [1.0, 1.14],
    drift: [-40, 10],
  },
  {
    name: "Side – closing notebook",
    file: "office",
    from: 675,
    duration: 56,
    src: 11.5,
    rate: 0.8,
    zoom: [1.08, 1.14],
  },
  {
    name: "Spec card background",
    file: "office",
    from: 731,
    duration: 79,
    src: 1.0,
    rate: 0.35,
    zoom: [1.2, 1.3],
  },
  // 4 – Closing: check mark, phone ping, smile, end card.
  {
    name: "Notebook – check mark",
    file: "street",
    from: 810,
    duration: 66,
    src: 9.1,
    rate: 0.74,
    zoom: [1.05, 1.12],
  },
  {
    name: "Smile",
    file: "street",
    from: 876,
    duration: 94,
    src: 10.8,
    rate: 0.8,
    zoom: [1.0, 1.1],
    drift: [0, 10],
  },
  {
    name: "End card background",
    file: "street",
    from: 970,
    duration: 170,
    src: 13.4,
    rate: 0.28,
    zoom: [1.1, 1.2],
  },
];

export const SPEC_CARD = { from: 731, duration: 79 };
export const CHECK_FROM = 822; // V stroke starts, relative to composition
export const NOTIFY_FROM = 885; // phone notification + ping
export const END_CARD_FROM = 970;

// On-screen headlines (from the brief), shown in the lower third.
export const HEADLINES = [
  {
    from: f(2),
    to: f(7.7),
    emoji: "📍",
    text: "מיקום מנצח | צמוד לבני ברק ולגבעתיים",
  },
  {
    from: f(10),
    to: f(16.7),
    emoji: "📈",
    text: "פוטנציאל אדיר לעליית ערך ושכירות גבוהה",
  },
  {
    from: f(18),
    to: SPEC_CARD.from - 6,
    emoji: "🏡",
    text: "דירות גן ופנטהאוזים יוקרתיים",
  },
  {
    // Starts on the smile shot so it does not cover the check mark.
    from: 876,
    to: END_CARD_FROM - 6,
    emoji: "🔑",
    text: "הזדמנות השקעה נדירה – השאירו פרטים!",
  },
];

// Voiceover script, one slot per line (seconds). The narration clips from
// scripts/generate-investor-voiceover.mjs are placed at each slot's start;
// the subtitles use the same slots.
export const VO_SLOTS = [
  {
    start: 0.3,
    end: 7.8,
    text: 'כמשקיעים, אתם יודעים שהסוד של השקעה מנצחת בנדל"ן מתחיל במיקום מנצח!',
  },
  {
    start: 8.2,
    end: 16.8,
    text: "הכירו את פרויקט המגורים היוקרתי צמוד לבני ברק ולגבעתיים — לוקיישן בביקוש שיא שיוצר פוטנציאל אדיר לעליית ערך ולשכירות גבוהה בטוחה בכל ימות השנה!",
  },
  {
    start: 17.2,
    end: 26.8,
    text: "הזדמנות נדירה להשקעה בדירות גן מרהיבות ופנטהאוזים מפוארים, עם מפרט יוקרתי ותכנון אדריכלי חכם.",
  },
  {
    start: 27.2,
    end: 31.9,
    text: "זה הזמן לתפוס את ההזדמנות ולהבטיח את העתיד הכלכלי שלכם.",
  },
  {
    start: 32.4,
    end: 36.6,
    text: "לחצו כאן לפרטים נוספים ותיאום פגישת משקיעים!",
  },
];

// Generated narration clips (empty until the voiceover script is run).
export const VOICEOVER: { id: string; seconds: number }[] = voiceover.lines;

// Show the narration text as subtitles at the bottom of the frame.
export const SHOW_SUBTITLES = true;
