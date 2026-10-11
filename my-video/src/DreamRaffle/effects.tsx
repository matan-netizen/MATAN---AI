import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FOOTAGE, FPS, OVERLAP } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A shot from the walkthrough, with a slow push-in. `zoom` is [start, end] scale.
export const Shot: React.FC<{
  at: number;
  rate?: number;
  zoom?: [number, number];
  origin?: string;
  style?: React.CSSProperties;
}> = ({ at, rate = 1, zoom = [1.04, 1.14], origin = "50% 50%", style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], zoom, clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <OffthreadVideo
        src={staticFile(FOOTAGE)}
        trimBefore={Math.round(at * FPS)}
        playbackRate={rate}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          transformOrigin: origin,
          filter: "saturate(1.12) contrast(1.06) brightness(1.02)",
        }}
      />
    </AbsoluteFill>
  );
};

// Warm light leaks drifting across the frame (screen-blended).
export const LightLeak: React.FC<{ intensity?: number; seed?: number }> = ({
  intensity = 0.55,
  seed = 1,
}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const blob = (k: number, color: string) => {
    const x = 50 + 45 * Math.sin(t * 0.7 + k * 2.1 + seed);
    const y = 30 + 40 * Math.cos(t * 0.5 + k * 1.3 + seed);
    return `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, transparent 45%)`;
  };
  const flicker = 0.85 + 0.15 * Math.sin(t * 5.3 + seed);
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: intensity * flicker,
        background: [
          blob(0, "rgba(255,150,60,0.75)"),
          blob(1, "rgba(255,210,120,0.6)"),
          blob(2, "rgba(255,90,40,0.45)"),
        ].join(","),
        filter: "blur(40px)",
        pointerEvents: "none",
      }}
    />
  );
};

// A diagonal band of light sweeping across, for the "reflection glow".
export const ShineSweep: React.FC<{ start?: number; duration?: number; opacity?: number }> = ({
  start = 0,
  duration = 28,
  opacity = 0.5,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + duration], [-60, 160], clamp);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(115deg, transparent ${p - 18}%, rgba(255,240,200,${opacity}) ${p}%, transparent ${p + 18}%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

// Gold sparkles rising and twinkling. Deterministic, so every render matches.
export const Particles: React.FC<{
  count?: number;
  seed?: string;
  area?: { top: number; height: number };
  size?: number;
}> = ({ count = 40, seed = "p", area = { top: 0, height: 1920 }, size = 10 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const x = random(`${seed}x${i}`) * 1080;
        const speed = 1 + random(`${seed}s${i}`) * 3;
        const phase = random(`${seed}p${i}`) * area.height;
        const y = area.top + ((phase - frame * speed) % area.height + area.height) % area.height;
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(frame / 8 + i));
        const s = size * (0.4 + random(`${seed}z${i}`));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + 20 * Math.sin(frame / 20 + i),
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${COLORS.white} 0%, ${COLORS.goldLight} 35%, rgba(212,175,55,0) 70%)`,
              opacity: twinkle,
              boxShadow: `0 0 ${s * 1.5}px ${COLORS.gold}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Warm gold flare behind the cause scene's graphics.
export const GoldFlare: React.FC<{ x?: number; y?: number; size?: number }> = ({
  x = 540,
  y = 420,
  size = 900,
}) => {
  const frame = useCurrentFrame();
  const pulse = 0.85 + 0.15 * Math.sin(frame / 10);
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,226,150,${0.7 * pulse}) 0%, rgba(212,175,55,${0.35 * pulse}) 30%, transparent 65%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(10,6,3,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

// Darkens the bottom (or top) of the frame so text reads on bright footage.
export const Scrim: React.FC<{ from?: "top" | "bottom"; height?: number; opacity?: number }> = ({
  from = "bottom",
  height = 60,
  opacity = 0.75,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${from === "bottom" ? "0deg" : "180deg"}, rgba(20,12,6,${opacity}) 0%, rgba(20,12,6,${opacity * 0.6}) ${height * 0.5}%, transparent ${height}%)`,
      pointerEvents: "none",
    }}
  />
);

// ---------------------------------------------------------------------------
// Transitions: the entering scene animates in over OVERLAP frames while the
// previous scene keeps playing underneath.
// ---------------------------------------------------------------------------

export type Entrance = "none" | "whip" | "zoom" | "flash";

export const Enter: React.FC<{ type: Entrance; children: React.ReactNode }> = ({
  type,
  children,
}) => {
  const frame = useCurrentFrame();
  if (type === "whip") {
    // Fast whip-pan from the right, with motion blur that clears as it lands.
    const p = interpolate(frame, [0, OVERLAP], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    return (
      <AbsoluteFill
        style={{
          transform: `translateX(${(1 - p) * 1080}px)`,
          filter: `blur(${(1 - p) * 26}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  if (type === "zoom") {
    // Soft cinematic zoom: scale down from 1.25 while fading in.
    const p = interpolate(frame, [0, OVERLAP + 8], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 2) });
    return (
      <AbsoluteFill
        style={{
          opacity: p,
          transform: `scale(${1.25 - 0.25 * p})`,
          filter: `blur(${(1 - p) * 12}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  if (type === "flash") {
    const opacity = interpolate(frame, [0, 3], [0, 1], clamp);
    return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
  }
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

// White flash that peaks on the cut; lives in the root timeline.
export const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 3, 14], [0, 1, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle, #FFFFFF 0%, ${COLORS.goldLight} 70%, ${COLORS.gold} 100%)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// Bright streak that rides along with the whip-pan.
export const WhipStreak: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, OVERLAP], [1300, -600], clamp);
  const opacity = interpolate(frame, [0, 3, OVERLAP], [0, 0.9, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: 500,
        height: 1920,
        background: "linear-gradient(90deg, transparent, rgba(255,235,190,0.85), transparent)",
        filter: "blur(30px)",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};
