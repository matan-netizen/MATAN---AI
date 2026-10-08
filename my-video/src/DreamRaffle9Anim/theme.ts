export { FONT, IMG } from "../DreamRaffle9/theme";

// Clean, modern palette: warm cream and deep navy grounds, the logo's gold,
// with one bright accent per message (yellow for money, green for "free").
export const C = {
  cream: "#FFF6E6",
  sand: "#F3E3C3",
  stone: "#E9D2A6",
  stoneDark: "#CDAE78",
  navy: "#13213C",
  navy2: "#1D3157",
  gold: "#D9A441",
  goldDark: "#A9771F",
  yellow: "#FFD21F",
  green: "#22C55E",
  greenDark: "#15803D",
  red: "#EF4444",
  sky1: "#FFE3B3",
  sky2: "#8FC5F0",
  ink: "#1B1F2A",
  white: "#FFFFFF",
  cypress: "#2F5D3A",
};

export const FPS = 30;

// Scene lengths in frames. Voiceover scenes match the trimmed clips' length
// (public/dream9/clips), whose audio is the voiceover.
export const PARTS = [
  { id: "hook", duration: 100 },
  { id: "voA", duration: 174, vo: "a-660-shekel" },
  { id: "apartment", duration: 180 },
  { id: "voB", duration: 114, vo: "b-no-mortgage" },
  { id: "offer", duration: 120 },
  { id: "voC", duration: 192, vo: "c-everyone-sends" },
  { id: "urgency", duration: 90 },
  { id: "voD", duration: 145, vo: "d-win-big" },
  { id: "cta", duration: 225 },
] as const;

export type PartId = (typeof PARTS)[number]["id"];

export const START: Record<PartId, number> = PARTS.reduce(
  (acc, p, i) => ({
    ...acc,
    [p.id]: i === 0 ? 0 : acc[PARTS[i - 1].id] + PARTS[i - 1].duration,
  }),
  {} as Record<PartId, number>,
);

export const DURATION = PARTS.reduce((s, p) => s + p.duration, 0);
