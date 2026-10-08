import { loadFont } from "@remotion/fonts";
import { staticFile, useVideoConfig } from "remotion";

// Heebo is bundled in public/fonts so renders don't depend on network access.
export const FONT = "Heebo";
for (const weight of ["400", "700", "900"]) {
  loadFont({
    family: FONT,
    url: staticFile(`fonts/Heebo-${weight}.ttf`),
    weight,
  });
}

export const FPS = 30;
export const s = (seconds: number) => Math.round(seconds * FPS);

// Brand palette from the brief. The brief listed navy as #019200 (a green),
// so navy uses a real navy value.
export const COLORS = {
  navy: "#0B1F4D",
  navyDeep: "#050E26",
  gold: "#D4AF37",
  goldLight: "#F7E38D",
  goldDark: "#8A6A16",
  emerald: "#108981",
  emeraldDark: "#0A5E58",
  coral: "#EF4444",
  coralDark: "#B91C1C",
  white: "#FFFFFF",
};
export const GOLD_GRADIENT =
  "linear-gradient(180deg, #FFF6C9 0%, #F7E38D 22%, #D4AF37 55%, #A8841F 78%, #E9CF6A 100%)";
export const GOLD_METAL =
  "linear-gradient(135deg, #8A6A16 0%, #E9CF6A 22%, #FFF6C9 38%, #D4AF37 55%, #8A6A16 80%, #D4AF37 100%)";
export const NAVY_BG = `radial-gradient(ellipse at 50% 35%, #183A80 0%, ${COLORS.navy} 45%, ${COLORS.navyDeep} 100%)`;

// Images from thedreamraffle.co.il (apartment photo gallery, winners page,
// campaign mascot and logo), resized into public/raffle.
export const IMG = {
  logo: "raffle/logo9.png",
  jerusalem: "raffle/jerusalem.jpg",
  living: "raffle/apt-living.jpg",
  living2: "raffle/apt-living2.jpg",
  dining: "raffle/apt-dining.jpg",
  lounge: "raffle/apt-lounge.jpg",
  balcony: "raffle/apt-balcony.jpg",
  balcony2: "raffle/apt-balcony2.jpg",
  kitchen: "raffle/apt-kitchen.jpg",
  bedroom: "raffle/apt-bedroom.jpg",
  hostPoint: "raffle/host-point.png",
  hostThumbs: "raffle/host-thumbs.png",
  hostOpen: "raffle/host-open.png",
  hostFist: "raffle/host-fist.png",
  hostStar: "raffle/host-star.png",
  cash: "raffle/cash.png",
  w2021: "raffle/w2021.jpg",
  w2022: "raffle/w2022.jpg",
  w2023: "raffle/w2023.jpg",
  w2024: "raffle/w2024.jpg",
};

// Facts checked against the site (see briefs/dream-raffle-year9-scripts.md).
export const OFFER = {
  url: "thedreamraffle.co.il",
  prize: "$1,300,000",
  earlyBird: "$15,000",
  earlyBirdDeadline: "עד ר״ח כסלו · 11/11",
  superTicket: "$25,000",
  superTicketPrice: "₪70",
  packages: [
    { name: "כרטיס", tickets: "1+1", price: "₪660" },
    { name: "מניין", tickets: "10+10", price: "₪4,200" },
    { name: "חי", tickets: "18+18", price: "₪6,480" },
    { name: "VIP", tickets: "100+100", price: "₪18,000" },
  ],
};

export type Format = "vertical" | "square" | "landscape";
export const FORMATS: Record<Format, { width: number; height: number; label: string }> = {
  vertical: { width: 1080, height: 1920, label: "9x16" },
  square: { width: 1080, height: 1080, label: "1x1" },
  landscape: { width: 1920, height: 1080, label: "16x9" },
};

// Layout helper: every scene sizes itself from this, so one scene works in
// all three formats.
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const format: Format = width > height ? "landscape" : width === height ? "square" : "vertical";
  // Text scale: vertical has the most room per line, square the least height.
  const t = format === "vertical" ? 1 : format === "square" ? 0.8 : 0.85;
  // Safe zone for platform UI (Reels/TikTok) on vertical.
  const safeTop = format === "vertical" ? 250 : 60;
  const safeBottom = format === "vertical" ? 300 : 60;
  return { width, height, format, t, safeTop, safeBottom, short: Math.min(width, height) };
};
