import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FONT } from "../DreamRaffle/theme";
import {
  Character,
  characterState,
  Cube,
  GOLDEN,
  GoldenCube,
  HOP,
  HOPS,
  LANDED,
  POLITICAL_DURATION,
  Sparkles,
  STEPS,
  THOUGHT,
} from "./index";

// The cinematic cut of PoliticalAnimation: the same scene (1280x720 stage)
// filmed by a virtual camera at 1920x1080 — 2.39:1 letterbox, a camera that
// follows the climb, pushes in on the thought and pulls back for the reveal,
// parallax skyline, fog, light shafts, depth of field, teal-orange grade,
// film grain and a trailer score (scripts/generate-political-cinematic-audio.mjs).

const SERIF = "Frank Ruhl Libre";
loadFont({ family: SERIF, url: staticFile("fonts/FrankRuhlLibre-900.ttf"), weight: "900" });

export const CINEMATIC_FPS = 30;
export const CINEMATIC_DURATION = POLITICAL_DURATION;

const W = 1920;
const H = 1080;
const STAGE = 1.5; // stage px → output px
const BAR = 138; // 2.39:1 letterbox
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------------------------------------------------------------------------
// Camera (stage coordinates)
// ---------------------------------------------------------------------------

// Character position smoothed over the last frames, so the camera lags a
// little behind him like a real operator.
const follow = (frame: number) => {
  let x = 0;
  let y = 0;
  const N = 10;
  for (let k = 0; k < N; k++) {
    const s = characterState(Math.max(0, frame - k));
    x += s.x;
    y += s.y;
  }
  // Aim between his head and the cube under him, so the name stays in shot.
  return { x: x / N, y: y / N + 20 };
};

const IMPACTS = [12, HOPS[0][0] + HOP, HOPS[1][0] + HOP, GOLDEN + 8, LANDED];

const camera = (frame: number) => {
  const f = follow(frame);
  // Fixed framings: wide establishing shot, the reveal, the hero shot.
  const fixedX = interpolate(frame, [0, 40, 205, 222, 265, 300], [640, 380, 760, 905, 1060, 1060], clamp);
  const fixedY = interpolate(frame, [0, 40, 205, 222, 265, 300], [405, 425, 230, 300, 240, 235], clamp);
  // How much the camera follows him instead of a fixed framing.
  const w = interpolate(frame, [30, 50, 200, 212, 224, 238, 252, 268], [0, 1, 1, 0, 0, 1, 1, 0], clamp);
  const zoom = interpolate(
    frame,
    [0, 40, 60, 150, 200, 214, 224, 240, 268, 300],
    [0.85, 1.0, 1.2, 1.2, 1.45, 1.0, 0.98, 1.15, 1.25, 1.3],
    clamp,
  );
  // Handheld drift, plus a short shake on every landing and impact.
  let shakeX = Math.sin(frame * 0.13) * 1.6 + Math.sin(frame * 0.29) * 0.8;
  let shakeY = Math.cos(frame * 0.11) * 1.2 + Math.sin(frame * 0.37) * 0.6;
  for (const at of IMPACTS) {
    const t = frame - at;
    if (t >= 0 && t < 18) {
      const a = (at === GOLDEN + 8 ? 9 : 5) * Math.exp(-t / 4);
      shakeX += Math.sin(t * 2.3) * a;
      shakeY += Math.cos(t * 2.9) * a;
    }
  }
  const rot = 0.3 * Math.sin(frame / 40) + interpolate(frame, [205, 216, 240], [0, -1.3, 0], clamp);
  return {
    x: fixedX + (f.x - fixedX) * w + shakeX / zoom,
    y: fixedY + (f.y - fixedY) * w + shakeY / zoom,
    zoom,
    rot,
  };
};

// Moves a screen-space layer by a fraction `k` of the camera motion (parallax).
const parallax = (frame: number, k: number): React.CSSProperties => {
  const c = camera(frame);
  return {
    transform: `translate(${-(c.x - 640) * STAGE * k}px, ${-(c.y - 360) * STAGE * k}px) scale(${1 + (c.zoom - 1) * k})`,
  };
};

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

