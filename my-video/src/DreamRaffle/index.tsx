import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { AudioLayer } from "./AudioLayer";
import { Enter, Flash, WhipStreak } from "./effects";
import { SCENE_TIMELINE } from "./scenes";
import { COLORS, FONT, OVERLAP, SCENES } from "./theme";

export { DURATION as DREAM_RAFFLE_DURATION, FPS as DREAM_RAFFLE_FPS } from "./theme";

// 20s 9:16 promo for thedreamraffle.co.il: hook → offer → cause → CTA.
export const DreamRaffle: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.brown, direction: "rtl", fontFamily: FONT }}>
    <AudioLayer />
    {SCENE_TIMELINE.map(({ name, Component, entrance, from, duration }, i) => {
      const isLast = i === SCENE_TIMELINE.length - 1;
      // Each scene keeps running for OVERLAP frames under the next one's entrance.
      return (
        <Sequence key={name} name={name} from={from} durationInFrames={isLast ? duration : duration + OVERLAP}>
          <Enter type={entrance}>
            <Component />
          </Enter>
        </Sequence>
      );
    })}
    <Sequence name="Whip streak" from={SCENES.offer.from} durationInFrames={OVERLAP}>
      <WhipStreak />
    </Sequence>
    <Sequence name="Flash" from={SCENES.cta.from - 3} durationInFrames={16}>
      <Flash />
    </Sequence>
  </AbsoluteFill>
);
