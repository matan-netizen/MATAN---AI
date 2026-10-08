import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Backdrop,
  Badge,
  Card,
  Icon,
  Rise,
  SceneTitle,
  Typewriter,
  useEnter,
} from "./components";
import { BRAND_GRADIENT, COLORS, FONT } from "./theme";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const shekels = (n: number) => `₪${Math.round(n).toLocaleString("en-US")}`;

// 1 — Hook: an agency drowning in AI subscriptions, then Optimi sweeps in.
const TOOLS = ["ChatGPT", "Claude", "Midjourney", "Gemini", "Runway"];
const ALERTS = [
  { text: "מנוי כפול – ChatGPT Plus ×3", x: 1180, y: 250, at: 26 },
  { text: "חריגה מתקציב ה-AI החודשי", x: 260, y: 300, at: 44 },
  { text: "2.4M טוקנים בוזבזו השבוע", x: 1250, y: 640, at: 62 },
  { text: "מנוי כפול – Midjourney ×2", x: 330, y: 690, at: 80 },
];
const SWEEP = 118;

const Workstation: React.FC<{ x: number; tool: number; delay: number }> = ({
  x,
  tool,
  delay,
}) => {
  const frame = useCurrentFrame();
  const s = useEnter(delay, 16);
  const bob = Math.sin((frame + tool * 17) / 12) * 10;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 470,
        width: 360,
        opacity: s,
        transform: `translateY(${(1 - s) * 60}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -110 + bob,
          left: 90,
          padding: "10px 26px",
          borderRadius: 999,
          background: COLORS.white,
          border: `2px solid ${COLORS.royal}55`,
          boxShadow: `0 10px 30px ${COLORS.royal}33`,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 30,
          color: COLORS.royal,
          direction: "ltr",
        }}
      >
        ✦ {TOOLS[tool]}
      </div>
      <div
        style={{
          height: 200,
          borderRadius: 18,
          background: COLORS.navy,
          padding: 22,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {[0.9, 0.6, 0.75, 0.4].map((w, i) => (
          <div
            key={i}
            style={{
              height: 16,
              width: `${w * 100}%`,
              borderRadius: 8,
              background: i === 0 ? COLORS.sky : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          width: 60,
          height: 40,
          background: "#9fb0c6",
          margin: "0 auto",
        }}
      />
      <div
        style={{
          height: 18,
          borderRadius: 9,
          background: "#c8d3e1",
          width: 300,
          margin: "0 auto",
        }}
      />
    </div>
  );
};

const Alert: React.FC<{
  text: string;
  x: number;
  y: number;
  at: number;
}> = ({ text, x, y, at }) => {
  const frame = useCurrentFrame();
  const s = useEnter(at, 9);
  const shake = frame > at && frame < at + 14 ? Math.sin(frame * 2.4) * 8 : 0;
  // The shield passes right-to-left; each alert clears as it goes by.
  const clearAt = SWEEP + 8 + ((1920 - x) / 1920) * 18;
  const cleared = interpolate(frame, [clearAt, clearAt + 10], [0, 1], clamp);
  const color = cleared > 0.5 ? COLORS.emerald : COLORS.red;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translateX(${shake}px) scale(${s * (1 - cleared * 0.4)})`,
        opacity: Math.min(1, s * 2) * (1 - cleared),
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: COLORS.white,
        border: `3px solid ${color}`,
        borderRadius: 18,
        padding: "16px 26px",
        boxShadow: `0 16px 36px ${color}44`,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 32,
        color: COLORS.navy,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: color,
          color: COLORS.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
        }}
      >
        {cleared > 0.5 ? "✓" : "!"}
      </span>
      {text}
    </div>
  );
};

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spend =
    frame < SWEEP
      ? interpolate(frame, [0, 100], [9200, 18400], clamp)
      : interpolate(frame, [SWEEP + 10, SWEEP + 50], [18400, 11040], clamp);
  const fly = spring({ frame: frame - SWEEP, fps, config: { damping: 18 } });
  const calm = interpolate(frame, [SWEEP + 25, SWEEP + 45], [0, 1], clamp);
  return (
    <Backdrop>
      {[0, 1, 2, 3].map((i) => (
        <Workstation
          key={i}
          x={110 + i * 440}
          tool={i === 3 ? 4 : i}
          delay={i * 5}
        />
      ))}
      {ALERTS.map((a) => (
        <Alert key={a.text} {...a} />
      ))}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT,
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 700, color: COLORS.muted }}>
          הוצאה חודשית על כלי AI
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: frame < SWEEP + 10 ? COLORS.red : COLORS.emerald,
            direction: "ltr",
          }}
        >
          {shekels(spend)}
        </div>
      </div>
      {/* Calm overlay once the shield has swept through */}
      <AbsoluteFill
        style={{
          background: `rgba(244,246,249,${0.88 * calm})`,
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
        }}
      >
        <div style={{ height: 200 }} />
        {calm > 0 ? (
          <>
            <Rise delay={SWEEP + 32} size={92} weight={900}>
              הכירו את Optimi
            </Rise>
            <Badge delay={SWEEP + 44} size={56}>
              עד 40% חיסכון בעלויות AI
            </Badge>
          </>
        ) : null}
      </AbsoluteFill>
      {/* The shield: flies in from the right and settles above the headline */}
      {frame >= SWEEP ? (
        <div
          style={{
            position: "absolute",
            left: interpolate(fly, [0, 1], [2100, 960 - 130]),
            top: interpolate(fly, [0, 1], [420, 230]),
            transform: `rotate(${(1 - fly) * 200}deg) scale(${0.7 + fly * 0.3})`,
            filter: `drop-shadow(0 20px 50px ${COLORS.emerald}88)`,
          }}
        >
          <Icon size={260} />
        </div>
      ) : null}
    </Backdrop>
  );
};

