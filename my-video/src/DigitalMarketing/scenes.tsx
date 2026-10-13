import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Card,
  ChatGlyph,
  CoinsIcon,
  CtaButton,
  Handwritten,
  LightBackdrop,
  MonitorIcon,
  PhoneGlyph,
  Pop,
  QuestionMarks,
  Rise,
  Sfx,
  TapFinger,
  TargetIcon,
  Words,
} from "./components";
import { COLORS, FONT, HAND, IMG, PHONE } from "./theme";

// 1 — Hook: the business owner at his desk, puzzled.
export const SceneHook: React.FC = () => {
  const marks = [
    { x: 330, y: 830, size: 90, delay: 30 },
    { x: 640, y: 790, size: 120, delay: 42 },
    { x: 200, y: 990, size: 70, delay: 54 },
    { x: 790, y: 960, size: 80, delay: 66 },
  ];
  return (
    <AbsoluteFill>
      <LightBackdrop />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 230, gap: 60 }}>
        <Words
          text="חושבים על שיווק דיגיטלי לעסק?"
          highlight={["דיגיטלי"]}
          delay={8}
          size={104}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 760 }}>
        <Card
          src={IMG.desk}
          width={980}
          height={705}
          zoom={[1, 1.14]}
          position="50% 30%"
        />
      </AbsoluteFill>
      <QuestionMarks marks={marks} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 230,
        }}
      >
        <Rise delay={80} size={72} weight={700} color={COLORS.ink}>
          ולא יודעים מאיפה להתחיל?
        </Rise>
      </AbsoluteFill>
      {marks.map((m) => (
        <Sfx key={m.delay} name="pop" at={m.delay} volume={0.45} />
      ))}
    </AbsoluteFill>
  );
};

const QUESTIONS = [
  { text: "יותר חשיפה?", at: 25 },
  { text: "יותר מכירות?", at: 60 },
  { text: "למי לפנות?", at: 95 },
  { text: "מה באמת עובד?", at: 130 },
];

// 2 — Questions: thought bubbles, echoed as chips under the card.
export const SceneQuestions: React.FC = () => (
  <AbsoluteFill>
    <LightBackdrop />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
      <Card src={IMG.bubbles} width={980} height={985} zoom={[1.12, 1]} />
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 190,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 28,
          width: 980,
        }}
      >
        {QUESTIONS.map(({ text, at }, i) => (
          <Pop key={text} delay={at}>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 58,
                color: i === 3 ? COLORS.white : COLORS.navy,
                background: i === 3 ? COLORS.navy : COLORS.white,
                borderRadius: 999,
                padding: "26px 0",
                textAlign: "center",
                boxShadow: "0 14px 34px rgba(15,27,61,0.18)",
              }}
            >
              {text}
            </div>
          </Pop>
        ))}
      </div>
    </AbsoluteFill>
    {QUESTIONS.map(({ at }) => (
      <Sfx key={at} name="pop" at={at} volume={0.5} />
    ))}
  </AbsoluteFill>
);

const TERMS = [
  { t: "SEO", c: "#22D3EE" },
  { t: "PPC", c: "#F472B6" },
  { t: "SEM", c: "#A3E635" },
  { t: "A/B Testing", c: "#FBBF24" },
  { t: "CRO", c: "#C084FC" },
  { t: "Remarketing", c: "#FB923C" },
  { t: "Targeting", c: "#34D399" },
  { t: "Optimization", c: "#60A5FA" },
  { t: "CTR", c: "#F87171" },
  { t: "Funnel", c: "#FDE047" },
];

