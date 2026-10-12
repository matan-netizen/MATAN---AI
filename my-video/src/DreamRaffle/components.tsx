import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import clips from "./clips.json";
import { COLORS, CROSSFADE, FONT, GOLD_GRADIENT } from "./theme";

type ClipEntry = { image?: string; clip?: string };
const CLIPS = clips as Record<string, ClipEntry>;

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

// The fal.ai footage for a shot (see scripts/generate-dreamraffle-clips.mjs).
// Falls back to its still, then to a gold-on-navy glow, so the edit can be
// previewed before any credits are spent.
export const Shot: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.08]);
  const { clip, image } = CLIPS[id] ?? {};
  const fill: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: COLORS.deep }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        {clip ? (
          <OffthreadVideo src={staticFile(clip)} muted style={fill} />
        ) : image ? (
          <Img src={staticFile(image)} style={fill} />
        ) : (
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% ${35 + (Number(id) % 3) * 15}%, ${COLORS.goldDark} 0%, ${COLORS.navy} 45%, ${COLORS.deep} 100%)`,
            }}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Darkens the top and bottom so the Hebrew stays readable on any footage.
export const Shade: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg, rgba(6,17,31,0.75) 0%, rgba(6,17,31,0) 30%, rgba(6,17,31,0) 45%, rgba(6,17,31,0.92) 100%)",
    }}
  />
);

const useEnter = (delay: number, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
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
  size = 72,
  weight = 700,
  color = COLORS.white,
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
        textAlign: "center",
        textShadow: "0 4px 18px rgba(0,0,0,0.6)",
        opacity: s,
        transform: `translateY(${(1 - s) * 50}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Gold pill that pops in, for years and offers.
export const GoldPill: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
}> = ({ children, delay = 0, size = 64 }) => {
  const s = useEnter(delay, 11);
  return (
    <div
      style={{
        display: "inline-block",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        color: COLORS.deep,
        backgroundImage: GOLD_GRADIENT,
        padding: `${size * 0.18}px ${size * 0.6}px`,
        borderRadius: size,
        transform: `scale(${s})`,
        boxShadow: "0 14px 36px rgba(0,0,0,0.45)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

// A winner's year, name and quote.
export const WinnerCard: React.FC<{
  year: string;
  name: string;
  place: string;
  quote: string;
}> = ({ year, name, place, quote }) => (
  <AbsoluteFill
    style={{
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "0 70px 150px",
      gap: 22,
    }}
  >
    <GoldPill delay={4} size={70}>
      {year}
    </GoldPill>
    <Rise delay={12} size={84} weight={900}>
      {name}
    </Rise>
    <Rise delay={18} size={46} weight={400} color={COLORS.goldLight}>
      {place}
    </Rise>
    <Rise delay={30} size={58} weight={700} color={COLORS.cream}>
      ״{quote}״
    </Rise>
  </AbsoluteFill>
);

export const Disclaimer: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: FONT,
      fontSize: 24,
      color: "rgba(255,255,255,0.65)",
    }}
  >
    התמונות להמחשה בלבד
  </div>
);
