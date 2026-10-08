import React from "react";
import { AbsoluteFill, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { OnePlusOne } from "./badges";
import {
  clamp,
  Fade,
  Flash,
  GoldTitle,
  Headline,
  LightRays,
  Particles,
  Photo,
  Pill,
  Shade,
  Stack,
  Ticket,
  useSpring,
  Vignette,
} from "./components";
import { Endcard } from "./Endcard";
import SCRIPT from "./script.json";
import { VersionShell } from "./Shell";
import { DuskSky, PENTHOUSE, Skyline } from "./Skyline";
import { COLORS, FONT, GOLD_METAL, IMG, OFFER, useLayout } from "./theme";

// Version 2 – Eyes on the Dream (25s). Music: choir on the penthouse (7s),
// groove from 17s, resolve 21s (scripts/generate-raffle-audio.mjs).
export const V2_DURATION = 750;
const SC = { hook: 0, host: 90, penthouse: 210, early: 360, double: 510, end: 630 };

const CAPTIONS = SCRIPT.v2;

const CUES = [
  { sfx: "riser", at: SC.penthouse - 75, volume: 0.35 },
  { sfx: "whoosh", at: SC.host - 6, volume: 0.5 },
  { sfx: "impact", at: SC.penthouse, volume: 0.7 },
  { sfx: "choir", at: SC.penthouse, volume: 0.35 },
  { sfx: "shimmer", at: SC.penthouse + 50, volume: 0.45 },
  { sfx: "whoosh", at: SC.early - 6, volume: 0.6 },
  { sfx: "tick", at: SC.early + 20, volume: 0.5 },
  { sfx: "coins", at: SC.early + 30, volume: 0.5 },
  { sfx: "tick", at: SC.early + 80, volume: 0.5 },
  { sfx: "whoosh", at: SC.double - 4, volume: 0.7 },
  { sfx: "pop", at: SC.double + 20, volume: 0.5 },
  { sfx: "impact", at: SC.end, volume: 0.5 },
  { sfx: "click", at: SC.end + 34, volume: 0.5 },
];

const Hook: React.FC = () => {
  const { format } = useLayout();
  return (
    <AbsoluteFill>
      <Photo
        src={IMG.jerusalem}
        from={1.3}
        to={1.3}
        driftY={format === "landscape" ? 120 : 220}
        position="45% 80%"
        filter="brightness(0.6) sepia(0.55) saturate(1.5) hue-rotate(-12deg)"
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(19,40,92,0.85) 0%, rgba(91,58,110,0.35) 45%, rgba(0,0,0,0) 70%)" }} />
      <Particles count={30} seed="v2a" opacity={0.6} speed={1.5} />
      <Stack justify="flex-start">
        <Headline size={84} delay={8}>
          כולם מסתכלים למעלה...
        </Headline>
      </Stack>
      <Vignette />
    </AbsoluteFill>
  );
};

// Host points the way up to the tower.
const Host: React.FC = () => {
  const frame = useCurrentFrame();
  const { format, height } = useLayout();
  const sp = useSpring(4, 13);
  const arrow = interpolate(frame, [20, 60], [0, 1], clamp);
  const hostH = format === "vertical" ? height * 0.55 : height * 0.78;
  return (
    <AbsoluteFill>
      <DuskSky />
      <Skyline glow={0.15 + 0.15 * Math.sin(frame / 6) ** 2} />
      <Particles count={25} seed="v2b" speed={1.5} />
      {/* upward light trail toward the penthouse */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "8%",
          width: 10,
          marginLeft: -5,
          height: `${(1 - PENTHOUSE.y - 0.1) * 100 * arrow}%`,
          background: "linear-gradient(0deg, rgba(247,227,141,0), #F7E38D)",
          boxShadow: "0 0 40px 10px rgba(247,227,141,0.6)",
          borderRadius: 10,
        }}
      />
      <Img
        src={staticFile(IMG.hostFist)}
        style={{
          position: "absolute",
          bottom: format === "vertical" ? 0 : -height * 0.04,
          right: format === "landscape" ? "12%" : "2%",
          height: hostH,
          transform: `translateX(${(1 - sp) * 500}px)`,
          filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
        }}
      />
      <Stack justify="flex-start">
        <Headline size={80} delay={10}>
          כי שם, למעלה...
        </Headline>
        <Pill size={40} delay={24} bg={COLORS.navy}>
          עם ישראל חי
        </Pill>
      </Stack>
    </AbsoluteFill>
  );
};

