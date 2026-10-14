import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { FilmGrain, LightLeak, SceneFade, Vignette } from "./components";
import {
  SceneCTA,
  SceneHook,
  SceneImpact,
  SceneOffer,
  ScenePrize,
  SceneQuote,
  SceneTurn,
  SceneWinner,
} from "./scenes";
import { COLORS, CROSSFADE, DURATION, FONT, FPS, SCENES, SFX, VO } from "./theme";
import timings from "./voiceover-timings.json";

export { DURATION as DREAM_DURATION, FPS as DREAM_FPS } from "./theme";

const TIMELINE = [
  { name: "Hook", Component: SceneHook, ...SCENES.hook },
  { name: "Winner", Component: SceneWinner, ...SCENES.winner },
  { name: "Winner quote", Component: SceneQuote, ...SCENES.quote },
  { name: "It could be you", Component: SceneTurn, ...SCENES.turn },
  { name: "Grand prize", Component: ScenePrize, ...SCENES.prize },
  { name: "Offer", Component: SceneOffer, ...SCENES.offer },
  { name: "Impact", Component: SceneImpact, ...SCENES.impact },
  { name: "CTA", Component: SceneCTA, ...SCENES.cta },
];

const VO_CLIPS = VO.map((v, i) => ({
  ...v,
  frames: Math.ceil(timings.lines[i].seconds * FPS),
}));

// Music sits under the narration and drops further while the winner speaks.
const musicVolume = (f: number) => {
  const fade = interpolate(f, [0, 6, DURATION - 40, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const near = (from: number, to: number) =>
    interpolate(f, [from - 6, from, to, to + 8], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const voice = Math.max(...VO_CLIPS.map((v) => near(v.at, v.at + v.frames)));
  const quote = near(SCENES.quote.from, SCENES.quote.from + SCENES.quote.duration);
  const level = 0.85 - 0.5 * voice - 0.6 * quote;
  return fade * Math.max(0.15, level);
};

export const DreamRaffle: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.ink, fontFamily: FONT }}>
    {/* Music and effects from scripts/generate-dream-audio.mjs */}
    <Html5Audio src={staticFile("dream/audio/music.mp3")} volume={musicVolume} />
    {SFX.map((s, i) => (
      <Sequence key={`sfx${i}`} name={`SFX ${s.file}`} from={Math.max(0, s.at)} durationInFrames={90}>
        <Html5Audio src={staticFile(`dream/audio/${s.file}.mp3`)} volume={s.volume} />
      </Sequence>
    ))}
    {VO_CLIPS.map((v) => (
      <Sequence key={v.file} name={`VO ${v.file}`} from={v.at} durationInFrames={v.frames}>
        <Html5Audio src={staticFile(`dream/vo/${v.file}.mp3`)} />
      </Sequence>
    ))}
    {TIMELINE.map(({ name, Component, from, duration }, i) => {
      const isLast = i === TIMELINE.length - 1;
      // Each scene runs CROSSFADE frames into the next, which fades in on top.
      return (
        <Sequence
          key={name}
          name={name}
          from={from}
          durationInFrames={isLast ? duration : duration + CROSSFADE}
        >
          <SceneFade fadeIn={i > 0}>
            <Component />
          </SceneFade>
        </Sequence>
      );
    })}
    {TIMELINE.slice(1).map(({ name, from }) => (
      <Sequence key={`leak-${name}`} from={from - 2} durationInFrames={16} layout="none">
        <LightLeak />
      </Sequence>
    ))}
    <Vignette />
    <FilmGrain />
  </AbsoluteFill>
);
