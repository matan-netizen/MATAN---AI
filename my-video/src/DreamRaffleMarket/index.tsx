import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Enter,
  Flash,
  LightLeak,
  Particles,
  Scrim,
  ShineSweep,
  Shot,
  Vignette,
  WhipStreak,
} from "../DreamRaffle/effects";
import { KeyIcon, KineticText, Tag } from "../DreamRaffle/graphics";
import { COLORS, FONT, GOLD_GRADIENT, IMG, SHOTS } from "../DreamRaffle/theme";

// The Machane Yehuda market video (720x1280, 30fps) with two fixes:
//   1. The logo in the top header is cropped at the bottom; a patch redraws
//      the same tile with the whole logo, following the header frame by frame.
//   2. The two illustrated segments (the opening and the price window) are
//      replaced with live footage of the apartment in the DreamRaffle style.
// The original video, sound included, plays underneath unchanged, so the
// speech and captions keep their timing.

export const MARKET_FPS = 30;
export const MARKET_DURATION = 793;
const MAIN = "dreamraffle/market/main.mp4";
const S = 1080 / 720; // source pixels → composition pixels

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Source frames, measured from main.mp4.
const INTRO_END = 76; // illustrated opening: 0–75, market footage clean from 78
const VALUE = { from: 279, to: 400 }; // price window: 281–399 (+ wipes either side)
const EXIT = 8; // frames for the value segment to slide out
// When the header (and so the logo tile) is on screen and settled.
const LOGO_VISIBLE: [number, number][] = [
  [78, VALUE.from + 4],
  [400, 517],
  [524, 574], // 517–523: white flash transition in the original
];
// The logo tile inside the header, in source pixels.
const TILE = { x: 511, y: 44, w: 168, h: 122 };

// ---------------------------------------------------------------------------
// Logo fix
// ---------------------------------------------------------------------------

const LogoPatch: React.FC = () => {
  const frame = useCurrentFrame();
  if (!LOGO_VISIBLE.some(([a, b]) => frame >= a && frame < b)) return null;
  const pad = 3; // cover the original tile's edges
  return (
    <>
      {/* Header navy behind the tile, so no trace of the old one shows. */}
      <div
        style={{
          position: "absolute",
          left: (TILE.x - pad - 1) * S,
          top: (TILE.y - pad - 2) * S,
          width: (TILE.w + 2 * pad + 2) * S,
          height: (TILE.h + 2 * pad + 4) * S,
          background: "#13203A",
          borderRadius: 12 * S,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: TILE.x * S,
          top: TILE.y * S,
          width: TILE.w * S,
          height: TILE.h * S,
          borderRadius: 14 * S,
          overflow: "hidden",
          background: "linear-gradient(180deg, #6FAEF2 0%, #93C2F6 55%, #BBD6F7 100%)",
          boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* The whole logo, including "שנה תשיעית ברציפות", with even padding. */}
        <Img
          src={staticFile(IMG.logo)}
          style={{
            height: (TILE.h - 8) * S,
            width: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
          }}
        />
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// New opening (replaces the illustrated building)
// ---------------------------------------------------------------------------

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 5], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeIn, backgroundColor: COLORS.brown }}>
      <Sequence durationInFrames={44} layout="none">
        <Shot at={SHOTS.dining} rate={0.8} zoom={[1.0, 1.16]} origin="45% 55%" />
      </Sequence>
      <Sequence from={42} layout="none">
        <AbsoluteFill style={{ opacity: interpolate(frame, [42, 46], [0, 1], clamp) }}>
          <Shot at={SHOTS.livingWide} rate={0.8} zoom={[1.06, 1.2]} />
        </AbsoluteFill>
      </Sequence>
      <LightLeak intensity={0.55} seed={2} />
      <ShineSweep start={6} duration={26} opacity={0.35} />
      <Vignette />
      <Scrim from="top" height={55} opacity={0.8} />
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <KineticText text="דירה חדשה *בירושלים*" delay={3} stagger={3} size={86} />
      </div>
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <KineticText text="*במתנה?*" delay={14} size={190} icon={<KeyIcon size={150} delay={24} />} />
      </div>
      <Particles count={26} seed="intro" size={10} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Value segment (replaces the illustrated window and price counter)
