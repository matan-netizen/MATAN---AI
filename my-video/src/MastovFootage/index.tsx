import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Chip, Icons, Rise, useEnter } from "../UzielLeadAd/components";
import { MastovLogo, Tag } from "../MastovPresale/scenes";
import {
  COLORS,
  FONT_FAMILY,
  FPS,
  GOLD_GRADIENT,
  sec,
} from "../MastovPresale/theme";

// Re-cut of the supplied promo footage (public/mastov/source-footage.mp4,
// 832×464) for Mastov: only the building / interior / amenity shots are
// used, the burned-in captions and the previous developer's corner logo
// are hidden under a blurred, tinted band, and new copy, narration and
// logo go on top. Scene cuts match MastovPresale, which uses the same
// narration.

export const FOOTAGE_FPS = FPS;
export const FOOTAGE_W = 1280;
export const FOOTAGE_H = 720;

const SRC = "mastov/source-footage.mp4";
const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Shots in the source, in seconds. Shots with people in them are skipped.
const SHOT = {
  sunsetTower: [0, 3.55],
  penthouseTop: [3.65, 5.55],
  towerDay: [5.65, 7.75],
  penthouseLiving: [7.85, 9.35],
  twoRoom: [9.45, 11.05],
  terrace: [12.25, 13.45],
  aerialSunset: [13.55, 16.15],
  street: [16.25, 18.35],
  kitchen: [23.05, 24.65],
  lobby: [24.75, 25.65],
  gym: [25.75, 26.85],
  facade: [28.95, 30.35],
  skyline: [30.45, 33.8],
} as const;
type Shot = readonly [number, number];

// Rectangles (output px) where the source has burned-in text or a logo
// (the previous developer's logo sits bottom-centre).
const BAND = { x: 120, y: 205, w: 1040, h: 310 };
const SOURCE_LOGO = { x: 500, y: 615, w: 280, h: 105 };
const EDGE_CREDIT = { x: 0, y: 290, w: 46, h: 170 };
const TOP_LEFT_TITLE = { x: 40, y: 30, w: 600, h: 230 };

type Rect = { x: number; y: number; w: number; h: number };
const rectPath = (rects: Rect[]) =>
  `path('${rects
    .map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}Z`)
    .join(" ")}')`;

