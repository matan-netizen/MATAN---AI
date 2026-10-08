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
import { COLORS, FONT, GOLD_GRADIENT, GOLD_METAL, useLayout } from "./theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const useSpring = (delay = 0, damping = 14, mass = 1) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass } });
};

// Fades a scene in on top of the previous one.
export const Fade: React.FC<{ children: React.ReactNode; inFrames?: number }> = ({
  children,
  inFrames = 8,
}) => {
  const frame = useCurrentFrame();
  const opacity = inFrames ? interpolate(frame, [0, inFrames], [0, 1], clamp) : 1;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// Photo with a slow push-in (or pull-out) and optional drift.
export const Photo: React.FC<{
  src: string;
  from?: number;
  to?: number;
  driftX?: number;
  driftY?: number;
  position?: string;
  filter?: string;
  duration?: number;
}> = ({ src, from = 1.05, to = 1.18, driftX = 0, driftY = 0, position = "50% 50%", filter, duration }) => {
  const frame = useCurrentFrame();
  const cfg = useVideoConfig();
  const p = interpolate(frame, [0, duration ?? cfg.durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          transform: `scale(${from + (to - from) * p}) translate(${driftX * p}px, ${driftY * p}px)`,
          filter,
        }}
      />
    </AbsoluteFill>
  );
};

export const Shade: React.FC<{ top?: number; bottom?: number; color?: string }> = ({
  top = 0.55,
  bottom = 0.75,
  color = "5,14,38",
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(${color},${top}) 0%, rgba(${color},0) 35%, rgba(${color},0) 60%, rgba(${color},${bottom}) 100%)`,
    }}
  />
);

// Dark navy glow behind centered text, for legibility over bright photos.
export const Spotlight: React.FC<{ strength?: number }> = ({ strength = 0.7 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 70% 38% at 50% 48%, rgba(5,14,38,${strength}) 0%, rgba(5,14,38,${strength * 0.5}) 55%, rgba(5,14,38,0) 100%)`,
    }}
  />
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.6 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

