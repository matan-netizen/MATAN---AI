import React from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";

// The campaign mascot (gold jacket, bow tie, kippah, white beard) drawn as a
// flat vector character. Everything that moves is driven by a Pose, so scenes
// animate him with keyframes; `talk` (0–1) opens the mouth for lip sync.

export type Mood = "smile" | "grin" | "surprise" | "serious" | "worried";
export type Pose = {
  // [shoulder, elbow] in degrees; 0 = hanging down, positive = outward.
  left: [number, number];
  right: [number, number];
  // Raised (+1) or furrowed (−1) eyebrows.
  brow: number;
  // Where the pupils look, −1…1.
  lookX: number;
  lookY: number;
  // Head tilt (deg) and whole-body lean (deg).
  tilt: number;
  lean: number;
  // Vertical hop in px (e.g. a jump of joy).
  hop: number;
  mood: Mood;
  // Which hand points a finger.
  pointLeft?: boolean;
  pointRight?: boolean;
};

export const REST: Pose = {
  left: [8, 10],
  right: [8, 10],
  brow: 0,
  lookX: 0,
  lookY: 0,
  tilt: 0,
  lean: 0,
  hop: 0,
  mood: "smile",
};

type Key = { at: number } & Partial<Pose>;

const NUMERIC = ["brow", "lookX", "lookY", "tilt", "lean", "hop"] as const;

// Interpolates between pose keyframes (eased). Discrete fields (mood,
// pointing) switch when their keyframe is reached.
export const usePose = (keys: Key[]): Pose => {
  const frame = useCurrentFrame();
  const full: (Pose & { at: number })[] = [];
  keys.forEach((k, i) => {
    const prev = i === 0 ? { ...REST, at: 0 } : full[i - 1];
    full.push({ ...prev, ...k });
  });
  if (frame <= full[0].at) return full[0];
  const i = full.findIndex((k) => k.at > frame);
  if (i === -1) return full[full.length - 1];
  const a = full[i - 1];
  const b = full[i];
  const t = interpolate(frame, [a.at, b.at], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
  });
  const mix = (x: number, y: number) => x + (y - x) * t;
  const out: Pose = {
    ...a,
    left: [mix(a.left[0], b.left[0]), mix(a.left[1], b.left[1])],
    right: [mix(a.right[0], b.right[0]), mix(a.right[1], b.right[1])],
  };
  for (const key of NUMERIC) out[key] = mix(a[key], b[key]);
  return out;
};

// Mouth opening from a per-frame voice envelope (see lipsync.json).
export const talkFrom = (env: number[], frame: number) => {
  const v = env[Math.max(0, Math.min(env.length - 1, frame))] ?? 0;
  const prev = env[Math.max(0, frame - 1)] ?? 0;
  return Math.min(1, Math.max(0, (v * 0.7 + prev * 0.3 - 0.08) * 1.25));
};

const SKIN = "#F1C29B";
const SKIN_DARK = "#DFA57E";
const GOLD = "#D9A441";
const GOLD_DARK = "#B07C25";
const INK = "#1B1F2A";
const PANTS = "#1F2A44";
const WHITE = "#FFFFFF";
const HAIR = "#F4F1EA";

const Arm: React.FC<{
  x: number;
  y: number;
  side: 1 | -1;
  angles: [number, number];
  point?: boolean;
  item?: React.ReactNode;
}> = ({ x, y, side, angles, point, item }) => {
  // side: 1 = character's right (viewer's left).
  const shoulder = angles[0] * side;
  const elbow = angles[1] * side;
  return (
    <g transform={`translate(${x} ${y}) rotate(${shoulder})`}>
      <rect x={-23} y={-10} width={46} height={140} rx={23} fill={GOLD} />
      <rect
        x={-23}
        y={60}
        width={46}
        height={10}
        fill={GOLD_DARK}
        opacity={0.35}
      />
      <g transform={`translate(0 122) rotate(${elbow})`}>
        <rect x={-21} y={-8} width={42} height={120} rx={21} fill={GOLD} />
        <rect x={-20} y={96} width={40} height={18} rx={6} fill={WHITE} />
        <g transform="translate(0 132)">
          <circle r={24} fill={SKIN} />
          {point ? (
            <rect x={-6} y={8} width={12} height={36} rx={6} fill={SKIN} />
          ) : (
            <path
              d="M-18 6 Q0 22 18 6"
              stroke={SKIN_DARK}
              strokeWidth={3}
              fill="none"
            />
          )}
          {item}
        </g>
      </g>
    </g>
  );
};

