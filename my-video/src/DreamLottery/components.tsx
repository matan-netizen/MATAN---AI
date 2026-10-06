import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, GOLD_GRADIENT, MEDIA, NAVY_GRADIENT } from "./theme";

export const usePop = (delay: number, damping = 11) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

// One-shot sound effect starting `at` frames into the parent sequence.
export const Sfx: React.FC<{ src: string; at: number; volume?: number }> = ({
  src,
  at,
  volume = 0.6,
}) => (
  <Sequence from={at} durationInFrames={60} layout="none">
    <Html5Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

// A take from the Mahane Yehuda footage, with a slow push-in and an
// optional punch-in at `punchAt` (frames into the take).
export const Footage: React.FC<{ src: number; punchAt?: number[] }> = ({
  src,
  punchAt = [],
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [1, 1.06]);
  const punch = punchAt.reduce(
    (acc, at) =>
      acc +
      interpolate(frame - at, [0, 4, 24, 30], [0, 0.12, 0.12, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    0,
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: COLORS.deep }}>
      <OffthreadVideo
        src={staticFile(MEDIA.footage)}
        trimBefore={src}
        // Short fades so the street audio never clicks on a hard cut.
        volume={(f) =>
          interpolate(
            f,
            [0, 3, durationInFrames - 3, durationInFrames],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )
        }
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${drift + punch})`,
        }}
      />
    </AbsoluteFill>
  );
};

// Navy backdrop with the blurred campaign poster behind it.
export const PosterBackdrop: React.FC<{ blur?: number; dim?: number }> = ({
  blur = 18,
  dim = 0.72,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy, overflow: "hidden" }}>
      <Img
        src={staticFile(MEDIA.poster)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: `blur(${blur}px)`,
          transform: `scale(${1.15 + frame * 0.0006})`,
        }}
      />
      <AbsoluteFill style={{ background: NAVY_GRADIENT, opacity: dim }} />
      <Rays />
    </AbsoluteFill>
  );
};

// Slowly turning gold light rays.
const Rays: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: 0.18,
        background: `repeating-conic-gradient(from ${frame * 0.4}deg at 50% 45%, ${COLORS.gold} 0deg 6deg, transparent 6deg 24deg)`,
        maskImage:
          "radial-gradient(circle at 50% 45%, black 0%, transparent 70%)",
      }}
    />
  );
};

export const GoldText: React.FC<{
  children: React.ReactNode;
  size: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, size, delay = 0, style }) => {
  const s = usePop(delay, 10);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.05,
        textAlign: "center",
        backgroundImage: GOLD_GRADIENT,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.55))",
        transform: `scale(${s})`,
        opacity: Math.min(1, s * 2),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const WhiteText: React.FC<{
  children: React.ReactNode;
  size: number;
  delay?: number;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ children, size, delay = 0, weight = 900, style }) => {
  const s = usePop(delay, 200);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.1,
        color: COLORS.white,
        textAlign: "center",
        textShadow: "0 6px 18px rgba(0,0,0,0.6)",
        opacity: s,
        transform: `translateY(${(1 - s) * 40}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Gold-framed navy panel, like the poster's info boxes.
export const Panel: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const s = usePop(delay, 12);
  return (
    <div
      style={{
        padding: 6,
        borderRadius: 34,
        backgroundImage: GOLD_GRADIENT,
        boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
        transform: `scale(${s})`,
        opacity: Math.min(1, s * 2),
        ...style,
      }}
    >
      <div
        style={{
          borderRadius: 29,
          background: NAVY_GRADIENT,
          padding: "34px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Banner that slides down from the top over the footage, so it never
// covers the captions burned into the middle of the original video.
export const TopBanner: React.FC<{
  children: React.ReactNode;
  at: number;
  until: number;
  gold?: boolean;
}> = ({ children, at, until, gold = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame > until) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
  const out = interpolate(frame, [until - 6, until], [1, 0], {
    extrapolateLeft: "clamp",
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 64,
          lineHeight: 1.1,
          textAlign: "center",
          color: gold ? COLORS.navy : COLORS.white,
          backgroundImage: gold ? GOLD_GRADIENT : undefined,
          backgroundColor: gold ? undefined : COLORS.red,
          padding: "22px 46px",
          borderRadius: 26,
          maxWidth: 1000,
          boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
          transform: `translateY(${(1 - s) * -160}px) scale(${0.9 + s * 0.1})`,
          opacity: out,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

// The poster's "ninth year in a row" rosette, drawn in CSS.
export const NinthYearBadge: React.FC<{ size: number; delay?: number }> = ({
  size,
  delay = 0,
}) => {
  const s = usePop(delay, 9);
  const frame = useCurrentFrame();
  const shine = ((frame - delay) % 90) / 90;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        padding: size * 0.05,
        backgroundImage: `conic-gradient(${COLORS.goldLight}, ${COLORS.gold}, ${COLORS.goldDark}, ${COLORS.gold}, ${COLORS.goldLight})`,
        boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
        transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`,
        opacity: Math.min(1, s * 2),
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 30%, #1B3466, ${COLORS.deep})`,
          border: `${size * 0.015}px solid ${COLORS.goldLight}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontWeight: 900,
          color: COLORS.goldLight,
          lineHeight: 1.05,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Crown size={size * 0.16} />
        <div style={{ fontSize: size * 0.13 }}>שנה</div>
        <div style={{ fontSize: size * 0.16 }}>תשיעית</div>
        <div style={{ fontSize: size * 0.13 }}>ברציפות</div>
        <div
          style={{
            fontSize: size * 0.08,
            letterSpacing: size * 0.02,
            color: COLORS.gold,
          }}
        >
          ★★★
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
            transform: `translateX(${(shine * 2 - 1) * size * 1.4}px)`,
          }}
        />
      </div>
    </div>
  );
};

export const Crown: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 100 70">
    <path
      d="M5 60 L12 15 L35 40 L50 5 L65 40 L88 15 L95 60 Z"
      fill={COLORS.gold}
      stroke={COLORS.goldLight}
      strokeWidth={4}
      strokeLinejoin="round"
    />
  </svg>
);

// Small rosette pinned to the corner of every scene after the hook.
export const CornerBadge: React.FC = () => (
  <div style={{ position: "absolute", top: 70, left: 50 }}>
    <NinthYearBadge size={210} delay={4} />
  </div>
);

// Quick white flash on a hard cut.
export const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 6], [0.85, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.goldLight,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// Bottom gradient so footage overlays stay legible.
export const Shade: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg, rgba(6,14,32,0.65) 0%, rgba(6,14,32,0) 28%, rgba(6,14,32,0) 70%, rgba(6,14,32,0.75) 100%)",
    }}
  />
);

export const Disclaimer: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 40,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: FONT,
      fontSize: 26,
      color: "rgba(255,255,255,0.75)",
    }}
  >
    ההגרלה בכפוף לתקנון ולהיתר כדין
  </div>
);