// Plays a list of shots back to back, stretched to fill `duration`
// frames, with the caption/logo areas blurred out.
const Footage: React.FC<{
  shots: Shot[];
  duration: number;
  extraMasks?: Rect[];
  tint?: boolean;
}> = ({ shots, duration, extraMasks = [], tint = true }) => {
  const total = shots.reduce((s, [a, b]) => s + (b - a), 0);
  const rate = (total * FPS) / duration;
  const masks = [BAND, SOURCE_LOGO, EDGE_CREDIT, ...extraMasks];
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {shots.map(([a, b], i) => {
        const len =
          i === shots.length - 1
            ? duration - from
            : Math.round(((b - a) * FPS) / rate);
        const seq = (
          <Sequence key={i} from={from} durationInFrames={len}>
            {[false, true].map((blurred) => (
              <AbsoluteFill
                key={String(blurred)}
                style={
                  blurred
                    ? { clipPath: rectPath(masks), overflow: "hidden" }
                    : undefined
                }
              >
                <OffthreadVideo
                  src={staticFile(SRC)}
                  muted
                  trimBefore={Math.round(a * FPS)}
                  trimAfter={Math.round(b * FPS)}
                  playbackRate={rate}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: blurred ? "blur(22px) brightness(0.8)" : undefined,
                    transform: blurred ? "scale(1.04)" : undefined,
                  }}
                />
              </AbsoluteFill>
            ))}
          </Sequence>
        );
        from += len;
        return seq;
      })}
      {/* Tint over the blurred band so it reads as a deliberate panel. */}
      <div
        hidden={!tint}
        style={{
          position: "absolute",
          left: BAND.x,
          top: BAND.y,
          width: BAND.w,
          height: BAND.h,
          background: "rgba(0,40,18,0.55)",
          borderRadius: 28,
          border: `2px solid rgba(216,184,112,0.55)`,
        }}
      />
      {/* Location plate over the old logo spot. */}
      <div
        style={{
          position: "absolute",
          left: SOURCE_LOGO.x - 6,
          top: SOURCE_LOGO.y + 14,
          width: SOURCE_LOGO.w + 12,
          height: SOURCE_LOGO.h - 8,
          background: "rgba(0,40,18,0.82)",
          borderRadius: 18,
          border: `2px solid rgba(216,184,112,0.6)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 34,
          fontWeight: 700,
          color: COLORS.gold,
        }}
      >
        📍 רמת גן
      </div>
    </AbsoluteFill>
  );
};

// Centred content inside the band.
const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      left: BAND.x,
      top: BAND.y,
      width: BAND.w,
      height: BAND.h,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      fontFamily: FONT_FAMILY,
      color: COLORS.white,
      textAlign: "center",
      textShadow: "0 3px 12px rgba(0,0,0,0.45)",
    }}
  >
    {children}
  </div>
);

const Ltr: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>{children}</span>
);

type SceneProps = { duration: number };

const Hook: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame / 2) * (frame < sec(1.2) ? 2 : 0);
  return (
    <AbsoluteFill>
      <Footage shots={[SHOT.sunsetTower]} duration={duration} />
      <Panel>
        <div style={{ rotate: `${shake}deg` }}>
          <Tag variant="red" delay={2} fontSize={52}>
            📢 משקיעים, שימו לב!
          </Tag>
        </div>
        <Rise delay={sec(1.5)} style={{ fontSize: 56, fontWeight: 900 }}>
          הזדמנות להשקעה חכמה{" "}
          <span style={{ color: COLORS.gold }}>עם רווח גדול</span>
        </Rise>
      </Panel>
    </AbsoluteFill>
  );
};

const Project: React.FC<SceneProps> = ({ duration }) => (
  <AbsoluteFill>
    <Footage
      shots={[SHOT.penthouseTop, SHOT.towerDay]}
      duration={duration}
      extraMasks={[TOP_LEFT_TITLE]}
    />
    <Panel>
      <Rise delay={4} style={{ fontSize: 66, fontWeight: 900 }}>
        בפרויקט יוקרה בלב רמת גן
      </Rise>
      <Tag variant="gold" delay={sec(1.9)} fontSize={50}>
        📍 במרחק נגיעה מבני ברק!
      </Tag>
    </Panel>
  </AbsoluteFill>
);

const Five: React.FC<SceneProps> = ({ duration }) => {
  const five = useEnter(4, 9);
  return (
    <AbsoluteFill>
      <Footage
        shots={[SHOT.penthouseLiving, SHOT.twoRoom]}
        duration={duration}
      />
      <Panel>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 26,
            transform: `scale(${five})`,
          }}
        >
          <div
            style={{
              fontSize: 190,
              fontWeight: 900,
              lineHeight: 0.9,
              background: GOLD_GRADIENT,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "none",
            }}
          >
            5
          </div>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05 }}>
            דירות מיוחדות
          </div>
        </div>
        <Tag variant="gold" delay={sec(1.2)} fontSize={50}>
          מתחת למחירי השוק! 🚨
        </Tag>
      </Panel>
    </AbsoluteFill>
  );
};

const Location: React.FC<SceneProps> = ({ duration }) => (
  <AbsoluteFill>
    <Footage
      shots={[SHOT.aerialSunset, SHOT.street, [30.45, 32.1]]}
      duration={duration}
    />
    <Panel>
      <Rise
        delay={4}
        style={{ fontSize: 40, fontWeight: 700, color: COLORS.gold }}
      >
        מיקום אסטרטגי
      </Rise>
      <Rise
        delay={10}
        style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.15 }}
      >
        סמוך לבני ברק ולצירי התחבורה המרכזיים
      </Rise>
    </Panel>
    <div
      style={{
        position: "absolute",
        top: BAND.y + BAND.h + 30,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 30,
      }}
    >
      <Chip
        delay={sec(5.2)}
        color={COLORS.green}
        icon={Icons.key}
        label="ביקוש קשיח לשכירות"
      />
      <Chip
        delay={sec(6.9)}
        color={COLORS.goldDark}
        icon={Icons.chart}
        label="רווח הון משמעותי במכירה"
      />
    </div>
  </AbsoluteFill>
);

const Terms: React.FC<SceneProps> = ({ duration }) => (
  <AbsoluteFill>
    <Footage shots={[SHOT.terrace, [32.1, 33.8]]} duration={duration} />
    <Panel>
      <Rise delay={4} style={{ fontSize: 62, fontWeight: 900 }}>
        💡 תנאי מימון ורכישה{" "}
        <span style={{ color: COLORS.gold }}>חסרי תקדים</span>
      </Rise>
      <Tag delay={sec(2.3)} fontSize={46}>
        ✔ מחיר פרי-סייל מיוחד ל-<Ltr>5</Ltr> הדירות הראשונות!
      </Tag>
    </Panel>
  </AbsoluteFill>
);

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
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 58, fontWeight: 900, color }}>
          <Ltr>{Math.round(pct * eased)}%</Ltr>
        </div>
      </div>
      <div
        style={{
          height: 34,
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

const Plan: React.FC<SceneProps> = ({ duration }) => (
  <AbsoluteFill>
    <Footage
      shots={[SHOT.facade, SHOT.sunsetTower]}
      duration={duration}
      tint={false}
    />
    <AbsoluteFill style={{ background: "rgba(0,32,14,0.82)" }} />
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 90,
        padding: "0 110px",
        fontFamily: FONT_FAMILY,
        color: COLORS.white,
        textAlign: "center",
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <Rise
          delay={2}
          style={{ fontSize: 46, fontWeight: 700, color: COLORS.gold }}
        >
          משלמים בחתימה
        </Rise>
        <Rise
          delay={6}
          style={{ fontSize: 170, fontWeight: 900, lineHeight: 1 }}
        >
          <Ltr>15%</Ltr>
        </Rise>
        <Rise
          delay={10}
          style={{ fontSize: 64, fontWeight: 900, color: COLORS.gold }}
        >
          בלבד
        </Rise>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 34,
          alignItems: "center",
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
        <Tag variant="gold" delay={sec(3.8)} fontSize={46}>
          ללא הלוואות קבלן!
        </Tag>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

const SPEC: { shot: Shot; label: string; masks?: Rect[] }[] = [
  {
    shot: SHOT.towerDay,
    label: "מגדל יוקרה + בנייני בוטיק",
    masks: [TOP_LEFT_TITLE],
  },
  { shot: SHOT.gym, label: "חדר כושר לדיירים" },
  { shot: SHOT.kitchen, label: "מיזוג VRF" },
  { shot: SHOT.lobby, label: "בית חכם" },
];

const Spec: React.FC<SceneProps> = ({ duration }) => {
  const each = Math.floor(duration / SPEC.length);
  return (
    <AbsoluteFill>
      {SPEC.map((it, i) => {
        const len = i === SPEC.length - 1 ? duration - i * each : each;
        return (
          <Sequence key={it.label} from={i * each} durationInFrames={len}>
            <Footage shots={[it.shot]} duration={len} extraMasks={it.masks} />
            <Panel>
              <Rise
                delay={0}
                style={{ fontSize: 40, fontWeight: 700, color: COLORS.gold }}
              >
                מפרט עשיר
              </Rise>
              <Tag variant="gold" delay={2} fontSize={58}>
                ✔ {it.label}
              </Tag>
            </Panel>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const Equity: React.FC<SceneProps> = ({ duration }) => (
  <AbsoluteFill>
    <Footage
      shots={[SHOT.penthouseTop, SHOT.penthouseLiving]}
      duration={duration}
    />
    <Panel>
      <Rise delay={2} style={{ fontSize: 66, fontWeight: 900 }}>
        החל מ-
        <span style={{ color: COLORS.gold }}>
          <Ltr>300</Ltr> אלף ₪
        </span>{" "}
        הון עצמי
      </Rise>
      <Tag delay={sec(2.7)} fontSize={50}>
        🤝 ליווי מלא בכל התהליך
      </Tag>
    </Panel>
  </AbsoluteFill>
);

const CTA: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const card = useEnter(4, 16);
  const bounce = Math.abs(Math.sin(frame / 7)) * 22;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${COLORS.greenMid} 0%, ${COLORS.green} 55%, ${COLORS.greenDeep} 100%)`,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 90,
        fontFamily: FONT_FAMILY,
        color: COLORS.white,
        textAlign: "center",
      }}
    >
      <div>
        <Rise
          delay={8}
          style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.1 }}
        >
          לחצו כאן
        </Rise>
        <Rise
          delay={14}
          style={{ fontSize: 66, fontWeight: 900, color: COLORS.gold }}
        >
          לקבלת הפרטים
        </Rise>
        <div
          style={{
            fontSize: 110,
            lineHeight: 1,
            marginTop: 20,
            transform: `translateY(${bounce}px)`,
            opacity: interpolate(frame, [18, 26], [0, 1], clamp),
          }}
        >
          👇
        </div>
      </div>
      <div
        style={{
          background: COLORS.white,
          borderRadius: 40,
          padding: "40px 54px",
          border: `5px solid ${COLORS.gold}`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          transform: `scale(${0.7 + card * 0.3})`,
          opacity: card,
        }}
      >
        <MastovLogo width={400} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: 0,
          right: 0,
          fontSize: 18,
          opacity: 0.65,
        }}
      >
        ההדמיות להמחשה בלבד. ייתכנו שינויים לפי דרישת הרשויות.
      </div>
    </AbsoluteFill>
  );
};

