import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Bubble,
  Chip,
  Icons,
  KenBurns,
  Pin,
  Rise,
  Shade,
  useEnter,
} from "./components";
import { COLORS, COPPER_GRADIENT, FONT_FAMILY, img } from "./theme";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const GOLD = "#F3C792";

// Keeps numbers and ranges (e.g. "15%") in their own LTR run inside RTL text.
const Ltr: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>{children}</span>
);

// 1 — Hook: the opportunity, right next to Bnei Brak.
export const SceneHook: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const panel = useEnter(30);
  return (
    <AbsoluteFill>
      <KenBurns
        src={img("hero-rooftop")}
        x={[40, 52]}
        zoom={[1.18, 1.02]}
        durationInFrames={durationInFrames}
      />
      <Shade background="linear-gradient(180deg, rgba(10,25,45,0.45) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.25) 100%)" />
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
        }}
      >
        <Bubble delay={6} fontSize={74} tail="none">
          הזדמנות נדל״נית מנצחת
        </Bubble>
        <Bubble delay={30} fontSize={74} variant="copper" tail="right">
          בלב רמת גן
        </Bubble>
      </div>
      {/* White diagonal panel, echoing the brochure cover */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 600,
          background: COLORS.white,
          clipPath: "polygon(0 22%, 100% 0, 100% 100%, 0 100%)",
          transform: `translateY(${(1 - panel) * 620}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 120,
          fontFamily: FONT_FAMILY,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700, color: COLORS.slate }}>
          מרחק נגיעה
        </div>
        <div
          style={{
            fontSize: 112,
            fontWeight: 900,
            color: COLORS.blue,
            lineHeight: 1.05,
          }}
        >
          מבני ברק! 📍
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 2 — Location: next to Bnei Brak and Givatayim, rental & appreciation upside.
export const SceneLocation: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      {/* objectPosition 39% keeps the project tower at x≈420; the zoom
          origin sits on the tower so the pin stays locked to it. */}
      <KenBurns
        src={img("aerial-day")}
        x={[39, 39]}
        zoom={[1.15, 1.0]}
        origin="39% 22%"
        durationInFrames={durationInFrames}
      />
      <Shade background="linear-gradient(180deg, transparent 0%, transparent 38%, rgba(15,25,35,0.82) 60%, rgba(15,25,35,0.95) 100%)" />
      <Pin x={421} y={400} delay={8} />
      <div
        style={{
          position: "absolute",
          top: 960,
          right: 80,
          left: 80,
          color: COLORS.white,
        }}
      >
        <Rise
          delay={12}
          style={{ fontSize: 50, fontWeight: 700, color: "#9ED8F0" }}
        >
          לוקיישן מרכזי ברמת גן
        </Rise>
        <Rise
          delay={18}
          style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.05 }}
        >
          צמוד לבני ברק
        </Rise>
        <Rise
          delay={24}
          style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.05 }}
        >
          ולגבעתיים
        </Rise>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 22,
            marginTop: 46,
          }}
        >
          <Chip
            delay={40}
            color={COLORS.copper}
            icon={Icons.key}
            label="שכירות זמינה וגבוהה כל השנה"
          />
          <Chip
            delay={52}
            color={COLORS.blue}
            icon={Icons.chart}
            label="פוטנציאל השבחה ארוך טווח"
          />
          <Chip
            delay={64}
            color={COLORS.sage}
            icon={Icons.pin}
            label="לוקיישן שמבטיח ביקוש"
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Counter: React.FC<{ to: number; delay: number; len?: number }> = ({
  to,
  delay,
  len = 30,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + len], [0, 1], clamp);
  const eased = 1 - Math.pow(1 - p, 3);
  return <>{Math.round(to * eased)}</>;
};

// 3 — Financing terms: 15% on signing, the rest on occupancy.
export const SceneFinancing: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const ring = useEnter(10, 18);
  const glow = 0.5 + 0.5 * Math.sin(frame / 8);
  return (
    <AbsoluteFill>
      <KenBurns
        src={img("tower-night")}
        x={[66, 58]}
        zoom={[1.0, 1.12]}
        origin="60% 40%"
        durationInFrames={durationInFrames}
      />
      <Shade background="linear-gradient(180deg, rgba(20,15,30,0.88) 0%, rgba(20,15,30,0.55) 40%, rgba(10,12,20,0.75) 70%, rgba(10,12,20,0.92) 100%)" />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 190 }}>
        <Bubble delay={2} fontSize={60} tail="none">
          תנאי מימון
        </Bubble>
        <Rise
          delay={8}
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: COLORS.white,
            textAlign: "center",
            marginTop: 60,
          }}
        >
          משלמים בחתימה
        </Rise>
        <div
          style={{
            marginTop: 30,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: COPPER_GRADIENT,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.white,
            fontFamily: FONT_FAMILY,
            boxShadow: `0 0 ${60 + glow * 50}px rgba(217,154,69,${0.45 + glow * 0.25})`,
            transform: `scale(${ring})`,
          }}
        >
          <div style={{ fontSize: 230, fontWeight: 900, lineHeight: 1 }}>
            <Ltr>
              <Counter to={15} delay={14} len={24} />%
            </Ltr>
          </div>
          <div style={{ fontSize: 70, fontWeight: 900, marginTop: -6 }}>
            בלבד
          </div>
        </div>
        <Rise
          delay={46}
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: GOLD,
            textAlign: "center",
            marginTop: 70,
          }}
        >
          והיתרה באכלוס!
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SPEC = [
  { src: "skyline-sunset", label: "מגדל יוקרה + בנייני בוטיק", x: [70, 85] },
  { src: "gym", label: "חדר כושר לדיירים", x: [55, 80] },
  { src: "apt-3room-a", label: "מיזוג VRF", x: [20, 45] },
  { src: "penthouse-living", label: "בית חכם", x: [30, 60] },
] as const;

const Slide: React.FC<{
  src: string;
  label: string;
  x: readonly [number, number];
  len: number;
}> = ({ src, label, x, len }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 10], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <KenBurns
        src={img(src)}
        x={[x[0], x[1]]}
        zoom={[1.06, 1.0]}
        durationInFrames={len + 10}
      />
      <div
        style={{
          position: "absolute",
          bottom: 260,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Bubble delay={6} fontSize={64} variant="copper" tail="left">
          ✔ {label}
        </Bubble>
      </div>
    </AbsoluteFill>
  );
};

// 4 — Rich specification montage.
export const SceneSpec: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const len = Math.floor(durationInFrames / SPEC.length);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.slateDeep }}>
      {SPEC.map((it, i) => (
        <Sequence
          key={it.src}
          from={i * len}
          durationInFrames={
            i === SPEC.length - 1 ? durationInFrames - i * len : len + 10
          }
        >
          <Slide src={it.src} label={it.label} x={it.x} len={len} />
        </Sequence>
      ))}
      <Shade background="linear-gradient(180deg, rgba(20,25,30,0.75) 0%, transparent 22%, transparent 75%, rgba(0,0,0,0.45) 100%)" />
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <Rise
          delay={2}
          style={{ fontSize: 92, fontWeight: 900, color: COLORS.white }}
        >
          מפרט עשיר
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

// 5 — Hot pre-sale: 5 special units below market price.
export const ScenePresale: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const badge = useEnter(4, 10);
  const big = useEnter(16, 9);
  const shake = frame > 30 ? Math.sin(frame / 2.2) * 2 : 0;
  return (
    <AbsoluteFill>
      <KenBurns
        src={img("aerial-day")}
        x={[60, 75]}
        zoom={[1.12, 1.0]}
        durationInFrames={durationInFrames}
      />
      <Shade background="linear-gradient(180deg, rgba(27,36,43,0.82) 0%, rgba(27,36,43,0.92) 100%)" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 260,
          fontFamily: FONT_FAMILY,
          color: COLORS.white,
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "linear-gradient(100deg, #E5484D, #B4232A)",
            borderRadius: 999,
            padding: "18px 56px",
            fontSize: 62,
            fontWeight: 900,
            boxShadow: "0 18px 50px rgba(229,72,77,0.45)",
            transform: `scale(${badge}) rotate(${shake}deg)`,
          }}
        >
          🔥 הזדמנות פרי-סייל חמה
        </div>
        <div
          style={{
            fontSize: 520,
            fontWeight: 900,
            lineHeight: 1,
            marginTop: 50,
            background: `linear-gradient(180deg, #FFE7C2 0%, ${COLORS.orange} 60%, ${COLORS.copper} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            transform: `scale(${big})`,
          }}
        >
          5
        </div>
        <Rise delay={28} style={{ fontSize: 86, fontWeight: 900 }}>
          דירות מיוחדות
        </Rise>
        <div style={{ marginTop: 34 }}>
          <Bubble delay={40} fontSize={70} tail="none">
            מתחת למחירי השוק 😉
          </Bubble>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const FormField: React.FC<{ label: string; typed: string; delay: number }> = ({
  label,
  typed,
  delay,
}) => {
  const frame = useCurrentFrame();
  const s = useEnter(delay);
  const chars = Math.floor(
    interpolate(frame, [delay + 8, delay + 26], [0, typed.length], clamp),
  );
  const typing = chars > 0 && chars < typed.length;
  return (
    <div
      style={{
        height: 104,
        borderRadius: 18,
        border: `3px solid ${chars > 0 ? COLORS.blue : "#D5DADF"}`,
        background: "#F7F8F9",
        display: "flex",
        alignItems: "center",
        padding: "0 34px",
        fontSize: 44,
        fontWeight: 700,
        color: chars > 0 ? COLORS.slate : "#98A2AB",
        opacity: s,
        transform: `translateY(${(1 - s) * 30}px)`,
      }}
    >
      {chars > 0 ? typed.slice(0, chars) : label}
      {typing ? <span style={{ color: COLORS.blue }}>|</span> : null}
    </div>
  );
};

