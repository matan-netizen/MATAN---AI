import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Chip,
  Icons,
  KenBurns,
  Pin,
  Rise,
  Shade,
  useEnter,
} from "../UzielLeadAd/components";
import {
  COLORS,
  FONT_FAMILY,
  GOLD_GRADIENT,
  GREEN_GRADIENT,
  img,
  sec,
} from "./theme";

// Cue times inside each scene follow the pauses in the narration
// (public/mastov/voiceover.mp3), measured from the scene's start.

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const Ltr: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>{children}</span>
);

type TagProps = {
  children: React.ReactNode;
  delay?: number;
  variant?: "green" | "gold" | "red";
  fontSize?: number;
  style?: React.CSSProperties;
};

// Brand tag: a green or gold plate that pops in.
export const Tag: React.FC<TagProps> = ({
  children,
  delay = 0,
  variant = "green",
  fontSize = 64,
  style,
}) => {
  const s = useEnter(delay, 14);
  const bg =
    variant === "green"
      ? GREEN_GRADIENT
      : variant === "gold"
        ? GOLD_GRADIENT
        : "linear-gradient(100deg, #E5484D, #B4232A)";
  return (
    <div
      style={{
        display: "inline-block",
        background: bg,
        color: variant === "gold" ? COLORS.green : COLORS.white,
        fontFamily: FONT_FAMILY,
        fontWeight: 900,
        fontSize,
        lineHeight: 1.2,
        padding: `${fontSize * 0.3}px ${fontSize * 0.6}px`,
        borderRadius: 20,
        border:
          variant === "green"
            ? `3px solid ${COLORS.gold}`
            : "3px solid transparent",
        boxShadow: "0 22px 55px rgba(0,0,0,0.4)",
        textAlign: "center",
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `translateY(${(1 - s) * 50}px) scale(${0.85 + s * 0.15})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const MastovLogo: React.FC<{ width: number }> = ({ width }) => (
  <Img
    src={staticFile("mastov/logo.png")}
    style={{ width, height: "auto", display: "block" }}
  />
);

// 1 — Hook (0–4.3s): hot pre-sale, 5 units below market.
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const five = useEnter(sec(1.6), 9);
  const shake = Math.sin(frame / 2) * (frame < sec(1.4) ? 2.5 : 0);
  return (
    <AbsoluteFill>
      <KenBurns
        src={img("tower-night")}
        x={[66, 58]}
        zoom={[1.15, 1.0]}
        origin="60% 40%"
        durationInFrames={durationInFrames}
      />
      <Shade background="linear-gradient(180deg, rgba(0,20,10,0.55) 0%, rgba(0,20,10,0.35) 35%, rgba(0,20,10,0.88) 70%, rgba(0,20,10,0.95) 100%)" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 330,
          fontFamily: FONT_FAMILY,
          color: COLORS.white,
          textAlign: "center",
        }}
      >
        <div style={{ rotate: `${shake}deg` }}>
          <Tag variant="red" delay={2} fontSize={68}>
            🚨 הזדמנות פרי-סייל חמה
          </Tag>
        </div>
        <div
          style={{
            marginTop: 380,
            display: "flex",
            alignItems: "center",
            gap: 30,
            transform: `scale(${five})`,
            opacity: five,
          }}
        >
          <div
            style={{
              fontSize: 330,
              fontWeight: 900,
              lineHeight: 0.9,
              background: GOLD_GRADIENT,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            5
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1.05,
              textAlign: "right",
            }}
          >
            דירות
            <br />
            מיוחדות
          </div>
        </div>
        <div style={{ marginTop: 30 }}>
          <Tag variant="gold" delay={sec(2.6)} fontSize={70}>
            מתחת למחירי השוק!
          </Tag>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 2 — Project (4.3–11.7s): luxury project in Ramat Gan, next to Bnei Brak.
export const SceneAllocation: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <KenBurns
        src={img("hero-rooftop")}
        x={[38, 55]}
        zoom={[1.2, 1.02]}
        durationInFrames={durationInFrames}
      />
      <Shade background="linear-gradient(180deg, rgba(0,32,14,0.9) 0%, rgba(0,32,14,0.55) 38%, transparent 55%, rgba(0,32,14,0.85) 82%)" />
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 70,
          right: 70,
          color: COLORS.white,
          textAlign: "center",
        }}
      >
        <Rise
          delay={4}
          style={{ fontSize: 60, fontWeight: 700, color: COLORS.gold }}
        >
          בפרויקט
        </Rise>
        <Rise
          delay={10}
          style={{ fontSize: 120, fontWeight: 900, lineHeight: 1.05 }}
        >
          יוקרה
        </Rise>
        <Rise
          delay={16}
          style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.1 }}
        >
          בלב רמת גן
        </Rise>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 210,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        <Tag variant="gold" delay={sec(3.4)} fontSize={68}>
          📍 במרחק נגיעה מבני ברק!
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

// 3 — Location (11.7–18.9s): strategic, next to Bnei Brak and main roads.
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
      <Shade background="linear-gradient(180deg, transparent 0%, transparent 36%, rgba(0,32,14,0.85) 58%, rgba(0,32,14,0.96) 100%)" />
      <Pin
        x={421}
        y={400}
        delay={6}
        colors={[COLORS.greenMid, COLORS.green, COLORS.gold]}
      />
      <div
        style={{
          position: "absolute",
          top: 950,
          right: 80,
          left: 80,
          color: COLORS.white,
        }}
      >
        <Rise
          delay={4}
          style={{ fontSize: 50, fontWeight: 700, color: COLORS.gold }}
        >
          מיקום אסטרטגי
        </Rise>
        <Rise
          delay={10}
          style={{ fontSize: 80, fontWeight: 900, lineHeight: 1.08 }}
        >
          סמוך לבני ברק
        </Rise>
        <Rise
          delay={16}
          style={{ fontSize: 80, fontWeight: 900, lineHeight: 1.08 }}
        >
          ולצירי התחבורה המרכזיים
        </Rise>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 24,
            marginTop: 50,
          }}
        >
          <Chip
            delay={sec(3.4)}
            color={COLORS.green}
            icon={Icons.key}
            label="ביקוש קשיח לשכירות"
          />
          <Chip
            delay={sec(4.9)}
            color={COLORS.goldDark}
            icon={Icons.chart}
            label="רווח הון משמעותי במכירה"
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 4 — Terms intro (18.9–24.6s): unprecedented terms, special pre-sale price.
export const SceneTerms: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <KenBurns
        src={img("penthouse-living")}
        x={[30, 60]}
        zoom={[1.1, 1.0]}
        durationInFrames={durationInFrames}
      />
      <Shade background="linear-gradient(180deg, rgba(0,32,14,0.88) 0%, rgba(0,32,14,0.6) 45%, rgba(0,32,14,0.9) 100%)" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          fontFamily: FONT_FAMILY,
          color: COLORS.white,
          textAlign: "center",
          padding: "0 70px",
        }}
      >
        <div style={{ fontSize: 150 }}>
          <Tag
            variant="gold"
            delay={2}
            fontSize={150}
            style={{ padding: "10px 40px", borderRadius: 999 }}
          >
            💡
          </Tag>
        </div>
        <div>
          <Rise
            delay={6}
            style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.1 }}
          >
            תנאי מימון ורכישה
          </Rise>
          <Rise
            delay={12}
            style={{
              fontSize: 92,
              fontWeight: 900,
              lineHeight: 1.1,
              color: COLORS.gold,
            }}
          >
            חסרי תקדים
          </Rise>
        </div>
        <Tag delay={sec(3.1)} fontSize={60}>
          ✔ מחיר פרי-סייל מיוחד
          <br />
          ל-<Ltr>5</Ltr> הדירות הראשונות!
        </Tag>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PayBar: React.FC<{
  pct: number;
  label: string;
  delay: number;
  bg: string;
  color: string;
}> = ({ pct, label, delay, bg, color }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 20], [0, 1], clamp);
  const eased = 1 - Math.pow(1 - p, 3);
  return (
    <div style={{ width: "100%", opacity: p > 0 ? 1 : 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: FONT_FAMILY,
          color: COLORS.white,
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 58, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 90, fontWeight: 900, color }}>
          <Ltr>{Math.round(pct * eased)}%</Ltr>
        </div>
      </div>
      <div
        style={{
          height: 54,
          borderRadius: 999,
          background: "rgba(255,255,255,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct * eased}%`,
            background: bg,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
};

// 5 — Payment plan (24.6–30.4s): 15% on signing, the rest on occupancy.
export const ScenePlan: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <KenBurns
        src={img("skyline-sunset")}
        x={[70, 85]}
        zoom={[1.12, 1.0]}
        durationInFrames={durationInFrames}
      />
      <Shade background="linear-gradient(180deg, rgba(0,32,14,0.9) 0%, rgba(0,32,14,0.82) 100%)" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          padding: "260px 90px 0",
          fontFamily: FONT_FAMILY,
          color: COLORS.white,
          textAlign: "center",
        }}
      >
        <Rise
          delay={2}
          style={{ fontSize: 64, fontWeight: 700, color: COLORS.gold }}
        >
          משלמים בחתימה
        </Rise>
        <Rise
          delay={6}
          style={{ fontSize: 230, fontWeight: 900, lineHeight: 1 }}
        >
          <Ltr>15%</Ltr>
        </Rise>
        <Rise
          delay={10}
          style={{ fontSize: 84, fontWeight: 900, color: COLORS.gold }}
        >
          בלבד
        </Rise>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 50,
            marginTop: 80,
          }}
        >
          <PayBar
            pct={15}
            label="בחתימה"
            delay={sec(1.2)}
            bg={GOLD_GRADIENT}
            color={COLORS.gold}
          />
          <PayBar
            pct={85}
            label="היתרה באכלוס"
            delay={sec(2.7)}
            bg={`linear-gradient(100deg, #3F8F62, ${COLORS.greenMid})`}
            color="#8FD3A8"
          />
        </div>
        <div style={{ marginTop: 80 }}>
          <Tag variant="gold" delay={sec(3.7)} fontSize={62}>
            ללא הלוואות קבלן!
          </Tag>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SPEC = [
  { src: "tower-night", label: "מגדל יוקרה + בנייני בוטיק", x: [66, 58] },
  { src: "gym", label: "חדר כושר לדיירים", x: [55, 75] },
  { src: "apt-3room-a", label: "מיזוג VRF", x: [20, 40] },
  { src: "apt-3room-c", label: "בית חכם", x: [40, 60] },
] as const;