// Same cuts as MastovPresale: the pauses between sentences of the narration.
const CUTS = [0, 4.1, 7.7, 10.6, 19.3, 24.5, 29.7, 35.4, 39.8, 43.5].map(sec);
const SCENES: React.FC<SceneProps>[] = [
  Hook,
  Project,
  Five,
  Location,
  Terms,
  Plan,
  Spec,
  Equity,
  CTA,
];
const FADE = 8;

export const FOOTAGE_DURATION = CUTS[CUTS.length - 1];
const VO_END = sec(41.4);
const CTA_START = CUTS[CUTS.length - 2];

const Fader: React.FC<{ duration: number; children: React.ReactNode }> = ({
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, FADE, duration - FADE, duration],
    [0, 1, 1, 0],
    clamp,
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const MastovFootage: React.FC = () => {
  const frame = useCurrentFrame();
  const badge = interpolate(
    frame,
    [6, 16, CTA_START - 8, CTA_START],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <AbsoluteFill
      style={{
        direction: "rtl",
        fontFamily: FONT_FAMILY,
        backgroundColor: COLORS.greenDeep,
      }}
    >
      <Html5Audio src={staticFile("mastov/voiceover.mp3")} />
      <Html5Audio
        src={staticFile("mastov/audio/music.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [
              0,
              10,
              VO_END,
              VO_END + 15,
              FOOTAGE_DURATION - 25,
              FOOTAGE_DURATION,
            ],
            [0, 0.16, 0.16, 0.45, 0.45, 0],
            clamp,
          )
        }
      />
      {SCENES.map((Scene, i) => {
        // Overlap neighbours by FADE frames for a soft crossfade.
        const start = Math.max(0, CUTS[i] - (i > 0 ? FADE : 0));
        const end = CUTS[i + 1];
        const len = end - start;
        return (
          <Sequence key={i} from={start} durationInFrames={len}>
            <Fader duration={len}>
              <Scene duration={len} />
            </Fader>
          </Sequence>
        );
      })}
      <div
        style={{
          position: "absolute",
          top: 22,
          left: 22,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 16,
          padding: "10px 14px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          opacity: badge,
        }}
      >
        <MastovLogo width={120} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 26,
          right: 30,
          fontSize: 22,
          fontWeight: 700,
          color: "rgba(255,255,255,0.9)",
          textShadow: "0 2px 8px rgba(0,0,0,0.6)",
        }}
      >
        בס״ד
      </div>
    </AbsoluteFill>
  );
};
