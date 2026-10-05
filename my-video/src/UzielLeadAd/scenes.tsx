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
  Logo,
  Pin,
  Rise,
  Shade,
  useEnter,
} from "./components";
import {
  BLUE_GRADIENT,
  COLORS,
  COPPER_GRADIENT,
  FONT_FAMILY,
  img,
  PHONE,
  SAGE_GRADIENT,
  WEBSITE,
} from "./theme";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// 1 — Hook: brand promise over the rooftop render.
export const SceneHook: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const panel = useEnter(28);
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
          top: 330,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
        }}
      >
        <Bubble delay={6} fontSize={78} tail="none">
          בשבילכם זו דירה.
        </Bubble>
        <Bubble delay={34} fontSize={78} variant="copper" tail="right">
          בשבילנו זה בית.
        </Bubble>
      </div>
      {/* White diagonal panel, echoing the brochure cover */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 620,
          background: COLORS.white,
          clipPath: "polygon(0 22%, 100% 0, 100% 100%, 0 100%)",
          transform: `translateY(${(1 - panel) * 640}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 120,
          gap: 18,
        }}
      >
        <Logo size={170} subtitle="בעוזיאל רמת גן" />
      </div>
    </AbsoluteFill>
  );
};

// 2 — Location: aerial with a pin on the tower and nearby amenities.
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
      <Shade background="linear-gradient(180deg, transparent 0%, transparent 38%, rgba(15,25,35,0.82) 62%, rgba(15,25,35,0.95) 100%)" />
      <Pin x={421} y={400} delay={8} />
      <div
        style={{
          position: "absolute",
          top: 1000,
          right: 80,
          left: 80,
          color: COLORS.white,
        }}
      >
        <Rise
          delay={12}
          style={{ fontSize: 46, fontWeight: 700, color: "#9ED8F0" }}
        >
          עוזיאל{" "}
          <span style={{ unicodeBidi: "isolate", direction: "ltr" }}>
            13–15
          </span>{" "}
          · רמת גן
        </Rise>
        <Rise
          delay={18}
          style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.05 }}
        >
          מרכז החיים של רמת גן
        </Rise>
        <Rise
          delay={24}
          style={{ fontSize: 60, fontWeight: 400, marginTop: 6 }}
        >
          תמיד היה כאן.
        </Rise>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 22,
            marginTop: 50,
          }}
        >
          <Chip
            delay={40}
            color={COLORS.copper}
            icon={Icons.train}
            label="קרבה לקו הרכבת הקלה"
          />
          <Chip
            delay={50}
            color={COLORS.blue}
            icon={Icons.road}
            label="נתיבי איילון ודרך השלום"
          />
          <Chip
            delay={60}
            color={COLORS.sage}
            icon={Icons.tree}
            label="פארק הבנים וגינות ציבוריות"
          />
          <Chip
            delay={70}
            color={COLORS.copperDark}
            icon={Icons.cup}
            label="שדרות ירושלים, מסחר ובתי קפה"
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const StatTile: React.FC<{
  value: React.ReactNode;
  label: string;
  bg: string;
  delay: number;
  valueSize?: number;
}> = ({ value, label, bg, delay, valueSize = 66 }) => {
  const s = useEnter(delay, 14);
  return (
    <div
      style={{
        flex: 1,
        background: bg,
        borderRadius: 26,
        padding: "30px 10px",
        textAlign: "center",
        color: COLORS.white,
        fontFamily: FONT_FAMILY,
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
        transform: `translateY(${(1 - s) * 80}px)`,
      }}
    >
      <div
        style={{
          fontSize: valueSize,
          fontWeight: 900,
          lineHeight: 1.05,
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>{label}</div>
    </div>
  );
};

// 3 — The project: tower + boutique buildings, unit mix.
export const SceneProject: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <KenBurns
        src={img("tower-night")}
        x={[66, 58]}
        zoom={[1.0, 1.12]}
        origin="60% 40%"
        durationInFrames={durationInFrames}
      />
      <Shade background="linear-gradient(180deg, rgba(20,15,30,0.85) 0%, rgba(20,15,30,0.35) 26%, transparent 45%, transparent 60%, rgba(10,12,20,0.9) 85%)" />
      <div
        style={{
          position: "absolute",
          top: 150,
          right: 80,
          left: 80,
          color: COLORS.white,
        }}
      >
        <Rise
          delay={4}
          style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.05 }}
        >
          מגדל יוקרה
        </Rise>
        <Rise
          delay={10}
          style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.05 }}
        >
          או בניין בוטיק.
        </Rise>
        <Rise
          delay={20}
          style={{ fontSize: 62, fontWeight: 400, color: "#F3C792" }}
        >
          לכם נותר רק לבחור…
        </Rise>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 150,
          right: 70,
          left: 70,
        }}
      >
        <div style={{ display: "flex", gap: 22 }}>
          <StatTile
            delay={34}
            bg={BLUE_GRADIENT}
            value={
              <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>
                2–5
              </span>
            }
            label="חדרים"
          />
          <StatTile
            delay={42}
            bg={SAGE_GRADIENT}
            value="מיני"
            label="פנטהאוזים"
          />
          <StatTile
            delay={50}
            bg={COPPER_GRADIENT}
            value="פנטהאוז"
            label="יוקרתיים"
            valueSize={52}
          />
        </div>
        <Rise
          delay={62}
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: COLORS.white,
            textAlign: "center",
            marginTop: 30,
          }}
        >
          מרפסות גדולות הצופות לקו הרקיע של גוש דן
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const INTERIORS = [
  { src: "penthouse-living", label: "פנטהאוזים מרווחים ומוארים", x: [30, 60] },
  { src: "apt-3room-a", label: "דירות מעוצבות עם נוף פתוח", x: [20, 45] },
  { src: "lobby-1", label: "לובי מעוצב ברמה הגבוהה ביותר", x: [70, 45] },
  { src: "gym", label: "חדר כושר מתקדם בבניין", x: [55, 80] },
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
        <Bubble delay={6} fontSize={54} variant="copper" tail="left">
          {label}
        </Bubble>
      </div>
    </AbsoluteFill>
  );
};

// 4 — Lifestyle montage of interiors and building amenities.
export const SceneInteriors: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const len = Math.floor(durationInFrames / INTERIORS.length);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.slateDeep }}>
      {INTERIORS.map((it, i) => (
        <Sequence
          key={it.src}
          from={i * len}
          durationInFrames={
            i === INTERIORS.length - 1 ? durationInFrames - i * len : len + 10
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
          style={{ fontSize: 84, fontWeight: 900, color: COLORS.white }}
        >
          לגור ברמה אחרת
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const Counter: React.FC<{ to: number; delay: number; suffix?: string }> = ({
  to,
  delay,
  suffix = "",
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 30], [0, 1], clamp);
  const eased = 1 - Math.pow(1 - p, 3);
  return (
    <>
      {Math.round(to * eased)}
      {suffix}
    </>
  );
};

const TrustTile: React.FC<{
  bg: string;
  delay: number;
  big: React.ReactNode;
  small: string;
}> = ({ bg, delay, big, small }) => {
  const s = useEnter(delay, 14);
  return (
    <div
      style={{
        width: 430,
        height: 300,
        background: bg,
        borderRadius: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.white,
        fontFamily: FONT_FAMILY,
        textAlign: "center",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        transform: `scale(${0.6 + s * 0.4})`,
        opacity: interpolate(s, [0, 0.35], [0, 1], clamp),
      }}
    >
      <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1 }}>{big}</div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          marginTop: 12,
          lineHeight: 1.2,
          padding: "0 20px",
        }}
      >
        {small}
      </div>
    </div>
  );
};

// 5 — Why Kardan: track record and financial strength.
export const SceneTrust: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <KenBurns
        src={img("skyline-sunset")}
        x={[20, 40]}
        zoom={[1.1, 1.0]}
        durationInFrames={durationInFrames}
        filter="saturate(0.9)"
      />
      <Shade background="linear-gradient(180deg, rgba(27,36,43,0.78) 0%, rgba(27,36,43,0.9) 100%)" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 210,
          gap: 30,
        }}
      >
        <Logo size={130} dark />
        <Rise
          delay={8}
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: COLORS.white,
            textAlign: "center",
          }}
        >
          חברה יציבה עם גב כלכלי איתן
        </Rise>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 30,
            width: 900,
            marginTop: 40,
          }}
        >
          <TrustTile
            delay={16}
            bg={BLUE_GRADIENT}
            big={<Counter to={1988} delay={16} />}
            small="פועלת משנת"
          />
          <TrustTile
            delay={24}
            bg={SAGE_GRADIENT}
            big={
              <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>
                +<Counter to={751} delay={24} />
              </span>
            }
            small="מיליון ₪ הון עצמי"
          />
          <TrustTile
            delay={32}
            bg={COPPER_GRADIENT}
            big="בורסה"
            small="חברה ציבורית בת״א"
          />
          <TrustTile
            delay={40}
            bg={`linear-gradient(135deg, ${COLORS.orange}, ${COLORS.copper})`}
            big="יזם"
            small="שהוא גם מבצע"
          />
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

// 6 — Call to action: lead form card.
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const card = useEnter(6, 16);
  const press = interpolate(frame, [86, 92, 100], [1, 0.92, 1], clamp);
  const pulse = 1 + Math.sin(Math.max(0, frame - 100) / 5) * 0.035;
  const arrow = Math.sin(frame / 6) * 16;
  return (
    <AbsoluteFill>
      <KenBurns
        src={img("penthouse-terrace")}
        x={[40, 60]}
        zoom={[1.15, 1.05]}
        durationInFrames={durationInFrames}
        filter="blur(6px) brightness(0.55)"
      />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 130 }}>
        <Rise
          delay={2}
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: COLORS.white,
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          הבית הבא שלכם
        </Rise>
        <Rise
          delay={8}
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "#F3C792",
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          מתחיל כאן
        </Rise>
        <div
          style={{
            marginTop: 60,
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
              וקבלו מחירון ותוכניות דירות
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
            {frame >= 92 ? "✓ נשמח לחזור אליכם" : "לקבלת פרטים ←"}
          </div>
        </div>
        <div
          style={{
            marginTop: 50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: COLORS.white,
            fontFamily: FONT_FAMILY,
            opacity: interpolate(frame, [100, 112], [0, 1], clamp),
          }}
        >
          <div style={{ fontSize: 46, fontWeight: 700 }}>
            לחצו למטה והשאירו פרטים
          </div>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            style={{ transform: `translateY(${arrow}px)`, marginTop: 6 }}
          >
            <path
              d="M12 4v15M5 12l7 7 7-7"
              fill="none"
              stroke="#F3C792"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          fontFamily: FONT_FAMILY,
          color: COLORS.white,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 26,
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          <span style={{ direction: "ltr" }}>{PHONE}</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ direction: "ltr" }}>{WEBSITE}</span>
        </div>
        <div style={{ fontSize: 24, opacity: 0.7 }}>
          ההדמיות להמחשה בלבד. ייתכנו שינויים לפי דרישת הרשויות ו/או החלטת
          החברה.
        </div>
      </div>
    </AbsoluteFill>
  );
};
