import React from "react";
import { AbsoluteFill, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { OnePlusOne, SuperTicket } from "./badges";
import {
  clamp,
  Fade,
  Flash,
  GoldTitle,
  Headline,
  Key,
  LightRays,
  Particles,
  Photo,
  Shade,
  Spotlight,
  Stack,
  Ticket,
  useSpring,
  Vignette,
} from "./components";
import { Endcard } from "./Endcard";
import SCRIPT from "./script.json";
import { VersionShell } from "./Shell";
import { COLORS, IMG, NAVY_BG, OFFER, useLayout } from "./theme";

// Version 3 – The Next Winner (25s). Music drops on "it could be you" (8s)
// and resolves on the endcard (21s).
export const V3_DURATION = 750;
const SC = { hook: 0, form: 90, you: 240, gift: 360, superT: 510, end: 630 };

const CAPTIONS = SCRIPT.v3;

const CUES = [
  { sfx: "scratch", at: 40, volume: 0.6 },
  { sfx: "ting", at: 50, volume: 0.5 },
  { sfx: "whoosh", at: SC.form, volume: 0.5 },
  { sfx: "shimmer", at: SC.form + 40, volume: 0.5 },
  { sfx: "jingle", at: SC.form + 90, volume: 0.5 },
  { sfx: "heartbeat", at: SC.you, volume: 0.8 },
  { sfx: "heartbeat", at: SC.you + 28, volume: 0.8 },
  { sfx: "jingle", at: SC.you + 50, volume: 0.4 },
  { sfx: "pop", at: SC.gift + 20, volume: 0.6 },
  { sfx: "pop", at: SC.gift + 32, volume: 0.6 },
  { sfx: "pop", at: SC.gift + 40, volume: 0.6 },
  { sfx: "stamp", at: SC.superT + 6, volume: 0.7 },
  { sfx: "whoosh", at: SC.superT + 40, volume: 0.35 },
  { sfx: "whoosh", at: SC.superT + 70, volume: 0.35 },
  { sfx: "shimmer", at: SC.end + 4, volume: 0.4 },
  { sfx: "click", at: SC.end + 34, volume: 0.5 },
];

// Points inside the silhouette (viewBox 200×400) for the particle swarm.
const SIL_POINTS = Array.from({ length: 70 }, (_, i) => {
  if (i < 18) {
    const a = random(`ha${i}`) * Math.PI * 2;
    const r = Math.sqrt(random(`hr${i}`)) * 38;
    return { x: 100 + Math.cos(a) * r, y: 62 + Math.sin(a) * r };
  }
  return { x: 50 + random(`bx${i}`) * 100, y: 125 + random(`by${i}`) * 270 };
});

// Glowing golden silhouette holding out the keys.
export const Silhouette: React.FC<{ height: number; formAt?: number; withKeys?: boolean }> = ({
  height,
  formAt = 0,
  withKeys = true,
}) => {
  const frame = useCurrentFrame();
  const w = height / 2;
  const k = height / 400;
  const gather = interpolate(frame, [formAt, formAt + 45], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const solid = interpolate(frame, [formAt + 30, formAt + 60], [0, 1], clamp);
  const turn = Math.cos(frame / 40) * 0.12 + 0.88; // slow orbit feel
  const glow = 0.7 + 0.3 * Math.sin(frame / 8);
  return (
    <div style={{ position: "relative", width: w, height, transform: `scaleX(${turn})` }}>
      <svg width={w} height={height} viewBox="0 0 200 400" style={{ position: "absolute", inset: 0, overflow: "visible", opacity: solid }}>
        <defs>
          <linearGradient id="silg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FFF6C9" />
            <stop offset="0.5" stopColor="#F7E38D" />
            <stop offset="1" stopColor="#D4AF37" stopOpacity="0.2" />
          </linearGradient>
          <filter id="silglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={10 * glow} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#silglow)" fill="url(#silg)">
          <circle cx="100" cy="62" r="40" />
          <path d="M42 400 L42 205 Q42 125 100 118 Q158 125 158 205 L158 400 Z" />
          {/* arm reaching forward */}
          <path d="M140 170 Q190 185 210 230 L196 240 Q175 205 138 200 Z" />
        </g>
      </svg>
      {withKeys ? (
        <div style={{ position: "absolute", left: 175 * k, top: 225 * k, opacity: solid, transform: `rotate(${Math.sin(frame / 10) * 10}deg)` }}>
          <Key size={110 * k} />
        </div>
      ) : null}
      {SIL_POINTS.map((p, i) => {
        const sx = (random(`sx${i}`) - 0.5) * 1600;
        const sy = (random(`sy${i}`) - 0.5) * 1600;
        const x = (sx + (p.x - sx) * gather) * k;
        const y = (sy + (p.y - sy) * gather) * k;
        const r = (4 + random(`sr${i}`) * 6) * k;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r,
              height: r,
              borderRadius: "50%",
              background: COLORS.goldLight,
              boxShadow: `0 0 ${r * 3}px ${r}px rgba(247,227,141,0.8)`,
              opacity: (1 - solid * 0.7) * Math.min(1, gather * 3 + 0.2),
            }}
          />
        );
      })}
    </div>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { format, height } = useLayout();
  const sp = useSpring(2, 14);
  const sparkle = 0.5 + 0.5 * Math.sin(frame / 5);
  return (
    <AbsoluteFill>
      <Photo src={IMG.living2} from={1.05} to={1.12} filter="brightness(1.05) saturate(1.1)" />
      <Shade top={0.75} bottom={0.4} />
      <Img
        src={staticFile(IMG.hostOpen)}
        style={{
          position: "absolute",
          bottom: 0,
          right: format === "landscape" ? "18%" : "4%",
          height: format === "vertical" ? height * 0.55 : height * 0.8,
          transform: `translateX(${(1 - sp) * 400}px)`,
          filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
        }}
      />
      {/* the empty space he greets */}
      <div
        style={{
          position: "absolute",
          left: format === "landscape" ? "28%" : "12%",
          bottom: format === "vertical" ? height * 0.15 : height * 0.1,
          width: 260,
          height: format === "vertical" ? height * 0.4 : height * 0.6,
          borderRadius: 140,
          border: `4px dashed rgba(212,175,55,${0.4 + 0.4 * sparkle})`,
          background: "radial-gradient(ellipse, rgba(247,227,141,0.25), rgba(247,227,141,0))",
        }}
      />
      <Stack justify="flex-start">
        <Headline size={86} delay={6}>
          רגע...
        </Headline>
        <Headline size={68} delay={40} color={COLORS.goldLight}>
          למי הוא מושיט יד?
        </Headline>
      </Stack>
    </AbsoluteFill>
  );
};

