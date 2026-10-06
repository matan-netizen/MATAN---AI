import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CornerBadge,
  CutFlash,
  Disclaimer,
  GoldText,
  NinthYearBadge,
  Panel,
  PosterBackdrop,
  Sfx,
  usePop,
  WhiteText,
} from "../DreamLottery/components";
import {
  COLORS,
  FACTS,
  FONT,
  GOLD_GRADIENT,
  MEDIA,
} from "../DreamLottery/theme";
import { Confetti } from "../DreamWinner";

export const THIS_YEAR_FPS = 30;

// "בשנה הזאת – הדירה בירושלים היא שלך!": 28s vertical promo built on the
// draw video (the call to last year's winner, his walk to the apartment,
// the balcony) followed by this year's offer and the CTA.
//
// Optional narration: drop a recording at public/dream/this-year-vo.mp3 and
// set VOICEOVER to its path; the on-screen captions follow the same script
// (docs/dream-this-year-script.md).
const VOICEOVER: string | null = null;

// Landscape clips cut from the draw video (1080x608, 30fps).
const CLIPS = {
  skyline: "dream/draw-skyline.mp4",
  call: "dream/draw-call.mp4",
  door: "dream/draw-door.mp4",
  card: "dream/draw-card.mp4",
  balcony: "dream/draw-balcony.mp4",
};

const CLIP_TOP = 600;

// Footage framed in the middle of the vertical frame, over a blurred copy.
const Clip: React.FC<{ src: string; volume?: number }> = ({
  src,
  volume = 1,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.05]);
  const fade = (f: number) =>
    volume *
    interpolate(
      f,
      [0, 3, durationInFrames - 3, durationInFrames],
      [0, 1, 1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  return (
    <>
      <AbsoluteFill style={{ filter: "blur(30px) brightness(0.4)" }}>
        <OffthreadVideo
          src={staticFile(src)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: CLIP_TOP,
          left: 0,
          width: 1080,
          height: 608,
          overflow: "hidden",
          borderTop: `6px solid ${COLORS.gold}`,
          borderBottom: `6px solid ${COLORS.gold}`,
          boxShadow: "0 0 70px rgba(232,182,74,0.45)",
        }}
      >
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          <OffthreadVideo
            src={staticFile(src)}
            volume={fade}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      </div>
    </>
  );
};

