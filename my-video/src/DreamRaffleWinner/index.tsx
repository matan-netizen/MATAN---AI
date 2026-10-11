import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Flash, LightLeak, Particles, Scrim, ShineSweep, Shot, Vignette } from "../DreamRaffle/effects";
import { Chevrons, CtaButton, KineticText, OnePlusOneBadge, PrizeCard, Tag } from "../DreamRaffle/graphics";
import { COLORS, FONT, GOLD_GRADIENT, IMG, SHOTS, URL } from "../DreamRaffle/theme";

// 9:16 sales video for thedreamraffle.co.il built around last year's winner,
// Aryeh Luria (הגרלת החלומות 8). Three clips from the winner interview
// (aryeh-last-years-winner-hebrew.mp4, from 0:27 on) play with their own
// sound, framed, with the site's offer around them:
//   hook  0–4.5s     apartment footage: "הוא זכה בדירה בירושלים. השנה – זה יכול להיות אתם!"
//   clip 1           meet the winner + the $1.3M prize card
//   clip 2           "הפעם – זה יכול להיות אתם!" + 1+1, all orders doubled
//   clip 3           "כרטיס אחד. מאה דרכים לבנות את ארץ ישראל" + where the money goes
//   CTA   6.5s       button, site address, closing logo card on the score's final hit

export const WINNER_FPS = 30;

const INTERVIEW = "dreamraffle/winner/interview.mp4"; // source 27.0–72.6s, 30fps
const OFFSET = 27; // interview.mp4 starts at 0:27 of the original

// The three clips, in original-video seconds. Each one starts and ends on the
// interview's own cuts (or, for the balcony, on a pause at 68.4s), so no
// sentence is cut off.
const CLIPS = [
  { from: 29.56, to: 39.0 }, // at the table, two shots
  { from: 44.12, to: 53.06 }, // at the table, continued
  { from: 56.02, to: 68.35 }, // on the balcony over Jerusalem
];

const HOOK = 135;
const CTA = 195;
const CTA_PRESS = 70;
const END_CARD = 135; // = 25.5s of music.mp3 (its final hit), started at 21s

const clipFrames = CLIPS.map(({ from, to }) => Math.round((to - from) * WINNER_FPS));
const starts: number[] = [];
{
  let t = HOOK;
  for (const n of clipFrames) {
    starts.push(t);
    t += n;
  }
  starts.push(t); // CTA
}
const CTA_FROM = starts[3];
export const WINNER_DURATION = CTA_FROM + CTA;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Center: React.FC<{ top: number; children: React.ReactNode }> = ({ top, children }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    {children}
  </div>
);

const useSpring = (delay: number, damping = 13) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

const SmallLogo: React.FC<{ top?: number; width?: number }> = ({ top = 70, width = 150 }) => {
  const s = useSpring(2, 14);
  return (
    <Center top={top}>
      <Img
        src={staticFile(IMG.logo)}
        style={{ width, opacity: s, transform: `scale(${0.7 + 0.3 * s})`, filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.5))" }}
      />
    </Center>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const Hook: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.brown }}>
    <Sequence durationInFrames={72} layout="none">
      <Shot at={SHOTS.dining} rate={0.8} zoom={[1.0, 1.15]} origin="45% 55%" />
    </Sequence>
    <Sequence from={68} layout="none">
      <Shot at={SHOTS.livingWide} rate={0.8} zoom={[1.05, 1.18]} />
    </Sequence>
    <LightLeak intensity={0.5} seed={3} />
    <ShineSweep start={8} duration={30} opacity={0.35} />
    <Vignette />
    <Scrim from="bottom" height={60} opacity={0.85} />
    <Scrim from="top" height={20} opacity={0.5} />
    <SmallLogo top={150} width={190} />
    <Center top={1080}>
      <KineticText text="הוא *זכה* בדירה / *בירושלים.*" delay={6} size={104} exitAt={70} />
    </Center>
    <Sequence from={74} layout="none">
      <Center top={1080}>
        <KineticText text="השנה – / זה יכול להיות *אתם!*" delay={0} size={104} />
      </Center>
    </Sequence>
    <Particles count={24} seed="whook" size={10} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Interview clips