const Penthouse: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, format } = useLayout();
  const ignite = interpolate(frame, [0, 12], [0.3, 1], clamp);
  const halo = interpolate(frame, [0, 40], [0, 1], clamp);
  const reveal = useSpring(44, 15);
  const cardW = format === "landscape" ? width * 0.36 : width * 0.78;
  return (
    <AbsoluteFill>
      <DuskSky />
      <LightRays x={`${PENTHOUSE.x * 100}%`} y={`${PENTHOUSE.y * 100 + 3}%`} opacity={0.7 * ignite} speed={0.25} />
      <Skyline glow={ignite} />
      {/* halo ring */}
      <div
        style={{
          position: "absolute",
          left: width * PENTHOUSE.x,
          top: height * PENTHOUSE.y + 40,
          width: 10,
          height: 10,
          borderRadius: "50%",
          border: "6px solid rgba(247,227,141,0.9)",
          transform: `translate(-50%, -50%) scale(${halo * 90})`,
          opacity: 1 - halo,
        }}
      />
      <Flash at={0} dur={16} />
      <Particles count={50} seed="v2c" speed={1.2} />
      {/* the apartment, revealed out of the penthouse */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - cardW / 2,
          top: format === "landscape" ? height * 0.1 : height * 0.12,
          width: cardW,
          aspectRatio: "16 / 10",
          borderRadius: 26,
          overflow: "hidden",
          border: `6px solid ${COLORS.gold}`,
          boxShadow: "0 0 80px rgba(247,227,141,0.7), 0 30px 60px rgba(0,0,0,0.6)",
          transform: `translateY(${(1 - reveal) * height * 0.15}px) scale(${0.1 + 0.9 * reveal})`,
          opacity: reveal,
        }}
      >
        <Photo src={IMG.balcony} from={1.0} to={1.1} filter="saturate(1.1)" />
      </div>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: format === "vertical" ? 520 : 170,
          gap: 10,
        }}
      >
        <GoldTitle size={format === "vertical" ? 150 : 120} delay={56}>
          {OFFER.prize}
        </GoldTitle>
        <Headline size={58} delay={70}>
          דירת יוקרה חדשה בירושלים
        </Headline>
        <Headline size={44} delay={80} color={COLORS.goldLight} weight={700}>
          ישר מהקבלן — אליכם
        </Headline>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Coral price tag on a string, swinging into place over a rain of cash.
