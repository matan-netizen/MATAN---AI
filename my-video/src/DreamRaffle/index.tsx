import React from "react";
import { Composition } from "remotion";
import { FORMATS, FPS, Format } from "./theme";
import { V1_DURATION, V1SuccessStory } from "./V1SuccessStory";
import { V2_DURATION, V2EyesOnDream } from "./V2EyesOnDream";
import { V3_DURATION, V3NextWinner } from "./V3NextWinner";
import { V4_DURATION, V4HallOfWinners } from "./V4HallOfWinners";

// Each version renders in all three formats: DreamRaffle-V1-9x16, -1x1, -16x9.
const VERSIONS: { id: string; component: React.FC; duration: number }[] = [
  { id: "V1", component: V1SuccessStory, duration: V1_DURATION },
  { id: "V2", component: V2EyesOnDream, duration: V2_DURATION },
  { id: "V3", component: V3NextWinner, duration: V3_DURATION },
  { id: "V4", component: V4HallOfWinners, duration: V4_DURATION },
];

export const DreamRaffleCompositions: React.FC = () => (
  <>
    {VERSIONS.flatMap(({ id, component, duration }) =>
      (Object.keys(FORMATS) as Format[]).map((f) => (
        <Composition
          key={`${id}-${f}`}
          id={`DreamRaffle-${id}-${FORMATS[f].label}`}
          component={component}
          durationInFrames={duration}
          fps={FPS}
          width={FORMATS[f].width}
          height={FORMATS[f].height}
        />
      )),
    )}
  </>
);
