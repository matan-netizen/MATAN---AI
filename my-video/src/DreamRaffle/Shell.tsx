import React from "react";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { CaptionLine, Captions, Cue, Sfx } from "./components";
import { COLORS, FONT } from "./theme";
import voiceover from "./voiceover.json";

// Clips written by scripts/generate-raffle-voiceover.mjs, one per caption
// line. Until they exist the videos run on music, SFX and captions alone.
type VoLine = { file: string; seconds: number };
const VO = voiceover.lines as Record<string, VoLine[] | undefined>;

export const VersionShell: React.FC<{
  version: "v1" | "v2" | "v3" | "v4";
  captions: CaptionLine[];
  cues: Cue[];
  children: React.ReactNode;
  // From this frame on (the endcard), square and landscape drop the burned-in
  // captions: the card fills the frame and already says it all.
  endFrom?: number;
}> = ({ version, captions, cues, children, endFrom }) => {
  const { durationInFrames, width, height } = useVideoConfig();
  const shown = width < height || endFrom === undefined ? captions : captions.filter((c) => c.from < endFrom);
  const vo = VO[version] ?? [];
  // Music sits lower under a voiceover so the narration stays clear.
  const bed = vo.length ? 0.4 : 0.85;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep, direction: "rtl", fontFamily: FONT }}>
      {children}
      <Captions lines={shown} />
      <Html5Audio
        src={staticFile(`raffle/audio/${version}.mp3`)}
        volume={(f) => bed * interpolate(f, [0, 4, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      <Sfx cues={cues} />
      {vo.map((clip, i) =>
        captions[i] ? (
          <Sequence key={clip.file} from={captions[i].from} name={`VO ${i + 1}`} layout="none">
            <Html5Audio src={staticFile(clip.file)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </AbsoluteFill>
  );
};