// ---------------------------------------------------------------------------

const VIDEO = { top: 560, w: 1000, h: 562 };

const ClipFrame: React.FC<{
  index: number;
  headline: string;
  children?: React.ReactNode;
  nameTag?: boolean;
}> = ({ index, headline, children, nameTag }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const clip = CLIPS[index];
  const trim = Math.round((clip.from - OFFSET) * WINNER_FPS);
  const enter = useSpring(0, 14);
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.05], clamp);
  // Short fades on the interview sound so cuts don't click.
  const volume = (f: number) => interpolate(f, [0, 4, durationInFrames - 5, durationInFrames], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.brown }}>
      {/* The same footage, blurred, filling the vertical frame */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile(INTERVIEW)}
          trimBefore={trim}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(28px) brightness(0.45) saturate(1.1)", transform: "scale(1.15)" }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(41,26,17,0.75), rgba(41,26,17,0.2) 35%, rgba(41,26,17,0.2) 60%, rgba(41,26,17,0.85))` }} />
      <Particles count={20} seed={`clip${index}`} size={9} />
      <SmallLogo />
      <Center top={260}>
        <KineticText text={headline} delay={4} size={78} />
      </Center>
      {/* The clip, in a gold frame, with its own sound */}
      <div
        style={{
          position: "absolute",
          left: (1080 - VIDEO.w) / 2,
          top: VIDEO.top,
          width: VIDEO.w,
          height: VIDEO.h,
          borderRadius: 28,
          overflow: "hidden",
          border: `5px solid ${COLORS.gold}`,
          boxShadow: "0 0 40px rgba(212,175,55,0.35), 0 24px 60px rgba(0,0,0,0.6)",
          opacity: enter,
          transform: `scale(${0.92 + 0.08 * enter})`,
        }}
      >
        <OffthreadVideo
          src={staticFile(INTERVIEW)}
          trimBefore={trim}
          volume={volume}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }}
        />
        {nameTag ? <NameTag /> : null}
      </div>
      {children}
    </AbsoluteFill>
  );
};

// When the winner is on screen in clip 1 (clip frames): the opening two-shot
// (29.56–33.34s), and after the camera pans from his host to him (37.6s on).
const WINNER_ON_SCREEN: [number, number][] = [
  [18, 108],
  [242, 400],
];

const NameTag: React.FC = () => {
  const frame = useCurrentFrame();
  const window = WINNER_ON_SCREEN.find(([a, b]) => frame >= a - 2 && frame < b);
  const s = useSpring(window ? window[0] : 0, 14);
  if (!window) return null;
  const out = interpolate(frame, [window[1] - 8, window[1]], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 24, // the winner sits on the left in these shots
        bottom: 24,
        direction: "rtl",
        fontFamily: FONT,
        transform: `translateX(${(1 - s) * -420}px)`,
        opacity: s * out,
      }}
    >
      <div style={{ background: GOLD_GRADIENT, color: COLORS.brown, fontWeight: 900, fontSize: 44, padding: "6px 26px", borderRadius: "16px 16px 0 16px" }}>
        אריה לוריא
      </div>
      <div style={{ background: "rgba(41,26,17,0.88)", color: COLORS.cream, fontWeight: 700, fontSize: 30, padding: "6px 22px", borderRadius: "0 0 16px 16px" }}>
        הזוכה בהגרלת החלומות 8
      </div>
    </div>
  );
};

const OfferDoubled: React.FC = () => {
  const s = useSpring(30, 13);
  return (
    <div style={{ position: "absolute", top: 1200, left: 40, right: 40, display: "flex", alignItems: "center", gap: 30, direction: "rtl" }}>
      <OnePlusOneBadge delay={22} size={330} />
      <div style={{ flex: 1, fontFamily: FONT, color: COLORS.white, opacity: s, transform: `translateX(${(1 - s) * -80}px)` }}>
        <div style={{ fontWeight: 900, fontSize: 60, lineHeight: 1.1 }}>קונים כרטיס אחד</div>
        <div style={{ fontWeight: 900, fontSize: 60, lineHeight: 1.1, color: COLORS.goldLight }}>ומקבלים עוד אחד במתנה!</div>
        <div style={{ marginTop: 22 }}>
          <Tag delay={44} size={40}>
            כל ההזמנות מוכפלות!
          </Tag>
        </div>
      </div>
    </div>
  );
};

