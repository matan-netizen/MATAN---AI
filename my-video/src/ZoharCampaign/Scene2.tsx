import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GoldDust, RevealText } from "./effects";
import { ZoharImageCard } from "./ZoharImageCard";
import {
  COLORS,
  HEARTBEAT_PERIOD,
  HEART_WORD,
  IMAGES,
  SCENES,
  cue,
  f,
} from "./theme";

// Lub-dub envelope matching the heartbeat SFX (second beat 0.2s = 6 frames later).
const heartbeat = (frame: number) => {
  const phase = frame % HEARTBEAT_PERIOD;
  const lub = Math.exp(-phase / 4);
  const dub = phase >= 6 ? 0.7 * Math.exp(-(phase - 6) / 4) : 0;
  return Math.min(1, lub + dub);
};

// Scene 2: struggle and persistent hope. Stormy, dark road; the
// words land one by one and a heartbeat glow pulses behind "הלב שלו".
export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const beat = heartbeat(frame);
  // Glow swells in as "הלב" is spoken.
  const heartCue = f(HEART_WORD) - SCENES.struggle.from;
  const heartIn = interpolate(frame, [heartCue - 10, heartCue + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ECG trace that draws across the screen in time with the beat.
  const ecgProgress = interpolate(frame, [0, durationInFrames], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.night }}>
      <ZoharImageCard
        src={IMAGES.stormRoad}
        fallback="prayer"
        zoomFrom={1.05}
        zoomTo={1.15}
        driftY={-30}
        objectPosition="50% 40%"
        filter="brightness(0.4) saturate(0.6) hue-rotate(-10deg)"
        vignette={0.95}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(42,27,74,0.55) 0%, rgba(15,20,36,0.75) 60%, rgba(15,20,36,0.92) 100%)",
        }}
      />
      <GoldDust count={25} intensity={0.5} seed="s2" />

      <svg
        width={1080}
        height={300}
        viewBox="0 0 1080 300"
        style={{ position: "absolute", top: 420, opacity: 0.55 }}
      >
        <path
          d="M0 150 H300 L330 150 L350 90 L375 230 L400 40 L425 200 L445 150 H620 L645 150 L665 100 L690 220 L715 60 L740 190 L760 150 H1080"
          fill="none"
          stroke={COLORS.amber}
          strokeWidth={5}
          strokeDasharray={2600}
          strokeDashoffset={2600 * (1 - ecgProgress)}
          style={{
            filter: `drop-shadow(0 0 ${8 + beat * 16}px ${COLORS.amber})`,
          }}
        />
      </svg>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 80px",
          gap: 46,
          paddingTop: 300,
        }}
      >
        <RevealText
          text="ניסית הכל, התפללת, קיווית, לפעמים כמעט נשברת –"
          {...cue("tried", "struggle", 8)}
          size={72}
          weight={700}
        />
        <RevealText
          text="ואז אספת את עצמך וקמת שוב."
          {...cue("rose", "struggle", 6)}
          size={72}
          weight={700}
          highlight={["וקמת", "שוב."]}
        />
        <div style={{ position: "relative" }}>
          {/* Heartbeat glow */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 900,
              height: 500,
              marginLeft: -450,
              marginTop: -250,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, rgba(255,90,60,${0.55 * beat * heartIn}) 0%, rgba(212,175,55,${0.25 * heartIn}) 35%, transparent 70%)`,
              transform: `scale(${1 + beat * 0.12})`,
            }}
          />
          <RevealText
            text="אבל מבפנים, הלב עדיין מחכה לבקשה האחת הזו שלא זזה."
            {...cue("heart", "struggle", 10)}
            size={76}
            weight={900}
            highlight={["הלב"]}
            style={{
              position: "relative",
              transform: `scale(${1 + beat * 0.025 * heartIn})`,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
