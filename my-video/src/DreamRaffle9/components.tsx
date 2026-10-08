import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, GOLD_GRADIENT, GREEN_GRADIENT, IMG } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Whip-pan entrance: the scene slides in fast from the side with motion blur.
export const Whip: React.FC<{
  children: React.ReactNode;
  from?: "left" | "right";
}> = ({ children, from = "right" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 7], [1, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const dir = from === "left" ? -1 : 1;
  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${p * 1080 * dir}px)`,
        filter: p > 0.01 ? `blur(${p * 40}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Photo with a speed-ramp push: a fast zoom that settles into a slow drift.
export const Photo: React.FC<{
  src: string;
  position?: string;
  from?: number;
  to?: number;
  ramp?: boolean;
  filter?: string;
  duration?: number;
}> = ({
  src,
  position = "50% 50%",
  from = 1.3,
  to = 1.05,
  ramp = true,
  filter,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const len = duration ?? durationInFrames;
  const p = interpolate(frame, [0, len], [0, 1], {
    ...clamp,
    easing: ramp ? Easing.out(Easing.exp) : Easing.linear,
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: COLORS.ink }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          transform: `scale(${from + (to - from) * p})`,
          filter,
        }}
      />
    </AbsoluteFill>
  );
};

export const Shade: React.FC<{ strength?: number; top?: boolean }> = ({
  strength = 0.85,
  top = false,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${top ? "0deg" : "180deg"}, rgba(13,10,7,0) 35%, rgba(13,10,7,${strength}) 100%)`,
    }}
  />
);

// White flash used on hard cuts.
export const Flash: React.FC<{ at?: number; length?: number }> = ({
  at = 0,
  length = 6,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - at, [0, length], [0.7, 0], clamp);
  return frame >= at ? (
    <AbsoluteFill style={{ backgroundColor: "white", opacity }} />
  ) : null;
};

const glow = (color: string) =>
  color === COLORS.white
    ? "0 6px 0 rgba(0,0,0,0.45), 0 0 30px rgba(0,0,0,0.6)"
    : `0 0 18px ${color}, 0 0 46px ${color}aa, 0 6px 0 rgba(0,0,0,0.5)`;

// Kinetic word: pops in with overshoot; optional glow and shake.
export const Pop: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
  weight?: number;
  shake?: boolean;
  style?: React.CSSProperties;
}> = ({
  children,
  delay = 0,
  size = 110,
  color = COLORS.white,
  weight = 900,
  shake = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 9, stiffness: 180 },
  });
  const local = frame - delay;
  const jitter =
    shake && local > 0 && local < 14
      ? (random(`x${local}`) - 0.5) * 16 * (1 - local / 14)
      : 0;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.05,
        textAlign: "center",
        textShadow: glow(color),
        opacity: frame < delay ? 0 : Math.min(1, s * 2),
        transform: `scale(${s}) translateX(${jitter}px)`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Left-to-right text (numbers, prices, URLs) inside the RTL layout.
export const Ltr: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>{children}</span>
);

// Rolling money counter.
export const Counter: React.FC<{
  from: number;
  to: number;
  start: number;
  end: number;
  prefix?: string;
  size?: number;
  color?: string;
}> = ({
  from,
  to,
  start,
  end,
  prefix = "$",
  size = 150,
  color = COLORS.yellow,
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [start, end], [from, to], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const landed = frame >= end;
  const { fps } = useVideoConfig();
  const bump = spring({ frame: frame - end, fps, config: { damping: 8 } });
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        color,
        textShadow: glow(color),
        transform: `scale(${landed ? 1 + 0.15 * (1 - bump) + 0.1 * bump : 1})`,
        direction: "ltr",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {prefix}
      {(Math.round(v / 1000) * 1000).toLocaleString("en-US")}
    </div>
  );
};

// Gold dust burst.
export const Particles: React.FC<{
  at?: number;
  count?: number;
  color?: string;
}> = ({ at = 0, count = 60, color = COLORS.goldLight }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = random(`a${i}`) * Math.PI * 2;
        const speed = 8 + random(`s${i}`) * 26;
        const x = 540 + Math.cos(angle) * speed * t;
        const y = 900 + Math.sin(angle) * speed * t + 0.6 * t * t;
        const size = 6 + random(`z${i}`) * 14;
        const opacity = interpolate(t, [0, 40], [1, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 12px ${color}`,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Raffle ticket drawn in CSS.
export const Ticket: React.FC<{
  label?: string;
  width?: number;
  free?: boolean;
}> = ({ label = "₪660", width = 400, free = false }) => {
  const h = width * 0.56;
  const notch = width * 0.07;
  return (
    <div
      style={{
        position: "relative",
        width,
        height: h,
        borderRadius: 26,
        backgroundImage: free ? GREEN_GRADIENT : GOLD_GRADIENT,
        boxShadow: `0 20px 50px rgba(0,0,0,0.55), 0 0 40px ${free ? COLORS.green : COLORS.gold}88`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        color: COLORS.brown,
        overflow: "hidden",
      }}
    >
      {[-1, 1].map((side) => (
        <div
          key={side}
          style={{
            position: "absolute",
            top: h / 2 - notch,
            [side < 0 ? "left" : "right"]: -notch,
            width: notch * 2,
            height: notch * 2,
            borderRadius: "50%",
            background: COLORS.ink,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 14,
          borderRadius: 18,
          border: `4px dashed ${COLORS.brown}55`,
        }}
      />
      <div style={{ fontSize: width * 0.085, fontWeight: 700 }}>
        הגרלת החלומות 9
      </div>
      <div style={{ fontSize: width * 0.2, fontWeight: 900, lineHeight: 1 }}>
        {free ? "חינם!" : <Ltr>{label}</Ltr>}
      </div>
      <div style={{ fontSize: width * 0.07, fontWeight: 700 }}>
        {free ? "כרטיס במתנה" : "כרטיס הגרלה"}
      </div>
    </div>
  );
};

// Rubber-stamp label that slams onto the screen.
export const Stamp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  color?: string;
  size?: number;
  rotate?: number;
}> = ({
  children,
  delay = 0,
  color = COLORS.green,
  size = 90,
  rotate = -8,
}) => {
  const frame = useCurrentFrame();
  const t = frame - delay;
  const scale = interpolate(t, [0, 5, 9], [3, 0.92, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  return t < 0 ? null : (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        color,
        border: `8px solid ${color}`,
        borderRadius: 20,
        padding: `${size * 0.1}px ${size * 0.4}px`,
        transform: `rotate(${rotate}deg) scale(${scale})`,
        opacity: interpolate(t, [0, 3], [0, 1], clamp),
        textShadow: `0 0 20px ${color}`,
        boxShadow: `0 0 30px ${color}66, inset 0 0 20px ${color}44`,
        background: "rgba(0,0,0,0.35)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

// Mascot cut-out sliding up from the bottom edge.
export const Mascot: React.FC<{
  src?: string;
  delay?: number;
  height?: number;
  side?: "left" | "right";
  offset?: number;
}> = ({
  src = IMG.mascotPoint,
  delay = 0,
  height = 900,
  side = "left",
  offset = -40,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 13 } });
  const bob = Math.sin((frame - delay) / 9) * 6;
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        bottom: -30,
        [side]: offset,
        height,
        transform: `translateY(${(1 - s) * (height + 100) + bob}px)`,
        filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
      }}
    />
  );
};

// Pulsing pill button with an expanding ring and a shine sweep.
export const CtaButton: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
}> = ({ children, delay = 0, size = 60 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 10 } });
  const pulse = 1 + 0.045 * Math.sin((frame - delay) * 0.3);
  const ring = ((((frame - delay) % 30) + 30) % 30) / 30;
  const shine = ((frame - delay) % 45) / 45;
  return (
    <div style={{ position: "relative", transform: `scale(${s * pulse})` }}>
      <div
        style={{
          position: "absolute",
          inset: -10,
          borderRadius: 999,
          border: `6px solid ${COLORS.green}`,
          opacity: (1 - ring) * s,
          transform: `scale(${1 + ring * 0.25})`,
        }}
      />
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          color: COLORS.ink,
          backgroundImage: GREEN_GRADIENT,
          borderRadius: 999,
          padding: `${size * 0.45}px ${size * 1.1}px`,
          boxShadow: `0 16px 40px rgba(0,0,0,0.5), 0 0 40px ${COLORS.green}88`,
          whiteSpace: "nowrap",
        }}
      >
        {children}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 120,
            left: `${-20 + shine * 140}%`,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)",
            transform: "skewX(-20deg)",
          }}
        />
      </div>
    </div>
  );
};