const Early: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { format, t } = useLayout();
  const swing = 28 * Math.exp(-frame / 28) * Math.cos(frame / 6);
  const drop = useSpring(0, 12);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #2A1630 0%, #0B1F4D 55%, #050E26 100%)" }}>
      {Array.from({ length: 18 }, (_, i) => {
        const x = random(`cx${i}`) * width;
        const speed = 6 + random(`cs${i}`) * 8;
        const y = -200 + ((frame - 15) * speed + random(`cy${i}`) * height) % (height + 300);
        const rot = frame * (random(`cr${i}`) - 0.5) * 6;
        const sz = 120 + random(`cz${i}`) * 120;
        return frame < 15 ? null : (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: sz * 0.5,
              height: sz * 0.5,
              borderRadius: "50%",
              backgroundImage: GOLD_METAL,
              border: "4px solid #8A6A16",
              transform: `rotateY(${rot * 3}deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: sz * 0.28,
              color: "#6E520F",
              opacity: 0.8,
              boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
            }}
          >
            $
          </div>
        );
      })}
      <Particles count={30} seed="v2d" color="#FFD36B" />
      <Stack gap={36}>
        <div
          style={{
            transformOrigin: "50% -200px",
            transform: `translateY(${(1 - drop) * -600}px) rotate(${swing}deg)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ width: 4, height: 160 * t, background: COLORS.goldLight }} />
          <div
            style={{
              background: `linear-gradient(180deg, #FF6B6B, ${COLORS.coral} 50%, ${COLORS.coralDark})`,
              border: `6px solid ${COLORS.goldLight}`,
              borderRadius: 30,
              padding: `${24 * t}px ${60 * t}px`,
              textAlign: "center",
              fontFamily: FONT,
              color: COLORS.white,
              boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 52 * t }}>הגרלת מוקדמים</div>
            <div style={{ fontWeight: 900, fontSize: (format === "vertical" ? 170 : 140) * t, lineHeight: 1, direction: "ltr" }}>
              {OFFER.earlyBird}
            </div>
            <div style={{ fontWeight: 900, fontSize: 64 * t }}>במזומן</div>
          </div>
        </div>
        <Pill size={50} delay={30} bg={COLORS.navy}>
          {OFFER.earlyBirdDeadline}
        </Pill>
      </Stack>
    </AbsoluteFill>
  );
};

const Double: React.FC = () => {
  const frame = useCurrentFrame();
  const { format, width } = useLayout();
  const sp = useSpring(2, 14);
  return (
    <AbsoluteFill>
      <DuskSky />
      <Skyline glow={0.9} dim={0.35} />
      <LightRays x="50%" y={`${PENTHOUSE.y * 100}%`} opacity={0.35} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: width * 1.2,
            transform: `rotate(-4deg) scaleX(${sp})`,
            background: `linear-gradient(180deg, #19B0A6, ${COLORS.emerald} 50%, ${COLORS.emeraldDark})`,
            borderTop: `6px solid ${COLORS.gold}`,
            borderBottom: `6px solid ${COLORS.gold}`,
            padding: "40px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ display: "flex", gap: 30, transform: `translateY(${Math.sin(frame / 10) * 6}px)` }}>
            <Ticket width={format === "vertical" ? 330 : 280} />
            <Ticket width={format === "vertical" ? 330 : 280} label="מתנה" sub="+1 חינם" free />
          </div>
          <OnePlusOne delay={16} size={format === "vertical" ? 56 : 48} />
        </div>
      </AbsoluteFill>
      <Stack justify="flex-start">
        <Headline size={70} delay={26}>
          אל תישארו מחוץ לתמונה
        </Headline>
      </Stack>
    </AbsoluteFill>
  );
};

export const V2EyesOnDream: React.FC = () => (
  <VersionShell version="v2" captions={CAPTIONS} cues={CUES} endFrom={SC.end}>
    <Sequence name="Hook" from={SC.hook} durationInFrames={SC.host - SC.hook + 8}>
      <Hook />
    </Sequence>
    <Sequence name="Host" from={SC.host} durationInFrames={SC.penthouse - SC.host}>
      <Fade>
        <Host />
      </Fade>
    </Sequence>
    <Sequence name="Penthouse" from={SC.penthouse} durationInFrames={SC.early - SC.penthouse + 8}>
      <Penthouse />
    </Sequence>
    <Sequence name="Early Bird" from={SC.early} durationInFrames={SC.double - SC.early + 6}>
      <Fade inFrames={6}>
        <Early />
      </Fade>
    </Sequence>
    <Sequence name="1+1 banner" from={SC.double} durationInFrames={SC.end - SC.double + 10}>
      <Double />
    </Sequence>
    <Sequence name="Endcard" from={SC.end}>
      <Endcard earlyFirst cta="היכנסו עכשיו">
        <AbsoluteFill style={{ opacity: 0.25 }}>
          <Skyline glow={1} />
        </AbsoluteFill>
        <Shade top={0} bottom={0.4} />
      </Endcard>
    </Sequence>
  </VersionShell>
);