const Form: React.FC = () => {
  const { format, height } = useLayout();
  return (
    <AbsoluteFill>
      <Photo src={IMG.living2} from={1.12} to={1.2} filter="brightness(0.45) saturate(0.8) blur(3px)" />
      <LightRays opacity={0.4} y="55%" />
      <Particles count={30} seed="v3b" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: format === "vertical" ? 200 : 140 }}>
        <Silhouette height={format === "vertical" ? height * 0.48 : height * 0.62} formAt={0} />
      </AbsoluteFill>
      <Stack justify="flex-start">
        <GoldTitle size={110} delay={50}>
          הזוכה של שנה 9
        </GoldTitle>
      </Stack>
      <Vignette />
    </AbsoluteFill>
  );
};

const You: React.FC = () => {
  const frame = useCurrentFrame();
  const { format, height } = useLayout();
  const push = interpolate(frame, [0, 110], [1, 1.55], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const beat = 1 + 0.03 * Math.exp(-((frame % 28) / 5));
  return (
    <AbsoluteFill>
      <Photo src={IMG.living2} from={1.2} to={1.3} filter="brightness(0.4) saturate(0.7) blur(4px)" />
      <LightRays opacity={0.5} y="55%" speed={0.5} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingTop: format === "vertical" ? 200 : 140,
          transform: `scale(${push * beat})`,
          transformOrigin: "62% 62%",
        }}
      >
        <Silhouette height={format === "vertical" ? height * 0.48 : height * 0.62} formAt={-100} />
      </AbsoluteFill>
      <Flash at={0} dur={10} peak={0.6} />
      <Particles count={40} seed="v3c" />
      <Spotlight strength={0.5} />
      <Stack>
        <Headline size={70} delay={4}>
          ...אבל הוא יכול להיות
        </Headline>
        <GoldTitle size={190} delay={18}>
          אתה.
        </GoldTitle>
      </Stack>
    </AbsoluteFill>
  );
};