// 6 — Call to action: lead form card pointing at the platform's button.
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const card = useEnter(6, 16);
  const press = interpolate(frame, [86, 92, 100], [1, 0.92, 1], clamp);
  const pulse = 1 + Math.sin(Math.max(0, frame - 100) / 5) * 0.035;
  const bounce = Math.abs(Math.sin(frame / 7)) * 26;
  return (
    <AbsoluteFill>
      <KenBurns
        src={img("penthouse-terrace")}
        x={[40, 60]}
        zoom={[1.15, 1.05]}
        durationInFrames={durationInFrames}
        filter="blur(6px) brightness(0.55)"
      />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
        <Rise
          delay={2}
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: COLORS.white,
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          📩 לקבלת תוכניות, מחירון
        </Rise>
        <Rise
          delay={8}
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: GOLD,
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          ופרטים נוספים
        </Rise>
        <div
          style={{
            marginTop: 56,
            width: 900,
            background: COLORS.white,
            borderRadius: 40,
            padding: "56px 60px 60px",
            boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
            fontFamily: FONT_FAMILY,
            transform: `translateY(${(1 - card) * 300}px)`,
            opacity: card,
            display: "flex",
            flexDirection: "column",
            gap: 26,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 62, fontWeight: 900, color: COLORS.navy }}>
              השאירו פרטים עכשיו
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 400,
                color: COLORS.slate,
                marginTop: 8,
              }}
            >
              ונחזור אליכם בהקדם
            </div>
          </div>
          <FormField label="שם מלא" typed="ישראל ישראלי" delay={24} />
          <FormField label="טלפון" typed="050-1234567" delay={48} />
          <div
            style={{
              height: 120,
              borderRadius: 999,
              background: COPPER_GRADIENT,
              color: COLORS.white,
              fontSize: 56,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 18px 40px rgba(201,118,47,0.5)",
              transform: `scale(${press * pulse})`,
              marginTop: 8,
            }}
          >
            {frame >= 92 ? "✓ נשמח לחזור אליכם" : "שליחה ←"}
          </div>
        </div>
        <div
          style={{
            marginTop: 54,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: COLORS.white,
            fontFamily: FONT_FAMILY,
            opacity: interpolate(frame, [96, 108], [0, 1], clamp),
          }}
        >
          <div style={{ fontSize: 84, fontWeight: 900 }}>לחצו כאן</div>
          <div
            style={{
              fontSize: 110,
              lineHeight: 1,
              marginTop: 6,
              transform: `translateY(${bounce}px)`,
            }}
          >
            👇
          </div>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 24,
          color: COLORS.white,
          opacity: 0.7,
        }}
      >
        ההדמיות להמחשה בלבד. ייתכנו שינויים לפי דרישת הרשויות.
      </div>
    </AbsoluteFill>
  );
};