const CAUSES = [
  { img: IMG.soldiers, label: 'חיילי צה"ל' },
  { img: IMG.emergency, label: "ציוד חירום לחזית" },
  { img: "dreamraffle/torah.jpg", label: "מוסדות תורה" },
];

const Causes: React.FC = () => (
  <div style={{ position: "absolute", top: 1210, left: 30, right: 30, display: "flex", justifyContent: "space-between", direction: "rtl" }}>
    {CAUSES.map(({ img, label }, i) => (
      <CauseCard key={label} img={img} label={label} delay={24 + i * 10} />
    ))}
  </div>
);

const CauseCard: React.FC<{ img: string; label: string; delay: number }> = ({ img, label, delay }) => {
  const s = useSpring(delay, 12);
  return (
    <div
      style={{
        width: 320,
        padding: 10,
        borderRadius: 24,
        background: GOLD_GRADIENT,
        boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
        opacity: s,
        transform: `translateY(${(1 - s) * 140}px) rotate(${(1 - s) * 6}deg)`,
      }}
    >
      <Img src={staticFile(img)} style={{ width: "100%", height: 230, objectFit: "cover", borderRadius: 16, display: "block" }} />
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 36, color: COLORS.brown, textAlign: "center", padding: "8px 0 4px", direction: "rtl" }}>
        {label}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Call to action
// ---------------------------------------------------------------------------

const UrlPill: React.FC<{ delay: number; size?: number }> = ({ delay, size = 62 }) => {
  const s = useSpring(delay, 12);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        direction: "ltr",
        color: COLORS.brown,
        background: COLORS.cream,
        border: `4px solid ${COLORS.gold}`,
        borderRadius: 999,
        padding: `${size * 0.18}px ${size * 0.6}px`,
        boxShadow: "0 0 30px rgba(246,223,160,0.6), 0 12px 30px rgba(0,0,0,0.45)",
        transform: `scale(${s})`,
      }}
    >
      {URL}
    </div>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const mascot = useSpring(26, 14);
  const end = interpolate(frame, [END_CARD, END_CARD + 10], [0, 1], clamp);
  const endLogo = useSpring(END_CARD + 2, 10);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.brown }}>
      <Sequence durationInFrames={100} layout="none">
        <Shot at={SHOTS.livingWide} rate={0.75} zoom={[1.0, 1.12]} />
      </Sequence>
      <Sequence from={96} layout="none">
        <Shot at={SHOTS.chess} rate={0.9} zoom={[1.05, 1.2]} />
      </Sequence>
      <AbsoluteFill style={{ background: "rgba(25,15,8,0.5)" }} />
      <LightLeak intensity={0.3} seed={7} />
      <Vignette strength={0.7} />
      <SmallLogo top={150} width={180} />
      <Center top={430}>
        <KineticText text="היכנסו *עכשיו* / והבטיחו את הכרטיס שלכם!" delay={6} size={84} exitAt={END_CARD - 6} />
      </Center>
      <div style={{ opacity: 1 - end }}>
        <Center top={720}>
          <UrlPill delay={20} />
        </Center>
        <Center top={850}>
          <Chevrons delay={30} />
        </Center>
        <Center top={960}>
          <CtaButton delay={28} pressAt={CTA_PRESS} label="כניסה להגרלה" />
        </Center>
        <Img
          src={staticFile(IMG.mascot)}
          style={{
            position: "absolute",
            left: 10,
            bottom: -60,
            height: 820,
            transform: `translateY(${(1 - mascot) * 900}px)`,
            filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.6))",
          }}
        />
      </div>
      <Particles count={28} seed="wcta" size={10} />
      {/* Closing card on the score's final hit */}
      <AbsoluteFill
        style={{
          opacity: end,
          background: `radial-gradient(circle at 50% 40%, ${COLORS.brownMid}, ${COLORS.brown} 75%)`,
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
        }}
      >
        <Particles count={50} seed="wend" size={12} />
        <Img src={staticFile(IMG.logo)} style={{ width: 460, transform: `scale(${endLogo})`, filter: "drop-shadow(0 0 40px rgba(246,223,160,0.45))" }} />
        <Tag delay={END_CARD + 8} size={54}>
          1+1 מתנה על כל הכרטיסים
        </Tag>
        <UrlPill delay={END_CARD + 12} size={66} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------