// ---------------------------------------------------------------------------

const VALUE_STEPS = { start: 800_000, end: 1_300_000 };

const ValueCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 8, fps, config: { damping: 13 } });
  // Hold $800,000, then climb to $1,300,000 and land with a pulse.
  const value = interpolate(frame, [22, 70], [VALUE_STEPS.start, VALUE_STEPS.end], {
    ...clamp,
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  const landed = spring({ frame: frame - 70, fps, config: { damping: 8 } });
  const glow = frame >= 70 ? 0.5 + 0.5 * Math.sin((frame - 70) / 5) : 0;
  return (
    <div
      style={{
        padding: "26px 70px 34px",
        borderRadius: 36,
        background: "linear-gradient(160deg, rgba(74,50,34,0.92), rgba(41,26,17,0.95))",
        border: `3px solid ${COLORS.gold}`,
        boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 ${20 + 40 * glow}px rgba(246,223,160,${0.25 + 0.35 * glow})`,
        fontFamily: FONT,
        textAlign: "center",
        direction: "rtl",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 120}px) scale(${1 + 0.06 * landed * (1 - Math.min(1, (frame - 70) / 20))})`,
      }}
    >
      <div style={{ color: COLORS.cream, fontWeight: 700, fontSize: 52 }}>בשווי</div>
      <div
        style={{
          fontWeight: 900,
          fontSize: 132,
          lineHeight: 1.05,
          direction: "ltr",
          fontVariantNumeric: "tabular-nums",
          background: GOLD_GRADIENT,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.55))",
        }}
      >
        ${(Math.round(value / 5000) * 5000).toLocaleString("en-US")}
      </div>
    </div>
  );
};

const ValueSegment: React.FC = () => {
  const frame = useCurrentFrame();
  const length = VALUE.to - VALUE.from;
  // Slide out to the left, revealing the market footage underneath.
  const out = interpolate(frame, [length, length + EXIT], [0, 1], { ...clamp, easing: (x) => x * x });
  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${-out * 1080}px)`,
        filter: `blur(${out * 20}px)`,
        backgroundColor: COLORS.brown,
      }}
    >
      <Sequence durationInFrames={64} layout="none">
        <Shot at={SHOTS.sofa} rate={0.7} zoom={[1.18, 1.04]} />
      </Sequence>
      <Sequence from={60} layout="none">
        <AbsoluteFill style={{ opacity: interpolate(frame, [60, 66], [0, 1], clamp) }}>
          <Shot at={SHOTS.mirror} rate={0.55} zoom={[1.05, 1.16]} />
        </AbsoluteFill>
      </Sequence>
      <LightLeak intensity={0.4} seed={5} />
      <ShineSweep start={72} duration={26} opacity={0.4} />
      <Vignette />
      <Scrim from="bottom" height={50} opacity={0.85} />
      <Scrim from="top" height={22} opacity={0.6} />
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Tag delay={4} size={52}>
          דירה יוקרתית חדשה בירושלים
        </Tag>
      </div>
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <ValueCard />
      </div>
      <Particles count={36} seed="value" size={11} />
    </AbsoluteFill>
  );
};

export const DreamRaffleMarket: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    {/* The original video and its sound, scaled from 720x1280. */}
    <OffthreadVideo src={staticFile(MAIN)} style={{ width: "100%", height: "100%" }} />
    <LogoPatch />
    <Sequence name="New opening" durationInFrames={INTRO_END + 6}>
      <Intro />
    </Sequence>
    <Sequence name="Flash into the market" from={INTRO_END - 3} durationInFrames={16}>
      <Flash />
    </Sequence>
    <Sequence name="Value segment" from={VALUE.from} durationInFrames={VALUE.to - VALUE.from + EXIT}>
      <Enter type="whip">
        <ValueSegment />
      </Enter>
    </Sequence>
    <Sequence name="Whip streak" from={VALUE.from} durationInFrames={10}>
      <WhipStreak />
    </Sequence>
  </AbsoluteFill>
);
