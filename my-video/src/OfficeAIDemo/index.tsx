import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "../RealEstatePromo/theme";

// Demo explainer: an intern's first morning in an accounting office, where
// an AI assistant hands him the right tool (Nanonets) and the work flows
// into Priority on its own. Motion-graphics only: flat illustrated people
// and UI mock-ups. Scene times (s): 0 arrival, 5 voice note, 11 chat,
// 16 tool match, 22 live walkthrough, 32 done, 37 auto update, 43 end card.

export const DEMO_FPS = 30;
const sec = (s: number) => Math.round(s * DEMO_FPS);
const CUTS = [0, 5, 11, 16, 22, 32, 37, 43, 48].map(sec);
export const DEMO_DURATION = CUTS[CUTS.length - 1];

const C = {
  blue: "#0048BF",
  blueLight: "#E8F0FF",
  ink: "#16213A",
  sub: "#5B6782",
  bg: "#F4F7FC",
  card: "#FFFFFF",
  line: "#DCE3F0",
  green: "#13A36F",
  greenLight: "#E3F7EE",
  amber: "#F2A33A",
  skin: "#F1C7A3",
  hair: "#3B2A20",
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const useEnter = (delay = 0, damping = 16) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

const Pop: React.FC<{
  delay?: number;
  from?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, from = 40, style, children }) => {
  const s = useEnter(delay);
  return (
    <div
      style={{
        opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
        transform: `translateY(${(1 - s) * from}px) scale(${0.94 + s * 0.06})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Typewriter text.
const Type: React.FC<{ text: string; start: number; cps?: number }> = ({
  text,
  start,
  cps = 40,
}) => {
  const frame = useCurrentFrame();
  const n = Math.floor(
    interpolate(
      frame,
      [start, start + (text.length / cps) * DEMO_FPS],
      [0, text.length],
      clamp,
    ),
  );
  return <>{text.slice(0, n)}</>;
};

// ---------- Illustrated people (flat style) ----------

const Person: React.FC<{
  size: number;
  shirt: string;
  beard?: boolean;
  glasses?: boolean;
  smile?: boolean;
}> = ({ size, shirt, beard, glasses, smile = true }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 200 250">
    {/* body */}
    <path
      d="M30 250 C30 175 60 150 100 150 C140 150 170 175 170 250 Z"
      fill={shirt}
    />
    <path d="M85 152 L100 182 L115 152 Z" fill="#fff" />
    <path
      d="M100 182 L94 205 L100 230 L106 205 Z"
      fill="#1E2A44"
      opacity={0.85}
    />
    {/* neck */}
    <rect x="88" y="128" width="24" height="26" rx="8" fill={C.skin} />
    {/* head */}
    <ellipse cx="100" cy="88" rx="44" ry="50" fill={C.skin} />
    <ellipse cx="56" cy="92" rx="8" ry="12" fill={C.skin} />
    <ellipse cx="144" cy="92" rx="8" ry="12" fill={C.skin} />
    {/* short hair */}
    <path
      d="M56 80 C54 42 80 30 102 30 C128 30 148 44 145 80 C138 62 122 56 100 58 C80 58 64 62 56 80 Z"
      fill={C.hair}
    />
    {beard ? (
      <path
        d="M60 100 C62 140 84 146 100 146 C116 146 138 140 140 100 C132 118 120 124 100 124 C80 124 68 118 60 100 Z"
        fill={C.hair}
      />
    ) : null}
    {/* eyes */}
    <circle cx="83" cy="90" r="4.5" fill="#1E2A44" />
    <circle cx="117" cy="90" r="4.5" fill="#1E2A44" />
    {glasses ? (
      <g fill="none" stroke="#1E2A44" strokeWidth="3">
        <rect x="68" y="78" width="28" height="22" rx="8" />
        <rect x="104" y="78" width="28" height="22" rx="8" />
        <path d="M96 88 h8" />
      </g>
    ) : null}
    {/* mouth */}
    {smile ? (
      <path
        d="M86 112 Q100 124 114 112"
        stroke="#9A4B3A"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    ) : (
      <path
        d="M88 114 h24"
        stroke="#9A4B3A"
        strokeWidth="4"
        strokeLinecap="round"
      />
    )}
  </svg>
);

const Ori: React.FC<{ size: number; smile?: boolean }> = ({ size, smile }) => (
  <Person size={size} shirt="#3D7BE0" smile={smile} />
);
const Manager: React.FC<{ size: number }> = ({ size }) => (
  <Person size={size} shirt="#2E3A55" beard glasses />
);

const Avatar: React.FC<{ who: "ori" | "manager" | "ai"; size?: number }> = ({
  who,
  size = 64,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      background:
        who === "ai"
          ? `linear-gradient(135deg, #5B8CFF, ${C.blue})`
          : C.blueLight,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      flexShrink: 0,
      color: "#fff",
      fontSize: size * 0.5,
      fontWeight: 900,
      lineHeight: `${size}px`,
    }}
  >
    {who === "ai" ? (
      "✦"
    ) : who === "ori" ? (
      <Ori size={size * 1.05} />
    ) : (
      <Manager size={size * 1.05} />
    )}
  </div>
);

// ---------- Frames ----------

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,72,191,0.10), transparent 70%)",
          left: -200 + Math.sin(frame / 60) * 40,
          top: -300,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(19,163,111,0.08), transparent 70%)",
          right: -200,
          bottom: -300 + Math.cos(frame / 70) * 40,
        }}
      />
    </AbsoluteFill>
  );
};

