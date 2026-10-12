import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Disclaimer,
  GoldPill,
  Rise,
  Shade,
  Shot,
  WinnerCard,
} from "./components";
import { COLORS, FONT, GOLD_GRADIENT } from "./theme";

// Winners and quotes from thedreamraffle.co.il/pages/זוכים

// 1 — Hook: the prize up front, before the viewer scrolls past.
export const SceneHook: React.FC = () => (
  <AbsoluteFill>
    <Shot id="01" />
    <Shade />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
      <Rise delay={2} size={46} weight={700} color={COLORS.goldLight}>
        הגרלת החלומות עם ישראל חי
      </Rise>
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 150,
        gap: 26,
      }}
    >
      <Rise delay={8} size={96} weight={900}>
        דירת יוקרה
        <br />
        בירושלים
      </Rise>
      <GoldPill delay={22} size={76}>
        בשווי $1.3 מיליון
      </GoldPill>
    </AbsoluteFill>
    <Disclaimer />
  </AbsoluteFill>
);

export const Scene2018: React.FC = () => (
  <AbsoluteFill>
    <Shot id="02" />
    <Shade />
    <WinnerCard
      year="2018"
      name="דון ויזנבסקי"
      place="הוואי, ארה״ב"
      quote="נדהמתי! לא ידעתי מה לומר!"
    />
  </AbsoluteFill>
);

export const Scene2019: React.FC = () => (
  <AbsoluteFill>
    <Shot id="03" />
    <Shade />
    <WinnerCard
      year="2019"
      name="דוד רוטפליש"
      place="טורונטו, קנדה"
      quote="בעקבות הזכייה – אני עולה לישראל!"
    />
  </AbsoluteFill>
);

export const Scene2020: React.FC = () => (
  <AbsoluteFill>
    <Shot id="04" />
    <Shade />
    <WinnerCard
      year="2020"
      name="מאיר רייכמן"
      place="ווסט אורנג׳, ניו ג׳רזי"
      quote="מעולם לא זכיתי בשום דבר בחיי"
    />
  </AbsoluteFill>
);

const MORE = [
  { year: "2021", name: "מיכאל כהן", place: "סן דייגו" },
  { year: "2022", name: "אסף כהן", place: "שבי דרום" },
  { year: "2023", name: "מאיר פרידמן", place: "ביתר עילית" },
  { year: "2024", name: "משפחת ניסניאן", place: "ניו יורק" },
  { year: "2025", name: "אריה לוריא", place: "ירושלים" },
];

const WinnerRow: React.FC<{
  year: string;
  name: string;
  place: string;
  delay: number;
}> = ({ year, name, place, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        width: 860,
        padding: "16px 30px",
        borderRadius: 22,
        background: "rgba(6,17,31,0.72)",
        border: `2px solid ${COLORS.gold}`,
        fontFamily: FONT,
        opacity: s,
        transform: `translateX(${(1 - s) * 120}px)`,
      }}
    >
      <div
        style={{
          fontSize: 44,
          fontWeight: 900,
          color: COLORS.deep,
          backgroundImage: GOLD_GRADIENT,
          borderRadius: 14,
          padding: "4px 18px",
        }}
      >
        {year}
      </div>
      <div style={{ fontSize: 50, fontWeight: 700, color: COLORS.white }}>
        {name}
      </div>
      <div
        style={{
          fontSize: 38,
          fontWeight: 400,
          color: COLORS.goldLight,
          marginRight: "auto",
        }}
      >
        {place}
      </div>
    </div>
  );
};

// 5 — The rest of the winners roll in, year after year.
export const SceneMore: React.FC = () => (
  <AbsoluteFill>
    <Shot id="05" />
    <AbsoluteFill style={{ backgroundColor: "rgba(6,17,31,0.35)" }} />
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", gap: 20 }}
    >
      <Rise delay={0} size={70} weight={900} style={{ marginBottom: 14 }}>
        והזוכים ממשיכים…
      </Rise>
      {MORE.map((w, i) => (
        <WinnerRow key={w.year} {...w} delay={10 + i * 12} />
      ))}
    </AbsoluteFill>
  </AbsoluteFill>
);

export const SceneNinth: React.FC = () => (
  <AbsoluteFill>
    <Shot id="06" />
    <Shade />
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 60px 150px",
        gap: 24,
      }}
    >
      <GoldPill delay={4} size={80}>
        השנה ה-9 שלנו!
      </GoldPill>
      <Rise delay={14} size={70} weight={900}>
        בואו נוסיף את השם שלכם
        <br />
        לרשימה
      </Rise>
      <Rise delay={30} size={42} weight={400} color={COLORS.goldLight}>
        כרטיס אחד. מאה דרכים לבנות את ארץ ישראל.
      </Rise>
    </AbsoluteFill>
    <Disclaimer />
  </AbsoluteFill>
);

export const SceneDouble: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.04 * Math.sin((frame / 30) * Math.PI * 2);
  return (
    <AbsoluteFill>
      <Shot id="07" />
      <AbsoluteFill style={{ backgroundColor: "rgba(6,17,31,0.3)" }} />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 30 }}
      >
        <Rise delay={0} size={64} weight={700} color={COLORS.goldLight}>
          כל ההזמנות מוכפלות!
        </Rise>
        <div style={{ transform: `scale(${pulse})` }}>
          <GoldPill delay={8} size={150}>
            1+1 מתנה
          </GoldPill>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 8 — Early-bird bonus with its deadline, then the call to action.
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(Math.sin((frame / 20) * Math.PI), [-1, 1], [0.4, 1]);
  return (
    <AbsoluteFill>
      <Shot id="08" />
      <Shade />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 60px",
          gap: 24,
        }}
      >
        <Rise delay={0} size={60} weight={700} color={COLORS.goldLight}>
          הגרלת בונוס למצטרפים מוקדם
        </Rise>
        <GoldPill delay={8} size={110}>
          $15,000 במזומן
        </GoldPill>
        <Rise delay={18} size={52} weight={700}>
          לרוכשים עד ר״ח כסלו (11/11)
        </Rise>
        <Rise delay={32} size={64} weight={900} style={{ marginTop: 30 }}>
          <div
            style={{
              padding: "20px 56px",
              borderRadius: 80,
              border: `4px solid ${COLORS.gold}`,
              boxShadow: `0 0 ${40 * glow}px ${COLORS.gold}`,
              background: "rgba(6,17,31,0.75)",
            }}
          >
            להשתתפות – לחצו עכשיו
          </div>
        </Rise>
        <Rise delay={40} size={40} weight={400} color={COLORS.cream}>
          thedreamraffle.co.il
        </Rise>
      </AbsoluteFill>
      <Disclaimer />
    </AbsoluteFill>
  );
};
