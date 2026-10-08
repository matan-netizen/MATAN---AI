import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { Captions, SceneFade } from "./components";
import {
  SceneBilling,
  SceneCache,
  SceneCTA,
  SceneHook,
  SceneRouter,
} from "./scenes";
import { COLORS, CROSSFADE, DURATION, FONT, SCENES, VOICEOVER } from "./theme";

export { DURATION as OPTIMI_DURATION, FPS as OPTIMI_FPS } from "./theme";

const TIMELINE = [
  { name: "Hook", Component: SceneHook, ...SCENES.hook },
  { name: "Smart router", Component: SceneRouter, ...SCENES.router },
  { name: "Semantic cache", Component: SceneCache, ...SCENES.cache },
  { name: "Billing & alerts", Component: SceneBilling, ...SCENES.billing },
  { name: "CTA", Component: SceneCTA, ...SCENES.cta },
];

const MUSIC = VOICEOVER ? 0.18 : 0.5;

export const OptimiExplainer: React.FC = () => (
  <AbsoluteFill
    style={{ backgroundColor: COLORS.gray, direction: "rtl", fontFamily: FONT }}
  >
    <Html5Audio
      src={staticFile("music/promo-beat.mp3")}
      loop
      volume={(f) =>
        interpolate(f, [0, 10, DURATION - 40, DURATION], [0, MUSIC, MUSIC, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
    {VOICEOVER ? <Html5Audio src={staticFile("optimi/voiceover.mp3")} /> : null}
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
    <Captions />
  </AbsoluteFill>
);
