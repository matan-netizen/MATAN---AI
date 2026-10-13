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
  Scene2018,
  Scene2019,
  Scene2020,
  SceneBonus,
  SceneCTA,
  SceneDouble,
  SceneHook,
  SceneMore,
  SceneNinth,
} from "./scenes";
import { COLORS, CROSSFADE, DURATION, FONT, SCENES } from "./theme";

export {
  DURATION as DREAM_DURATION,
  FEED as DREAM_FEED,
  FPS as DREAM_FPS,
  STORY as DREAM_STORY,
} from "./theme";

const TIMELINE = [
  { name: "Hook", Component: SceneHook, ...SCENES.hook },
  { name: "2018", Component: Scene2018, ...SCENES.y2018 },
  { name: "2019", Component: Scene2019, ...SCENES.y2019 },
  { name: "2020", Component: Scene2020, ...SCENES.y2020 },
  { name: "2021-2025", Component: SceneMore, ...SCENES.more },
  { name: "Bonus winners", Component: SceneBonus, ...SCENES.bonus },
  { name: "9th year", Component: SceneNinth, ...SCENES.ninth },
  { name: "1+1", Component: SceneDouble, ...SCENES.double },
  { name: "CTA", Component: SceneCTA, ...SCENES.cta },
];

// 28s Facebook ad: the winners' story year by year, then the offer.
// Rendered as DreamRaffle (4:5 feed) and DreamRaffleStory (9:16).
export const DreamRaffle: React.FC = () => (
  <AbsoluteFill
    style={{ backgroundColor: COLORS.deep, direction: "rtl", fontFamily: FONT }}
  >
    <Html5Audio
      src={staticFile("music/promo-beat.mp3")}
      volume={(f) =>
        interpolate(f, [0, 8, DURATION - 45, DURATION], [0, 0.7, 0.7, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
    {TIMELINE.map(({ name, Component, from, duration }, i) => {
      const isLast = i === TIMELINE.length - 1;
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
  </AbsoluteFill>
);
