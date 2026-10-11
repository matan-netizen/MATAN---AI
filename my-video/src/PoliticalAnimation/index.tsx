import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "../DreamRaffle/theme";

// 10s, 1280x720. A figure hops across three cubes (Lapid → Gantz →
// Eisenkot), wonders "אז מה יהיה בסוף??", then a golden "אייזנ-ביטון" cube
// drops in above them.
//   0–1.5s  on Lapid      1.5–3s  on Gantz      3–5s  on Eisenkot
//   5–7s    thought bubble                       7–10s golden cube

export const POLITICAL_FPS = 30;
export const POLITICAL_DURATION = 300;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CUBE = { w: 230, h: 290, top: 330 };
const CUBES = [
  { name: "לפיד", photo: "political/lapid.jpg", x: 340 },
  { name: "גנץ", photo: "political/gantz.jpg", x: 640 },
  { name: "איזנקוט", photo: "political/eisenkot.jpg", x: 940 },
];
// Hops between cubes: [start frame, from cube, to cube]. Each takes HOP frames.
const HOP = 16;
const HOPS: [number, number, number][] = [
  [45, 0, 1],
  [90, 1, 2],
];
const THOUGHT = { from: 150, to: 210 };
const GOLDEN = 210;
const FIGURE = { w: 60, h: 90 };

// Which cube the figure is on (or between), its x and its height above the cube.
const figurePosition = (frame: number) => {
  // Drops onto the first cube at the start.
  const drop = interpolate(frame, [0, 12], [-420, 0], { ...clamp, easing: (t) => t * t });
  let x = CUBES[0].x;
  let lift = -drop;
  for (const [start, a, b] of HOPS) {
    if (frame >= start + HOP) {
      x = CUBES[b].x;
    } else if (frame >= start) {
      const p = (frame - start) / HOP;
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      x = CUBES[a].x + (CUBES[b].x - CUBES[a].x) * eased;
      lift = Math.sin(p * Math.PI) * 140;
    }
  }
  return { x, lift };
};

// Frames since the figure last landed on cube `i` (for the squash), or null.
const landedOn = (frame: number, i: number) => {
  const landings = [12, ...HOPS.map(([start]) => start + HOP)];
  const cubes = [0, ...HOPS.map(([, , b]) => b)];
  let since: number | null = null;
  landings.forEach((at, k) => {
    if (cubes[k] === i && frame >= at) since = frame - at;
  });
  return since;
};

const Cube: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cube = CUBES[index];
  const enter = spring({ frame: frame - index * 4, fps, config: { damping: 14 } });
  const since = landedOn(frame, index);
  // Squash on landing, then settle.
  const squash = since !== null && since < 12 ? Math.sin((since / 12) * Math.PI) * 0.06 : 0;
  const { x } = figurePosition(frame);
  const occupied = Math.abs(x - cube.x) < 5 && frame < GOLDEN;
  const dim = interpolate(frame, [GOLDEN, GOLDEN + 15], [1, 0.35], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: cube.x - CUBE.w / 2,
        top: CUBE.top,
        width: CUBE.w,
        height: CUBE.h,
        borderRadius: 24,
        background: "linear-gradient(180deg, #24324a, #1e293b)",
        border: `4px solid ${occupied ? "#7dd3fc" : "#38bdf8"}`,
        boxShadow: occupied
          ? "0 0 34px rgba(56,189,248,0.6), 0 20px 25px -5px rgba(0,0,0,0.5)"
          : "0 20px 25px -5px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 14,
        gap: 10,
        opacity: dim * enter,
        transformOrigin: "50% 100%",
        transform: `translateY(${(1 - enter) * 200}px) scaleY(${1 - squash}) scaleX(${1 + squash * 0.6})`,
        filter: dim < 1 ? `grayscale(${(1 - dim) * 1.2})` : undefined,
      }}
    >
      <Img
        src={staticFile(cube.photo)}
        style={{ width: "100%", height: 196, objectFit: "cover", objectPosition: "50% 20%", borderRadius: 14 }}
      />
      <div style={{ color: "#fff", fontSize: 38, fontWeight: 900 }}>{cube.name}</div>
    </div>
  );
};