const Clock: React.FC<{ label?: string }> = ({ label = "08:30" }) => (
  <div
    style={{
      position: "absolute",
      top: 40,
      right: 56,
      display: "flex",
      alignItems: "center",
      gap: 14,
      background: C.card,
      borderRadius: 999,
      padding: "12px 26px",
      boxShadow: "0 8px 24px rgba(22,33,58,0.08)",
      fontSize: 34,
      fontWeight: 700,
      color: C.ink,
    }}
  >
    <span style={{ fontSize: 30 }}>🕣</span>
    <span style={{ direction: "ltr" }}>{label}</span>
  </div>
);

const SceneTitle: React.FC<{ step: string; title: string }> = ({
  step,
  title,
}) => (
  <Pop
    delay={2}
    style={{
      position: "absolute",
      top: 56,
      left: 0,
      right: 0,
      textAlign: "center",
    }}
  >
    <div
      style={{ fontSize: 28, fontWeight: 700, color: C.blue, letterSpacing: 1 }}
    >
      {step}
    </div>
    <div style={{ fontSize: 58, fontWeight: 900, color: C.ink, marginTop: 4 }}>
      {title}
    </div>
  </Pop>
);

const Window: React.FC<{
  title: string;
  width: number;
  height: number;
  accent?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, width, height, accent = C.blue, children, style }) => (
  <div
    style={{
      width,
      height,
      background: C.card,
      borderRadius: 24,
      boxShadow: "0 30px 80px rgba(22,33,58,0.16)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      ...style,
    }}
  >
    <div
      style={{
        height: 64,
        background: accent,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        fontSize: 28,
        fontWeight: 700,
        gap: 14,
      }}
    >
      <div style={{ display: "flex", gap: 8, direction: "ltr" }}>
        {["#FF6B6B", "#FFD166", "#06D6A0"].map((c) => (
          <div
            key={c}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: c,
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1 }}>{title}</div>
    </div>
    <div style={{ flex: 1, position: "relative" }}>{children}</div>
  </div>
);

const Bubble: React.FC<{
  who: "ori" | "manager" | "ai";
  name: string;
  delay: number;
  children: React.ReactNode;
  mine?: boolean;
  tint?: string;
}> = ({ who, name, delay, children, mine, tint }) => (
  <Pop
    delay={delay}
    style={{
      display: "flex",
      gap: 16,
      flexDirection: mine ? "row-reverse" : "row",
      alignItems: "flex-end",
    }}
  >
    <Avatar who={who} />
    <div style={{ maxWidth: 760 }}>
      <div
        style={{ fontSize: 22, color: C.sub, fontWeight: 700, marginBottom: 6 }}
      >
        {name}
      </div>
      <div
        style={{
          background: tint ?? (mine ? C.blue : C.card),
          color: mine ? "#fff" : C.ink,
          border: mine ? "none" : `2px solid ${C.line}`,
          borderRadius: 26,
          padding: "18px 26px",
          fontSize: 32,
          lineHeight: 1.45,
          boxShadow: "0 8px 22px rgba(22,33,58,0.06)",
        }}
      >
        {children}
      </div>
    </div>
  </Pop>
);

const TypingDots: React.FC<{ until: number }> = ({ until }) => {
  const frame = useCurrentFrame();
  if (frame >= until) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "14px 22px",
        background: C.card,
        borderRadius: 22,
        border: `2px solid ${C.line}`,
        width: "fit-content",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: C.sub,
            opacity: 0.3 + 0.7 * Math.abs(Math.sin((frame - i * 5) / 6)),
          }}
        />
      ))}
    </div>
  );
};

