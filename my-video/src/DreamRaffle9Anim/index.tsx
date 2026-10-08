import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { Enter } from "./art";
import { SCENE_COMPONENTS } from "./scenes";
import { C, DURATION, FONT, PARTS, START, type PartId } from "./theme";

export {
  DURATION as DREAM9_ANIM_DURATION,
  FPS as DREAM9_ANIM_FPS,
} from "./theme";

// Animated cut of the Dream Raffle 9 ad. The mascot speaks the chairman's
// four lines in his own voice (audio from public/dream9/clips), lip-synced
// from lipsync.json. Music: npm run dream9-anim-music.

// Sound effects per scene, in scene-local frames.
const SFX: Record<
  PartId,
  { file: string; at: number; volume: number; length?: number }[]
> = {
  hook: [
    { file: "bassdrop", at: 0, volume: 0.7 },
    { file: "pop", at: 14, volume: 0.5 },
    { file: "swoosh", at: 56, volume: 0.5 },
    { file: "pop", at: 70, volume: 0.6 },
  ],
  voA: [
    { file: "cash", at: 26, volume: 0.6 },
    { file: "pop", at: 112, volume: 0.6 },
  ],
  apartment: [
    { file: "ticker", at: 20, volume: 0.3, length: 100 },
    { file: "bassdrop", at: 120, volume: 0.7 },
  ],
  voB: [
    { file: "swoosh", at: 66, volume: 0.7 },
    { file: "stamp", at: 82, volume: 0.7 },
  ],
  offer: [
    { file: "swoosh", at: 28, volume: 0.6 },
    { file: "pop", at: 34, volume: 0.6 },
    { file: "pop", at: 42, volume: 0.6 },
    { file: "stamp", at: 52, volume: 0.7 },
    { file: "bassdrop", at: 86, volume: 0.6 },
  ],
  voC: [
    { file: "pop", at: 150, volume: 0.6 },
    { file: "cash", at: 152, volume: 0.4 },
  ],
  urgency: [{ file: "ticktock", at: 0, volume: 0.6 }],
  voD: [
    { file: "riser", at: 30, volume: 0.35 },
    { file: "bassdrop", at: 86, volume: 0.6 },
  ],
  cta: [
    { file: "pop", at: 22, volume: 0.5 },
    { file: "pop", at: 40, volume: 0.6 },
    { file: "click", at: 120, volume: 0.9 },
    { file: "cash", at: 122, volume: 0.5 },
  ],
};

// Music sits low under the voiceover scenes.
const VO_RANGES = PARTS.filter((p) => "vo" in p).map((p) => [
  START[p.id],
  START[p.id] + p.duration,
]);
const musicVolume = (f: number) => {
  const inVo = VO_RANGES.some(([a, b]) => f >= a - 4 && f < b + 4);
  const fade = interpolate(f, [0, 6, DURATION - 45, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (inVo ? 0.14 : 0.5) * fade;
};

export const DreamRaffle9Anim: React.FC = () => (
  <AbsoluteFill
    style={{ backgroundColor: C.navy, direction: "rtl", fontFamily: FONT }}
  >
    <Html5Audio
      src={staticFile("dream9/audio/music-anim.mp3")}
      volume={musicVolume}
    />
    {PARTS.map((part, i) => {
      const Scene = SCENE_COMPONENTS[part.id];
      return (
        <Sequence
          key={part.id}
          name={part.id}
          from={START[part.id]}
          durationInFrames={part.duration}
        >
          {"vo" in part ? (
            <Html5Audio src={staticFile(`dream9/clips/${part.vo}.mp4`)} />
          ) : null}
          {i > 0 ? (
            <Html5Audio
              src={staticFile("dream9/audio/swoosh.mp3")}
              volume={0.4}
            />
          ) : null}
          {SFX[part.id].map(({ file, at, volume, length }) => (
            <Sequence
              key={`${file}-${at}`}
              from={at}
              durationInFrames={length}
              layout="none"
            >
              <Html5Audio
                src={staticFile(`dream9/audio/${file}.mp3`)}
                volume={volume}
              />
            </Sequence>
          ))}
          {i > 0 ? (
            <Enter from={i % 2 ? "right" : "bottom"}>
              <Scene />
            </Enter>
          ) : (
            <Scene />
          )}
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
