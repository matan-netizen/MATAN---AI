import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { SceneFade, Watermark } from "../DreamRaffle/components";
import { COLORS, SANS } from "../DreamRaffle/theme";
import {
  SceneCTA,
  SceneEarlyBird,
  SceneHook,
  SceneMission,
  SceneOffer,
  ScenePrize,
  SceneProof,
  SceneSuperTicket,
} from "./scenes";
import { CROSSFADE, DURATION, SCENES, VO } from "./theme";

export { DURATION as DREAM_US_DURATION, FPS as DREAM_US_FPS } from "./theme";

const TIMELINE = [
  { name: "Hook", Component: SceneHook, ...SCENES.hook },
  { name: "Grand prize", Component: ScenePrize, ...SCENES.prize },
  { name: "1+1 offer", Component: SceneOffer, ...SCENES.offer },
  { name: "Early Bird", Component: SceneEarlyBird, ...SCENES.earlyBird },
  { name: "Super Ticket", Component: SceneSuperTicket, ...SCENES.superTicket },
  { name: "Mission", Component: SceneMission, ...SCENES.mission },
  { name: "Winners", Component: SceneProof, ...SCENES.proof },
  { name: "CTA", Component: SceneCTA, ...SCENES.cta },
];

const musicVolume = (f: number) =>
  interpolate(
    f,
    [0, 10, 1700, 1725, DURATION - 25, DURATION],
    [0, 0.3, 0.3, 0.5, 0.5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

export const DreamRaffleUS: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep, fontFamily: SANS }}>
    {/* cassetteai/music-generator on fal.ai */}
    <Html5Audio
      src={staticFile("dreamraffle-us/music.mp3")}
      volume={musicVolume}
    />
    {VO.map(({ src, from }) => (
      <Sequence key={src} from={from} layout="none">
        <Html5Audio src={staticFile(src)} />
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
    {/* Logo badge until the end card, which carries its own */}
    <Sequence durationInFrames={SCENES.cta.from + 50} layout="none">
      <Watermark />
    </Sequence>
  </AbsoluteFill>
);