// Neon jargon chips that fly in from the edges and jitter.
const FlyingTerms: React.FC<{
  start: number;
  every: number;
  short: boolean;
}> = ({ start, every, short }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {TERMS.map(({ t, c }, i) => {
        const at = start + i * every;
        const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
        const fromLeft = i % 2 === 0;
        const x = fromLeft ? 40 + (i % 3) * 60 : 560 - (i % 3) * 50;
        const y = (short ? 480 : 290) + ((i * 157) % 1000);
        const flicker = (frame + i * 7) % 23 < 2 ? 0.35 : 1;
        return (
          <div
            key={t}
            style={{
              position: "absolute",
              left: x,
              top: y,
              direction: "ltr",
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 58 + (i % 3) * 10,
              color: c,
              padding: "10px 30px",
              borderRadius: 22,
              border: `4px solid ${c}`,
              background: "rgba(15,27,61,0.82)",
              textShadow: `0 0 18px ${c}`,
              boxShadow: `0 0 26px ${c}88`,
              opacity: Math.min(1, s * 2) * flicker,
              transform: `translateX(${(1 - s) * (fromLeft ? -700 : 700)}px) rotate(${(i % 2 ? 1 : -1) * (4 + (i % 3) * 2)}deg)`,
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </div>
        );
      })}
    </>
  );
};

// 3 — Jargon overload. `short` is the 3-second hook of the 15s cut.
export const SceneJargon: React.FC<{ short?: boolean }> = ({
  short = false,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const shake = interpolate(
    frame,
    [0, durationInFrames * 0.85],
    [0, short ? 10 : 9],
    {
      extrapolateRight: "clamp",
    },
  );
  const termsStart = short ? 4 : 20;
  const every = short ? 5 : 11;
  const secondCaption = short ? 9999 : 130;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 45%, #1E2A5A 0%, ${COLORS.deepNavy} 70%)`,
      }}
    >
      <AbsoluteFill
        style={{ alignItems: "center", paddingTop: short ? 520 : 330 }}
      >
        <Card
          src={IMG.jargon}
          width={980}
          height={980}
          zoom={short ? [1.25, 1.05] : [1, 1.2]}
          shake={shake}
          style={{ border: "8px solid #334155" }}
        />
      </AbsoluteFill>
      <FlyingTerms start={termsStart} every={every} short={short} />
      <AbsoluteFill
        style={{ alignItems: "center", paddingTop: short ? 200 : 140 }}
      >
        {short ? (
          <Words
            text="שיווק דיגיטלי מבלבל אתכם?"
            color={COLORS.white}
            highlight={["מבלבל"]}
            highlightColor={COLORS.yellow}
            size={100}
            stagger={3}
          />
        ) : (
          <Rise color={COLORS.white} size={92}>
            ואז מתחילים...
          </Rise>
        )}
      </AbsoluteFill>
      {short ? null : (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 170,
            paddingLeft: 60,
            paddingRight: 60,
          }}
        >
          <Rise delay={secondCaption} color={COLORS.yellow} size={74}>
            ומרגישים שצריך תואר
            <br />
            רק כדי להבין מה אומרים לכם 🤯
          </Rise>
        </AbsoluteFill>
      )}
      {(short ? [6, 26, 52] : [22, 66, 110, 160, 200]).map((at) => (
        <Sfx key={at} name="glitch" at={at} volume={0.35} />
      ))}
    </AbsoluteFill>
  );
};

// Yellow panel that wipes in from the right edge.
const YellowWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 14], [0, 100], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #FDE047 0%, ${COLORS.yellow} 60%, #EAB308 100%)`,
        clipPath: `inset(0 0 0 ${100 - p}%)`,
      }}
    />
  );
};

const RingingPhone: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const ringing = frame > delay + 10 && frame < delay + 50;
  const wobble = ringing ? Math.sin(frame * 1.6) * 14 : 0;
  return (
    <Pop delay={delay} damping={9}>
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: COLORS.navy,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 18px 40px rgba(15,27,61,0.35)",
          transform: `rotate(${wobble}deg)`,
        }}
      >
        <PhoneGlyph size={110} />
      </div>
    </Pop>
  );
};

// 4 — Turning point: the offer. `intro` adds the "רגע." beat of the 15s cut.
export const SceneTurn: React.FC<{ intro?: boolean }> = ({ intro = false }) => {
  const frame = useCurrentFrame();
  const d = intro ? 26 : 0; // content delay after the "רגע." stamp
  const stamp = intro
    ? interpolate(frame, [0, 4, 20, 28], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  return (
    <AbsoluteFill>
      <YellowWipe />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 170, gap: 26 }}>
        <RingingPhone delay={d + 12} />
        <Rise delay={d + 20} size={118} color={COLORS.deepNavy}>
          שיחת ייעוץ
          <br />
          לשיווק דיגיטלי
        </Rise>
        <Pop delay={d + 40} damping={11}>
          <div
            style={{
              marginTop: 18,
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 76,
              color: COLORS.white,
              background: COLORS.navy,
              borderRadius: 26,
              padding: "16px 48px",
              transform: "rotate(-2deg)",
              boxShadow: "0 14px 30px rgba(15,27,61,0.3)",
            }}
          >
            ללא עלות וללא התחייבות
          </div>
        </Pop>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 40, bottom: 0 }}>
        <Card
          src={IMG.curious}
          width={540}
          height={820}
          delay={d + 30}
          zoom={[1.02, 1.1]}
          position="50% 20%"
          radius={40}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        />
      </div>
      <div style={{ position: "absolute", right: 20, bottom: 420, width: 480 }}>
        <Handwritten delay={d + 70} size={104}>
          בעברית
          <br />
          שכולם יכולים
          <br />
          להבין! 🙂
        </Handwritten>
      </div>
      {intro ? (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            background: `rgba(15,27,61,${0.85 * stamp})`,
            opacity: stamp,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 260,
              color: COLORS.yellow,
              transform: `scale(${0.8 + 0.2 * stamp}) rotate(-4deg)`,
            }}
          >
            רגע.
          </div>
        </AbsoluteFill>
      ) : null}
      <Sfx name="scratch" at={0} volume={0.6} />
      <Sfx name="whoosh" at={intro ? 24 : 2} volume={0.5} />
      <Sfx name="ring" at={d + 22} volume={0.35} />
    </AbsoluteFill>
  );
};