// Subtitle line under the footage; carries the narration script.
const Caption: React.FC<{ children: React.ReactNode; at?: number }> = ({
  children,
  at = 0,
}) => {
  const s = usePop(at, 200);
  return (
    <div
      style={{
        position: "absolute",
        top: CLIP_TOP + 608 + 50,
        left: 50,
        right: 50,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 58,
          lineHeight: 1.25,
          textAlign: "center",
          color: COLORS.white,
          background: "rgba(6,14,32,0.78)",
          border: `3px solid ${COLORS.gold}`,
          borderRadius: 26,
          padding: "20px 36px",
          opacity: s,
          transform: `translateY(${(1 - s) * 30}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Headline above the footage.
const Headline: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      top: 250,
      left: 0,
      right: 0,
      height: CLIP_TOP - 270,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    }}
  >
    {children}
  </div>
);

// 1 — Hook: Jerusalem, then the call to the winner.
const SceneHook: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={40} layout="none">
      <Clip src={CLIPS.skyline} volume={0} />
    </Sequence>
    <Sequence from={40} layout="none">
      <Clip src={CLIPS.call} />
      <Caption>רגע ההודעה לזוכה...</Caption>
      <Confetti at={93} />
      <Sfx src={MEDIA.chime} at={93} volume={0.45} />
    </Sequence>
    <Headline>
      <WhiteText size={96} delay={0}>
        בשנה הזאת –
      </WhiteText>
      <GoldText size={150} delay={14}>
        זה קורה לך!
      </GoldText>
    </Headline>
    <CornerBadge />
    <Sfx src={MEDIA.rumble} at={14} volume={0.7} />
  </AbsoluteFill>
);

// 2 — Social proof: last year's winner and his new home.
const SceneProof: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={135} layout="none">
      <Clip src={CLIPS.door} volume={0.4} />
      <Caption>אריה כבר קיבל את המפתחות...</Caption>
    </Sequence>
    <Sequence from={135} durationInFrames={78} layout="none">
      <Clip src={CLIPS.card} volume={0.4} />
      <Caption>...לדירה החדשה שלו בירושלים!</Caption>
    </Sequence>
    <Sequence from={213} layout="none">
      <Clip src={CLIPS.balcony} volume={0.3} />
      <Caption>החלום שלו התגשם – והשנה התור שלך!</Caption>
    </Sequence>
    <Headline>
      <GoldText size={120} delay={0}>
        אריה לוריא
      </GoldText>
      <WhiteText size={62} delay={8}>
        הזוכה של הגרלת החלומות 8
      </WhiteText>
    </Headline>
    <CornerBadge />
  </AbsoluteFill>
);

// 3 — This year's prize and the 1+1 offer.
const SceneOffer: React.FC = () => (
  <AbsoluteFill>
    <PosterBackdrop />
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", gap: 34 }}
    >
      <NinthYearBadge size={280} delay={0} />
      <WhiteText size={70} delay={8}>
        השנה – הגרלת החלומות ה־9
      </WhiteText>
      <Panel delay={18} style={{ width: 920 }}>
        <WhiteText size={62} delay={22}>
          דירת יוקרה חדשה בירושלים
        </WhiteText>
        <GoldText size={150} delay={28}>
          $1.3M
        </GoldText>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 50,
            color: COLORS.white,
            backgroundColor: COLORS.red,
            padding: "8px 36px",
            borderRadius: 60,
          }}
        >
          מרוהטת לגמרי!
        </div>
      </Panel>
      <GoldText size={104} delay={70}>
        1+1 מתנה
      </GoldText>
      <WhiteText size={58} delay={76}>
        על כל כרטיס!
      </WhiteText>
    </AbsoluteFill>
    <Sfx src={MEDIA.rumble} at={0} volume={0.7} />
    <Sfx src={MEDIA.pop} at={18} />
    <Sfx src={MEDIA.chime} at={70} volume={0.5} />
  </AbsoluteFill>
);

// The new ninth-year logo, popping in with a slow float.
const Logo: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const s = usePop(delay, 9);
  const float = Math.sin((frame - delay) / 14) * 8;
  return (
    <Img
      src={staticFile("dream/logo-9.png")}
      style={{
        width: 250,
        height: 269,
        maxWidth: "none",
        transform: `translateY(${float}px) scale(${s}) rotate(${(1 - s) * -25}deg)`,
        filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.55))",
      }}
    />
  );
};

const Urgency: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const s = usePop(delay, 9);
  const pulse = 1 + Math.max(0, Math.sin((frame - delay) / 4)) * 0.05;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 52,
        color: COLORS.white,
        backgroundColor: COLORS.red,
        padding: "14px 44px",
        borderRadius: 26,
        boxShadow: `0 0 40px ${COLORS.red}`,
        transform: `scale(${s * pulse})`,
        textAlign: "center",
      }}
    >
      בונוס {FACTS.bonus} – רק עד {FACTS.bonusDeadline}!
    </div>
  );
};

const BuyButton: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const s = usePop(delay, 10);
  const pulse = 1 + Math.max(0, Math.sin((frame - delay) / 5)) * 0.06;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 62,
        color: COLORS.navy,
        backgroundImage: GOLD_GRADIENT,
        padding: "22px 70px",
        borderRadius: 100,
        border: `6px solid ${COLORS.goldLight}`,
        boxShadow: `0 0 ${40 + (pulse - 1) * 600}px ${COLORS.gold}`,
        transform: `scale(${s * pulse})`,
      }}
    >
      לרכישה – הקישור בפרופיל ›
    </div>
  );
};

// 4 — Call to action.
const SceneCTA: React.FC = () => (
  <AbsoluteFill>
    <PosterBackdrop dim={0.65} />
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", gap: 30 }}
    >
      <Logo delay={0} />
      <WhiteText size={70} delay={10}>
        מי יזכה השנה?
      </WhiteText>
      <GoldText size={120} delay={20}>
        אולי זה אתם!
      </GoldText>
      <WhiteText size={64} delay={34}>
        קנו את הכרטיס שלכם עכשיו
      </WhiteText>
      <Urgency delay={46} />
      <BuyButton delay={60} />
      <WhiteText size={42} weight={700} delay={70}>
        thedreamraffle.co.il
      </WhiteText>
    </AbsoluteFill>
    <Disclaimer />
    <Sfx src={MEDIA.pop} at={0} />
    <Sfx src={MEDIA.rumble} at={20} volume={0.6} />
    <Sfx src={MEDIA.pop} at={60} />
  </AbsoluteFill>
);

const SCENES = [
  { name: "Hook", Component: SceneHook, duration: 160 },
  { name: "Winner", Component: SceneProof, duration: 303 },
  { name: "Offer", Component: SceneOffer, duration: 195 },
  { name: "CTA", Component: SceneCTA, duration: 195 },
];
export const THIS_YEAR_DURATION = SCENES.reduce((s, x) => s + x.duration, 0);
const FOOTAGE_END = SCENES[0].duration + SCENES[1].duration;

export const DreamThisYear: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.deep,
        direction: "rtl",
        fontFamily: FONT,
      }}
    >
      {/* Music ducks under the call so the real announcement is heard. */}
      <Html5Audio
        src={staticFile(MEDIA.music)}
        loop
        volume={(f) =>
          interpolate(
            f,
            [
              0,
              6,
              36,
              46,
              150,
              165,
              FOOTAGE_END,
              FOOTAGE_END + 10,
              THIS_YEAR_DURATION - 30,
              THIS_YEAR_DURATION,
            ],
            [0, 0.6, 0.6, 0.12, 0.12, 0.45, 0.45, 0.6, 0.6, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ) * (VOICEOVER ? 0.5 : 1)
        }
      />
      {VOICEOVER ? <Html5Audio src={staticFile(VOICEOVER)} /> : null}
      {SCENES.map(({ name, Component, duration }) => {
        const start = from;
        from += duration;
        return (
          <Sequence
            key={name}
            name={name}
            from={start}
            durationInFrames={duration}
          >
            <Component />
            <CutFlash />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
