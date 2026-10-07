import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Corrections to the Dream Raffle promo with the speaker (1080×1920, 30 fps):
//
// 1. The gold medal (16–21s) read "שנה שמינית ברציפות". The base video,
//    source-fixed.mp4, has it re-engraved as "שנה תשיעית ברציפות" by
//    scripts/fix-medal-year.py.
// 2. The winner scene (6.3–11.1s) was a tight crop on the organiser with
//    Aryeh Luria cut off at the edge, under big "הכירו את הזוכה" /
//    "הגרלת החלומות 8 – אריה לוריא" tickers. It is replaced with the full
//    photo, centred and clean, with the captions in the bottom third.

const FONT = "Heebo";
loadFont({
  family: FONT,
  url: staticFile("fonts/Heebo-700.ttf"),
  weight: "700",
});

const BASE = staticFile("winner-promo/source-fixed.mp4");
export const WINNER_PROMO_FPS = 30;
export const WINNER_PROMO_DURATION = 1068;

// Winner scene, in frames. The source crossfades in over 189–202 and out
// over 326–334; the new scene takes over within 6 frames and lets go in the
// last 3, so the old tickers barely show.
const WIN = { from: 189, to: 335, fade: 6 };

// The corner logo (already the year-9 logo) is kept on top.
const CORNER = { x: 822, y: 65, w: 193, h: 200 };

// Caption groups as the source splits them, with word timings (seconds)
// from a transcription of the voice-over.
const CAPTIONS: { prefix?: string; words: [string, number][] }[] = [
  {
    prefix: "🔑",
    words: [
      ["אריה", 6.38],
      ["לוריא", 6.68],
      ["כבר", 7.02],
      ["זכה", 7.26],
      ["בשנה", 7.52],
    ],
  },
  {
    words: [
      ["שעברה,", 7.88],
      ["השנה", 8.52],
      ["זה", 9.08],
      ["לגמרי", 9.22],
      ["יכול", 9.72],
      ["להיות", 10.0],
    ],
  },
  { words: [["שלכם!", 10.22]] },
];
const CAPTIONS_END = 10.9;

const Caption: React.FC = () => {
  const frame = useCurrentFrame() + WIN.from;
  const t = frame / WINNER_PROMO_FPS;
  const group = CAPTIONS.findIndex((g, i) => {
    const next = CAPTIONS[i + 1]?.words[0][1] ?? CAPTIONS_END;
    return t >= g.words[0][1] && t < next;
  });
  if (group < 0) return null;
  const { prefix, words } = CAPTIONS[group];
  const active = words.reduce((a, [, s], i) => (t >= s ? i : a), 0);
  return (
    <div
      style={{
        position: "absolute",
        top: 1576,
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
          fontSize: 48,
          lineHeight: "69px",
          height: 69,
          color: "white",
          background: "rgba(28,28,30,0.82)",
          borderRadius: 10,
          padding: "0 22px",
          whiteSpace: "nowrap",
        }}
      >
        {prefix ? <span>{prefix} </span> : null}
        {words.map(([w], i) => (
          <span key={i} style={{ color: i === active ? "#3BDB2F" : "white" }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

const WinnerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const len = WIN.to - WIN.from;
  const opacity = interpolate(
    frame,
    [0, WIN.fade, len - 3, len],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // Gentle push-in on the photo, kept centred.
  const zoom = interpolate(frame, [0, len], [1, 1.05]);
  const enter = interpolate(frame, [0, 12], [0.96, 1], {
    extrapolateRight: "clamp",
  });
  const photo = staticFile("winner-promo/arieh.jpg");
  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Backdrop: the same photo, blurred and darkened, edge to edge. */}
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#111" }}>
        <Img
          src={photo}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.15)",
            filter: "blur(36px) brightness(0.5) saturate(1.1)",
          }}
        />
      </AbsoluteFill>
      {/* The photo, centred on the two of them: heads, shoulders and the
          thumbs-up all inside the frame. */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 1000,
            height: 868,
            borderRadius: 26,
            overflow: "hidden",
            border: "5px solid #D9B45A",
            boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
            transform: `scale(${enter})`,
          }}
        >
          <Img
            src={photo}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "58% 50%",
              transform: `scale(${zoom * 1.01})`,
            }}
          />
        </div>
      </AbsoluteFill>
      {/* Soft dark gradient under the captions. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.7) 100%)",
        }}
      />
      <Caption />
    </AbsoluteFill>
  );
};

export const WinnerPromo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <OffthreadVideo src={BASE} style={{ width: "100%", height: "100%" }} />
    <Sequence
      from={WIN.from}
      durationInFrames={WIN.to - WIN.from}
      name="Winner scene"
    >
      <WinnerScene />
      {/* Corner logo from the base video, kept on top. */}
      <div
        style={{
          position: "absolute",
          left: CORNER.x,
          top: CORNER.y,
          width: CORNER.w,
          height: CORNER.h,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -CORNER.x,
            top: -CORNER.y,
            width: 1080,
            height: 1920,
          }}
        >
          <OffthreadVideo
            src={BASE}
            trimBefore={WIN.from}
            muted
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </Sequence>
  </AbsoluteFill>
);