export const Character: React.FC<{
  pose: Pose;
  talk?: number;
  size?: number;
  x?: number;
  y?: number;
  leftItem?: React.ReactNode;
  rightItem?: React.ReactNode;
  seed?: string;
  sweat?: boolean;
}> = ({
  pose,
  talk = 0,
  size = 900,
  x = 0,
  y = 0,
  leftItem,
  rightItem,
  seed = "c",
  sweat = false,
}) => {
  const frame = useCurrentFrame();
  // Breathing and idle sway.
  const breathe = Math.sin(frame / 14) * 3;
  // Blink every ~3s at a seeded offset, 5 frames long.
  const period = 95;
  const phase = (frame + Math.floor(random(seed) * period)) % period;
  const eyeOpen = phase < 5 ? Math.abs(phase - 2.5) / 2.5 : 1;
  const { mood } = pose;
  const eyeScale =
    eyeOpen * (mood === "surprise" ? 1.25 : mood === "grin" ? 0.75 : 1);
  const browY = -pose.brow * 9 + (mood === "surprise" ? -10 : 0);
  const browTilt =
    mood === "serious" ? 12 : mood === "worried" ? -14 : pose.brow * -4;
  const mouthOpen = talk * 16 + (mood === "surprise" ? 14 : 0);
  const jaw = talk * 7;

  const mouth =
    mouthOpen > 2 ? (
      <g>
        <ellipse
          cx={200}
          cy={254 + jaw / 2}
          rx={mood === "surprise" ? 13 : 19}
          ry={3 + mouthOpen}
          fill="#5A1E1E"
        />
        <ellipse
          cx={200}
          cy={258 + jaw}
          rx={10}
          ry={Math.min(6, mouthOpen / 2)}
          fill="#E46B6B"
        />
      </g>
    ) : mood === "serious" ? (
      <path
        d="M182 256 L218 256"
        stroke="#5A1E1E"
        strokeWidth={5}
        strokeLinecap="round"
      />
    ) : mood === "worried" ? (
      <path
        d="M182 262 Q200 248 218 262"
        stroke="#5A1E1E"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
    ) : (
      <path
        d={
          mood === "grin"
            ? "M176 248 Q200 278 224 248 Z"
            : "M180 252 Q200 268 220 252"
        }
        stroke="#5A1E1E"
        strokeWidth={5}
        fill={mood === "grin" ? "#5A1E1E" : "none"}
        strokeLinecap="round"
      />
    );

  return (
    <svg
      viewBox="0 0 400 830"
      width={size * (400 / 830)}
      height={size}
      style={{
        position: "absolute",
        left: x,
        top: y,
        overflow: "visible",
        filter: "drop-shadow(0 24px 30px rgba(10,20,40,0.28))",
      }}
    >
      <g transform={`translate(0 ${-pose.hop}) rotate(${pose.lean} 200 800)`}>
        {/* Legs and shoes */}
        <ellipse cx={160} cy={808} rx={42} ry={14} fill={INK} />
        <ellipse cx={240} cy={808} rx={42} ry={14} fill={INK} />
        <path d="M140 560 L196 560 L190 800 L148 800 Z" fill={PANTS} />
        <path d="M204 560 L260 560 L252 800 L210 800 Z" fill={PANTS} />
        <path
          d="M150 600 L156 795"
          stroke={WHITE}
          strokeWidth={5}
          opacity={0.85}
        />
        <path
          d="M250 600 L244 795"
          stroke={WHITE}
          strokeWidth={5}
          opacity={0.85}
        />
        <g transform={`translate(0 ${breathe * 0.4})`}>
          {/* Torso */}
          <path
            d="M118 300 Q200 280 282 300 L292 590 Q200 612 108 590 Z"
            fill={GOLD}
          />
          <path d="M150 304 L250 304 L258 585 Q200 598 142 585 Z" fill={INK} />
          <path d="M168 300 L232 300 L200 392 Z" fill={WHITE} />
          <path
            d="M118 300 L168 300 L178 420 Z"
            fill={GOLD_DARK}
            opacity={0.55}
          />
          <path
            d="M282 300 L232 300 L222 420 Z"
            fill={GOLD_DARK}
            opacity={0.55}
          />
          {[440, 490, 540].map((cy) => (
            <circle key={cy} cx={200} cy={cy} r={6} fill={GOLD} />
          ))}
          <path
            d="M176 294 L200 308 L176 322 Z M224 294 L200 308 L224 322 Z"
            fill={GOLD}
          />
          <circle cx={200} cy={308} r={7} fill={GOLD_DARK} />
          {/* Pocket square */}
          <path d="M238 360 L262 360 L258 372 L242 372 Z" fill={WHITE} />
          {/* Arms, in front of the jacket */}
          <Arm
            x={122}
            y={322}
            side={1}
            angles={pose.right}
            point={pose.pointRight}
            item={rightItem}
          />
          <Arm
            x={278}
            y={322}
            side={-1}
            angles={pose.left}
            point={pose.pointLeft}
            item={leftItem}
          />
          {/* Neck */}
          <rect x={180} y={262} width={40} height={40} fill={SKIN_DARK} />
          {/* Head */}
          <g transform={`rotate(${pose.tilt} 200 290)`}>
            <ellipse cx={121} cy={206} rx={14} ry={20} fill={SKIN} />
            <ellipse cx={279} cy={206} rx={14} ry={20} fill={SKIN} />
            <ellipse cx={200} cy={196} rx={80} ry={94} fill={SKIN} />
            {/* White hair at the sides */}
            <path
              d="M124 170 Q118 135 140 120 Q132 160 140 196 Z"
              fill={HAIR}
            />
            <path
              d="M276 170 Q282 135 260 120 Q268 160 260 196 Z"
              fill={HAIR}
            />
            {/* Kippah */}
            <ellipse
              cx={200}
              cy={112}
              rx={50}
              ry={17}
              fill={INK}
              transform="rotate(-6 200 112)"
            />
            {/* Cheeks */}
            <circle cx={150} cy={226} r={15} fill="#F08A8A" opacity={0.25} />
            <circle cx={250} cy={226} r={15} fill="#F08A8A" opacity={0.25} />
            {/* Eyes */}
            {[170, 230].map((cx) => (
              <g
                key={cx}
                transform={`translate(${cx} 186) scale(1 ${eyeScale})`}
              >
                <ellipse rx={14} ry={16} fill={WHITE} />
                <circle
                  cx={pose.lookX * 5}
                  cy={pose.lookY * 5 + 1}
                  r={7.5}
                  fill={INK}
                />
                <circle
                  cx={pose.lookX * 5 + 2.5}
                  cy={pose.lookY * 5 - 2}
                  r={2.2}
                  fill={WHITE}
                />
              </g>
            ))}
            {/* Eyebrows */}
            <rect
              x={150}
              y={156 + browY}
              width={38}
              height={9}
              rx={4.5}
              fill={HAIR}
              stroke="#D8D2C4"
              strokeWidth={1.5}
              transform={`rotate(${browTilt} 169 ${160 + browY})`}
            />
            <rect
              x={212}
              y={156 + browY}
              width={38}
              height={9}
              rx={4.5}
              fill={HAIR}
              stroke="#D8D2C4"
              strokeWidth={1.5}
              transform={`rotate(${-browTilt} 231 ${160 + browY})`}
            />
            {/* Nose */}
            <ellipse cx={200} cy={218} rx={13} ry={11} fill={SKIN_DARK} />
            {/* Beard (lower part follows the jaw) */}
            <g transform={`translate(0 ${jaw})`}>
              <path
                d="M126 214 Q126 318 200 340 Q274 318 274 214 Q256 268 228 272 Q200 290 172 272 Q144 268 126 214 Z"
                fill={HAIR}
                stroke="#E2DDD0"
                strokeWidth={2}
              />
            </g>
            {mouth}
            {/* Mustache */}
            <path
              d="M166 242 Q184 230 200 240 Q216 230 234 242 Q222 252 200 246 Q178 252 166 242 Z"
              fill={HAIR}
              stroke="#E2DDD0"
              strokeWidth={1.5}
            />
            {sweat ? (
              <path
                d={`M268 ${150 + ((frame * 2) % 40)} q8 14 0 20 q-8 -6 0 -20 Z`}
                fill="#7CC6FF"
                opacity={0.9}
              />
            ) : null}
          </g>
        </g>
      </g>
    </svg>
  );
};