// 6 — Rich specification (30.4–34s): quick montage.
export const SceneSpec: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const len = Math.floor(durationInFrames / SPEC.length);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.greenDeep }}>
      {SPEC.map((it, i) => (
        <Sequence
          key={it.src}
          from={i * len}
          durationInFrames={
            i === SPEC.length - 1 ? durationInFrames - i * len : len + 6
          }
        >
          <SpecSlide {...it} len={len} />
        </Sequence>
      ))}
      <Shade background="linear-gradient(180deg, rgba(0,32,14,0.8) 0%, transparent 24%, transparent 70%, rgba(0,32,14,0.6) 100%)" />
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <Rise
          delay={0}
          style={{ fontSize: 96, fontWeight: 900, color: COLORS.white }}
        >
          מפרט עשיר
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const SpecSlide: React.FC<{
  src: string;
  label: string;
  x: readonly [number, number];
  len: number;
}> = ({ src, label, x, len }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ opacity: interpolate(frame, [0, 6], [0, 1], clamp) }}
    >
      <KenBurns
        src={img(src)}
        x={[x[0], x[1]]}
        zoom={[1.08, 1.0]}
        durationInFrames={len + 6}
      />
      <div
        style={{
          position: "absolute",
          bottom: 300,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tag variant="gold" delay={2} fontSize={66}>
          ✔ {label}
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

// 7 — CTA (34s–end): click for details, Mastov logo.
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useEnter(4, 16);
  const bounce = Math.abs(Math.sin(frame / 7)) * 30;
  const pulse = 1 + Math.sin(frame / 5) * 0.03;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 35%, ${COLORS.greenMid} 0%, ${COLORS.green} 55%, ${COLORS.greenDeep} 100%)`,
        alignItems: "center",
        paddingTop: 170,
        fontFamily: FONT_FAMILY,
        color: COLORS.white,
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: COLORS.white,
          borderRadius: 48,
          padding: "60px 80px 50px",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
          border: `6px solid ${COLORS.gold}`,
          transform: `scale(${0.7 + card * 0.3})`,
          opacity: card,
        }}
      >
        <MastovLogo width={560} />
      </div>
      <div style={{ marginTop: 90 }}>
        <Rise
          delay={8}
          style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.1 }}
        >
          לחצו כאן
        </Rise>
        <Rise
          delay={14}
          style={{
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 1.1,
            color: COLORS.gold,
          }}
        >
          לקבלת הפרטים
        </Rise>
      </div>
      <div
        style={{
          fontSize: 150,
          lineHeight: 1,
          marginTop: 40,
          transform: `translateY(${bounce}px) scale(${pulse})`,
          opacity: interpolate(frame, [18, 26], [0, 1], clamp),
        }}
      >
        👇
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: 0,
          right: 0,
          fontSize: 24,
          opacity: 0.65,
        }}
      >
        ההדמיות להמחשה בלבד. ייתכנו שינויים לפי דרישת הרשויות.
      </div>
    </AbsoluteFill>
  );
};