const Skyline: React.FC<{ layer: number }> = ({ layer }) => {
  const frame = useCurrentFrame();
  const far = layer === 0;
  const count = far ? 34 : 18;
  let x = -600;
  const buildings = [];
  for (let i = 0; i < count; i++) {
    const w = (far ? 70 : 130) + random(`w${layer}${i}`) * (far ? 90 : 160);
    const h = (far ? 180 : 260) + random(`h${layer}${i}`) * (far ? 320 : 380);
    buildings.push({ x, w, h, i });
    x += w + (far ? 6 : 14);
  }
  return (
    <AbsoluteFill style={{ ...parallax(frame, far ? 0.18 : 0.38), filter: `blur(${far ? 2.5 : 5}px)`, inset: -400 }}>
      {buildings.map(({ x: bx, w, h, i }) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: bx + 400,
            bottom: far ? 260 : 120,
            width: w,
            height: h,
            background: far ? "#0d2230" : "#08161f",
          }}
        >
          {/* A few lit windows */}
          {Array.from({ length: far ? 6 : 10 }, (_, k) => (
            <div
              key={k}
              style={{
                position: "absolute",
                left: random(`wx${layer}${i}${k}`) * (w - 10),
                top: random(`wy${layer}${i}${k}`) * (h - 20),
                width: far ? 5 : 8,
                height: far ? 7 : 11,
                background: random(`wc${layer}${i}${k}`) > 0.3 ? "#f2b45a" : "#9fd3e6",
                opacity: 0.35 + 0.4 * random(`wo${layer}${i}${k}`),
              }}
            />
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const LightShafts: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...parallax(frame, 0.3), mixBlendMode: "screen", inset: -300 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 1500 + i * 230,
            top: -200,
            width: 140 + i * 60,
            height: 1900,
            transform: `rotate(${28 + i * 4}deg)`,
            transformOrigin: "50% 0%",
            background: "linear-gradient(180deg, rgba(180,225,255,0.35), rgba(180,225,255,0) 80%)",
            filter: "blur(40px)",
            opacity: 0.35 + 0.15 * Math.sin(frame / (18 + i * 5) + i),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Fog: React.FC<{ k: number; y: number; opacity: number }> = ({ k, y, opacity }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...parallax(frame, k), inset: -400, pointerEvents: "none" }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: ((i * 700 + frame * (1.2 + i * 0.4)) % 3200) - 400,
            top: y + i * 40,
            width: 1400,
            height: 360,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(140,180,200,0.5), rgba(140,180,200,0) 70%)",
            filter: "blur(30px)",
            opacity,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Dust in the light (mid) and big out-of-focus bokeh (foreground).
const Dust: React.FC<{ k: number; count: number; size: number; blur: number; seed: string }> = ({
  k,
  count,
  size,
  blur,
  seed,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...parallax(frame, k), inset: -300, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const x = random(`${seed}x${i}`) * 2500 + Math.sin(frame / 50 + i) * 30;
        const y = ((random(`${seed}y${i}`) * 1700 - frame * (0.3 + random(`${seed}s${i}`) * 0.6)) % 1700 + 1700) % 1700;
        const s = size * (0.5 + random(`${seed}z${i}`));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,230,190,0.9), rgba(255,230,190,0) 70%)",
              filter: `blur(${blur}px)`,
              opacity: 0.25 + 0.35 * Math.abs(Math.sin(frame / 20 + i)),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// The scene, filmed
// ---------------------------------------------------------------------------

// Depth of field: things far from the camera's focus point blur.
const Focus: React.FC<{ x: number; children: React.ReactNode }> = ({ x, children }) => {
  const frame = useCurrentFrame();
  const c = camera(frame);
  const blur = Math.max(0, Math.min(1, (Math.abs(x - c.x) * c.zoom) / 420 - 0.25)) * 5;
  return <div style={{ position: "absolute", inset: 0, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>{children}</div>;
};

const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const c = camera(frame);
  const s = STAGE * c.zoom;
  const ch = characterState(frame);
  const warm = interpolate(frame, [GOLDEN, GOLDEN + 20], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1280,
        height: 720,
        transformOrigin: "0 0",
        transform: `translate(${W / 2 - c.x * s}px, ${H / 2 - c.y * s}px) scale(${s})`,
      }}
    >
      {/* Key light following him */}
      <div
        style={{
          position: "absolute",
          left: ch.x - 260,
          top: ch.y - 330,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,230,255,0.28), rgba(200,230,255,0) 65%)",
          mixBlendMode: "screen",
        }}
      />
      {/* Warm light thrown by the golden cube */}
      <div
        style={{
          position: "absolute",
          left: STEPS[3].x - 700,
          top: STEPS[3].top - 600,
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,170,60,${0.45 * warm}), rgba(255,170,60,0) 60%)`,
          mixBlendMode: "screen",
        }}
      />
      {STEPS.slice(0, 3).map((step, i) => (
        <Focus key={i} x={step.x}>
          <Cube index={i} />
        </Focus>
      ))}
      <Focus x={STEPS[3].x}>
        <Sparkles />
        <GoldenCube />
      </Focus>
      <Character />
    </div>
  );
};

// "אז מה יהיה בסוף??" as a cinematic line beside him in the close-up.
const ThoughtLine: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < THOUGHT.from + 4 || frame >= GOLDEN) return null;
  const words = ["אז", "מה", "יהיה", "בסוף??"];
  const out = interpolate(frame, [GOLDEN - 8, GOLDEN], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        width: 760,
        top: 420,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 26px",
        direction: "rtl",
        fontFamily: SERIF,
        fontWeight: 900,
        fontSize: 84,
        color: "#f4efe6",
        letterSpacing: 2,
        textShadow: "0 0 30px rgba(255,220,170,0.35), 0 6px 18px rgba(0,0,0,0.8)",
        opacity: out,
      }}
    >
      {words.map((w, i) => {
        const p = interpolate(frame, [THOUGHT.from + 6 + i * 7, THOUGHT.from + 20 + i * 7], [0, 1], clamp);
        return (
          <span key={i} style={{ opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 14}px)` }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.16, pointerEvents: "none" }}>
      <svg width={W} height={H}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 60} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const PoliticalCinematic: React.FC = () => {
  const frame = useCurrentFrame();
  const c = camera(frame);
  // Bars open from black at the start and close at the end.
  const bar = interpolate(frame, [0, 26, CINEMATIC_DURATION - 14, CINEMATIC_DURATION], [H / 2, BAR, BAR, H / 2], {
    ...clamp,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const warm = interpolate(frame, [GOLDEN, GOLDEN + 25], [0, 1], clamp);
  // Gate weave and a touch of flicker.
  const weaveX = (random(`gx${frame}`) - 0.5) * 1.4;
  const weaveY = (random(`gy${frame}`) - 0.5) * 1.4;
  const flicker = 1 - random(`fl${frame}`) * 0.025;
  return (
    <AbsoluteFill style={{ backgroundColor: "black", fontFamily: FONT }}>
      <Html5Audio
        src={staticFile("political/cinematic.mp3")}
        volume={(f) => interpolate(f, [0, 6, CINEMATIC_DURATION - 8, CINEMATIC_DURATION], [0, 1, 1, 0], clamp)}
      />
      <AbsoluteFill
        style={{
          transform: `translate(${weaveX}px, ${weaveY}px) rotate(${c.rot}deg)`,
          filter: `contrast(1.12) saturate(0.88) brightness(${0.97 * flicker})`,
        }}
      >
        {/* Sky */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, #04101a 0%, #0a1d29 55%, #1b2a2e 78%, #2c2418 100%)",
          }}
        />
        <Skyline layer={0} />
        <LightShafts />
        <Fog k={0.3} y={900} opacity={0.35} />
        <Skyline layer={1} />
        <Dust k={0.7} count={40} size={10} blur={1} seed="mid" />
        <Stage />
        <Fog k={1.2} y={1080} opacity={0.4} />
        <Dust k={1.6} count={9} size={120} blur={14} seed="front" />
        {/* Teal-orange grade */}
        <AbsoluteFill
          style={{
            background: "linear-gradient(180deg, rgba(0,90,110,0.35), rgba(0,60,80,0.15) 60%, rgba(255,140,40,0.12))",
            mixBlendMode: "soft-light",
          }}
        />
        <AbsoluteFill
          style={{ background: `rgba(255,150,50,${0.12 * warm})`, mixBlendMode: "soft-light" }}
        />
        {/* Vignette */}
        <AbsoluteFill
          style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.7) 100%)" }}
        />
      </AbsoluteFill>
      <FilmGrain />
      <ThoughtLine />
      {/* Letterbox */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bar, background: "black" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bar, background: "black" }} />
    </AbsoluteFill>
  );
};
