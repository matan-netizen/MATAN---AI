import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { Watermark } from "../DreamRaffle/components";
import { Captions, FilmFinish, ZoomIn } from "./finish";
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

// ElevenLabs sound effects on fal.ai: [file, start frame, volume].
const CUTS = [164, 416, 548, 712, 912, 1318];
const SFX: [string, number, number][] = [
  ["key-turn", 22, 0.7],
  ["door-open", 88, 0.55],
  ...CUTS.map((f): [string, number, number] => ["whoosh", f - 6, 0.45]),
  ["ticket-split", 476, 0.6],
  ["stamp", 506, 0.8],
  ["coins", 564, 0.45],
  ["ticket-split", 718, 0.45],
  ["impact", 1184, 0.55],
  ["riser", 1450, 0.45],
  ["key-turn", 1470, 0.7],
  ["door-open", 1500, 0.5],
  ["impact", 1515, 0.6],
];

const musicVolume = (f: number) =>
  interpolate(
    f,
    [0, 10, 1700, 1716, DURATION - 20, DURATION],
    [0, 0.24, 0.24, 0.5, 0.5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

export const DreamRaffleUS: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep, fontFamily: SANS }}>
    {/* ElevenLabs Music on fal.ai, scored to the scene timings */}
    <Html5Audio
      src={staticFile("dreamraffle-us/music-el.mp3")}
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
          <ZoomIn on={i > 0} frames={CROSSFADE}>
            <Component />
          </ZoomIn>
        </Sequence>
      );
    })}
    {SFX.map(([name, from, volume]) => (
      <Sequence key={`${name}-${from}`} from={from} layout="none">
        <Html5Audio
          src={staticFile(`dreamraffle-us/sfx/${name}.mp3`)}
          volume={volume}
        />
      </Sequence>
    ))}
    <Captions until={SCENES.cta.from + 43} />
    <FilmFinish />
    {/* Logo badge until the end card, which carries its own */}
    <Sequence durationInFrames={SCENES.cta.from + 50} layout="none">
      <Watermark />
    </Sequence>
  </AbsoluteFill>
);
