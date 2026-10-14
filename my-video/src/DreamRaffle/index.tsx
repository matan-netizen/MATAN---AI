import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { SceneFade } from "./components";
import {
  SceneCTA,
  SceneEarlyBird,
  SceneHook,
  SceneInterior,
  SceneJerusalem,
  SceneMission,
  SceneOffer,
} from "./scenes";
import { COLORS, CROSSFADE, DURATION, SANS, SCENES, VO } from "./theme";

export { DURATION as DREAM_DURATION, FPS as DREAM_FPS } from "./theme";

const TIMELINE = [
  { name: "Hook", Component: SceneHook, ...SCENES.hook },
  { name: "Jerusalem", Component: SceneJerusalem, ...SCENES.jerusalem },
  { name: "Interior", Component: SceneInterior, ...SCENES.interior },
  { name: "1+1 Offer", Component: SceneOffer, ...SCENES.offer },
  { name: "Early Bird", Component: SceneEarlyBird, ...SCENES.earlyBird },
  { name: "Mission", Component: SceneMission, ...SCENES.mission },
  { name: "CTA", Component: SceneCTA, ...SCENES.cta },
];

// Music sits under the voiceover and comes up for the final hit.
const musicVolume = (f: number) =>
  interpolate(
    f,
    [0, 10, 1320, 1340, DURATION - 20, DURATION],
    [0, 0.32, 0.32, 0.55, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

// The Dream Raffle, 9th edition: 46s, 16:9, English (US) voiceover.
// Script: dream-raffle-promo-script.md at the repo root.
export const DreamRaffle: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep, fontFamily: SANS }}>
    {/* cassetteai/music-generator on fal.ai */}
    <Html5Audio
      src={staticFile("dreamraffle/music/score.mp3")}
      volume={musicVolume}
    />
    {VO.map(({ src, from }) => (
      <Sequence key={src} from={from} layout="none">
        <Html5Audio src={staticFile(src)} volume={1} />
      </Sequence>
    ))}
    {TIMELINE.map(({ name, Component, from, duration }, i) => {
      const isLast = i === TIMELINE.length - 1;
      return (
        <Sequence
          key={name}
          name={name}
          from={from}
          durationInFrames={isLast ? duration : duration + CROSSFADE}
        >
          <SceneFade fadeIn={i > 0} frames={CROSSFADE}>
            <Component />
          </SceneFade>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
