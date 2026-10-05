import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BLUE_GRADIENT,
  COLORS,
  COPPER_GRADIENT,
  FONT_FAMILY,
  SAGE_GRADIENT,
} from "./theme";

// Smooth 0→1 spring that starts `delay` frames into the current sequence.
export const useEnter = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

type KenBurnsProps = {
  src: string;
  // objectPosition x/y in percent; x may animate from → to for a slow pan.
  x?: [number, number];
  y?: number;
  zoom?: [number, number];
  origin?: string;
  durationInFrames: number;
  filter?: string;
};

// Full-bleed photo with a slow zoom and optional horizontal pan.
export const KenBurns: React.FC<KenBurnsProps> = ({
  src,
  x = [50, 50],
  y = 50,
  zoom = [1.12, 1],
  origin = "50% 50%",
  durationInFrames,
  filter,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(p, [0, 1], zoom);
  const posX = interpolate(p, [0, 1], x);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${posX}% ${y}%`,
          transform: `scale(${scale})`,
          transformOrigin: origin,
          filter,
        }}
      />
    </AbsoluteFill>
  );
};

export const Shade: React.FC<{ background: string }> = ({ background }) => (
  <AbsoluteFill style={{ background }} />
);

type BubbleProps = {
  children: React.ReactNode;
  variant?: "blue" | "copper";
  delay?: number;
  fontSize?: number;
  tail?: "left" | "right" | "none";
  style?: React.CSSProperties;
};

// The brochure's signature speech bubble: a gradient tag with a small tail.
export const Bubble: React.FC<BubbleProps> = ({
  children,
  variant = "blue",
  delay = 0,
  fontSize = 64,
  tail = "right",
  style,
}) => {
  const s = useEnter(delay, 14);
  const bg = variant === "blue" ? BLUE_GRADIENT : COPPER_GRADIENT;
  const tailColor = variant === "blue" ? COLORS.blue : COLORS.orange;
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        background: bg,
        color: COLORS.white,
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize,
        lineHeight: 1.25,
        padding: `${fontSize * 0.35}px ${fontSize * 0.6}px`,
        borderRadius: 22,
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        textAlign: "center",
        opacity: interpolate(s, [0, 0.3], [0, 1], {
          extrapolateRight: "clamp",
        }),
        transform: `translateY(${(1 - s) * 60}px) scale(${0.85 + s * 0.15})`,
        transformOrigin: tail === "left" ? "15% 100%" : "85% 100%",
        ...style,
      }}
    >
      {children}
      {tail !== "none" ? (
        <div
          style={{
            position: "absolute",
            bottom: -22,
            [tail === "right" ? "right" : "left"]: 70,
            width: 0,
            height: 0,
            borderLeft: "22px solid transparent",
            borderRight: "22px solid transparent",
            borderTop: `24px solid ${tailColor}`,
          }}
        />
      ) : null}
    </div>
  );
};

// Text line that rises in from below a mask.
export const Rise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const s = useEnter(delay);
  return (
    <div style={{ overflow: "hidden", paddingBottom: 8 }}>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          transform: `translateY(${(1 - s) * 110}%)`,
          opacity: s,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const LogoIcon: React.FC<{
  size: number;
  style?: React.CSSProperties;
}> = ({ size, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.16,
      overflow: "hidden",
      boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
      flexShrink: 0,
      ...style,
    }}
  >
    <Img
      src={staticFile("uziel/logo-icon.png")}
      style={{
        width: "106%",
        height: "106%",
        margin: "-3%",
        objectFit: "cover",
      }}
    />
  </div>
);

// Icon + "קרדן" wordmark lock-up.
export const Logo: React.FC<{
  size?: number;
  dark?: boolean;
  subtitle?: string;
}> = ({ size = 150, dark = false, subtitle = "נדל״ן" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.2 }}>
    <LogoIcon size={size} />
    <div style={{ fontFamily: FONT_FAMILY, lineHeight: 1 }}>
      <div
        style={{
          fontSize: size * 0.78,
          fontWeight: 900,
          color: dark ? COLORS.white : COLORS.blue,
          letterSpacing: -2,
        }}
      >
        קרדן
      </div>
      <div
        style={{
          fontSize: size * 0.3,
          fontWeight: 700,
          color: dark ? "rgba(255,255,255,0.85)" : COLORS.slate,
          marginTop: size * 0.06,
        }}
      >
        {subtitle}
      </div>
    </div>
  </div>
);

// Four-colour brand stripe running down the right edge, as in the brochure.
export const BrandStripe: React.FC = () => {
  const s = useEnter(4);
  const segs = [BLUE_GRADIENT, SAGE_GRADIENT, COLORS.white, COPPER_GRADIENT];
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 16,
        display: "flex",
        flexDirection: "column",
        transform: `scaleY(${s})`,
        transformOrigin: "top",
      }}
    >
      {segs.map((bg, i) => (
        <div key={i} style={{ flex: 1, background: bg }} />
      ))}
    </div>
  );
};

type ChipProps = {
  label: string;
  color: string;
  delay: number;
  icon: React.ReactNode;
};

export const Chip: React.FC<ChipProps> = ({ label, color, delay, icon }) => {
  const s = useEnter(delay, 16);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        background: "rgba(255,255,255,0.95)",
        borderRadius: 999,
        padding: "16px 34px 16px 18px",
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: 42,
        color: COLORS.slate,
        boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
        opacity: interpolate(s, [0, 0.4], [0, 1], {
          extrapolateRight: "clamp",
        }),
        transform: `translateX(${(1 - s) * 140}px)`,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      {label}
    </div>
  );
};

// Minimal line icons (inline SVG so they render without icon fonts).
const stroke = {
  fill: "none",
  stroke: "#fff",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Icons = {
  train: (
    <svg width="36" height="36" viewBox="0 0 24 24" {...stroke}>
      <rect x="5" y="3" width="14" height="13" rx="3" />
      <path d="M5 10h14M9 20l-2 2M15 20l2 2M8 16l-1 4M16 16l1 4" />
      <circle cx="9" cy="13" r="0.6" />
      <circle cx="15" cy="13" r="0.6" />
    </svg>
  ),
  road: (
    <svg width="36" height="36" viewBox="0 0 24 24" {...stroke}>
      <path d="M8 3L4 21M16 3l4 18M12 4v3M12 10v3M12 16v4" />
    </svg>
  ),
  tree: (
    <svg width="36" height="36" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 22v-7M12 3a6 6 0 0 0-5 9.5A4 4 0 0 0 9 16h6a4 4 0 0 0 2-3.5A6 6 0 0 0 12 3z" />
    </svg>
  ),
  cup: (
    <svg width="36" height="36" viewBox="0 0 24 24" {...stroke}>
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9zM16 10h2a2.5 2.5 0 0 1 0 5h-2M8 3v3M12 3v3" />
    </svg>
  ),
  school: (
    <svg width="36" height="36" viewBox="0 0 24 24" {...stroke}>
      <path d="M2 9l10-5 10 5-10 5L2 9zM6 11v5c3 2.5 9 2.5 12 0v-5" />
    </svg>
  ),
};

// Map pin that drops in and keeps a soft pulse ring.
export const Pin: React.FC<{ x: number; y: number; delay: number }> = ({
  x,
  y,
  delay,
}) => {
  const frame = useCurrentFrame();
  const s = useEnter(delay, 9);
  const pulse = ((frame - delay) % 40) / 40;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 50,
        top: y - 120,
        width: 100,
        height: 120,
        opacity: frame < delay ? 0 : 1,
        transform: `translateY(${(1 - s) * -260}px)`,
      }}
    >
      {frame > delay + 10 ? (
        <div
          style={{
            position: "absolute",
            left: 50 - 40 * (1 + pulse * 1.6),
            top: 120 - 14 * (1 + pulse * 1.6),
            width: 80 * (1 + pulse * 1.6),
            height: 28 * (1 + pulse * 1.6),
            borderRadius: "50%",
            border: `4px solid ${COLORS.orange}`,
            opacity: 1 - pulse,
          }}
        />
      ) : null}
      <svg width="100" height="120" viewBox="0 0 100 120">
        <defs>
          <linearGradient id="pinGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLORS.blue} />
            <stop offset="100%" stopColor={COLORS.navy} />
          </linearGradient>
        </defs>
        <path
          d="M50 118C50 118 8 70 8 44a42 42 0 0 1 84 0c0 26-42 74-42 74z"
          fill="url(#pinGrad)"
          stroke="#fff"
          strokeWidth="5"
        />
        <circle cx="50" cy="44" r="16" fill="#fff" />
      </svg>
    </div>
  );
};
