import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  linearTiming,
  TransitionPresentation,
  TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
  MastovLogo,
  SceneCTA,
  SceneEquity,
  SceneFive,
  SceneHook,
  SceneLocation,
  ScenePlan,
  SceneProject,
  SceneSpec,
  SceneTerms,
} from "./scenes";
import { COLORS, FONT_FAMILY, FPS, sec } from "./theme";

export const MASTOV_FPS = FPS;
const T = 12; // transition length in frames

// Scene start times in seconds, on the pauses between sentences of the
// narration (the music's whooshes use the same cuts, see
// scripts/generate-mastov-music.mjs); the CTA holds until 43.5s.
// Every scene except the last is padded by T to absorb the overlap.
const CUTS = [0, 4.1, 7.7, 10.6, 19.3, 24.5, 29.7, 35.4, 39.8, 43.5].map(sec);
const COMPONENTS = [
  SceneHook,
  SceneProject,
  SceneFive,
  SceneLocation,
  SceneTerms,
  ScenePlan,
  SceneSpec,
  SceneEquity,
  SceneCTA,
];
const SCENES = COMPONENTS.map((Component, i) => ({
  Component,
  frames: CUTS[i + 1] - CUTS[i] + (i < COMPONENTS.length - 1 ? T : 0),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANSITIONS: TransitionPresentation<any>[] = [
  wipe({ direction: "from-right" }),
  slide({ direction: "from-bottom" }),
  wipe({ direction: "from-right" }),
  fade(),
  slide({ direction: "from-right" }),
  fade(),
  slide({ direction: "from-bottom" }),
  fade(),
];

// Male narration; set to null to run on music alone (re-time CUTS when the
// recording changes).
const VOICEOVER: string | null = "mastov/voiceover.mp3";
const VO_END = sec(41.4);
const MUSIC_VOLUME = VOICEOVER ? 0.16 : 0.8;
const MUSIC_TAIL = VOICEOVER ? 0.45 : 0.8;

export const MASTOV_DURATION = CUTS[CUTS.length - 1];
const CTA_START = CUTS[CUTS.length - 2];

// Small logo plate in the corner until the CTA shows the full logo.
const LogoBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [8, 20, CTA_START - 10, CTA_START],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        left: 40,
        background: "rgba(255,255,255,0.95)",
        borderRadius: 22,
        padding: "14px 18px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        opacity,
      }}
    >
      <MastovLogo width={170} />
    </div>
  );
};

export const MastovPresale: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        direction: "rtl",
        fontFamily: FONT_FAMILY,
        backgroundColor: COLORS.greenDeep,
      }}
    >
      {VOICEOVER ? <Html5Audio src={staticFile(VOICEOVER)} /> : null}
      {/* Original track from scripts/generate-mastov-music.mjs; ducked
          under the narration and brought up for the final logo hold. */}
      <Html5Audio
        src={staticFile("mastov/audio/music.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 10, VO_END, VO_END + 15, MASTOV_DURATION - 25, MASTOV_DURATION],
            [0, MUSIC_VOLUME, MUSIC_VOLUME, MUSIC_TAIL, MUSIC_TAIL, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
      <TransitionSeries>
        {SCENES.map(({ Component, frames }, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={frames}>
              <Component />
            </TransitionSeries.Sequence>
            {i < TRANSITIONS.length ? (
              <TransitionSeries.Transition
                presentation={TRANSITIONS[i]}
                timing={linearTiming({ durationInFrames: T })}
              />
            ) : null}
          </React.Fragment>
        ))}
      </TransitionSeries>
      <LogoBadge />
      <div
        style={{
          position: "absolute",
          top: 48,
          right: 52,
          fontSize: 30,
          fontWeight: 700,
          color: "rgba(255,255,255,0.9)",
          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}
      >
        בס״ד
      </div>
    </AbsoluteFill>
  );
};
