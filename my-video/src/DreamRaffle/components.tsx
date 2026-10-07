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
import { COLORS, CROSSFADE, FONT, GOLD_GRADIENT } from "./theme";

const useEnter = (delay: number, damping = 14) => {
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

// Slow push-in on a photo.
export const KenBurns: React.FC<{
  src: string;
  position?: string;
  from?: number;
  to?: number;
  filter?: string;
}> = ({ src, position = "50% 50%", from = 1, to = 1.12, filter }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
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

// Dark gradient so text stays readable over photos.
export const Shade: React.FC<{ from?: number; to?: number; top?: boolean }> = ({
  from = 0.45,
  to = 0.95,
  top = false,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${top ? "0deg" : "180deg"}, rgba(42,26,16,0) ${from * 100}%, rgba(42,26,16,${to}) 100%)`,
    }}
  />
);

// Warm dark backdrop with a soft gold glow, for the non-photo scenes.
export const GoldBackdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.5 + 0.1 * Math.sin(frame / 12);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 42%, rgba(222,175,83,${glow}) 0%, ${COLORS.brown} 45%, ${COLORS.cocoa} 100%)`,
      }}
    />
  );
};

// Light rays turning slowly behind a headline.
export const Rays: React.FC<{ opacity?: number }> = ({ opacity = 0.18 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `rotate(${frame * 0.3}deg) scale(2.2)`,
        background: `repeating-conic-gradient(from 0deg at 50% 50%, ${COLORS.goldLight} 0deg 6deg, transparent 6deg 18deg)`,
        maskImage: "radial-gradient(circle, black 10%, transparent 60%)",
        WebkitMaskImage: "radial-gradient(circle, black 10%, transparent 60%)",
      }}
    />
  );
};

// Text that rises into place.
export const Rise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  weight?: number;
  color?: string;
  font?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  delay = 0,
  size = 72,
  weight = 700,
  color = COLORS.white,
  font = FONT,
  style,
}) => {
  const s = useEnter(delay, 200);
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.15,
        textAlign: "center",
        opacity: s,
        transform: `translateY(${(1 - s) * 50}px)`,
        textShadow: "0 6px 24px rgba(0,0,0,0.45)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Something that springs up from nothing (badges, numbers, logo).
export const Pop: React.FC<{
  children: React.ReactNode;
  delay?: number;
  damping?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, damping = 10, style }) => {
  const s = useEnter(delay, damping);
  return (
    <div
      style={{
        transform: `scale(${s})`,
        opacity: Math.min(1, s * 2),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Gold pill label.
export const Badge: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
}> = ({ children, delay = 0, size = 52 }) => (
  <Pop delay={delay} damping={13}>
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        color: COLORS.cocoa,
        backgroundImage: GOLD_GRADIENT,
        padding: `${size * 0.28}px ${size * 0.7}px`,
        borderRadius: 999,
        boxShadow: "0 14px 34px rgba(0,0,0,0.4)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  </Pop>
);

export const Logo: React.FC<{ size?: number; delay?: number }> = ({
  size = 360,
  delay = 0,
}) => {
  const s = useEnter(delay, 11);
  return (
    <Img
      src={staticFile("raffle/logo.png")}
      style={{
        width: size,
        transform: `scale(${s}) rotate(${(1 - s) * -15}deg)`,
        filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
      }}
    />
  );
};

// The site's mascot, sliding in from the side.
export const Mascot: React.FC<{
  src: string;
  height: number;
  delay?: number;
  side?: "left" | "right";
  bottom?: number;
}> = ({ src, height, delay = 0, side = "left", bottom = 0 }) => {
  const frame = useCurrentFrame();
  const s = useEnter(delay, 15);
  const bob = Math.sin((frame - delay) / 9) * 6;
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        bottom: bottom + bob,
        [side]: 10,
        height,
        transform: `translateX(${(1 - s) * (side === "left" ? -500 : 500)}px)`,
        filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.45))",
      }}
    />
  );
};