const Gift: React.FC = () => {
  const frame = useCurrentFrame();
  const { format, t } = useLayout();
  const box = format === "vertical" ? 360 : 280;
  const boxIn = useSpring(0, 12);
  const lid = interpolate(frame, [18, 30], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const t1 = useSpring(28, 10);
  const t2 = useSpring(36, 10);
  const ribbon = `linear-gradient(90deg, transparent 43%, ${COLORS.gold} 43%, #FFF0A8 50%, ${COLORS.gold} 57%, transparent 57%)`;
  return (
    <AbsoluteFill style={{ background: NAVY_BG }}>
      <LightRays opacity={0.5} y="55%" />
      <Particles count={40} seed="v3d" />
      <Stack gap={50 * t}>
        <div style={{ position: "relative", width: box, height: box * 1.15, marginTop: box * 0.6, transform: `scale(${boxIn})` }}>
          {/* tickets springing out */}
          <div style={{ position: "absolute", left: "50%", top: box * 0.2, transform: `translate(-50%, ${-t1 * box * 0.75}px) translateX(${t1 * box * 0.4}px) rotate(${-12 * t1}deg)`, opacity: t1 }}>
            <Ticket width={box * 0.9} />
          </div>
          <div style={{ position: "absolute", left: "50%", top: box * 0.2, transform: `translate(-50%, ${-t2 * box * 0.75}px) translateX(${-t2 * box * 0.4}px) rotate(${12 * t2}deg)`, opacity: t2 }}>
            <Ticket width={box * 0.9} label="מתנה" sub="+1 חינם" free />
          </div>
          {/* box body */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: box * 0.8,
              borderRadius: 18,
              background: `${ribbon}, linear-gradient(180deg, #19B0A6, ${COLORS.emerald} 60%, ${COLORS.emeraldDark})`,
              boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
            }}
          />
          {/* lid */}
          <div
            style={{
              position: "absolute",
              left: -box * 0.06,
              right: -box * 0.06,
              bottom: box * 0.78,
              height: box * 0.22,
              borderRadius: 16,
              background: `${ribbon}, linear-gradient(180deg, #1FC2B6, ${COLORS.emerald})`,
              transform: `translate(${-lid * box * 0.55}px, ${-lid * box * 0.35}px) rotate(${-28 * lid}deg)`,
              opacity: 1 - lid * 0.3,
              boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
            }}
          />
        </div>
        <OnePlusOne delay={44} size={format === "vertical" ? 58 : 50} />
      </Stack>
    </AbsoluteFill>
  );
};

const ROOMS = [IMG.living, IMG.kitchen, IMG.bedroom, IMG.dining, IMG.lounge, IMG.living2, IMG.balcony2, IMG.kitchen];
const Super: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(ROOMS.length - 1, Math.floor(frame / 15));
  return (
    <AbsoluteFill>
      <Photo src={ROOMS[idx]} from={1.08} to={1.0} duration={15} filter="saturate(1.1) brightness(0.85)" />
      <Shade top={0.5} bottom={0.6} />
      <Spotlight strength={0.55} />
      <Stack>
        <div style={{ transform: `scale(${interpolate(frame, [0, 6], [2.6, 1], clamp)}) rotate(${interpolate(frame, [0, 6], [-14, -4], clamp)}deg)` }}>
          <SuperTicket size={64} />
        </div>
        <GoldTitle size={120} delay={20}>
          +{OFFER.superTicket}
        </GoldTitle>
        <Headline size={56} delay={30}>
          לריהוט ולמכשירי חשמל
        </Headline>
      </Stack>
    </AbsoluteFill>
  );
};

export const V3NextWinner: React.FC = () => (
  <VersionShell version="v3" captions={CAPTIONS} cues={CUES} endFrom={SC.end}>
    <Sequence name="Hook" from={SC.hook} durationInFrames={SC.form - SC.hook + 8}>
      <Hook />
    </Sequence>
    <Sequence name="Silhouette forms" from={SC.form} durationInFrames={SC.you - SC.form}>
      <Fade>
        <Form />
      </Fade>
    </Sequence>
    <Sequence name="It could be you" from={SC.you} durationInFrames={SC.gift - SC.you + 8}>
      <You />
    </Sequence>
    <Sequence name="Gift 1+1" from={SC.gift} durationInFrames={SC.superT - SC.gift + 6}>
      <Fade>
        <Gift />
      </Fade>
    </Sequence>
    <Sequence name="Super Ticket" from={SC.superT} durationInFrames={SC.end - SC.superT + 10}>
      <Super />
    </Sequence>
    <Sequence name="Endcard" from={SC.end}>
      <Endcard cta="תמלאו את המקום" />
    </Sequence>
  </VersionShell>
);
