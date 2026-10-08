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

// Optimi brand palette.
export const COLORS = {
  navy: "#0c2340",
  emerald: "#00a884",
  royal: "#0052cc",
  sky: "#1fa4e8",
  gray: "#f4f6f9",
  line: "#dfe5ee",
  muted: "#64748b",
  red: "#e5484d",
  amber: "#f59e0b",
  whatsapp: "#25d366",
  white: "#ffffff",
};
export const BRAND_GRADIENT = `linear-gradient(135deg, ${COLORS.royal}, ${COLORS.sky} 55%, ${COLORS.emerald})`;

export const FPS = 30;
export const DURATION = 1050;
export const CROSSFADE = 12;

// Scene start frames, matching the 0:00 / 0:08 / 0:15 / 0:22 / 0:29 script.
export const SCENES = {
  hook: { from: 0, duration: 240 },
  router: { from: 240, duration: 210 },
  cache: { from: 450, duration: 210 },
  billing: { from: 660, duration: 210 },
  cta: { from: 870, duration: 180 },
};

// Voiceover lines, shown as captions. Frames are absolute.
export const CAPTIONS = [
  {
    from: 10,
    to: 118,
    text: "סוכנויות פרסום מוציאות אלפי שקלים בחודש על מנויי AI כפולים ובזבוז טוקנים.",
  },
  {
    from: 124,
    to: 236,
    text: "הכירו את Optimi – הסוכן החכם שמנהל, חוסך וממקסם את צריכת ה-AI בארגון שלכם בעד 40%!",
  },
  {
    from: 250,
    to: 446,
    text: "דוגמה ראשונה: ניתוב חכם. Optimi מנתבת אוטומטית למודל המשתלם והמהיר ביותר בזמן אמת.",
  },
  {
    from: 460,
    to: 656,
    text: "דוגמה שנייה: מאגר תשובות צוותי. שאילתות כפולות מקבלות תשובה קיימת – מיד ובאפס עלות!",
  },
  {
    from: 670,
    to: 866,
    text: "דוגמה שלישית: שליטה מלאה! שיוך עלויות לכל לקוח והתראות בוואטסאפ למניעת חריגות.",
  },
];

// Drop a narrated track at public/optimi/voiceover.mp3 and set this to true;
// the music then ducks under it.
export const VOICEOVER = false;
