import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "../DreamRaffle/theme";

// 10s, 1280x720. The character climbs a staircase of cubes from the bottom
// up — Lapid → Gantz → Eisenkot — wonders "אז מה יהיה בסוף??", then a golden
// "אייזנ-ביטון" cube lands at the top and he jumps onto it.
//   0–1.5s on Lapid   1.5–3s on Gantz   3–5s on Eisenkot   5–7s thought bubble
//   7s golden cube lands   7.5–8s the big hop   8–10s celebration
// Every hop and landing falls on a beat of the score
// (scripts/generate-political-music.mjs, 120 BPM = 15 frames a beat).

export const POLITICAL_FPS = 30;
export const POLITICAL_DURATION = 300;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

// The staircase: cube centre x and top y, bottom-left to top-right.
export const STEPS = [
  { x: 190, top: 495, name: "יאיר לפיד", year: "2013", photo: "political/lapid.jpg" },
  { x: 470, top: 385, name: "בני גנץ", year: "2019", photo: "political/gantz.jpg" },
  { x: 750, top: 275, name: "גדי איזנקוט", year: "2026", photo: "political/eisenkot.jpg" },
  { x: 1060, top: 218 }, // the golden cube
];
export const CUBE = { w: 210, h: 210 };
const GOLD = { w: 270, h: 200 };

// Hops: [start frame, to step, arc height]. Each takes HOP frames (one beat).
export const HOP = 15;
export const HOPS: [number, number, number][] = [
  [45, 1, 110],
  [90, 2, 110],
  [225, 3, 52],
];
const DROP_IN = 12; // falls onto the first cube
export const THOUGHT = { from: 150, to: 210 };
export const GOLDEN = 210;
export const LANDED = HOPS[2][0] + HOP; // 240, the "ta-da" in the score

export const CHARACTER = { src: "political/character.png", h: 158, w: 158 * (219 / 631) };

// Where the character's feet are, how high he is in the air, and his squash.
export const characterState = (frame: number) => {
  let step = 0;
  let x = STEPS[0].x;
  let y = STEPS[0].top - interpolate(frame, [0, DROP_IN], [520, 0], { ...clamp, easing: (t) => t * t });
  let airborne = frame < DROP_IN;
  let dir = 0;
  let sinceLanding = frame - DROP_IN;
  for (const [start, to] of HOPS) {
    if (frame >= start + HOP) {
      step = to;
      x = STEPS[to].x;
      y = STEPS[to].top;
      sinceLanding = frame - start - HOP;
    }
  }
  for (const [start, to, arc] of HOPS) {
    if (frame >= start && frame < start + HOP) {
      const from = STEPS[to - 1];
      const p = (frame - start) / HOP;
      x = from.x + (STEPS[to].x - from.x) * easeInOut(p);
      y = from.top + (STEPS[to].top - from.top) * easeInOut(p) - Math.sin(p * Math.PI) * arc;
      airborne = true;
      dir = 1;
      sinceLanding = -1;
    }
  }
  // Squash and stretch: crouch before take-off, stretch in the air, squash on landing.
  const nextHop = HOPS.find(([start]) => frame < start && frame >= start - 5);
  let scaleY = 1 + 0.015 * Math.sin(frame / 7); // breathing
  if (nextHop) scaleY = 1 - 0.14 * Math.sin(((frame - (nextHop[0] - 5)) / 5) * Math.PI * 0.5);
  if (airborne) scaleY = 1.1;
  if (sinceLanding >= 0 && sinceLanding < 8) scaleY = 1 - 0.18 * Math.sin((sinceLanding / 8) * Math.PI);
  return { step, x, y, airborne, dir, scaleY };
};

