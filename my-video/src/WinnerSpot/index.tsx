import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Polish pass on the Dream Raffle winner ad (Aryeh Luria, raffle 8).
// The source is the finished 720×1280 export, so fixes are made on top of
// it and the result is rendered at 1080×1920 (every source pixel × 1.5).
//
// Source layout (720×1280): header 0–400, gold-framed video band 400–805,
// lower-third captions in the blurred margin below, top at y=839.

const FONT = "Heebo";
loadFont({
  family: FONT,
  url: staticFile("fonts/Heebo-700.ttf"),
  weight: "700",
});

const SRC = staticFile("winner/source.mp4");
const SOURCE_FRAMES = 853;
export const WINNER_FPS = 30;
const S = 1.5;

// 1 — The jump: at source frame 150 the hallway clip starts while the
// phone-call header and caption are still up, then a gold flash restarts
// the hallway with the new graphics. Source frames 150–179 are dropped:
// 30 frames = exactly two beats of the 120 BPM track, so the music stays
// on the beat. The picture is a straight cut (a dissolve ghosted the two
// different headers over each other); the audio crossfades over 6 frames,
// which is seamless because both sides are on the same beat.
const CUT_FROM = 150;
const CUT_TO = 180;
const AUDIO_XFADE = 3;

// A single out-of-order frame in the phone call (source frame 87: his head
// jumps for one frame). It is replaced with the frame before it.
const BAD_FRAME = 87;
export const WINNER_DURATION = SOURCE_FRAMES - (CUT_TO - CUT_FROM);

// Source frame → output frame, for frames after the cut.
const out = (src: number) => src - (CUT_TO - CUT_FROM);

// Shots in the middle sequence, in source frames. The source switched the
// caption 2 frames after the picture cut into the "dream" shot; the new
// captions switch with the picture.
const SHOTS = {
  balcony: { from: 296, to: 373 },
  dream: { from: 373, to: 465 },
};

const fade = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Lower-third in the source's own style: navy box, thin gold frame, white
// bold text. Rendered fresh so the text and punctuation are exact.
const LowerThird: React.FC<{ children: React.ReactNode; wide?: boolean }> = ({
  children,
  wide = false,
}) => {
  const frame = useCurrentFrame();
  const t = fade(frame, 0, 6);
  return (
    <div
      style={{
        position: "absolute",
        top: (wide ? 836 : 837) * S,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          direction: "rtl",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 31 * S,
          lineHeight: 1.3,
          color: "white",
          textAlign: "center",
          background: "rgb(10,15,30)",
          border: `${2 * S}px solid rgb(212,173,92)`,
          borderRadius: 12 * S,
          padding: `${14 * S}px ${30 * S}px`,
          // At least as big as the source box it replaces, so none of the
          // old caption shows around the edges.
          minWidth: (wide ? 662 : 580) * S,
          minHeight: (wide ? 131 : 82) * S,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        }}
      >
        {/* The box is opaque from its first frame so the old caption never
            shows through; only the text fades in. */}
        <div style={{ opacity: t, transform: `translateY(${(1 - t) * 8}px)` }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// 3 — The source's blurred margin under the balcony shot was blurred from
// the frame *with* the "הכירו את הזוכה!" ticker, so giant smeared letters
// showed below the band. Rebuild that margin edge to edge from a clean part
// of the band (sky and skyline, x 200–720, y 410–640).
const CleanMargin: React.FC<{ trimBefore: number }> = ({ trimBefore }) => {
  const region = { x: 200, y: 410, w: 520, h: 230 };
  const box = { top: 805 * S, height: (1280 - 805) * S, width: 720 * S };
  const scale = Math.max(box.width / region.w, box.height / region.h) * 1.15;
  return (
    <div
      style={{
        position: "absolute",
        top: box.top,
        left: 0,
        width: box.width,
        height: box.height,
        overflow: "hidden",
        backgroundColor: "rgb(14,14,18)",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 720 * scale,
          height: 1280 * scale,
          left: -(region.x + region.w / 2) * scale + box.width / 2,
          top: -(region.y + region.h / 2) * scale + box.height / 2,
          filter: "blur(28px) brightness(0.42) saturate(0.9)",
        }}
      >
        <OffthreadVideo
          src={SRC}
          trimBefore={trimBefore}
          muted
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      {/* Soft top edge so it meets the gold band line without a seam. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 18%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.4))",
        }}
      />
    </div>
  );
};

const Source: React.FC<{ trimBefore: number }> = ({ trimBefore }) => (
  <OffthreadVideo
    src={SRC}
    trimBefore={trimBefore}
    muted
    style={{ width: "100%", height: "100%" }}
  />
);

export const WinnerSpot: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Opening and phone call, up to the cut. */}
      <Sequence durationInFrames={CUT_FROM} name="Opening + phone call">
        <Source trimBefore={0} />
      </Sequence>
      <Sequence from={BAD_FRAME} durationInFrames={1} name="Jump-frame fix">
        <Source trimBefore={BAD_FRAME - 1} />
      </Sequence>

      {/* Straight cut to the hallway, with its own header already up. */}
      <Sequence from={CUT_FROM} name="Hallway onward">
        <Source trimBefore={CUT_TO} />
      </Sequence>

      {/* Audio, crossfaded across the cut. */}
      <Sequence durationInFrames={CUT_FROM + AUDIO_XFADE} name="Audio A">
        <Html5Audio
          src={SRC}
          volume={(f) =>
            1 - fade(f, CUT_FROM - AUDIO_XFADE, CUT_FROM + AUDIO_XFADE)
          }
        />
      </Sequence>
      <Sequence from={CUT_FROM - AUDIO_XFADE} name="Audio B">
        <Html5Audio
          src={SRC}
          trimBefore={CUT_TO - AUDIO_XFADE}
          volume={(f) => fade(f, 0, 2 * AUDIO_XFADE)}
        />
      </Sequence>

      {/* 2 — Lower-thirds for the middle sequence. */}
      <Sequence
        from={out(SHOTS.balcony.from)}
        durationInFrames={SHOTS.balcony.to - SHOTS.balcony.from}
        name="Balcony: clean margin + caption"
      >
        <CleanMargin trimBefore={SHOTS.balcony.from} />
        <LowerThird>...לדירה החדשה שלו בירושלים!</LowerThird>
      </Sequence>
      <Sequence
        from={out(SHOTS.dream.from)}
        durationInFrames={SHOTS.dream.to - SHOTS.dream.from}
        name="Dream caption"
      >
        <LowerThird wide>
          החלום שלו התגשם –
          <br />
          והשנה התור שלך!
        </LowerThird>
      </Sequence>
    </AbsoluteFill>
  );
};