// ---------- Scenes ----------

const S1Arrival: React.FC = () => {
  const frame = useCurrentFrame();
  const minutes = Math.round(
    interpolate(frame, [0, sec(1.6)], [20, 30], clamp),
  );
  const walk = interpolate(frame, [sec(0.8), sec(2.6)], [700, 0], clamp);
  const bob = Math.abs(Math.sin(frame / 4)) * (frame < sec(2.6) ? 10 : 0);
  return (
    <AbsoluteFill>
      <Clock label={`08:${String(minutes).padStart(2, "0")}`} />
      {/* office: window + desk */}
      <div
        style={{
          position: "absolute",
          left: 180,
          top: 180,
          width: 620,
          height: 420,
          borderRadius: 24,
          background: "linear-gradient(180deg,#BFD8FF,#EAF2FF)",
          border: `10px solid ${C.card}`,
          boxShadow: "0 20px 50px rgba(22,33,58,0.10)",
        }}
      >
        {[60, 160, 250, 350, 450].map((x, i) => (
          <div
            key={x}
            style={{
              position: "absolute",
              left: x,
              bottom: 0,
              width: 70,
              height: 120 + (i % 3) * 70,
              background: "#9DB8E6",
              borderRadius: "8px 8px 0 0",
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 760,
          height: 26,
          background: "#C9D4E8",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 980,
          top: 470,
          width: 420,
          height: 270,
          background: C.ink,
          borderRadius: 18,
          border: "12px solid #2B3654",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 20,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${C.blue}, #5B8CFF)`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 1170,
          top: 740,
          width: 40,
          height: 22,
          background: "#2B3654",
        }}
      />
      <div style={{ position: "absolute", left: 1460 - walk, top: 330 - bob }}>
        <Ori size={330} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 820,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <Pop delay={sec(2.6)}>
          <div style={{ fontSize: 66, fontWeight: 900, color: C.ink }}>
            08:30 · היום הראשון של <span style={{ color: C.blue }}>אורי</span>{" "}
            במשרד
          </div>
          <div style={{ fontSize: 34, color: C.sub, marginTop: 8 }}>
            מתמחה צעיר במשרד רואי חשבון
          </div>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};

const Waveform: React.FC<{ start: number; dur: number }> = ({ start, dur }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + dur], [0, 1], clamp);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        height: 70,
        direction: "ltr",
      }}
    >
      {Array.from({ length: 34 }).map((_, i) => {
        const h = 14 + Math.abs(Math.sin(i * 1.7) * 44) + (i % 5) * 3;
        const played = i / 34 < p;
        return (
          <div
            key={i}
            style={{
              width: 7,
              height: h,
              borderRadius: 4,
              background: played ? C.green : "#C6D0E2",
            }}
          />
        );
      })}
    </div>
  );
};

