import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Glow, GoldDust, LightRays, RevealText } from "./effects";
import { ZoharImageCard } from "./ZoharImageCard";
import { COLORS, IMAGES, cue } from "./theme";

// Scene 3: the turning point. Darkness gives way to golden light
// bursting from the centre, revealing the glowing book and the lit path.
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const light = interpolate(frame, [10, durationInFrames - 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const burst = interpolate(frame, [0, durationInFrames], [0.3, 1.6]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070f" }}>
      <ZoharImageCard
        src={IMAGES.lightPath}
        fallback="zohar"
        zoomFrom={1.2}
        zoomTo={1.05}
        objectPosition="50% 0%"
        filter={`brightness(${0.08 + 0.75 * light}) saturate(${0.5 + 0.6 * light})`}
        vignette={0.9 - 0.3 * light}
      />
      <Glow x="50%" y="22%" size={1400 * burst} opacity={0.25 + 0.5 * light} />
      <LightRays x="50%" y="20%" opacity={0.2 + 0.8 * light} spread={1.2} />
      <GoldDust count={60} intensity={0.4 + 0.6 * light} seed="s3" />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(5,7,15,0) 30%, rgba(5,7,15,0.7) 62%, rgba(5,7,15,0.85) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 80px 420px",
          gap: 50,
        }}
      >
        <RevealText
          text="דווקא מהמקום הזה, של כאב אמיתי ותקווה שלא כבתה,"
          {...cue("l5", "turning", 9)}
          size={76}
          weight={700}
          highlight={["ותקווה"]}
        />
        <RevealText
          text="נפתחת אפשרות קטנה – אבל עם משמעות גדולה:"
          {...cue("l6", "turning", 8)}
          size={84}
          weight={900}
          highlight={["משמעות", "גדולה:"]}
          color={COLORS.parchment}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