// Bouncing chevrons pointing down at the link.
export const DownArrows: React.FC<{ delay?: number; color?: string }> = ({
  delay = 0,
  color = COLORS.yellow,
}) => {
  const frame = useCurrentFrame();
  const t = frame - delay;
  if (t < 0) return null;
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {[0, 1, 2].map((i) => {
        const phase = ((t - i * 5) % 30) / 30;
        return (
          <div
            key={i}
            style={{
              width: 70,
              height: 70,
              borderRight: `14px solid ${color}`,
              borderBottom: `14px solid ${color}`,
              transform: "rotate(45deg)",
              marginTop: -28,
              opacity: 0.3 + 0.7 * Math.max(0, Math.sin(phase * Math.PI)),
              filter: `drop-shadow(0 0 12px ${color})`,
            }}
          />
        );
      })}
    </div>
  );
};

// Shown on every shot of the apartment: the gallery is last year's apartment.
export const LastYearNote: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 40,
      left: 0,
      right: 0,
      textAlign: "center",
    }}
  >
    <span
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 36,
        color: COLORS.white,
        background: "rgba(13,10,7,0.72)",
        border: `2px solid ${COLORS.goldLight}`,
        padding: "8px 26px",
        borderRadius: 999,
      }}
    >
      התמונות מהדירה של שנה שעברה!
    </span>
  </div>
);

export const FinePrint: React.FC<{ children?: React.ReactNode }> = ({
  children = "בכפוף לתקנון ההגרלה",
}) => (
  <div
    style={{
      position: "absolute",
      bottom: 36,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: FONT,
      fontSize: 26,
      color: "rgba(255,255,255,0.75)",
    }}
  >
    {children}
  </div>
);
