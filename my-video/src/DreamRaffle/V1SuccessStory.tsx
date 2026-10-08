import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { SuperTicket, OnePlusOne } from "./badges";
import {
  clamp,
  Fade,
  Flash,
  GoldTitle,
  Headline,
  Key,
  LightRays,
  Nameplate,
  Particles,
  Photo,
  Shade,
  Stack,
  Ticket,
  Spotlight,
  useSpring,
  Vignette,
} from "./components";
import { Endcard } from "./Endcard";
import SCRIPT from "./script.json";
import { VersionShell } from "./Shell";
import { COLORS, IMG, NAVY_BG, OFFER, useLayout } from "./theme";

// Version 1 – The Success Story (28s). Scene starts in frames @30fps;
// scripts/generate-raffle-audio.mjs places the music drop at 8s and the
// resolve at 23s to match.
export const V1_DURATION = 840;
const SC = { hook: 0, winner: 90, year9: 240, double: 390, furnish: 540, end: 690 };

const CAPTIONS = SCRIPT.v1;

const CUES = [
  { sfx: "impact", at: 0, volume: 0.45 },
  { sfx: "jingle", at: SC.winner + 6, volume: 0.5 },
  { sfx: "shimmer", at: SC.winner + 20, volume: 0.5 },
  { sfx: "whoosh", at: SC.year9 - 8, volume: 0.7 },
  { sfx: "impact", at: SC.year9 + 10, volume: 0.6 },
  { sfx: "pop", at: SC.double + 8, volume: 0.6 },
  { sfx: "pop", at: SC.double + 26, volume: 0.6 },
  { sfx: "coins", at: SC.double + 44, volume: 0.45 },
  ...[0, 1, 2, 3, 4].map((i) => ({ sfx: "stamp", at: SC.furnish + i * 28, volume: 0.45 })),
  { sfx: "whoosh", at: SC.end - 8, volume: 0.6 },
  { sfx: "shimmer", at: SC.end + 6, volume: 0.4 },
  { sfx: "click", at: SC.end + 34, volume: 0.5 },
];

const Hook: React.FC = () => (
  <AbsoluteFill>
    <Photo src={IMG.jerusalem} from={1.25} to={1.08} position="40% 50%" filter="saturate(1.1) sepia(0.25) brightness(0.9)" />
    <Shade top={0.7} bottom={0.6} />
    <Particles count={25} seed="v1a" opacity={0.6} />
    <Stack justify="flex-start">
      <GoldTitle size={150} delay={6}>
        לפני שנה...
      </GoldTitle>
      <Headline size={64} delay={26}>
        הוא קנה כרטיס אחד.
      </Headline>
    </Stack>
  </AbsoluteFill>
);

const Winner: React.FC = () => {
  const frame = useCurrentFrame();
  const { format } = useLayout();
  const swing = Math.sin(frame / 9) * 14 * Math.exp(-frame / 60);
  const keyIn = useSpring(4, 12);
  return (
    <AbsoluteFill>
      <Photo src={IMG.jerusalem} from={1.08} to={1.16} position="60% 50%" filter="blur(6px) brightness(0.55) sepia(0.35)" />
      <LightRays opacity={0.35} y="30%" />
      <Particles count={30} seed="v1b" />
      <Stack gap={50}>
        <div style={{ transform: `rotate(${swing}deg) scale(${keyIn})`, transformOrigin: "85% 50%" }}>
          <Key size={format === "vertical" ? 300 : 230} />
        </div>
        <Nameplate title="אריה לוריא" sub="הזוכה של הגרלת החלומות 8 · 2025" width={format === "landscape" ? 900 : 860} delay={14} />
        <Headline size={58} delay={40} color={COLORS.goldLight}>
          נולד בניו יורק · עלה לירושלים
        </Headline>
      </Stack>
      <Vignette />
    </AbsoluteFill>
  );
};

