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

// Brand palette sampled from the Kardan brochure.
export const COLORS = {
  blue: "#1386B4",
  navy: "#1E4F86",
  copper: "#C8752F",
  rust: "#9A4A22",
  sage: "#6E8570",
  slate: "#2F3A42",
  ink: "#1B2329",
  paper: "#ECEEF0",
  white: "#FFFFFF",
};
export const BLUE_GRADIENT = `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.navy})`;
export const COPPER_GRADIENT = `linear-gradient(90deg, #D99545, ${COLORS.copper} 50%, ${COLORS.rust})`;

export const FPS = 30;
export const DURATION = 900;
export const CROSSFADE = 12;

// Scene start frames (seconds × 30). Music whooshes sit on these cuts.
export const SCENES = {
  hero: { from: 0, duration: 120 },
  location: { from: 120, duration: 150 },
  choice: { from: 270, duration: 150 },
  amenities: { from: 420, duration: 180 },
  apartments: { from: 600, duration: 150 },
  cta: { from: 750, duration: 150 },
};

// Renders extracted from the project brochure (Uziel_1.pdf).
export const IMG = {
  logo: "kardan/logo.jpg",
  towerTop: "kardan/p1.jpg",
  aerial: "kardan/p4.jpg",
  balcony: "kardan/p5.jpg",
  night: "kardan/p9.jpg",
  street: "kardan/p10.jpg",
  lobby: "kardan/p11.jpg",
  gym: "kardan/p13.jpg",
  penthouse: "kardan/p15.jpg",
  terrace: "kardan/p16.jpg",
  apt2: "kardan/p17.jpg",
  apt3: "kardan/p18.jpg",
  apt3b: "kardan/p19.jpg",
};