const S2VoiceNote: React.FC = () => {
  const tasks = [
    { t: "חשבוניות ללקוח כהן", tag: "דחוף", color: "#E5484D" },
    { t: "התאמת בנק", tag: "היום", color: C.amber },
    { t: "טיוטות מכתבים למועדי דיווח", tag: "השבוע", color: C.blue },
  ];
  return (
    <AbsoluteFill>
      <Clock />
      <SceneTitle step="שלב 1" title="המנהל מקליט את סדר היום" />
      <Pop delay={4} style={{ position: "absolute", right: 200, top: 240 }}>
        <Manager size={300} />
      </Pop>
      {/* phone */}
      <Pop delay={8} style={{ position: "absolute", left: 230, top: 210 }}>
        <div
          style={{
            width: 520,
            height: 760,
            borderRadius: 60,
            background: C.ink,
            padding: 16,
            boxShadow: "0 30px 80px rgba(22,33,58,0.25)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 46,
              background: "#EEF3FB",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar who="manager" size={56} />
              <div style={{ fontSize: 28, fontWeight: 700, color: C.ink }}>
                הודעה קולית · המנהל
              </div>
            </div>
            <div
              style={{
                background: C.card,
                borderRadius: 26,
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: C.green,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                }}
              >
                ▶
              </div>
              <Waveform start={sec(0.8)} dur={sec(4)} />
            </div>
            <div style={{ fontSize: 24, color: C.sub, fontWeight: 700 }}>
              תמלול אוטומטי
            </div>
            {tasks.map((k, i) => (
              <Pop key={k.t} delay={sec(1.4 + i * 0.9)} from={20}>
                <div
                  style={{
                    background: C.card,
                    borderRadius: 18,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    fontSize: 28,
                    color: C.ink,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: C.sub }}>{i + 1}.</span>
                  <span style={{ flex: 1 }}>{k.t}</span>
                  <span
                    style={{
                      fontSize: 20,
                      color: "#fff",
                      background: k.color,
                      borderRadius: 999,
                      padding: "4px 14px",
                    }}
                  >
                    {k.tag}
                  </span>
                </div>
              </Pop>
            ))}
          </div>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const S3Chat: React.FC = () => (
  <AbsoluteFill>
    <Clock label="08:34" />
    <SceneTitle step="שלב 2" title="הודעה בצ'אט הפנימי" />
    <Pop delay={4} style={{ position: "absolute", left: 360, top: 230 }}>
      <Window title="צ'אט המשרד · אורי" width={1200} height={700}>
        <div
          style={{
            position: "absolute",
            inset: 40,
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              alignSelf: "center",
              fontSize: 22,
              color: C.sub,
              background: C.bg,
              borderRadius: 999,
              padding: "6px 18px",
            }}
          >
            היום · 08:34
          </div>
          <Sequence durationInFrames={sec(1.6)} layout="none">
            <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
              <Avatar who="ai" />
              <TypingDots until={sec(1.6)} />
            </div>
          </Sequence>
          <Sequence from={sec(1.6)} layout="none">
            <Bubble who="ai" name="עוזר ה-AI של המשרד" delay={0}>
              בוקר טוב אורי! ☀️ המנהל עדכן אותי על התוכנית להיום.
              <br />
              <b>נתחיל בחשבוניות של הלקוח כהן.</b>
            </Bubble>
          </Sequence>
          <Sequence from={sec(3.4)} layout="none">
            <Bubble who="ori" name="אורי" delay={0} mine>
              מעולה, איך הכי מהר?
            </Bubble>
          </Sequence>
        </div>
      </Window>
    </Pop>
  </AbsoluteFill>
);

const S4ToolMatch: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.5 + 0.5 * Math.sin(frame / 7);
  const features = [
    "קורא חשבוניות",
    "מחלץ ספק, תאריך וסכום",
    "בלי הקלדה ידנית",
  ];
  return (
    <AbsoluteFill>
      <Clock label="08:35" />
      <SceneTitle step="שלב 3" title="ה-AI מתאים לאורי כלי" />
      <Pop delay={6} style={{ position: "absolute", left: 460, top: 250 }}>
        <div
          style={{
            width: 1000,
            background: C.card,
            borderRadius: 32,
            padding: "44px 56px",
            boxShadow: `0 30px 80px rgba(22,33,58,0.15), 0 0 ${30 + glow * 30}px rgba(0,72,191,${0.15 + glow * 0.15})`,
            border: `3px solid ${C.blue}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Avatar who="ai" size={72} />
            <div style={{ fontSize: 30, color: C.blue, fontWeight: 700 }}>
              💡 המלצה מותאמת למשימה
            </div>
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: C.ink,
              marginTop: 26,
              direction: "rtl",
            }}
          >
            <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>
              Nanonets
            </span>{" "}
            יחסוך לך הקלדה
          </div>
          <div
            style={{
              display: "flex",
              gap: 18,
              marginTop: 30,
              flexWrap: "wrap",
            }}
          >
            {features.map((f, i) => (
              <Pop key={f} delay={sec(1.2 + i * 0.6)} from={20}>
                <div
                  style={{
                    background: C.greenLight,
                    color: C.green,
                    fontSize: 30,
                    fontWeight: 700,
                    borderRadius: 999,
                    padding: "12px 26px",
                  }}
                >
                  ✔ {f}
                </div>
              </Pop>
            ))}
          </div>
          <Pop delay={sec(3.4)} from={20} style={{ marginTop: 40 }}>
            <div
              style={{
                display: "inline-block",
                background: C.blue,
                color: "#fff",
                fontSize: 34,
                fontWeight: 900,
                borderRadius: 18,
                padding: "18px 44px",
                transform: `scale(${frame > sec(4.6) && frame < sec(5) ? 0.94 : 1})`,
              }}
            >
              בוא נתחיל ←
            </div>
          </Pop>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const INVOICES = [
  { supplier: "אלקטרה בע״מ", date: "02/10/2026", amount: "₪ 4,820.00" },
  { supplier: "משרדי פלוס", date: "03/10/2026", amount: "₪ 1,265.50" },
  { supplier: "תדמית הפקות", date: "04/10/2026", amount: "₪ 9,900.00" },
];
const TOTAL_INVOICES = 12;

const Field: React.FC<{
  label: string;
  value: string;
  start: number;
  highlight?: string;
}> = ({ label, value, start, highlight }) => {
  const frame = useCurrentFrame();
  const filled = frame >= start;
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{ fontSize: 24, color: C.sub, fontWeight: 700, marginBottom: 6 }}
      >
        {label}
      </div>
      <div
        style={{
          height: 66,
          borderRadius: 14,
          border: `2px solid ${filled ? (highlight ?? C.green) : C.line}`,
          background: filled ? "#F7FCF9" : "#FAFBFD",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          fontSize: 32,
          fontWeight: 700,
          color: C.ink,
        }}
      >
        {filled ? <Type text={value} start={start} cps={60} /> : null}
      </div>
    </div>
  );
};

const S5Walkthrough: React.FC = () => {
  const frame = useCurrentFrame();
  const per = sec(3); // first three invoices shown in detail
  const idx = Math.min(INVOICES.length - 1, Math.floor(frame / per));
  const local = frame - idx * per;
  const inv = INVOICES[idx];
  const scanY = interpolate(local, [6, 36], [0, 100], clamp);
  const count =
    frame < per * 3
      ? idx + 1
      : Math.min(TOTAL_INVOICES, 3 + Math.floor((frame - per * 3) / 4));
  const fastForward = frame >= per * 3;
  const fieldStart = 34;
  return (
    <AbsoluteFill>
      <Clock label="08:41" />
      <SceneTitle step="שלב 4" title="הדרכה בלייב: מ-Nanonets ישר ל-Priority" />
      {/* invoice + scanner */}
      <Pop delay={2} style={{ position: "absolute", right: 140, top: 230 }}>
        <Window
          title="Nanonets · סריקת חשבוניות"
          width={760}
          height={700}
          accent="#1F2A44"
        >
          <div
            style={{
              position: "absolute",
              inset: 36,
              background: "#FCFCFE",
              border: `2px solid ${C.line}`,
              borderRadius: 12,
              padding: 30,
              overflow: "hidden",
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 900, color: C.ink }}>
              חשבונית מס
            </div>
            <div style={{ fontSize: 22, color: C.sub, marginTop: 4 }}>
              לקוח: כהן ושות׳
            </div>
            {[
              { k: "ספק", v: inv.supplier, t: 14 },
              { k: "תאריך", v: inv.date, t: 22 },
              { k: "סכום לתשלום", v: inv.amount, t: 30 },
            ].map((row) => (
              <div
                key={row.k}
                style={{
                  marginTop: 26,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 30,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `3px solid ${local > row.t ? C.amber : "transparent"}`,
                  background:
                    local > row.t ? "rgba(242,163,58,0.10)" : "transparent",
                }}
              >
                <span style={{ color: C.sub }}>{row.k}</span>
                <span
                  style={{
                    fontWeight: 900,
                    color: C.ink,
                    direction: row.k === "ספק" ? "rtl" : "ltr",
                  }}
                >
                  {row.v}
                </span>
              </div>
            ))}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 14,
                  borderRadius: 7,
                  background: "#EEF1F7",
                  marginTop: 22,
                  width: `${90 - i * 15}%`,
                }}
              />
            ))}
            {!fastForward ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${scanY}%`,
                  height: 6,
                  background: C.green,
                  boxShadow: `0 0 24px 6px rgba(19,163,111,0.55)`,
                }}
              />
            ) : null}
          </div>
        </Window>
      </Pop>
      {/* arrow */}
      <div
        style={{
          position: "absolute",
          left: 905,
          top: 540,
          fontSize: 90,
          color: C.blue,
          opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 8)),
        }}
      >
        ←
      </div>
      {/* priority form */}
      <Pop delay={8} style={{ position: "absolute", left: 140, top: 230 }}>
        <Window
          title="Priority · קליטת חשבונית ספק"
          width={700}
          height={700}
          accent={C.blue}
        >
          <div key={idx} style={{ position: "absolute", inset: 36 }}>
            <Field
              label="ספק"
              value={inv.supplier}
              start={idx * per + fieldStart}
            />
            <Field
              label="תאריך"
              value={inv.date}
              start={idx * per + fieldStart + 8}
            />
            <Field
              label="סכום"
              value={inv.amount}
              start={idx * per + fieldStart + 16}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 14,
                fontSize: 28,
                fontWeight: 700,
                color: local > fieldStart + 30 || fastForward ? C.green : C.sub,
              }}
            >
              {local > fieldStart + 30 || fastForward
                ? "✔ נקלט אוטומטית · ללא הקלדה"
                : "ממתין לנתונים…"}
            </div>
          </div>
        </Window>
      </Pop>
      {/* counter */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 960,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: C.card,
            borderRadius: 999,
            padding: "14px 34px",
            fontSize: 32,
            fontWeight: 900,
            color: C.ink,
            boxShadow: "0 10px 30px rgba(22,33,58,0.10)",
            display: "flex",
            gap: 20,
            alignItems: "center",
          }}
        >
          <span>
            חשבונית{" "}
            <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>
              {count}/{TOTAL_INVOICES}
            </span>
          </span>
          <div
            style={{
              width: 360,
              height: 16,
              borderRadius: 8,
              background: C.line,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(count / TOTAL_INVOICES) * 100}%`,
                height: "100%",
                background: C.green,
                borderRadius: 8,
              }}
            />
          </div>
          {fastForward ? <span style={{ color: C.blue }}>⏩</span> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const S6Done: React.FC = () => {
  const stats = [
    { n: "12", l: "חשבוניות עובדו" },
    { n: "4", l: "דקות בלבד" },
    { n: "0", l: "הקלדה ידנית" },
  ];
  return (
    <AbsoluteFill>
      <Clock label="08:45" />
      <Pop delay={2} style={{ position: "absolute", right: 260, top: 230 }}>
        <Ori size={380} />
      </Pop>
      <Pop
        delay={10}
        style={{ position: "absolute", right: 300, top: 180, fontSize: 90 }}
      >
        ✅
      </Pop>
      <div style={{ position: "absolute", left: 160, top: 250, width: 980 }}>
        <Pop delay={6}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: C.ink,
              lineHeight: 1.15,
            }}
          >
            כל החשבוניות עובדו
            <br />
            <span style={{ color: C.green }}>בלי הקלדה ובלי לבקש עזרה</span>
          </div>
        </Pop>
        <div style={{ display: "flex", gap: 30, marginTop: 60 }}>
          {stats.map((s, i) => (
            <Pop key={s.l} delay={sec(1 + i * 0.4)}>
              <div
                style={{
                  width: 290,
                  background: C.card,
                  borderRadius: 26,
                  padding: "30px 20px",
                  textAlign: "center",
                  boxShadow: "0 16px 40px rgba(22,33,58,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: 96,
                    fontWeight: 900,
                    color: C.blue,
                    lineHeight: 1,
                  }}
                >
                  {s.n}
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: C.sub,
                    marginTop: 10,
                  }}
                >
                  {s.l}
                </div>
              </div>
            </Pop>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Notification: React.FC<{
  delay: number;
  icon: string;
  title: string;
  body: string;
  color: string;
}> = ({ delay, icon, title, body, color }) => (
  <Pop delay={delay} from={-40}>
    <div
      style={{
        width: 760,
        background: C.card,
        borderRadius: 26,
        padding: "24px 28px",
        display: "flex",
        gap: 22,
        alignItems: "center",
        boxShadow: "0 20px 50px rgba(22,33,58,0.14)",
        borderRight: `10px solid ${color}`,
      }}
    >
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: 20,
          background: color,
          color: "#fff",
          fontSize: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, color: C.sub, fontWeight: 700 }}>
          {title}
        </div>
        <div
          style={{ fontSize: 34, color: C.ink, fontWeight: 900, marginTop: 4 }}
        >
          {body}
        </div>
      </div>
    </div>
  </Pop>
);

const S7AutoUpdate: React.FC = () => (
  <AbsoluteFill>
    <Clock label="08:45" />
    <SceneTitle step="שלב 5" title="עדכון אוטומטי למנהל" />
    {/* manager side */}
    <div
      style={{
        position: "absolute",
        right: 140,
        top: 260,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      <Pop delay={2}>
        <Manager size={230} />
      </Pop>
      <Notification
        delay={sec(0.8)}
        icon="✔"
        title="צ'אט המשרד · למנהל"
        body="אורי סיים לעבד את החשבוניות"
        color={C.green}
      />
    </div>
    {/* ori side */}
    <div
      style={{
        position: "absolute",
        left: 140,
        top: 260,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      <Pop delay={sec(1.8)}>
        <Ori size={230} />
      </Pop>
      <Notification
        delay={sec(2.6)}
        icon="→"
        title="עוזר ה-AI · לאורי"
        body="המשימה הבאה: התאמת בנק"
        color={C.blue}
      />
    </div>
  </AbsoluteFill>
);

const S8EndCard: React.FC = () => {
  const s = useEnter(4, 14);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${C.blue}, #0A2E7A)`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <Img
        src={staticFile("office-demo/public-logo-white.svg")}
        style={{ width: 720, transform: `scale(${0.8 + s * 0.2})`, opacity: s }}
      />
      <Pop delay={sec(1)} style={{ marginTop: 50 }}>
        <div style={{ fontSize: 60, fontWeight: 900 }}>
          הכלי הנכון, לאדם הנכון, ברגע הנכון
        </div>
        <div style={{ fontSize: 36, marginTop: 14, opacity: 0.85 }}>
          עוזר AI שמכיר את המשימות של כל עובד במשרד
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const SCENES = [
  S1Arrival,
  S2VoiceNote,
  S3Chat,
  S4ToolMatch,
  S5Walkthrough,
  S6Done,
  S7AutoUpdate,
  S8EndCard,
];
const FADE = 10;

const Fader: React.FC<{
  len: number;
  first: boolean;
  children: React.ReactNode;
}> = ({ len, first, children }) => {
  const frame = useCurrentFrame();
  const fadeIn = first ? 1 : interpolate(frame, [0, FADE], [0, 1], clamp);
  const fadeOut = interpolate(frame, [len - FADE, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      {children}
    </AbsoluteFill>
  );
};

export const OfficeAIDemo: React.FC = () => (
  <AbsoluteFill
    style={{ direction: "rtl", fontFamily: FONT_FAMILY, color: C.ink }}
  >
    <Background />
    <Html5Audio
      src={staticFile("office-demo/music.mp3")}
      volume={(f) =>
        interpolate(
          f,
          [0, 10, DEMO_DURATION - 30, DEMO_DURATION],
          [0, 0.55, 0.55, 0],
          clamp,
        )
      }
    />
    {SCENES.map((Scene, i) => {
      const start = Math.max(0, CUTS[i] - (i > 0 ? FADE : 0));
      const len = CUTS[i + 1] - start;
      return (
        <Sequence key={i} from={start} durationInFrames={len}>
          <Fader len={len} first={i === 0}>
            <Scene />
          </Fader>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