export const Cube: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = STEPS[index];
  const enter = spring({ frame: frame - index * 5, fps, config: { damping: 14 } });
  const { step, airborne } = characterState(frame);
  const occupied = step === index && !airborne && frame < LANDED;
  const dim = interpolate(frame, [LANDED, LANDED + 15], [1, 0.4], clamp);
  return (
    <>
      {/* Stair column under the cube, down to the floor */}
      <div
        style={{
          position: "absolute",
          left: s.x - CUBE.w / 2 + 20,
          top: s.top + CUBE.h - 10,
          width: CUBE.w - 40,
          height: 720 - s.top - CUBE.h + 10,
          background: "linear-gradient(180deg, rgba(56,189,248,0.22), rgba(56,189,248,0.02))",
          opacity: enter * dim,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: s.x - CUBE.w / 2,
          top: s.top,
          width: CUBE.w,
          height: CUBE.h,
          borderRadius: 22,
          background: "linear-gradient(180deg, #24324a, #1e293b)",
          border: `4px solid ${occupied ? "#7dd3fc" : "#38bdf8"}`,
          boxShadow: occupied
            ? "0 0 34px rgba(56,189,248,0.65), 0 20px 25px -5px rgba(0,0,0,0.5)"
            : "0 20px 25px -5px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 10,
          gap: 4,
          opacity: enter * dim,
          filter: dim < 1 ? `grayscale(${(1 - dim) * 1.4})` : undefined,
          transform: `translateY(${(1 - enter) * 300}px)`,
        }}
      >
        <Img
          src={staticFile(s.photo!)}
          style={{ width: "100%", height: 112, objectFit: "cover", objectPosition: "50% 18%", borderRadius: 12 }}
        />
        <div style={{ color: "#fff", fontSize: 30, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap" }}>
          {s.name}
        </div>
        <div style={{ color: "#fbbf24", fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{s.year}</div>
      </div>
    </>
  );
};

export const Character: React.FC = () => {
  const frame = useCurrentFrame();
  const { x, y, airborne, dir, scaleY } = characterState(frame);
  const thinking = frame >= THOUGHT.from && frame < GOLDEN;
  // Tilt into the jump, sway while thinking, wiggle when he makes it to the top.
  let rotate = airborne ? dir * 10 : 0;
  if (thinking) rotate = Math.sin((frame - THOUGHT.from) / 7) * 5;
  let hop = 0;
  if (frame >= LANDED + 8) {
    const t = frame - LANDED - 8;
    hop = Math.abs(Math.sin((t / 15) * Math.PI)) * 26 * Math.max(0, 1 - t / 60);
    rotate = Math.sin(t / 3) * 8 * Math.max(0, 1 - t / 60);
  }
  return (
    <div
      style={{
        position: "absolute",
        left: x - CHARACTER.w / 2,
        top: y - CHARACTER.h - hop,
        width: CHARACTER.w,
        height: CHARACTER.h,
        transformOrigin: "50% 100%",
        transform: `rotate(${rotate}deg) scale(${1 / Math.sqrt(scaleY)}, ${scaleY})`,
      }}
    >
      <Img
        src={staticFile(CHARACTER.src)}
        style={{ width: "100%", height: "100%", filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.5))" }}
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
  const head = { x: STEPS[2].x, y: STEPS[2].top - CHARACTER.h };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      {[0, 1].map((k) => {
        const s = spring({ frame: local - k * 4, fps, config: { damping: 12 } });
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: head.x - 40 - k * 30,
              top: head.y - 20 - k * 30,
              width: 16 + k * 10,
              height: 16 + k * 10,
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
          left: head.x - 470,
          top: head.y - 92,
          width: 400,
          textAlign: "center",
          whiteSpace: "nowrap",
          backgroundColor: "#ffffff",
          padding: "14px 22px",
          borderRadius: 36,
          fontSize: 34,
          fontWeight: 900,
          color: "#0f172a",
          boxShadow: "0 10px 15px rgba(0,0,0,0.3)",
          direction: "rtl",
          transform: `scale(${pop * pulse})`,
          transformOrigin: "90% 100%",
        }}
      >
        אז מה יהיה בסוף?? 🤔
      </div>
    </div>
  );
};

export const GoldenCube: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < GOLDEN - 2) return null;
  const local = frame - GOLDEN;
  const enter = spring({ frame: local, fps, config: { damping: 11 } });
  const y = interpolate(enter, [0, 1], [-480, 0]);
  const glow = 0.6 + 0.4 * Math.sin(local / 6);
  // Gets brighter once he is standing on it.
  const won = interpolate(frame, [LANDED, LANDED + 10], [0, 1], clamp);
  const s = STEPS[3];
  return (
    <div
      style={{
        position: "absolute",
        left: s.x - GOLD.w / 2,
        top: s.top,
        width: GOLD.w,
        height: GOLD.h,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -100,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(251,191,36,${(0.45 + 0.3 * won) * glow}) 0%, rgba(251,191,36,0) 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -170,
          background: "repeating-conic-gradient(from 0deg, rgba(253,230,138,0.2) 0deg 8deg, transparent 8deg 20deg)",
          transform: `rotate(${local * 0.7}deg)`,
          borderRadius: "50%",
          opacity: 0.6 + 0.4 * won,
          maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 26,
          background: "linear-gradient(135deg, #fcd34d, #f59e0b 45%, #d97706)",
          border: "6px solid #fbbf24",
          boxShadow: `0 0 ${60 + 40 * glow}px #fbbf24, 0 24px 40px rgba(0,0,0,0.5)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            backgroundColor: "#78350f",
            border: "4px solid #fde68a",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 44,
          }}
        >
          💪
        </div>
        <div style={{ color: "#fff", fontSize: 44, fontWeight: 900, textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>
          אייזנ-ביטון
        </div>
      </div>
    </div>
  );
};

// Gold sparkles bursting out when he lands on the golden cube.
export const Sparkles: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame - LANDED;
  if (local < 0) return null;
  const c = { x: STEPS[3].x, y: STEPS[3].top - 40 };
  return (
    <>
      {Array.from({ length: 34 }, (_, i) => {
        const angle = random(`a${i}`) * Math.PI * 2;
        const speed = 4 + random(`s${i}`) * 7;
        const d = Math.min(local, 40) * speed;
        const life = interpolate(local, [0, 40, 60], [1, 0.8, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x + Math.cos(angle) * d,
              top: c.y + Math.sin(angle) * d * 0.7 + local * local * 0.04,
              width: 9,
              height: 9,
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

export const PoliticalAnimation: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at 60% 30%, #1e2a44 0%, #0f172a 65%)",
      fontFamily: FONT,
      direction: "rtl",
    }}
  >
    {/* Playful score from scripts/generate-political-music.mjs */}
    <Html5Audio
      src={staticFile("political/music.mp3")}
      volume={(f) => interpolate(f, [0, 4, POLITICAL_DURATION - 6, POLITICAL_DURATION], [0, 0.85, 0.85, 0], clamp)}
    />
    {STEPS.slice(0, 3).map((_, i) => (
      <Cube key={i} index={i} />
    ))}
    <Sparkles />
    <GoldenCube />
    <Character />
    <ThoughtBubble />
  </AbsoluteFill>
);
