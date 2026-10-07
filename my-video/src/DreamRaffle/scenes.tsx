import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Badge,
  FinePrint,
  GoldBackdrop,
  KenBurns,
  Logo,
  Mascot,
  Pop,
  Rays,
  Rise,
  Shade,
} from "./components";
import { COLORS, FONT, GOLD_GRADIENT, GOLD_TEXT, IMG, SERIF } from "./theme";

const PHOTO_NOTE = "בתמונות: הדירה מהגרלת החלומות הקודמת";

// 1 — Hook: Jerusalem, the logo and "year nine in a row".
export const SceneHook: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.cocoa }}>
    <KenBurns src={IMG.jerusalem} position="50% 50%" from={1.18} to={1.04} />
    <Shade from={0.2} to={0.95} />
    <Shade from={0.55} to={0.6} top />
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", gap: 40 }}
    >
      <Logo size={560} delay={4} />
      <Badge delay={26} size={56}>
        השנה ה-9 ברציפות!
      </Badge>
      <Rise delay={36} size={50} weight={700}>
        עם קרן &quot;עם ישראל חי&quot;
      </Rise>
    </AbsoluteFill>
  </AbsoluteFill>
);

// Photos that cut from one to the next with a short white flash.
const PhotoCuts: React.FC<{
  shots: { src: string; position?: string }[];
  length: number;
}> = ({ shots, length }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {shots.map((shot, i) => (
        <Sequence
          key={shot.src}
          from={i * length}
          durationInFrames={i === shots.length - 1 ? undefined : length}
          layout="none"
        >
          <KenBurns src={shot.src} position={shot.position} />
          {i > 0 ? (
            <AbsoluteFill
              style={{
                backgroundColor: "white",
                opacity: interpolate(frame - i * length, [0, 6], [0.45, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            />
          ) : null}
        </Sequence>
      ))}
    </>
  );
};

// 2 — The prize: a brand-new luxury apartment in Jerusalem, $1.3M.
export const ScenePrize: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = spring({
    frame: frame - 40,
    fps,
    config: { damping: 30 },
    durationInFrames: 40,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cocoa }}>
      <PhotoCuts
        length={60}
        shots={[
          { src: IMG.living, position: "40% 50%" },
          { src: IMG.balconyView, position: "60% 50%" },
          { src: IMG.living2, position: "45% 50%" },
        ]}
      />
      <Shade from={0.35} to={0.97} />
      <Shade from={0.7} to={0.7} top />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150, gap: 6 }}>
        <Rise delay={4} size={66} weight={700}>
          דירת יוקרה חדשה לגמרי
        </Rise>
        <Rise delay={12} size={110} weight={900} font={SERIF}>
          בירושלים!
        </Rise>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 190,
          gap: 4,
        }}
      >
        <Rise delay={30} size={54} weight={400}>
          בשווי
        </Rise>
        <Pop delay={34}>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 900,
              fontSize: 230,
              lineHeight: 1,
              direction: "ltr",
              ...GOLD_TEXT,
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.6))",
            }}
          >
            ${(1.3 * count).toFixed(1)}M
          </div>
        </Pop>
        <Rise delay={44} size={56} weight={700}>
          1.3 מיליון דולר
        </Rise>
      </AbsoluteFill>
      <FinePrint>{PHOTO_NOTE}</FinePrint>
    </AbsoluteFill>
  );
};

const FURNITURE = ["🛋️ סלון", "🍽️ פינת אוכל", "🛏️ חדרי שינה", "🔌 מוצרי חשמל"];

// 3 — Super Ticket: the apartment comes furnished.
export const SceneSuper: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cocoa }}>
      <PhotoCuts
        length={70}
        shots={[
          { src: IMG.kitchen, position: "45% 50%" },
          { src: IMG.balcony, position: "40% 50%" },
          { src: IMG.living, position: "55% 50%" },
        ]}
      />
      <Shade from={0.25} to={0.97} />
      <Shade from={0.6} to={0.75} top />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 140, gap: 18 }}>
        <Rise delay={2} size={54} weight={700} color={COLORS.goldLight}>
          לראשונה אי פעם
        </Rise>
        <Badge delay={10} size={84}>
          כרטיס סופר
        </Badge>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 170,
          gap: 26,
        }}
      >
        <Rise delay={30} size={64} weight={900}>
          זוכים בדירה – מרוהטת!
        </Rise>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
          }}
        >
          {FURNITURE.map((item, i) => {
            const s = spring({
              frame: frame - 48 - i * 7,
              fps,
              config: { damping: 14 },
            });
            return (
              <div
                key={item}
                style={{
                  fontFamily: FONT,
                  fontSize: 44,
                  fontWeight: 700,
                  color: COLORS.white,
                  background: "rgba(255,255,255,0.12)",
                  border: `2px solid ${COLORS.gold}`,
                  borderRadius: 999,
                  padding: "14px 30px",
                  textAlign: "center",
                  opacity: s,
                  transform: `scale(${0.7 + 0.3 * s})`,
                  whiteSpace: "nowrap",
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
        <Rise delay={84} size={46} weight={400}>
          בשווי{" "}
          <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>
            $25,000
          </span>{" "}
          · תוספת ₪70 בלבד להזמנה
        </Rise>
      </AbsoluteFill>
      <FinePrint>{PHOTO_NOTE}</FinePrint>
    </AbsoluteFill>
  );
};

// 4 — 1+1: every order is doubled.
export const SceneOffer: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.035 * Math.sin(frame * 0.3);
  return (
    <AbsoluteFill>
      <GoldBackdrop />
      <Rays />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 230, gap: 20 }}>
        <Rise delay={2} size={70} weight={900}>
          כל ההזמנות מוכפלות!
        </Rise>
        <Pop delay={12} damping={8} style={{ marginTop: 40 }}>
          <div
            style={{
              transform: `scale(${pulse})`,
              fontFamily: SERIF,
              fontWeight: 900,
              fontSize: 330,
              lineHeight: 1,
              direction: "ltr",
              ...GOLD_TEXT,
              filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.55))",
            }}
          >
            1+1
          </div>
        </Pop>
        <Badge delay={26} size={92}>
          מתנה!
        </Badge>
      </AbsoluteFill>
      <Mascot src={IMG.mascotThumbs} height={980} delay={20} side="left" />
    </AbsoluteFill>
  );
};