const SFX: { file: string; from: number; volume: number }[] = [
  { file: "chime", from: 8, volume: 0.35 },
  ...starts.map((s) => ({ file: "whoosh", from: s - 5, volume: 0.6 })),
  { file: "chime", from: starts[0] + 20, volume: 0.3 },
  { file: "chime", from: starts[1] + 24, volume: 0.3 },
  { file: "chime", from: starts[2] + 24, volume: 0.3 },
  { file: "click", from: CTA_FROM + CTA_PRESS, volume: 0.9 },
];

export const DreamRaffleWinner: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.brown, direction: "rtl", fontFamily: FONT }}>
    {/* Score from the DreamRaffle promo: its build and drop (3s on) under the
        hook, and its CTA section (21s on, final hit at 25.5s) under the call
        to action. Levels match the interview sound. */}
    <Sequence durationInFrames={HOOK + 6} layout="none">
      <Html5Audio
        src={staticFile("dreamraffle/audio/music.mp3")}
        trimBefore={3 * WINNER_FPS}
        volume={(f) => interpolate(f, [0, 6, HOOK - 8, HOOK + 4], [0, 1, 1, 0], clamp)}
      />
    </Sequence>
    <Sequence from={CTA_FROM - 6} layout="none">
      <Html5Audio
        src={staticFile("dreamraffle/audio/music.mp3")}
        trimBefore={21 * WINNER_FPS - 6}
        volume={(f) => interpolate(f, [0, 8, CTA + 6 - 10, CTA + 6], [0, 0.55, 0.55, 0], clamp)}
      />
    </Sequence>
    {SFX.map(({ file, from, volume }, i) => (
      <Sequence key={i} from={from} layout="none">
        <Html5Audio src={staticFile(`dreamraffle/audio/${file}.mp3`)} volume={volume} />
      </Sequence>
    ))}

    <Sequence name="Hook" durationInFrames={HOOK}>
      <Hook />
    </Sequence>
    <Sequence name="Clip 1: meet the winner" from={starts[0]} durationInFrames={clipFrames[0]}>
      <ClipFrame index={0} headline="הכירו את *הזוכה* / מהשנה שעברה!" nameTag>
        <Center top={1200}>
          <div style={{ transform: "scale(0.86)", transformOrigin: "50% 0%" }}>
            <PrizeCard delay={26} />
          </div>
        </Center>
      </ClipFrame>
    </Sequence>
    <Sequence name="Clip 2: the offer" from={starts[1]} durationInFrames={clipFrames[1]}>
      <ClipFrame index={1} headline="הפעם – זה יכול / להיות *אתם!*">
        <OfferDoubled />
      </ClipFrame>
    </Sequence>
    <Sequence name="Clip 3: the cause" from={starts[2]} durationInFrames={clipFrames[2]}>
      <ClipFrame index={2} headline="כרטיס אחד. מאה דרכים / לבנות את *ארץ* *ישראל*">
        <Causes />
      </ClipFrame>
    </Sequence>
    <Sequence name="CTA" from={CTA_FROM} durationInFrames={CTA}>
      <Cta />
    </Sequence>
    {starts.map((s) => (
      <Sequence key={s} name="Flash" from={s - 3} durationInFrames={16}>
        <Flash />
      </Sequence>
    ))}
  </AbsoluteFill>
);
