import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CornerBadge,
  CutFlash,
  GoldText,
  NinthYearBadge,
  Panel,
  PosterBackdrop,
  Sfx,
  TopBanner,
  WhiteText,
} from "../DreamLottery/components";
import { SceneCTA } from "../DreamLottery/scenes";
import { COLORS, FACTS, FONT, MEDIA } from "../DreamLottery/theme";

export const WINNER_FPS = 30;

// The winning moment: the first 15.5s of the draw video, cropped to the TV
// screen it was filmed from (the call to the winner, his walk to the
// apartment door, and the "meet the winner" card). Landscape 1080x558.
export const WINNER_CLIP = {
  file: "dream/winner.mp4" as string | null,
  from: 0,
  duration: 465,
};

const SCENES = [
  { name: "Winning moment", duration: WINNER_CLIP.duration },
  { name: "You can too", duration: 150 },
  { name: "Offer", duration: 165 },
  { name: "CTA", duration: 186 },
];
export const WINNER_DURATION = SCENES.reduce((s, x) => s + x.duration, 0);

// Gold and white confetti falling over the winner.
const Confetti: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame() - at;
  if (frame < 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 70 }, (_, i) => {
        const x = random(`x${i}`) * 1080;
        const speed = 9 + random(`s${i}`) * 10;
        const y = -60 + frame * speed - random(`d${i}`) * 500;
        const spin = frame * (4 + random(`r${i}`) * 10);
        const color = [COLORS.gold, COLORS.goldLight, COLORS.white, COLORS.red][
          i % 4
        ];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin((frame + i * 9) / 9) * 30,
              top: y,
              width: 18,
              height: 30,
              background: color,
              borderRadius: 4,
              transform: `rotate(${spin}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Stand-in until the draw video is in public/.
const Placeholder: React.FC = () => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1a1a1a",
      border: "8px dashed rgba(255,255,255,0.3)",
    }}
  >
    <WhiteText size={70}>כאן ייכנס רגע הזכייה</WhiteText>
    <WhiteText size={40} weight={400}>
      (מתוך סרטון ההגרלה)
    </WhiteText>
  </AbsoluteFill>
);

// 1 — The winner hears the news.
const SceneWin: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06]);
  const clip = WINNER_CLIP.file ? (
    <OffthreadVideo
      src={staticFile(WINNER_CLIP.file)}
      trimBefore={WINNER_CLIP.from}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : (
    <Placeholder />
  );
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.deep }}>
      {/* Blurred copy fills the vertical frame behind the landscape clip. */}
      {WINNER_CLIP.file ? (
        <AbsoluteFill style={{ filter: "blur(30px) brightness(0.45)" }}>
          <OffthreadVideo
            src={staticFile(WINNER_CLIP.file)}
            trimBefore={WINNER_CLIP.from}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 690,
          left: 0,
          width: 1080,
          height: 558,
          overflow: "hidden",
          borderTop: `6px solid ${COLORS.gold}`,
          borderBottom: `6px solid ${COLORS.gold}`,
          boxShadow: "0 0 70px rgba(232,182,74,0.45)",
        }}
      >
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          {clip}
        </AbsoluteFill>
      </div>
      <TopBanner at={6} until={140} gold={false}>
        רגע הזכייה!
      </TopBanner>
      <TopBanner at={144} until={330}>
        בדרך לדירה החדשה בירושלים
      </TopBanner>
      <TopBanner at={334} until={durationInFrames}>
        הזוכה של הגרלת החלומות 8!
      </TopBanner>
      <div
        style={{
          position: "absolute",
          top: 1300,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <GoldText size={84} delay={150}>
          השנה – זה יכול להיות אתה!
        </GoldText>
      </div>
      <Confetti at={110} />
      <CornerBadge />
      <Sfx src={MEDIA.chime} at={110} volume={0.5} />
      <Sfx src={MEDIA.pop} at={144} volume={0.4} />
      <Sfx src={MEDIA.pop} at={334} volume={0.4} />
    </AbsoluteFill>
  );
};

// 2 — "You too can move to Jerusalem, just like him."
const SceneYouToo: React.FC = () => (
  <AbsoluteFill>
    <PosterBackdrop />
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", gap: 30 }}
    >
      <GoldText size={150} delay={0}>
        גם אתה
      </GoldText>
      <WhiteText size={86} delay={10}>
        יכול לעבור לגור
        <br />
        בירושלים
      </WhiteText>
      <GoldText size={120} delay={26}>
        בדיוק כמוהו!
      </GoldText>
    </AbsoluteFill>
    <Sfx src={MEDIA.rumble} at={0} volume={0.8} />
    <Sfx src={MEDIA.pop} at={26} />
  </AbsoluteFill>
);

// 3 — This year's prize and offers.
const SceneOffer: React.FC = () => (
  <AbsoluteFill>
    <PosterBackdrop />
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", gap: 34 }}
    >
      <NinthYearBadge size={300} delay={0} />
      <Panel delay={12} style={{ width: 920 }}>
        <WhiteText size={62} delay={16}>
          דירת יוקרה חדשה בירושלים
        </WhiteText>
        <GoldText size={110} delay={22}>
          {FACTS.prize}
        </GoldText>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 52,
            color: COLORS.white,
            backgroundColor: COLORS.red,
            padding: "8px 36px",
            borderRadius: 60,
          }}
        >
          מרוהטת לגמרי!
        </div>
      </Panel>
      <Panel delay={50} style={{ width: 920 }}>
        <GoldText size={100} delay={54}>
          1+1 מתנה
        </GoldText>
        <WhiteText size={50} delay={58}>
          על הכרטיסים
        </WhiteText>
        <WhiteText size={50} delay={62}>
          בונוס {FACTS.bonus}
          <br />
          למצטרפים עד {FACTS.bonusDeadline}
        </WhiteText>
      </Panel>
    </AbsoluteFill>
    <Sfx src={MEDIA.rumble} at={0} volume={0.7} />
    <Sfx src={MEDIA.pop} at={12} />
    <Sfx src={MEDIA.pop} at={50} />
  </AbsoluteFill>
);

const COMPONENTS = [SceneWin, SceneYouToo, SceneOffer, SceneCTA];

export const DreamWinner: React.FC = () => {
  let from = 0;
  const winEnd = WINNER_CLIP.duration;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.deep,
        direction: "rtl",
        fontFamily: FONT,
      }}
    >
      {/* Music stays low under the winner's real reaction, then lifts. */}
      <Html5Audio
        src={staticFile(MEDIA.music)}
        loop
        volume={(f) =>
          interpolate(
            f,
            [
              0,
              6,
              winEnd - 6,
              winEnd + 6,
              WINNER_DURATION - 30,
              WINNER_DURATION,
            ],
            [0, 0.15, 0.15, 0.6, 0.6, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
      {SCENES.map(({ name, duration }, i) => {
        const Component = COMPONENTS[i];
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
