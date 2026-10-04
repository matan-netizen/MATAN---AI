import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Glow, GoldDust, RevealText } from "./effects";
import { ZoharImageCard } from "./ZoharImageCard";
import { COLORS, IMAGES, cue } from "./theme";

// Scene 1: internal silence and pain. A man alone in thought,
// dim candle-warm light, slow push-in, floating gold dust.
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const flicker =
    0.75 + 0.15 * Math.sin(frame * 0.7) + 0.1 * Math.sin(frame * 1.9);
  const fromBlack = interpolate(frame, [0, 25], [1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.night }}>
      <ZoharImageCard
        src={IMAGES.manThinking}
        fallback="prayer"
        zoomFrom={1}
        zoomTo={1.15}
        driftX={-20}
        objectPosition="40% 30%"
        filter="brightness(0.55) saturate(0.75) sepia(0.25)"
        vignette={0.95}
      />
      {/* Candlelight from below */}
      <Glow
        x="50%"
        y="105%"
        size={1500}
        color={COLORS.amber}
        opacity={0.45 * flicker}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(15,20,36,0) 35%, rgba(15,20,36,0.85) 70%, rgba(15,20,36,0.95) 100%)",
        }}
      />
      <GoldDust count={45} intensity={0.8} seed="s1" />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 80px 430px",
          gap: 50,
        }}
      >
        <RevealText
          text="יש רגעים שאדם שואל את עצמו בשקט, בלי שאף אחד ישמע…"
          {...cue("l1", "silence", 11)}
          size={74}
          weight={500}
        />
        <RevealText
          text="“כמה עוד אפשר לחכות?”"
          {...cue("l2", "silence", 4)}
          size={84}
          weight={900}
          gold
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "black", opacity: fromBlack }} />
    </AbsoluteFill>
  );
};
