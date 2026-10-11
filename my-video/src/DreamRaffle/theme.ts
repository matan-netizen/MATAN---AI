import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import voiceover from "./voiceover.json";

// Heebo is bundled in public/fonts so renders don't depend on network access.
export const FONT = "Heebo";
for (const weight of ["400", "700", "900"]) {
  loadFont({
    family: FONT,
    url: staticFile(`fonts/Heebo-${weight}.ttf`),
    weight,
  });
}

// Palette sampled from the Dream Raffle logo (gold arch, dark brown banner).
export const COLORS = {
  gold: "#D4AF37",
  goldLight: "#F6DFA0",
  goldDeep: "#A97C2F",
  bronze: "#C09C5E",
  brown: "#291A11",
  brownMid: "#4A3222",
  cream: "#FFF6E6",
  white: "#FFFFFF",
  ilBlue: "#0038B8",
};
export const GOLD_GRADIENT = `linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 45%, ${COLORS.goldDeep} 100%)`;

export const FPS = 30;
export const DURATION = 825;

// Scene start frames, cut on the sentence breaks of the narration
// (public/dreamraffle/vo/narration.mp3, speech from 0.3s):
//   line 1  0.30–4.93s   line 2  5.30–11.57s
//   line 3 11.92–20.71s  line 4 21.04–25.45s
// The score's sections change on the same frames
// (scripts/generate-dream-raffle-audio.mjs, 120 BPM).
export const SCENES = {
  hook: { from: 0, duration: 150 },
  offer: { from: 150, duration: 210 },
  cause: { from: 360, duration: 270 },
  cta: { from: 630, duration: 195 },
};
// Frames each scene keeps running underneath the next one's entrance.
export const OVERLAP = 10;

// Within the CTA scene: button press (as the site address is read) and the
// closing logo card (25.5s, right after the narration, on the final hit).
export const CTA_PRESS = 75;
export const END_CARD = 135;

// Shots in public/dreamraffle/footage.mp4 (the walkthrough, rotated to
// 1080x1920), in source seconds. 05.8–07.77 (the unmade bed) is never used.
export const SHOTS = {
  dining: 0.1,
  coffee: 2.6,
  nightstand: 4.3,
  mirror: 7.78,
  mezuzah: 11.82,
  sofa: 13.5,
  livingWide: 17.3,
  chess: 19.85,
};

export const IMG = {
  logo: "dreamraffle/logo.png",
  mascot: "dreamraffle/mascot-pointing.png",
  soldiers: "dreamraffle/soldiers.jpg",
  emergency: "dreamraffle/emergency.jpg",
};
export const FOOTAGE = "dreamraffle/footage.mp4";
export const URL = "thedreamraffle.co.il";

// Voiceover placement, written by scripts/generate-dream-raffle-vo.mjs.
// Empty until the voiceover has been generated.
export const VOICEOVER: { file: string; from: number; frames: number }[] =
  voiceover.lines;
