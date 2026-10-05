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
import { BLUE_GRADIENT, COLORS, CROSSFADE, FONT } from "./theme";

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

// Slow push-in on a photo. Children share the transform, so overlays
// (like the map pin) stay locked to a spot in the image.
export const KenBurns: React.FC<{
  src: string;
  position?: string;
  from?: number;
  to?: number;
  driftX?: number;
  filter?: string;
  children?: React.ReactNode;
}> = ({
  src,
  position = "50% 50%",
  from = 1,
  to = 1.12,
  driftX = 0,
  filter,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${from + (to - from) * p}) translateX(${driftX * p}px)`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: position,
            filter,
          }}
        />
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

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
        opacity: s,
        transform: `translateY(${(1 - s) * 50}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// The brochure's speech-bubble label, with a tail under its right side.
export const Bubble: React.FC<{
  children: React.ReactNode;
  background?: string;
  delay?: number;
  size?: number;
}> = ({ children, background = BLUE_GRADIENT, delay = 0, size = 64 }) => {
  const s = useEnter(delay, 12);
  return (
    <div
      style={{
        position: "relative",
        transform: `scale(${s})`,
        transformOrigin: "80% 100%",
        opacity: Math.min(1, s * 1.5),
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.2,
          color: COLORS.white,
          textAlign: "center",
          padding: `${size * 0.4}px ${size * 0.7}px`,
          borderRadius: 18,
          backgroundImage: background,
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: -26,
          right: "18%",
          width: 0,
          height: 0,
          borderLeft: "22px solid transparent",
          borderRight: "22px solid transparent",
          borderTop: `28px solid ${background.includes(COLORS.blue) ? COLORS.navy : COLORS.copper}`,
        }}
      />
    </div>
  );
};

// Small pill tag, like the brochure's room labels.
export const Tag: React.FC<{
  children: React.ReactNode;
  background?: string;
  delay?: number;
  size?: number;
}> = ({ children, background = COLORS.copper, delay = 0, size = 50 }) => {
  const s = useEnter(delay, 16);
  return (
    <div
      style={{
        display: "inline-block",
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        color: COLORS.white,
        background,
        padding: `${size * 0.25}px ${size * 0.6}px`,
        borderRadius: 14,
        opacity: s,
        transform: `translateX(${(1 - s) * 80}px)`,
        boxShadow: "0 10px 26px rgba(0,0,0,0.3)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

export const Logo: React.FC<{ size?: number; delay?: number }> = ({
  size = 200,
  delay = 0,
}) => {
  const s = useEnter(delay, 11);
  return (
    <Img
      src={staticFile("kardan/logo.jpg")}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.16,
        transform: `scale(${s}) rotate(${(1 - s) * -20}deg)`,
        boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
      }}
    />
  );
};

// Colour stripe on the right edge, as on every brochure page.
export const BrandStripe: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const parts = [COLORS.blue, COLORS.sage, COLORS.white, COLORS.copper];
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: 22,
        height: 1920,
        display: "flex",
        flexDirection: "column",
        transform: `scaleY(${grow})`,
        transformOrigin: "top",
      }}
    >
      {parts.map((c) => (
        <div key={c} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );
};

export const Disclaimer: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 34,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: FONT,
      fontSize: 24,
      color: "rgba(255,255,255,0.7)",
    }}
  >
    ההדמיה להמחשה בלבד
  </div>
);

export const Shade: React.FC<{ from?: number; to?: number; top?: boolean }> = ({
  from = 0.45,
  to = 0.95,
  top = false,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${top ? "0deg" : "180deg"}, rgba(27,35,41,0) ${from * 100}%, rgba(27,35,41,${to}) 100%)`,
    }}
  />
);