// 5 — Early-bird bonus raffle: $15,000 cash until Rosh Chodesh Kislev.
export const SceneBonus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = spring({
    frame: frame - 30,
    fps,
    config: { damping: 30 },
    durationInFrames: 45,
  });
  const sway = Math.sin(frame / 10) * 4;
  return (
    <AbsoluteFill>
      <GoldBackdrop />
      <Rays opacity={0.12} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 170, gap: 10 }}>
        <Badge delay={2} size={54}>
          הגרלת בונוס למצטרפים מוקדם
        </Badge>
        <Pop delay={20} damping={12} style={{ marginTop: 40 }}>
          <Img
            src={staticFile(IMG.cash)}
            style={{
              width: 420,
              transform: `rotate(${sway}deg)`,
              filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))",
            }}
          />
        </Pop>
        <Pop delay={28}>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 900,
              fontSize: 210,
              lineHeight: 1,
              direction: "ltr",
              ...GOLD_TEXT,
              filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.55))",
            }}
          >
            ${Math.round(15 * count)},000
          </div>
        </Pop>
        <Rise delay={40} size={72} weight={900}>
          במזומן!
        </Rise>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 200,
        }}
      >
        <Pop delay={70}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 50,
              color: COLORS.cream,
              border: `3px solid ${COLORS.gold}`,
              borderRadius: 24,
              padding: "22px 40px",
              textAlign: "center",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            ⏳ לרוכשים עד ר&quot;ח כסלו (11/11)
          </div>
        </Pop>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 6 — The cause: "one ticket, a hundred ways to build the Land of Israel".
export const SceneCause: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.cocoa }}>
    <KenBurns src={IMG.balconyView} position="70% 50%" from={1.05} to={1.2} />
    <AbsoluteFill style={{ backgroundColor: "rgba(42,26,16,0.62)" }} />
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", gap: 30 }}
    >
      <Rise delay={4} size={120} weight={900} font={SERIF}>
        כרטיס אחד.
      </Rise>
      <Rise
        delay={30}
        size={86}
        weight={700}
        font={SERIF}
        style={{ ...GOLD_TEXT, padding: "0 60px" }}
      >
        מאה דרכים לבנות
        <br />
        את ארץ ישראל.
      </Rise>
      <Rise delay={50} size={38} weight={400} color={COLORS.cream}>
        כל ההכנסות לפעילות קרן &quot;עם ישראל חי&quot;
      </Rise>
    </AbsoluteFill>
  </AbsoluteFill>
);

// 7 — Call to action: buy a ticket on the site.
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btn = spring({ frame: frame - 30, fps, config: { damping: 10 } });
  const pulse = 1 + 0.045 * Math.sin(frame * 0.25);
  const ring = (frame % 40) / 40;
  return (
    <AbsoluteFill>
      <GoldBackdrop />
      <Rays opacity={0.1} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 110, gap: 14 }}>
        <Logo size={430} delay={0} />
        <Rise delay={12} size={58} weight={900}>
          כרטיס ב-₪660 · 1+1 מתנה
        </Rise>
        <Rise delay={20} size={42} weight={400} color={COLORS.cream}>
          ההגרלה: 11.3.2027 · ב׳ באדר ב׳ תשפ״ז
        </Rise>
        <Rise delay={24} size={34} weight={400} color={COLORS.cream}>
          בירושלים, בשידור חי
        </Rise>
        <div style={{ height: 50 }} />
        <div
          style={{ position: "relative", transform: `scale(${btn * pulse})` }}
        >
          <div
            style={{
              position: "absolute",
              inset: -10,
              borderRadius: 999,
              border: `5px solid ${COLORS.goldLight}`,
              opacity: (1 - ring) * btn,
              transform: `scale(${1 + ring * 0.25})`,
            }}
          />
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 74,
              color: COLORS.cocoa,
              backgroundImage: GOLD_GRADIENT,
              borderRadius: 999,
              padding: "30px 80px",
              boxShadow: "0 18px 44px rgba(0,0,0,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            🎟️ לרכישת כרטיס
          </div>
        </div>
        <Rise
          delay={44}
          size={54}
          weight={700}
          color={COLORS.goldLight}
          style={{ direction: "ltr", marginTop: 24 }}
        >
          thedreamraffle.co.il
        </Rise>
      </AbsoluteFill>
      <Mascot
        src={IMG.mascotPointing}
        height={820}
        delay={16}
        side="right"
        bottom={-40}
      />
    </AbsoluteFill>
  );
};