// 2 — Smart Cost Router: a simple prompt goes to the cheapest model.
const MODELS = [
  { name: "Claude Opus", cost: "₪₪₪₪", y: 250 },
  { name: "GPT-4o", cost: "₪₪₪", y: 445 },
  { name: "GPT-4o-mini", cost: "₪", y: 640, pick: true },
];
const HUB = { x: 960, y: 530, r: 110 };
const SEND = 72;
const PICK = 122;

const travel = (frame: number, start: number, len: number) =>
  interpolate(frame, [start, start + len], [0, 1], clamp);

export const SceneRouter: React.FC = () => {
  const frame = useCurrentFrame();
  const toHub = travel(frame, SEND, 22);
  const toModel = travel(frame, PICK, 18);
  const scanning = frame >= SEND + 22 && frame < PICK;
  const scanIndex = Math.floor((frame - SEND - 22) / 6) % 3;
  const picked = frame >= PICK;
  const spin = frame * (scanning ? 9 : 1.5);
  return (
    <Backdrop>
      <SceneTitle step={1} title="ניתוב חכם" english="SMART COST ROUTER" />
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <line
          x1={1190}
          y1={480}
          x2={HUB.x + HUB.r}
          y2={HUB.y}
          stroke={COLORS.royal}
          strokeWidth={6}
          strokeDasharray="14 12"
          strokeDashoffset={-frame * 2}
          opacity={0.5}
        />
        {MODELS.map((m, i) => {
          const lit = picked ? m.pick : scanning && scanIndex === i;
          return (
            <line
              key={m.name}
              x1={HUB.x - HUB.r}
              y1={HUB.y}
              x2={590}
              y2={m.y + 75}
              stroke={lit ? COLORS.emerald : "#c3cddb"}
              strokeWidth={lit ? 10 : 6}
              opacity={picked && !m.pick ? 0.35 : 1}
            />
          );
        })}
        {frame >= SEND && toHub < 1 ? (
          <circle
            cx={interpolate(toHub, [0, 1], [1190, HUB.x + HUB.r])}
            cy={interpolate(toHub, [0, 1], [480, HUB.y])}
            r={18}
            fill={COLORS.royal}
          />
        ) : null}
        {picked && toModel < 1 ? (
          <circle
            cx={interpolate(toModel, [0, 1], [HUB.x - HUB.r, 590])}
            cy={interpolate(toModel, [0, 1], [HUB.y, 715])}
            r={18}
            fill={COLORS.emerald}
          />
        ) : null}
      </svg>
      {/* Prompt window */}
      <Card
        style={{
          position: "absolute",
          right: 110,
          top: 300,
          width: 620,
          padding: 34,
        }}
      >
        <div style={{ fontSize: 28, color: COLORS.muted, fontWeight: 700 }}>
          קופירייטינג · לקוח: רשת מזון
        </div>
        <div
          style={{
            marginTop: 20,
            padding: "22px 26px",
            borderRadius: 18,
            background: COLORS.gray,
            border: `2px solid ${frame >= SEND ? COLORS.royal : COLORS.line}`,
            fontSize: 38,
            fontWeight: 700,
            color: COLORS.navy,
            minHeight: 110,
          }}
        >
          <Typewriter text="10 רעיונות לפוסטים בפייסבוק לפסח" delay={14} />
        </div>
        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              padding: "12px 34px",
              borderRadius: 999,
              background: COLORS.royal,
              color: COLORS.white,
              fontSize: 30,
              fontWeight: 700,
              transform: `scale(${frame >= SEND && frame < SEND + 6 ? 0.9 : 1})`,
            }}
          >
            שליחה ←
          </div>
        </div>
      </Card>
      {/* Router hub */}
      <div
        style={{
          position: "absolute",
          left: HUB.x - HUB.r,
          top: HUB.y - HUB.r,
          width: HUB.r * 2,
          height: HUB.r * 2,
          borderRadius: "50%",
          background: COLORS.white,
          boxShadow: `0 0 0 ${scanning ? 18 : 10}px ${COLORS.royal}22, 0 24px 60px rgba(12,35,64,0.18)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -14,
            borderRadius: "50%",
            border: `5px dashed ${picked ? COLORS.emerald : COLORS.royal}`,
            transform: `rotate(${spin}deg)`,
          }}
        />
        <Icon size={140} />
      </div>
      <div
        style={{
          position: "absolute",
          left: HUB.x - 200,
          width: 400,
          top: HUB.y + HUB.r + 30,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 30,
          fontWeight: 700,
          color: picked ? COLORS.emerald : COLORS.muted,
        }}
      >
        {picked
          ? "נבחר המודל המשתלם ביותר"
          : scanning
            ? "בודק מודלים…"
            : "Optimi Router"}
      </div>
      {/* Models */}
      {MODELS.map((m, i) => {
        const win = picked && m.pick;
        const pop = win ? pulseOnce(frame - PICK - 16) : 0;
        return (
          <Card
            key={m.name}
            style={{
              position: "absolute",
              left: 110,
              top: m.y,
              width: 480,
              height: 150,
              padding: "0 34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              direction: "ltr",
              opacity: picked && !m.pick ? 0.4 : 1,
              border: `3px solid ${win ? COLORS.emerald : COLORS.line}`,
              transform: `scale(${1 + pop * 0.06})`,
              boxShadow: win
                ? `0 24px 60px ${COLORS.emerald}55`
                : "0 24px 60px rgba(12,35,64,0.12)",
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 900, color: COLORS.navy }}>
              {m.name}
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: m.pick ? COLORS.emerald : COLORS.muted,
              }}
            >
              {m.cost}
            </div>
            {scanning && scanIndex === i ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 28,
                  background: `${COLORS.royal}14`,
                }}
              />
            ) : null}
          </Card>
        );
      })}
      <div
        style={{
          position: "absolute",
          top: 800,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {frame >= PICK + 14 ? (
          <Badge delay={PICK + 14}>✓ חיסכון של 80% בעלות השאילתה</Badge>
        ) : null}
      </div>
    </Backdrop>
  );
};

// Eased 0→1 pulse without a hook, so it can be used inside a loop.
const pulseOnce = (f: number) =>
  f <= 0 ? 0 : Math.sin(Math.min(1, f / 12) * Math.PI);

// 3 — Semantic Caching: a repeated question is answered from the team vault.
const VAULT = [
  "בריף קמפיין קיץ – משקאות",
  "ניתוח מתחרים – רשתות אופנה",
  "סלוגנים להשקת אפליקציה",
  "מחקר קהל יעד – נדל״ן",
  "תסריט לסרטון TikTok",
];
const MATCH = 1;
const ASK = 60;
const FOUND = 104;

export const SceneCache: React.FC = () => {
  const frame = useCurrentFrame();
  const scanning = frame >= ASK && frame < FOUND;
  const scanRow = scanning
    ? Math.floor(interpolate(frame, [ASK, FOUND - 1], [0, 4.99], clamp))
    : -1;
  const found = frame >= FOUND;
  const back = travel(frame, FOUND + 12, 18);
  const answered = frame >= FOUND + 30;
  return (
    <Backdrop>
      <SceneTitle
        step={2}
        title="מאגר תשובות צוותי"
        english="SEMANTIC CACHING"
      />
      {/* Query window */}
      <Card
        style={{
          position: "absolute",
          right: 110,
          top: 220,
          width: 720,
          height: 550,
          padding: 34,
        }}
      >
        <div style={{ fontSize: 28, color: COLORS.muted, fontWeight: 700 }}>
          ניהול לקוחות · בריף ללקוח חדש
        </div>
        <div
          style={{
            marginTop: 18,
            padding: "20px 26px",
            borderRadius: 18,
            background: COLORS.gray,
            border: `2px solid ${frame >= ASK ? COLORS.royal : COLORS.line}`,
            fontSize: 36,
            fontWeight: 700,
            color: COLORS.navy,
          }}
        >
          <Typewriter text="ניתוח מתחרים – רשתות אופנה בישראל" delay={12} />
        </div>
        {answered ? (
          <div style={{ marginTop: 28 }}>
            <Rise
              delay={FOUND + 30}
              size={32}
              color={COLORS.emerald}
              weight={900}
            >
              ⚡ תשובה מיידית מהמאגר · 0.02 שניות
            </Rise>
            {[0.95, 0.85, 0.9, 0.6].map((w, i) => {
              const grow = interpolate(
                frame,
                [FOUND + 34 + i * 4, FOUND + 46 + i * 4],
                [0, w],
                clamp,
              );
              return (
                <div
                  key={i}
                  style={{
                    marginTop: 20,
                    height: 20,
                    width: `${grow * 100}%`,
                    borderRadius: 10,
                    background: i === 0 ? `${COLORS.emerald}66` : "#dbe3ee",
                  }}
                />
              );
            })}
          </div>
        ) : scanning ? (
          <div
            style={{
              marginTop: 40,
              fontSize: 32,
              color: COLORS.muted,
              fontWeight: 700,
            }}
          >
            מחפש במאגר הצוות…
          </div>
        ) : null}
      </Card>
      {/* Team vault */}
      <Card
        style={{
          position: "absolute",
          left: 110,
          top: 220,
          width: 860,
          height: 550,
          padding: 34,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 34,
            fontWeight: 900,
            color: COLORS.navy,
          }}
        >
          🗄️ מאגר התשובות של הצוות
        </div>
        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {VAULT.map((q, i) => {
            const hit = found && i === MATCH;
            const scan = scanRow === i;
            return (
              <div
                key={q}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 22px",
                  borderRadius: 14,
                  fontSize: 28,
                  fontWeight: 700,
                  color: hit ? COLORS.white : COLORS.navy,
                  background: hit
                    ? COLORS.emerald
                    : scan
                      ? `${COLORS.royal}1f`
                      : COLORS.gray,
                  transform: `scale(${hit ? 1.03 : 1})`,
                }}
              >
                <span>{q}</span>
                {hit ? <span style={{ fontSize: 26 }}>התאמה 97% ✓</span> : null}
              </div>
            );
          })}
        </div>
        {found ? (
          <div
            style={{
              marginTop: 14,
              fontSize: 26,
              color: COLORS.muted,
              fontWeight: 700,
            }}
          >
            נשמר ע״י חבר צוות · לפני שבוע
          </div>
        ) : null}
      </Card>
      {/* Answer card flying from the vault to the query window */}
      {frame >= FOUND + 12 && back < 1 ? (
        <div
          style={{
            position: "absolute",
            left: interpolate(back, [0, 1], [560, 1250]),
            top:
              interpolate(back, [0, 1], [400, 470]) -
              Math.sin(back * Math.PI) * 120,
            width: 160,
            height: 100,
            borderRadius: 16,
            background: COLORS.emerald,
            boxShadow: `0 20px 40px ${COLORS.emerald}66`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 800,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {frame >= FOUND + 40 ? (
          <Badge delay={FOUND + 40}>עלות טוקנים: $0.00 · חינם 100%</Badge>
        ) : null}
      </div>
    </Backdrop>
  );
};

// 4 — Client billing dashboard and a WhatsApp budget alert.
const CLIENTS = [
  { name: "לקוח A", pct: 0.45, budget: 4000 },
  { name: "לקוח B", pct: 0.62, budget: 6500 },
  { name: "לקוח C", pct: 0.3, budget: 3000 },
  { name: "לקוח X", pct: 0.8, budget: 5000, watch: true },
];
const NOTIFY = 92;
const TAP = 146;

export const SceneBilling: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const notify = spring({
    frame: frame - NOTIFY,
    fps,
    config: { damping: 14 },
  });
  const approved = frame >= TAP;
  const tap = interpolate(frame, [TAP - 4, TAP + 16], [0, 1], clamp);
  const buzz =
    frame >= NOTIFY && frame < NOTIFY + 16 ? Math.sin(frame * 3) * 6 : 0;
  return (
    <Backdrop>
      <SceneTitle
        step={3}
        title="שליטה מלאה בעלויות"
        english="CLIENT BILLING & WHATSAPP ALERTS"
      />
      {/* Dashboard */}
      <Card
        style={{
          position: "absolute",
          right: 110,
          top: 250,
          width: 1060,
          height: 540,
          padding: "34px 44px",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 900, color: COLORS.navy }}>
          עלויות AI לפי לקוח · החודש
        </div>
        <div
          style={{
            marginTop: 30,
            display: "flex",
            flexDirection: "column",
            gap: 34,
          }}
        >
          {CLIENTS.map((c, i) => {
            const target = c.watch && approved ? c.pct * (5000 / 7500) : c.pct;
            const grow = interpolate(
              frame,
              [12 + i * 8, 60 + i * 8],
              [0, c.pct],
              clamp,
            );
            const fill = approved
              ? interpolate(frame, [TAP, TAP + 20], [c.pct, target], clamp)
              : grow;
            const hot = c.watch && grow > 0.7 && !approved;
            const color = hot
              ? COLORS.amber
              : c.watch && approved
                ? COLORS.emerald
                : COLORS.royal;
            const budget = c.watch && approved ? 7500 : c.budget;
            return (
              <div
                key={c.name}
                style={{ display: "flex", alignItems: "center", gap: 26 }}
              >
                <div
                  style={{
                    width: 130,
                    fontSize: 32,
                    fontWeight: 700,
                    color: COLORS.navy,
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 22,
                    background: COLORS.gray,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${fill * 100}%`,
                      height: "100%",
                      borderRadius: 22,
                      background: color,
                      boxShadow: hot
                        ? `0 0 ${12 + Math.sin(frame / 4) * 8}px ${COLORS.amber}`
                        : undefined,
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 230,
                    fontSize: 28,
                    fontWeight: 700,
                    color: hot ? COLORS.amber : COLORS.muted,
                    direction: "ltr",
                    textAlign: "right",
                  }}
                >
                  {shekels(grow * c.budget)} / {shekels(budget)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      {/* Phone */}
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 210,
          width: 400,
          height: 640,
          borderRadius: 54,
          background: COLORS.navy,
          padding: 16,
          boxShadow: "0 30px 70px rgba(12,35,64,0.35)",
          transform: `translateX(${buzz}px)`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 40,
            background: "#e9edf2",
            overflow: "hidden",
            position: "relative",
            fontFamily: FONT,
          }}
        >
          <div
            style={{
              height: 90,
              background: "#075e54",
              color: COLORS.white,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "20px 24px 0",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: COLORS.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={34} />
            </div>
            Optimi
          </div>
          {frame >= NOTIFY ? (
            <div
              style={{
                margin: "28px 18px 0",
                padding: 22,
                borderRadius: 18,
                background: "#d9fdd3",
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                fontSize: 27,
                fontWeight: 700,
                lineHeight: 1.35,
                color: COLORS.navy,
                transform: `translateY(${(1 - notify) * -80}px)`,
                opacity: notify,
              }}
            >
              ⚠️ לקוח X הגיע ל-80% מתקציב ה-AI החודשי
              <div
                style={{
                  marginTop: 18,
                  padding: "14px 0",
                  textAlign: "center",
                  borderRadius: 14,
                  color: COLORS.white,
                  background: approved ? COLORS.emerald : COLORS.royal,
                  transform: `scale(${frame >= TAP - 4 && frame < TAP + 4 ? 0.93 : 1})`,
                  position: "relative",
                }}
              >
                {approved ? "✓ התקציב אושר" : "אשר הגדלת תקציב"}
                {tap > 0 && tap < 1 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: 160,
                      height: 160,
                      marginLeft: -80,
                      marginTop: -80,
                      borderRadius: "50%",
                      border: `5px solid ${COLORS.emerald}`,
                      transform: `scale(${0.2 + tap})`,
                      opacity: 1 - tap,
                    }}
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Backdrop>
  );
};

// 5 — Logo, slogan and call to action.
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useEnter(4, 13);
  const pulse = 1 + Math.max(0, Math.sin((frame - 80) / 7)) * 0.04;
  return (
    <Backdrop>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="ribbon" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={COLORS.royal} />
            <stop offset="100%" stopColor={COLORS.emerald} />
          </linearGradient>
        </defs>
        {[0, 1, 2].map((i) => {
          const draw = interpolate(frame, [i * 6, 50 + i * 6], [1, 0], clamp);
          return (
            <path
              key={i}
              d={`M -100 ${1150 - i * 60} C 600 ${980 - i * 50}, 1300 ${760 - i * 40}, 2050 ${120 + i * 70}`}
              fill="none"
              stroke="url(#ribbon)"
              strokeWidth={14 - i * 4}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={draw}
              opacity={0.22 - i * 0.05}
            />
          );
        })}
      </svg>
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", gap: 18 }}
      >
        <Img
          src={staticFile("optimi/logo.png")}
          style={{
            width: 1040,
            transform: `scale(${0.85 + logo * 0.15})`,
            opacity: logo,
          }}
        />
        <Rise delay={40} size={72} weight={900}>
          מקסימום AI בלי לקרוע את הכיס
        </Rise>
        <div style={{ height: 14 }} />
        <div style={{ transform: `scale(${pulse})` }}>
          <Rise delay={62} size={46} weight={900} color={COLORS.white}>
            <div
              style={{
                padding: "22px 60px",
                borderRadius: 999,
                backgroundImage: BRAND_GRADIENT,
                boxShadow: `0 20px 50px ${COLORS.royal}55`,
              }}
            >
              הצטרפו עכשיו והתחילו לחסוך ←
            </div>
          </Rise>
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};