const Figure: React.FC = () => {
  const frame = useCurrentFrame();
  const { x, lift } = figurePosition(frame);
  const fade = interpolate(frame, [GOLDEN - 4, GOLDEN + 6], [1, 0], clamp);
  const think = frame >= THOUGHT.from && frame < THOUGHT.to + 6;
  // While thinking: look up and sway a little.
  const sway = think ? Math.sin((frame - THOUGHT.from) / 6) * 4 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x - FIGURE.w / 2,
        top: CUBE.top - FIGURE.h - lift,
        width: FIGURE.w,
        height: FIGURE.h,
        opacity: fade,
        transform: `rotate(${sway}deg)`,
        transformOrigin: "50% 100%",
      }}
    >
      <div
        style={{
          width: FIGURE.w,
          height: FIGURE.h,
          backgroundColor: "#3b82f6",
          borderRadius: "30px 30px 10px 10px",
          border: "3px solid #fff",
          boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
};

const ThoughtBubble: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < THOUGHT.from || frame >= GOLDEN) return null;
  const local = frame - THOUGHT.from;
  const pop = spring({ frame: local, fps, config: { damping: 10 } });
  const pulse = 1 + 0.04 * Math.sin(local / 4.5);
  const out = interpolate(frame, [GOLDEN - 6, GOLDEN], [1, 0], clamp);
  const { x } = figurePosition(frame);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: out }}>
      {/* Trail of small cloud puffs from the figure up to the bubble */}
      {[0, 1].map((k) => {
        const s = spring({ frame: local - k * 4, fps, config: { damping: 12 } });
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: x - 30 - k * 26,
              top: CUBE.top - FIGURE.h - 30 - k * 34,
              width: 18 + k * 10,
              height: 18 + k * 10,
              borderRadius: "50%",
              background: "#fff",
              transform: `scale(${s})`,
              boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: x - 400,
          top: CUBE.top - FIGURE.h - 170,
          width: 400,
          whiteSpace: "nowrap",
          textAlign: "center",
          backgroundColor: "#ffffff",
          padding: "14px 22px",
          borderRadius: 36,
          fontSize: 34,
          fontWeight: 900,
          color: "#0f172a",
          boxShadow: "0 10px 15px rgba(0,0,0,0.3)",
          direction: "rtl",
          transform: `scale(${pop * pulse})`,
          transformOrigin: "85% 100%",
        }}
      >
        אז מה יהיה בסוף?? 🤔
      </div>
    </div>
  );
};

const GoldenCube: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < GOLDEN) return null;
  const local = frame - GOLDEN;
  const enter = spring({ frame: local, fps, config: { damping: 12 } });
  const scale = interpolate(enter, [0, 1], [0, 1.1]);
  const y = interpolate(enter, [0, 1], [-520, 0]);
  const glow = 0.6 + 0.4 * Math.sin(local / 6);
  return (
    <div
      style={{
        position: "absolute",
        left: 640 - 170,
        top: 28,
        width: 340,
        height: 250,
        transform: `translateY(${y}px) scale(${scale})`,
      }}
    >
      {/* Glowing halo */}
      <div
        style={{
          position: "absolute",
          inset: -90,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(251,191,36,${0.55 * glow}) 0%, rgba(251,191,36,0) 70%)`,
        }}
      />
      {/* Light rays */}
      <div
        style={{
          position: "absolute",
          inset: -160,
          background: "repeating-conic-gradient(from 0deg, rgba(253,230,138,0.18) 0deg 8deg, transparent 8deg 20deg)",
          transform: `rotate(${local * 0.6}deg)`,
          borderRadius: "50%",
          maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 28,
          background: "linear-gradient(135deg, #fcd34d, #f59e0b 45%, #d97706)",
          border: "6px solid #fbbf24",
          boxShadow: `0 0 ${60 + 40 * glow}px #fbbf24, 0 24px 40px rgba(0,0,0,0.5)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            backgroundColor: "#78350f",
            border: "4px solid #fde68a",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 50,
          }}
        >
          💪
        </div>
        <div style={{ color: "#fff", fontSize: 50, fontWeight: 900, textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>
          אייזנ-ביטון
        </div>
      </div>
    </div>
  );
};

// Gold sparkles bursting out when the golden cube lands.
const Sparkles: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame - GOLDEN - 10;
  if (local < 0) return null;
  return (
    <>
      {Array.from({ length: 28 }, (_, i) => {
        const angle = random(`a${i}`) * Math.PI * 2;
        const speed = 4 + random(`s${i}`) * 7;
        const d = Math.min(local, 40) * speed;
        const life = interpolate(local, [0, 40, 60], [1, 0.8, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 640 + Math.cos(angle) * d,
              top: 160 + Math.sin(angle) * d * 0.7,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#fde68a",
              boxShadow: "0 0 10px #fbbf24",
              opacity: life * (0.5 + 0.5 * Math.abs(Math.sin(local / 3 + i))),
            }}
          />
        );
      })}
    </>
  );
};

const SFX: { file: string; from: number; volume: number }[] = [
  { file: "click", from: 12, volume: 0.6 },
  ...HOPS.flatMap(([start]) => [
    { file: "whoosh", from: start, volume: 0.35 },
    { file: "click", from: start + HOP, volume: 0.6 },
  ]),
  { file: "chime", from: THOUGHT.from, volume: 0.35 },
  { file: "riser", from: GOLDEN - 30, volume: 0.4 },
  { file: "impact", from: GOLDEN + 8, volume: 0.6 },
  { file: "outro", from: GOLDEN + 12, volume: 0.5 },
];

export const PoliticalAnimation: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at 50% 35%, #1e2a44 0%, #0f172a 65%)",
      fontFamily: FONT,
      direction: "rtl",
    }}
  >
    {CUBES.map((_, i) => (
      <Cube key={i} index={i} />
    ))}
    <Figure />
    <ThoughtBubble />
    <Sparkles />
    <GoldenCube />
    {/* Sound effects reused from the DreamRaffle set */}
    {SFX.map(({ file, from, volume }, i) => (
      <Sequence key={i} from={from} layout="none">
        <Html5Audio src={staticFile(`dreamraffle/audio/${file}.mp3`)} volume={volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
