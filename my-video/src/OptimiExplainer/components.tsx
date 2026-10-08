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
import { CAPTIONS, COLORS, CROSSFADE, FONT } from "./theme";

export const useEnter = (delay: number, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

// Fades a scene in on top of the previous one (crossfade).
export const SceneFade: React.FC<{
  children: React.ReactNode;
  fadeIn?: boolean;
}> = ({ children, fadeIn = true }) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn
    ? interpolate(frame, [0, CROSSFADE], [0, 1], { extrapolateRight: "clamp" })
    : 1;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// Light-gray canvas with a faint dot grid and two soft brand glows.
export const Backdrop: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 40) * 30;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.gray, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${COLORS.line} 2px, transparent 2px)`,
          backgroundSize: "44px 44px",
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          right: -300 + drift,
          top: -420,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.royal}22, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          left: -260 - drift,
          bottom: -420,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.emerald}22, transparent 65%)`,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// Text that rises into place.
export const Rise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  delay = 0,
  size = 64,
  weight = 700,
  color = COLORS.navy,
  style,
}) => {
  const s = useEnter(delay, 200);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.15,
        opacity: s,
        transform: `translateY(${(1 - s) * 40}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Section heading used by the three example scenes.
export const SceneTitle: React.FC<{
  step: number;
  title: string;
  english: string;
}> = ({ step, title, english }) => {
  const s = useEnter(4, 200);
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        right: 110,
        display: "flex",
        alignItems: "center",
        gap: 26,
        opacity: s,
        transform: `translateX(${(1 - s) * -60}px)`,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 22,
          background: COLORS.navy,
          color: COLORS.white,
          fontSize: 48,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {step}
      </div>
      <div>
        <div style={{ fontSize: 60, fontWeight: 900, color: COLORS.navy }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.emerald,
            direction: "ltr",
            textAlign: "right",
            letterSpacing: 1,
          }}
        >
          {english}
        </div>
      </div>
    </div>
  );
};

// Green result badge that pops in.
export const Badge: React.FC<{
  children: React.ReactNode;
  delay: number;
  color?: string;
  size?: number;
}> = ({ children, delay, color = COLORS.emerald, size = 44 }) => {
  const s = useEnter(delay, 10);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        color: COLORS.white,
        background: color,
        padding: `${size * 0.35}px ${size * 0.75}px`,
        borderRadius: 999,
        boxShadow: `0 18px 40px ${color}55`,
        transform: `scale(${s})`,
        opacity: Math.min(1, s * 2),
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

// White UI card.
export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: COLORS.white,
      borderRadius: 28,
      boxShadow: "0 24px 60px rgba(12,35,64,0.12)",
      border: `1px solid ${COLORS.line}`,
      fontFamily: FONT,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Icon: React.FC<{ size: number; style?: React.CSSProperties }> = ({
  size,
  style,
}) => (
  <Img
    src={staticFile("optimi/icon.png")}
    style={{ width: size, height: size * (375 / 405), ...style }}
  />
);

// Reveals text one character at a time.
export const Typewriter: React.FC<{
  text: string;
  delay: number;
  speed?: number;
}> = ({ text, delay, speed = 1.4 }) => {
  const frame = useCurrentFrame();
  const chars = Math.max(0, Math.floor((frame - delay) * speed));
  const done = chars >= text.length;
  const caret = !done && Math.floor(frame / 8) % 2 === 0;
  return (
    <span>
      {text.slice(0, chars)}
      <span style={{ opacity: caret ? 1 : 0, color: COLORS.royal }}>|</span>
    </span>
  );
};

// Voiceover captions along the bottom edge.
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const line = CAPTIONS.find((c) => frame >= c.from && frame < c.to);
  if (!line) return null;
  const opacity = interpolate(
    frame,
    [line.from, line.from + 8, line.to - 8, line.to],
    [0, 1, 1, 0],
  );
  return (
    <div
      style={{
        position: "absolute",
        bottom: 44,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: 1760,
          fontFamily: FONT,
          fontSize: 34,
          fontWeight: 700,
          lineHeight: 1.35,
          textAlign: "center",
          color: COLORS.white,
          background: "rgba(12,35,64,0.88)",
          padding: "16px 40px",
          borderRadius: 20,
        }}
      >
        {line.text}
      </div>
    </div>
  );
};