// Centered column inside the platform safe zone.
export const Stack: React.FC<{
  children: React.ReactNode;
  justify?: React.CSSProperties["justifyContent"];
  gap?: number;
  style?: React.CSSProperties;
}> = ({ children, justify = "center", gap = 28, style }) => {
  const { safeTop, safeBottom, format } = useLayout();
  return (
    <AbsoluteFill
      style={{
        paddingTop: safeTop,
        paddingBottom: safeBottom + (format === "vertical" ? 120 : 110),
        paddingLeft: format === "landscape" ? 160 : 60,
        paddingRight: format === "landscape" ? 160 : 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: justify,
        gap,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 3D extruded gold title: a solid dark-gold copy carries the extrusion
// shadows, a gradient copy sits on top (text-shadow would paint over a
// background-clipped fill otherwise).
export const GoldTitle: React.FC<{
  children: React.ReactNode;
  size?: number;
  delay?: number;
  slam?: boolean;
  style?: React.CSSProperties;
}> = ({ children, size = 110, delay = 0, slam = true, style }) => {
  const { t } = useLayout();
  const sp = useSpring(delay, slam ? 11 : 200);
  const fs = size * t;
  const scale = slam ? interpolate(sp, [0, 1], [1.8, 1]) : 1;
  const depth = Math.max(4, Math.round(fs / 14));
  const shadow = [
    ...Array.from({ length: depth }, (_, i) => `0 ${i + 1}px 0 ${i < depth / 2 ? "#A8841F" : "#6E520F"}`),
    `0 ${depth + 6}px ${depth * 2}px rgba(0,0,0,0.55)`,
  ].join(", ");
  const base: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 900,
    fontSize: fs,
    lineHeight: 1.08,
    textAlign: "center",
    whiteSpace: "pre-line",
    letterSpacing: -1,
  };
  return (
    <div
      style={{
        position: "relative",
        opacity: Math.min(1, sp * 2),
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      <div style={{ ...base, color: "#8A6A16", textShadow: shadow }}>{children}</div>
      <div
        style={{
          ...base,
          position: "absolute",
          inset: 0,
          backgroundImage: GOLD_GRADIENT,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Plain white headline that rises in.
export const Headline: React.FC<{
  children: React.ReactNode;
  size?: number;
  delay?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 76, delay = 0, color = COLORS.white, weight = 900, style }) => {
  const { t } = useLayout();
  const sp = useSpring(delay, 200);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size * t,
        lineHeight: 1.15,
        color,
        textAlign: "center",
        whiteSpace: "pre-line",
        textShadow: "0 6px 24px rgba(0,0,0,0.6)",
        opacity: sp,
        transform: `translateY(${(1 - sp) * 40}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Typewriter reveal (RTL-safe: reveals whole characters from the start).
export const Typewriter: React.FC<{ text: string; size?: number; delay?: number; cps?: number }> = ({
  text,
  size = 72,
  delay = 0,
  cps = 24,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { t } = useLayout();
  const n = Math.max(0, Math.floor(((frame - delay) / fps) * cps));
  const shown = text.slice(0, n);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size * t,
        lineHeight: 1.15,
        color: COLORS.white,
        textAlign: "center",
        textShadow: "0 6px 24px rgba(0,0,0,0.7)",
        minHeight: size * t * 1.2,
      }}
    >
      {shown}
      <span style={{ opacity: n < text.length && frame % 16 < 8 ? 1 : 0, color: COLORS.gold }}>|</span>
    </div>
  );
};

// Pill badge with gold stroke and a 3D bounce.
export const Pill: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: number;
  delay?: number;
  pulse?: boolean;
  sub?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, bg = COLORS.emerald, color = COLORS.white, size = 60, delay = 0, pulse, sub, style }) => {
  const frame = useCurrentFrame();
  const { t } = useLayout();
  const sp = useSpring(delay, 9);
  const fs = size * t;
  const beat = pulse ? 1 + 0.04 * Math.max(0, Math.sin(((frame - delay) / 30) * Math.PI * 2)) : 1;
  return (
    <div
      style={{
        transform: `scale(${sp * beat}) rotateX(${(1 - sp) * 70}deg)`,
        opacity: Math.min(1, sp * 2),
        padding: 6 * t,
        borderRadius: 999,
        backgroundImage: GOLD_METAL,
        boxShadow: `0 ${fs * 0.25}px ${fs * 0.6}px rgba(0,0,0,0.45)`,
        ...style,
      }}
    >
      <div
        style={{
          background: bg,
          borderRadius: 999,
          padding: `${fs * 0.22}px ${fs * 0.7}px`,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: fs,
          lineHeight: 1.1,
          color,
          textAlign: "center",
          whiteSpace: "nowrap",
          boxShadow: "inset 0 4px 0 rgba(255,255,255,0.25), inset 0 -6px 0 rgba(0,0,0,0.2)",
        }}
      >
        {children}
        {sub ? (
          <div style={{ fontSize: fs * 0.48, fontWeight: 700, opacity: 0.95, marginTop: 4 }}>{sub}</div>
        ) : null}
      </div>
    </div>
  );
};

// Deterministic gold particles drifting upward.
export const Particles: React.FC<{
  count?: number;
  seed?: string;
  color?: string;
  opacity?: number;
  speed?: number;
  size?: number;
}> = ({ count = 40, seed = "p", color = COLORS.goldLight, opacity = 0.8, speed = 1, size = 10 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {Array.from({ length: count }, (_, i) => {
        const x = random(`${seed}x${i}`) * width;
        const y0 = random(`${seed}y${i}`) * height;
        const r = (0.3 + random(`${seed}r${i}`)) * size;
        const v = (0.6 + random(`${seed}v${i}`)) * 2.2 * speed;
        const y = (((y0 - frame * v) % height) + height) % height;
        const tw = 0.5 + 0.5 * Math.sin(frame / 7 + i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(frame / 30 + i) * 20,
              top: y,
              width: r,
              height: r,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 ${r * 2}px ${r / 2}px ${color}`,
              opacity: opacity * tw,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Rotating god-rays from a point.
export const LightRays: React.FC<{
  x?: string;
  y?: string;
  opacity?: number;
  color?: string;
  speed?: number;
  size?: number;
}> = ({ x = "50%", y = "50%", opacity = 0.5, color = "rgba(247,227,141,0.55)", speed = 0.3, size = 3000 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity, mixBlendMode: "screen" }}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          transform: `rotate(${frame * speed}deg)`,
          background: `repeating-conic-gradient(from 0deg, ${color} 0deg 6deg, rgba(0,0,0,0) 6deg 18deg)`,
          maskImage: "radial-gradient(circle, black 0%, rgba(0,0,0,0.6) 25%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(circle, black 0%, rgba(0,0,0,0.6) 25%, transparent 60%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Light-leak / flash at the start of a sequence.
export const Flash: React.FC<{ at?: number; dur?: number; color?: string; peak?: number }> = ({
  at = 0,
  dur = 12,
  color = "#FFF3C4",
  peak = 0.9,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 2, at + dur], [0, peak, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 70% 40%, ${color} 0%, rgba(255,200,90,0.6) 40%, rgba(255,140,40,0) 80%)`,
        opacity: o,
        mixBlendMode: "screen",
      }}
    />
  );
};

// Golden raffle ticket.
export const Ticket: React.FC<{ label?: string; sub?: string; width?: number; free?: boolean }> = ({
  label = "כרטיס",
  sub = "שנה 9",
  width = 420,
  free,
}) => {
  const h = width * 0.5;
  const notch = h * 0.16;
  const mask = `radial-gradient(circle at 0 50%, transparent ${notch}px, black ${notch + 1}px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent ${notch}px, black ${notch + 1}px) right / 51% 100% no-repeat`;
  return (
    <div style={{ filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))" }}>
      <div
        style={{
          width,
          height: h,
          backgroundImage: free
            ? `linear-gradient(135deg, #18B3A8, ${COLORS.emerald} 50%, ${COLORS.emeraldDark})`
            : GOLD_METAL,
          WebkitMask: mask,
          mask,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: h * 0.09,
            border: `${Math.max(2, width / 140)}px dashed ${free ? "rgba(255,255,255,0.6)" : "rgba(110,82,15,0.7)"}`,
            borderRadius: h * 0.08,
          }}
        />
        <div style={{ fontWeight: 900, fontSize: h * 0.34, color: free ? COLORS.white : "#4A3608", lineHeight: 1 }}>
          {label}
        </div>
        <div style={{ fontWeight: 700, fontSize: h * 0.16, color: free ? COLORS.white : "#5C430A", marginTop: h * 0.04 }}>
          {sub}
        </div>
      </div>
    </div>
  );
};

// Brushed-gold engraved plate with a shimmer sweep.
export const Nameplate: React.FC<{ title: string; sub?: string; width?: number; delay?: number }> = ({
  title,
  sub,
  width = 760,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const sp = useSpring(delay, 14);
  const sweep = interpolate(frame - delay, [10, 40], [-60, 160], clamp);
  return (
    <div
      style={{
        width,
        padding: `${width * 0.045}px ${width * 0.06}px`,
        borderRadius: width * 0.025,
        backgroundImage: GOLD_METAL,
        boxShadow: "0 30px 60px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -3px 0 rgba(0,0,0,0.3)",
        position: "relative",
        overflow: "hidden",
        transform: `translateY(${(1 - sp) * 120}px) scale(${0.9 + 0.1 * sp})`,
        opacity: sp,
        textAlign: "center",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: width * 0.1,
          color: "#3E2D05",
          textShadow: "0 2px 0 rgba(255,246,201,0.7), 0 -1px 0 rgba(0,0,0,0.35)",
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      {sub ? (
        <div
          style={{
            fontWeight: 700,
            fontSize: width * 0.052,
            color: "#4A3608",
            marginTop: width * 0.012,
            textShadow: "0 1px 0 rgba(255,246,201,0.7)",
          }}
        >
          {sub}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${sweep}%`,
          width: "30%",
          background: "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)",
          transform: "skewX(-20deg)",
        }}
      />
    </div>
  );
};

// Simple house-key glyph.
export const Key: React.FC<{ size?: number; color?: string }> = ({ size = 200, color = COLORS.gold }) => (
  <svg width={size} height={size * 0.45} viewBox="0 0 200 90">
    <defs>
      <linearGradient id="keyg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#FFF6C9" />
        <stop offset="0.5" stopColor={color} />
        <stop offset="1" stopColor="#8A6A16" />
      </linearGradient>
    </defs>
    <circle cx="160" cy="45" r="36" fill="url(#keyg)" />
    <circle cx="168" cy="45" r="13" fill="rgba(5,14,38,0.9)" />
    <rect x="10" y="37" width="130" height="16" rx="4" fill="url(#keyg)" />
    <rect x="18" y="53" width="12" height="20" rx="2" fill="url(#keyg)" />
    <rect x="40" y="53" width="10" height="14" rx="2" fill="url(#keyg)" />
    <rect x="58" y="53" width="12" height="22" rx="2" fill="url(#keyg)" />
  </svg>
);

export const Logo: React.FC<{ size?: number; delay?: number; style?: React.CSSProperties }> = ({
  size = 300,
  delay = 0,
  style,
}) => {
  const sp = useSpring(delay, 12);
  return (
    <Img
      src={staticFile("raffle/logo9.png")}
      style={{
        width: size,
        transform: `scale(${sp}) rotate(${(1 - sp) * -12}deg)`,
        filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.5))",
        ...style,
      }}
    />
  );
};

// Burned-in captions for the voiceover lines (most feed views are muted).
export type CaptionLine = { from: number; to: number; text: string };
export const Captions: React.FC<{ lines: CaptionLine[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { format, t, safeBottom } = useLayout();
  const line = lines.find((l) => frame >= l.from && frame < l.to);
  if (!line) return null;
  const o = interpolate(frame, [line.from, line.from + 5, line.to - 5, line.to], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: safeBottom - (format === "vertical" ? 40 : 10),
        paddingLeft: format === "landscape" ? 200 : 60,
        paddingRight: format === "landscape" ? 200 : 60,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity: o,
          transform: `translateY(${(1 - o) * 10}px)`,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 44 * t,
          lineHeight: 1.3,
          color: COLORS.white,
          textAlign: "center",
          background: "rgba(5,14,38,0.72)",
          border: "2px solid rgba(212,175,55,0.55)",
          padding: `${12 * t}px ${28 * t}px`,
          borderRadius: 22 * t,
          maxWidth: format === "landscape" ? 1300 : 960,
        }}
      >
        {line.text}
      </div>
    </AbsoluteFill>
  );
};

// Sound-effect cues: {sfx file name, frame, volume}.
export type Cue = { sfx: string; at: number; volume?: number };
export const Sfx: React.FC<{ cues: Cue[] }> = ({ cues }) => (
  <>
    {cues.map((c, i) => (
      <Sequence key={`${c.sfx}-${i}`} from={Math.max(0, c.at)} name={`SFX ${c.sfx}`} layout="none">
        <Html5Audio src={staticFile(`raffle/audio/${c.sfx}.mp3`)} volume={c.volume ?? 0.6} />
      </Sequence>
    ))}
  </>
);
