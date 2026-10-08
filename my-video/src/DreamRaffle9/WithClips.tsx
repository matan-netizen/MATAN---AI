import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
} from "remotion";
import { LastYearNote, Whip } from "./components";
import { SFX } from "./index";
import {
  SceneApartment,
  SceneCTA,
  SceneEnd,
  SceneHook,
  SceneOffer,
  SceneUrgency,
} from "./scenes";
import { COLORS, FONT, SCENES } from "./theme";

// Second cut of the ad: the graphic scenes from DreamRaffle9 interleaved with
// four short clips of the fund's chairman, trimmed from the two campaign
// videos (public/dream9/clips). The clips already carry burned-in captions.
type Graphic = {
  kind: "graphic";
  name: string;
  Component: React.FC;
  // Where the scene sits in DreamRaffle9, so its music and SFX come along.
  scene: { from: number; duration: number };
};
type Clip = { kind: "clip"; name: string; file: string; duration: number };

const PARTS: (Graphic | Clip)[] = [
  { kind: "graphic", name: "Hook", Component: SceneHook, scene: SCENES.hook },
  {
    kind: "clip",
    name: "Clip: 660 shekel",
    file: "a-660-shekel",
    duration: 174,
  },
  {
    kind: "graphic",
    name: "Apartment",
    Component: SceneApartment,
    scene: SCENES.apartment,
  },
  {
    kind: "clip",
    name: "Clip: no mortgage",
    file: "b-no-mortgage",
    duration: 114,
  },
  {
    kind: "graphic",
    name: "1+1 offer",
    Component: SceneOffer,
    scene: SCENES.offer,
  },
  {
    kind: "clip",
    name: "Clip: everyone sends 660",
    file: "c-everyone-sends",
    duration: 192,
  },
  {
    kind: "graphic",
    name: "Urgency",
    Component: SceneUrgency,
    scene: SCENES.urgency,
  },
  { kind: "clip", name: "Clip: win big", file: "d-win-big", duration: 145 },
  { kind: "graphic", name: "CTA", Component: SceneCTA, scene: SCENES.cta },
  { kind: "graphic", name: "End card", Component: SceneEnd, scene: SCENES.end },
];

const lengthOf = (p: Graphic | Clip) =>
  p.kind === "clip" ? p.duration : p.scene.duration;

const TIMELINE = PARTS.reduce<{ part: Graphic | Clip; from: number }[]>(
  (acc, part) => {
    const prev = acc[acc.length - 1];
    const from = prev ? prev.from + lengthOf(prev.part) : 0;
    return [...acc, { part, from }];
  },
  [],
);

export const WITH_CLIPS_DURATION = TIMELINE.reduce(
  (sum, { part }) => sum + lengthOf(part),
  0,
);

const FADE = 6;

// The score and SFX of the original cut, for one scene's frame range.
const GraphicAudio: React.FC<{ scene: { from: number; duration: number } }> = ({
  scene,
}) => (
  <>
    <Html5Audio
      src={staticFile("dream9/audio/music.mp3")}
      trimBefore={scene.from}
      volume={(f) =>
        interpolate(
          f,
          [0, FADE, scene.duration - FADE, scene.duration],
          [0, 0.55, 0.55, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
    {SFX.filter(
      ({ at }) => at >= scene.from && at < scene.from + scene.duration,
    ).map(({ file, at, volume, length }) => (
      <Sequence
        key={`${file}-${at}`}
        from={at - scene.from}
        durationInFrames={length}
        layout="none"
      >
        <Html5Audio
          src={staticFile(`dream9/audio/${file}.mp3`)}
          volume={volume}
        />
      </Sequence>
    ))}
  </>
);

export const DreamRaffle9WithClips: React.FC = () => (
  <AbsoluteFill
    style={{ backgroundColor: COLORS.ink, direction: "rtl", fontFamily: FONT }}
  >
    {TIMELINE.map(({ part, from }) => (
      <Sequence
        key={part.name}
        name={part.name}
        from={from}
        durationInFrames={lengthOf(part)}
      >
        {part.kind === "graphic" ? (
          <>
            <GraphicAudio scene={part.scene} />
            <part.Component />
          </>
        ) : (
          <>
            <Html5Audio
              src={staticFile("dream9/audio/swoosh.mp3")}
              volume={0.5}
            />
            <Whip>
              <OffthreadVideo
                src={staticFile(`dream9/clips/${part.file}.mp4`)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Whip>
            <LastYearNote />
          </>
        )}
      </Sequence>
    ))}
  </AbsoluteFill>
);