const Year9: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  // Whip-pan in: fast slide with motion blur.
  const x = interpolate(frame, [0, 9], [width * 0.9, 0], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const blur = interpolate(frame, [0, 9], [40, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: `blur(${blur}px)` }}>
        <Photo src={IMG.living} from={1.15} to={1.0} position="40% 50%" filter="saturate(1.1) contrast(1.05) brightness(0.8)" />
      </AbsoluteFill>
      <Shade top={0.75} bottom={0.8} />
      <Spotlight />
      <Flash at={6} dur={14} />
      <Particles count={35} seed="v1c" />
      <Stack>
        <GoldTitle size={140} delay={10}>
          {"שנה 9:\nהתור שלכם"}
        </GoldTitle>
        <Headline size={56} delay={34}>
          דירת יוקרה בירושלים · {OFFER.prize}
        </Headline>
      </Stack>
    </AbsoluteFill>
  );
};

const Double: React.FC = () => {
  const frame = useCurrentFrame();
  const { format } = useLayout();
  const w = format === "vertical" ? 460 : 380;
  const a = useSpring(2, 12);
  const b = useSpring(20, 11);
  const spread = (format === "landscape" ? 300 : 240) * b;
  const float = Math.sin(frame / 14) * 10;
  return (
    <AbsoluteFill style={{ background: NAVY_BG }}>
      <LightRays opacity={0.55} y="42%" />
      <Particles count={40} seed="v1d" />
      <Stack gap={format === "vertical" ? 90 : 50}>
        <div style={{ position: "relative", width: w, height: w * 0.5 + 40 }}>
          <div
            style={{
              position: "absolute",
              transform: `translateX(${spread}px) translateY(${float}px) rotate(${-8 * b}deg) scale(${a})`,
            }}
          >
            <Ticket width={w} />
          </div>
          <div
            style={{
              position: "absolute",
              opacity: b,
              transform: `translateX(${-spread}px) translateY(${-float}px) rotate(${8 * b}deg) rotateY(${(1 - b) * 180}deg)`,
            }}
          >
            <Ticket width={w} label="מתנה" sub="+1 חינם" free />
          </div>
        </div>
        <OnePlusOne delay={40} size={format === "vertical" ? 62 : 52} />
      </Stack>
    </AbsoluteFill>
  );
};

// Stop-motion "furnishing": hard cuts on the beat through the rooms.
const ROOMS = [IMG.living2, IMG.dining, IMG.kitchen, IMG.bedroom, IMG.lounge];
const Furnish: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(ROOMS.length - 1, Math.floor(frame / 28));
  const local = frame - idx * 28;
  const punch = interpolate(local, [0, 6], [1.12, 1.04], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <Photo src={ROOMS[idx]} from={1} to={1.05} duration={28} filter="saturate(1.1)" />
      </AbsoluteFill>
      <Shade top={0.5} bottom={0.85} />
      <Particles count={20} seed="v1e" opacity={0.5} />
      <Stack justify="flex-end">
        <SuperTicket delay={8} />
      </Stack>
    </AbsoluteFill>
  );
};

export const V1SuccessStory: React.FC = () => (
  <VersionShell version="v1" captions={CAPTIONS} cues={CUES} endFrom={SC.end}>
    <Sequence name="Hook" from={SC.hook} durationInFrames={SC.winner - SC.hook + 8}>
      <Hook />
    </Sequence>
    <Sequence name="Winner" from={SC.winner} durationInFrames={SC.year9 - SC.winner}>
      <Fade>
        <Winner />
      </Fade>
    </Sequence>
    <Sequence name="Year 9" from={SC.year9} durationInFrames={SC.double - SC.year9 + 8}>
      <Year9 />
    </Sequence>
    <Sequence name="1+1" from={SC.double} durationInFrames={SC.furnish - SC.double + 8}>
      <Fade>
        <Double />
      </Fade>
    </Sequence>
    <Sequence name="Super Ticket" from={SC.furnish} durationInFrames={SC.end - SC.furnish + 10}>
      <Furnish />
    </Sequence>
    <Sequence name="Endcard" from={SC.end}>
      <Endcard credit="הזוכה של שנה 8: אריה לוריא" />
    </Sequence>
  </VersionShell>
);
