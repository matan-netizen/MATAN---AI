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
// 832×464) for Mastov. The previous developer's logo is burned in at the
// bottom centre of every shot, so the footage is zoomed (ZOOM, anchored
// near the top) until that strip — and a small credit on the left edge —
// fall outside the frame. Shots whose captions name the previous developer,
// and shots with people other than the gym, are not used. The remaining
// burned-in captions sit under a compact solid panel that carries the new
// copy. Scene cuts match MastovPresale, which uses the same narration.

export const FOOTAGE_FPS = FPS;
export const FOOTAGE_W = 1280;
export const FOOTAGE_H = 720;

const SRC = "mastov/source-footage.mp4";
const ZOOM = 1.18;
const ZOOM_ORIGIN = "50% 20%";
const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Shots in the source, in seconds.
const SHOT = {
  sunsetTower: [0, 3.55],
  towerDay: [5.65, 7.75],
  penthouseLiving: [7.85, 9.35],
  twoRoom: [9.45, 11.05],
  terrace: [12.25, 13.45],
  aerialSunset: [13.55, 16.15],
  street: [16.25, 18.35],
  kitchen: [23.05, 24.65],
  lobby: [24.75, 25.65],
  gym: [25.75, 26.85],
  skyline: [30.45, 33.8],
} as const;
type Shot = readonly [number, number];

// Where the burned-in captions land after the zoom (output px).
type Rect = { x: number; y: number; w: number; h: number };
const CENTER: Rect = { x: 270, y: 278, w: 740, h: 228 };
// towerDay has its caption in the top-left corner instead.
const TOP_LEFT: Rect = { x: 10, y: 30, w: 490, h: 215 };

// Plays a list of shots back to back, stretched to fill `duration` frames.
const Footage: React.FC<{ shots: Shot[]; duration: number }> = ({
  shots,
  duration,
}) => {
  const total = shots.reduce((s, [a, b]) => s + (b - a), 0);
  const rate = (total * FPS) / duration;
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {shots.map(([a, b], i) => {
        const len =
          i === shots.length - 1
            ? duration - from
            : Math.round(((b - a) * FPS) / rate);
        const seq = (
          <Sequence key={i} from={from} durationInFrames={len}>
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
                transform: `scale(${ZOOM})`,
                transformOrigin: ZOOM_ORIGIN,
              }}
            />
          </Sequence>
        );
        from += len;
        return seq;
      })}
    </AbsoluteFill>
  );
};

// Solid panel over the burned-in caption, carrying the new copy.
const Panel: React.FC<{
  rect?: Rect;
  children: React.ReactNode;
}> = ({ rect = CENTER, children }) => {
  const s = useEnter(0, 18);
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        background: `linear-gradient(135deg, #0D5530 0%, #002812 100%)`,
        border: `3px solid ${COLORS.gold}`,
        borderRadius: 26,
        boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "0 24px",
        fontFamily: FONT_FAMILY,
        color: COLORS.white,
        textAlign: "center",
        transform: `scale(${0.96 + s * 0.04})`,
      }}
    >
      {children}
    </div>
  );
};

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
          <Tag variant="red" delay={2} fontSize={38}>
            📢 משקיעים, שימו לב!
          </Tag>
        </div>
        <Rise
          delay={sec(1.5)}
          style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.1 }}
        >
          הזדמנות להשקעה חכמה
        </Rise>
        <Rise
          delay={sec(2.6)}
          style={{
            fontSize: 44,
            fontWeight: 900,
            lineHeight: 1.1,
            color: COLORS.gold,
          }}
        >
          עם רווח גדול
        </Rise>
      </Panel>
    </AbsoluteFill>
  );
};

const Project: React.FC<SceneProps> = ({ duration }) => (
  <AbsoluteFill>
    <Footage shots={[SHOT.towerDay]} duration={duration} />
    <Panel rect={TOP_LEFT}>
      <Rise
        delay={4}
        style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.15 }}
      >
        בפרויקט יוקרה
        <br />
        בלב רמת גן
      </Rise>
      <Tag variant="gold" delay={sec(1.9)} fontSize={30}>
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
            gap: 20,
            transform: `scale(${five})`,
          }}
        >
          <div
            style={{
              fontSize: 120,
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
          <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05 }}>
            דירות מיוחדות
          </div>
        </div>
        <Tag variant="gold" delay={sec(1.2)} fontSize={34}>
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
        style={{ fontSize: 30, fontWeight: 700, color: COLORS.gold }}
      >
        מיקום אסטרטגי
      </Rise>
      <Rise
        delay={10}
        style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.15 }}
      >
        סמוך לבני ברק
        <br />
        ולצירי התחבורה המרכזיים
      </Rise>
    </Panel>
    <div
      style={{
        position: "absolute",
        top: CENTER.y + CENTER.h + 26,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 60,
        transform: "scale(0.8)",
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
      <Rise
        delay={4}
        style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.15 }}
      >
        💡 תנאי מימון ורכישה
        <br />
        <span style={{ color: COLORS.gold }}>חסרי תקדים</span>
      </Rise>
      <Tag delay={sec(2.3)} fontSize={30}>
        ✔ מחיר פרי-סייל מיוחד ל-<Ltr>5</Ltr> הדירות הראשונות!
      </Tag>
    </Panel>
  </AbsoluteFill>
);

const Plan: React.FC<SceneProps> = ({ duration }) => {
  const right = useEnter(4, 14);
  const left = useEnter(sec(1.6), 14);
  return (
    <AbsoluteFill>
      <Footage shots={[SHOT.skyline]} duration={duration} />
      <Panel>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
          }}
        >
          <div style={{ opacity: right, transform: `scale(${right})` }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: COLORS.gold }}>
              משלמים בחתימה
            </div>
            <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1 }}>
              <Ltr>15%</Ltr>
            </div>
            <div style={{ fontSize: 34, fontWeight: 900 }}>בלבד</div>
          </div>
          <div
            style={{
              width: 3,
              height: 150,
              background: COLORS.gold,
              opacity: 0.6,
            }}
          />
          <div style={{ opacity: left, transform: `scale(${left})` }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: COLORS.gold }}>
              והיתרה
            </div>
            <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.1 }}>
              באכלוס
            </div>
          </div>
        </div>
      </Panel>
      <div
        style={{
          position: "absolute",
          top: CENTER.y + CENTER.h + 24,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tag variant="gold" delay={sec(3.8)} fontSize={34}>
          ללא הלוואות קבלן!
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

const SPEC: { shot: Shot; label: string; rect?: Rect }[] = [
  { shot: SHOT.towerDay, label: "מגדל יוקרה + בנייני בוטיק", rect: TOP_LEFT },
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
            <Footage shots={[it.shot]} duration={len} />
            <Panel rect={it.rect}>
              <div
                style={{ fontSize: 30, fontWeight: 700, color: COLORS.gold }}
              >
                מפרט עשיר
              </div>
              <Tag variant="gold" delay={2} fontSize={it.rect ? 30 : 42}>
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
    <Footage shots={[SHOT.aerialSunset]} duration={duration} />
    <Panel>
      <Rise
        delay={2}
        style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.15 }}
      >
        החל מ-
        <span style={{ color: COLORS.gold }}>
          <Ltr>300</Ltr> אלף ₪
        </span>
        <br />
        הון עצמי
      </Rise>
      <Tag delay={sec(2.7)} fontSize={34}>
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
          top: 46,
          right: 22,
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
          top: 12,
          right: 26,
          fontSize: 20,
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