const BENEFITS = [
  {
    Icon: CoinsIcon,
    text: "חיסכון בכסף, בזמן ובכאב ראש",
    at: 55,
    sound: "coins",
  },
  {
    Icon: MonitorIcon,
    text: "שיווק ופרסום העסק באינטרנט",
    at: 120,
    sound: "ding",
  },
  {
    Icon: TargetIcon,
    text: "תוכנית מקצועית בהתאמה אישית",
    at: 185,
    sound: "ding",
  },
];

// 5 — Benefits: the smiling adviser and three icon rows.
export const SceneBenefits: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <LightBackdrop />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 130 }}>
        <Card
          src={IMG.smile}
          width={760}
          height={820}
          zoom={[1.08, 1]}
          position="50% 25%"
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 150,
          gap: 30,
        }}
      >
        {BENEFITS.map(({ Icon, text, at }) => {
          const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
          return (
            <div
              key={text}
              style={{
                width: 960,
                display: "flex",
                alignItems: "center",
                gap: 30,
                background: COLORS.white,
                borderRadius: 34,
                padding: "22px 34px",
                boxShadow: "0 16px 36px rgba(15,27,61,0.16)",
                opacity: Math.min(1, s * 2),
                transform: `translateX(${(1 - s) * 500}px)`,
              }}
            >
              <Icon size={120} />
              <div
                style={{
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: 52,
                  color: COLORS.navy,
                  whiteSpace: "nowrap",
                }}
              >
                {text}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      {BENEFITS.map(({ at, sound }) => (
        <Sfx key={at} name={sound} at={at + 2} volume={0.45} />
      ))}
    </AbsoluteFill>
  );
};

// 6 — CTA: message and call buttons, a finger tapping the message button.
export const SceneCTA: React.FC<{ short?: boolean }> = ({ short = false }) => {
  const tapAt = short ? 60 : 80;
  return (
    <AbsoluteFill>
      <LightBackdrop tint="#FFFFFF" />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 170, gap: 20 }}>
        <Rise size={short ? 96 : 92} color={COLORS.deepNavy}>
          {short ? (
            "רוצים להתחיל?"
          ) : (
            <>
              שיחת ייעוץ
              <br />
              לשיווק דיגיטלי
            </>
          )}
        </Rise>
        <Rise delay={8} size={70} color={COLORS.blue} weight={700}>
          ללא עלות וללא התחייבות!
        </Rise>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 70,
          paddingTop: 60,
        }}
      >
        <CtaButton
          color={COLORS.green}
          shade={COLORS.darkGreen}
          icon={<ChatGlyph size={110} />}
          label="שולחים הודעה ל-"
          number={PHONE}
          delay={14}
          pressAt={tapAt}
        />
        <CtaButton
          color={COLORS.blue}
          shade={COLORS.navy}
          icon={<PhoneGlyph size={96} />}
          label="מתקשרים ל-"
          number={PHONE}
          delay={26}
        />
      </AbsoluteFill>
      <TapFinger x={120} y={860} enterAt={tapAt - 22} tapAt={tapAt} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 170,
        }}
      >
        <Pop delay={tapAt + 16} damping={10}>
          <div
            style={{
              fontFamily: HAND,
              fontWeight: 700,
              fontSize: 120,
              color: COLORS.yellow,
              background: COLORS.navy,
              padding: "6px 90px 14px",
              borderRadius: 24,
              transform: "rotate(-3deg)",
              boxShadow: "0 18px 36px rgba(15,27,61,0.35)",
            }}
          >
            מחכה לכם! 🙂
          </div>
        </Pop>
      </AbsoluteFill>
      <Sfx name="pop" at={14} volume={0.5} />
      <Sfx name="pop" at={26} volume={0.5} />
      <Sfx name="click" at={tapAt} volume={0.8} />
      <Sfx name="ding" at={tapAt + 16} volume={0.4} />
    </AbsoluteFill>
  );
};
