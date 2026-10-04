import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "./theme";

type Fallback = "prayer" | "zohar" | "hall";

type Props = {
  // Path under public/, or null to render the CSS fallback artwork.
  src: string | null;
  fallback?: Fallback;
  // Slow parallax zoom across the parent sequence's duration.
  zoomFrom?: number;
  zoomTo?: number;
  // Drift in px applied alongside the zoom (parallax).
  driftX?: number;
  driftY?: number;
  objectPosition?: string;
  filter?: string;
  vignette?: number;
  style?: React.CSSProperties;
};

// CSS-crafted stand-in so the video still renders when an image is missing.
const FallbackArt: React.FC<{ variant: Fallback }> = ({ variant }) => {
  const glow =
    variant === "prayer"
      ? "rgba(242,165,65,0.45)"
      : variant === "zohar"
        ? "rgba(255,215,0,0.6)"
        : "rgba(212,175,55,0.35)";
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 45%, ${glow} 0%, ${COLORS.purple} 45%, ${COLORS.night} 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Stylised open book */}
      <div
        style={{
          display: "flex",
          gap: 6,
          transform: "perspective(900px) rotateX(35deg)",
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 260,
              height: 340,
              background: `linear-gradient(${i ? 90 : 270}deg, ${COLORS.parchment}, #E8D9B0)`,
              borderRadius: i ? "4px 18px 18px 4px" : "18px 4px 4px 18px",
              boxShadow: `0 0 80px ${glow}`,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const ZoharImageCard: React.FC<Props> = ({
  src,
  fallback = "zohar",
  zoomFrom = 1,
  zoomTo = 1.15,
  driftX = 0,
  driftY = 0,
  objectPosition = "50% 50%",
  filter,
  vignette = 0.85,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = zoomFrom + (zoomTo - zoomFrom) * p;

  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${driftX * p}px, ${driftY * p}px)`,
          filter,
        }}
      >
        {src ? (
          <Img
            src={staticFile(src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition,
            }}
          />
        ) : (
          <FallbackArt variant={fallback} />
        )}
      </AbsoluteFill>
      {vignette > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, transparent 35%, rgba(5,7,15,${vignette}) 100%)`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
