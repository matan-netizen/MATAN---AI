import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { AudioLayer } from "./AudioLayer";
import { RevealFlash, SceneFrame } from "./effects";
import { Scene1 } from "./Scene1";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";
import { Scene4Zohar } from "./Scene4_Zohar";
import { Scene5CTA } from "./Scene5_CTA";
import { COLORS, CROSSFADE, SANS, SCENES } from "./theme";

export { DURATION as ZOHAR_DURATION, FPS as ZOHAR_FPS } from "./theme";

const TIMELINE = [
  { name: "Scene 1 – Silence", Component: Scene1, ...SCENES.silence },
  { name: "Scene 2 – Struggle", Component: Scene2, ...SCENES.struggle },
  { name: "Scene 3 – Turning point", Component: Scene3, ...SCENES.turning },
  { name: "Scene 4 – Zohar", Component: Scene4Zohar, ...SCENES.zohar },
  { name: "Scene 5 – CTA", Component: Scene5CTA, ...SCENES.cta },
];

export const ZoharCampaign: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.night,
        direction: "rtl",
        fontFamily: SANS,
      }}
    >
      {TIMELINE.map(({ name, Component, from, duration }, i) => {
        const isFirst = i === 0;
        const isLast = i === TIMELINE.length - 1;
        // Each scene overruns into the next by CROSSFADE frames; the next
        // scene fades in on top of it, giving a smooth crossfade.
        return (
          <Sequence
            key={name}
            name={name}
            from={from}
            durationInFrames={isLast ? duration : duration + CROSSFADE}
          >
            <SceneFrame fadeIn={!isFirst} fadeOut={!isLast}>
              <Component />
            </SceneFrame>
          </Sequence>
        );
      })}
      {/* Flash on the Zohar reveal, in sync with the chime */}
      <Sequence
        name="Reveal flash"
        from={SCENES.zohar.from - 3}
        durationInFrames={28}
      >
        <RevealFlash />
      </Sequence>
      <AudioLayer />
    </AbsoluteFill>
  );
};
