import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BLUE_GRADIENT, COLORS, GOLD_GRADIENT } from "./theme";

// Dark ambient slate/gold gradient mesh with slowly drifting light blobs.
export const BackgroundVideoOrGradient: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  const blob = (
    color: string,
    x: number,
    y: number,
    size: number,
    phase: number,
  ) => {
    const dx = Math.sin(t * 0.6 + phase) * 120;
    const dy = Math.cos(t * 0.45 + phase) * 160;
    return (
      <div
        style={{
          position: "absolute",
          left: x + dx - size / 2,
          top: y + dy - size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      {blob("rgba(245,196,81,0.35)", 900, 300, 1100, 0)}
      {blob("rgba(31,182,255,0.28)", 150, 1300, 1200, 2)}
      {blob("rgba(184,134,11,0.25)", 600, 1800, 900, 4)}
      {blob("rgba(10,91,255,0.2)", 200, 400, 800, 1)}
      {/* Fine grid overlay for a premium "blueprint" texture */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0px ${(frame * 1.5) % 90}px`,
        }}
      />
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

type HeroTextProps = {
  children: React.ReactNode;
  delay?: number;
  size?: number;
  variant?: "white" | "gold" | "blue";
  weight?: number;
  // Rendered outside the gradient clip so colour emoji keep their colours.
  emoji?: string;
  style?: React.CSSProperties;
};

// Bold, high-impact typography that springs in with scale + rise.
export const HeroTextText: React.FC<HeroTextProps> = ({
  children,
  delay = 0,
  size = 110,
  variant = "white",
  weight = 900,
  emoji,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 11, stiffness: 160, mass: 0.8 },
  });
  const opacity = interpolate(frame - delay, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const gradient =
    variant === "gold"
      ? GOLD_GRADIENT
      : variant === "blue"
        ? BLUE_GRADIENT
        : null;

  return (
    <div
      style={{
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.12,
        textAlign: "center",
        color: COLORS.white,
        opacity,
        transform: `translateY(${(1 - s) * 80}px) scale(${0.6 + s * 0.4})`,
        filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.65))",
        ...style,
      }}
    >
      {gradient ? (
        <span
          style={{
            backgroundImage: gradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {children}
        </span>
      ) : (
        children
      )}
      {emoji ? <span> {emoji}</span> : null}
    </div>
  );
};

type CounterProps = {
  from: number;
  to: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  duration?: number;
  size?: number;
};

// Interpolated number counter with an ease-out finish and a "landing" pop.
export const AnimatedCounter: React.FC<CounterProps> = ({
  from,
  to,
  prefix = "",
  suffix = "",
  delay = 0,
  duration = 40,
  size = 190,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  const value = Math.round(from + (to - from) * progress);
  const pop = spring({
    frame: frame - delay - duration,
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const scale = 1 + Math.sin(pop * Math.PI) * 0.12;

  return (
    <div
      style={{
        direction: "ltr",
        fontSize: size,
        fontWeight: 900,
        letterSpacing: -4,
        fontVariantNumeric: "tabular-nums",
        transform: `scale(${scale})`,
        backgroundImage: GOLD_GRADIENT,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: "drop-shadow(0 0 30px rgba(245,196,81,0.55))",
        whiteSpace: "nowrap",
      }}
    >
      {prefix}
      {value.toLocaleString("en-US")}
      {suffix}
    </div>
  );
};

type BadgeProps = {
  children: React.ReactNode;
  color?: string;
  textColor?: string;
  delay?: number;
  blink?: boolean;
  size?: number;
};

// Motion-graphic pill badge with a spring pop-in and optional glow blink.
export const Badge: React.FC<BadgeProps> = ({
  children,
  color = COLORS.red,
  textColor = COLORS.white,
  delay = 0,
  blink = false,
  size = 64,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 9, stiffness: 180 },
  });
  const glow = blink ? 0.5 + 0.5 * Math.sin((frame - delay) * 0.5) : 0.6;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 18,
        padding: `${size * 0.35}px ${size * 0.7}px`,
        borderRadius: 999,
        background: color,
        color: textColor,
        fontSize: size,
        fontWeight: 900,
        transform: `scale(${s}) rotate(${(1 - s) * -12}deg)`,
        boxShadow: `0 0 ${20 + glow * 60}px ${color}, 0 0 ${glow * 120}px ${color}88`,
        border: "4px solid rgba(255,255,255,0.35)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

// Pulsing neon/gold call button with a phone icon and expanding rings.
export const CTAButton: React.FC<{ label: string; delay?: number }> = ({
  label,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, stiffness: 140 },
  });
  const local = Math.max(0, frame - delay);
  const pulse = 1 + Math.sin(local * 0.35) * 0.05;
  const ring = (offset: number) => {
    const p = ((local + offset) % 30) / 30;
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          border: `6px solid ${COLORS.gold}`,
          opacity: (1 - p) * enter,
          transform: `scale(${1 + p * 0.35})`,
        }}
      />
    );
  };
  const ringIcon = Math.sin(local * 1.4) * 14;

  return (
    <div
      style={{
        position: "relative",
        transform: `scale(${enter * pulse})`,
      }}
    >
      {ring(0)}
      {ring(15)}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 30,
          padding: "44px 90px",
          borderRadius: 999,
          backgroundImage: GOLD_GRADIENT,
          color: "#1a1204",
          fontSize: 84,
          fontWeight: 900,
          boxShadow: `0 0 50px ${COLORS.gold}, 0 0 120px rgba(245,196,81,0.5), inset 0 4px 0 rgba(255,255,255,0.6)`,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            display: "inline-block",
            transform: `rotate(${ringIcon}deg)`,
          }}
        >
          📞
        </span>
        {label}
      </div>
    </div>
  );
};

// Deterministic floating particles (gold sparks) for glow scenes.
export const Particles: React.FC<{ count?: number; color?: string }> = ({
  count = 40,
  color = COLORS.gold,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`x${i}`) * width;
        const speed = 2 + random(`s${i}`) * 5;
        const size = 6 + random(`z${i}`) * 16;
        const y =
          height +
          50 -
          ((frame * speed + random(`y${i}`) * height) % (height + 100));
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.1 + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(frame * 0.05 + i) * 30,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: twinkle,
              boxShadow: `0 0 ${size * 2}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
