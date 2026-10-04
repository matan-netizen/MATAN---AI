import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  AnimatedCounter,
  Badge,
  CTAButton,
  HeroTextText,
  Particles,
} from "./components";
import { COLORS, GOLD_GRADIENT } from "./theme";

const Stack: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 40,
}) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap,
      padding: "0 70px",
    }}
  >
    {children}
  </AbsoluteFill>
);

// Scene 1 — aggressive hook with a pulsing attention badge.
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 7, stiffness: 200 } });
  const pulse = 1 + Math.sin(frame * 0.6) * 0.08;
  const shake = frame < 20 ? Math.sin(frame * 3) * (20 - frame) * 0.6 : 0;

  return (
    <Stack gap={50}>
      <div style={{ position: "relative", width: 300, height: 300 }}>
        {[0, 10, 20].map((o) => {
          const p = ((frame + o) % 30) / 30;
          return (
            <div
              key={o}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `8px solid ${COLORS.red}`,
                opacity: 1 - p,
                transform: `scale(${1 + p * 0.9})`,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `radial-gradient(circle, #ff6b7a 0%, ${COLORS.red} 70%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 160,
            transform: `scale(${enter * pulse})`,
            boxShadow: `0 0 90px ${COLORS.red}`,
          }}
        >
          🚨
        </div>
      </div>
      <div style={{ transform: `translateX(${shake}px)` }}>
        <HeroTextText size={150} delay={4}>
          משקיעים
        </HeroTextText>
        <HeroTextText size={150} delay={9} variant="gold" emoji="❤️">
          שימו
        </HeroTextText>
      </div>
      <HeroTextText size={88} delay={20} weight={700}>
        ההשקעה הכי טובה
        <br />
        <span style={{ color: COLORS.blue }}>בצפון 🫵</span>
      </HeroTextText>
    </Stack>
  );
};

// Scene 2 — immediate return metric with an animated counter.
export const SceneReturn: React.FC = () => {
  const frame = useCurrentFrame();
  const coinY = (i: number) =>
    interpolate((frame + i * 17) % 60, [0, 60], [-200, 2100]);

  return (
    <AbsoluteFill>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 80 + i * 170,
            top: coinY(i),
            fontSize: 90,
            opacity: 0.35,
            transform: `rotate(${frame * (i % 2 ? 6 : -6)}deg)`,
          }}
        >
          💰
        </div>
      ))}
      <Stack gap={30}>
        <HeroTextText size={110} delay={0}>
          מעל
        </HeroTextText>
        <AnimatedCounter
          from={0}
          to={200000}
          suffix=" ₪"
          delay={6}
          duration={40}
          size={200}
        />
        <HeroTextText size={120} delay={14} variant="blue">
          תשואה מיידית
        </HeroTextText>
        <HeroTextText size={80} delay={24} weight={700}>
          כבר בביצוע העסקה 💰
        </HeroTextText>
      </Stack>
    </AbsoluteFill>
  );
};

// Scene 3 — rising chart line in background + 24h countdown badge.
export const SceneGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 45], [0, 1], {
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 2),
  });
  const path =
    "M 0 1500 L 180 1380 L 330 1430 L 520 1150 L 680 1220 L 860 880 L 1080 560";
  const length = 1900;
  // Ticking "23:59:SS" countdown, sped up so the seconds visibly race.
  const seconds = 59 - (Math.floor(frame / 1.5) % 60);

  return (
    <AbsoluteFill>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", opacity: 0.85 }}
      >
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.45} />
            <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path
          d={`${path} L 1080 1920 L 0 1920 Z`}
          fill="url(#area)"
          opacity={draw}
        />
        <path
          d={path}
          fill="none"
          stroke={COLORS.blue}
          strokeWidth={14}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - draw)}
          style={{ filter: `drop-shadow(0 0 18px ${COLORS.blue})` }}
        />
      </svg>
      <Stack gap={36}>
        <HeroTextText size={90} delay={0} variant="gold">
          בנוסף:
        </HeroTextText>
        <HeroTextText size={104} delay={6}>
          עליית ערך
          <br />
          מטורפת בעתיד 📈
        </HeroTextText>
        <div style={{ height: 30 }} />
        <HeroTextText size={84} delay={22} weight={700}>
          תנאים שוברי שוק 💥
        </HeroTextText>
        <Badge delay={28} blink color={COLORS.red} size={78}>
          ⏱ 24 שעות בלבד
        </Badge>
        <div
          style={{
            direction: "ltr",
            fontSize: 70,
            fontWeight: 900,
            fontVariantNumeric: "tabular-nums",
            color: COLORS.white,
            opacity: interpolate(frame, [32, 40], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            textShadow: `0 0 20px ${COLORS.red}`,
          }}
        >
          {`23:59:${String(seconds).padStart(2, "0")}`}
        </div>
      </Stack>
    </AbsoluteFill>
  );
};

// Scene 4 — urgency: glowing warning frame and "last apartments" grid.
export const SceneUrgency: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = 0.5 + 0.5 * Math.sin(frame * 0.45);
  const units = 12;
  const available = new Set([4, 9]);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          margin: 36,
          borderRadius: 50,
          border: `10px solid ${COLORS.red}`,
          boxShadow: `0 0 ${40 + glow * 80}px ${COLORS.red}, inset 0 0 ${40 + glow * 80}px ${COLORS.red}`,
          opacity: 0.6 + glow * 0.4,
        }}
      />
      <Stack gap={46}>
        <Badge delay={0} blink color={COLORS.red} size={90}>
          ‼️ דירות אחרונות!
        </Badge>
        <HeroTextText size={120} delay={8}>
          הזדמנות
          <br />
          <span style={{ color: COLORS.gold }}>שלא חוזרת</span>
        </HeroTextText>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 170px)",
            gap: 22,
          }}
        >
          {new Array(units).fill(0).map((_, i) => {
            const s = spring({
              frame: frame - 16 - i * 2,
              fps,
              config: { damping: 12 },
            });
            const isFree = available.has(i);
            return (
              <div
                key={i}
                style={{
                  height: 120,
                  borderRadius: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  fontWeight: 900,
                  transform: `scale(${s})`,
                  background: isFree ? GOLD_GRADIENT : "rgba(255,255,255,0.08)",
                  color: isFree ? "#1a1204" : "rgba(255,255,255,0.4)",
                  border: isFree ? "none" : "3px solid rgba(255,255,255,0.15)",
                  boxShadow: isFree
                    ? `0 0 ${20 + glow * 40}px ${COLORS.gold}`
                    : "none",
                }}
              >
                {isFree ? "פנוי" : "נמכר"}
              </div>
            );
          })}
        </div>
        <HeroTextText size={80} delay={30} weight={700}>
          נשארו דירות אחרונות בהחלט! ‼️
        </HeroTextText>
      </Stack>
    </AbsoluteFill>
  );
};

// Scene 5 — hero card for the equity entry point with particle glow.
export const SceneEquity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = spring({
    frame: frame - 4,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const shine = interpolate(frame % 50, [0, 50], [-400, 1400]);

  return (
    <AbsoluteFill>
      <Particles count={45} />
      <Stack gap={50}>
        <HeroTextText size={110} delay={0}>
          החל מ-
        </HeroTextText>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "70px 60px",
            borderRadius: 50,
            background:
              "linear-gradient(145deg, rgba(30,36,52,0.95), rgba(10,12,20,0.95))",
            border: `5px solid ${COLORS.gold}`,
            boxShadow: `0 0 80px rgba(245,196,81,0.55), 0 30px 80px rgba(0,0,0,0.6)`,
            transform: `scale(${card}) rotate(${(1 - card) * 8}deg)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: shine,
              width: 160,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
              transform: "skewX(-20deg)",
            }}
          />
          <AnimatedCounter
            from={100000}
            to={190000}
            suffix=" ₪"
            delay={8}
            duration={30}
            size={180}
          />
          <div style={{ fontSize: 110, fontWeight: 900, color: COLORS.white }}>
            הון עצמי
          </div>
        </div>
        <HeroTextText size={110} delay={26} variant="gold" emoji="💰🤩">
          ואתם בפנים!
        </HeroTextText>
      </Stack>
    </AbsoluteFill>
  );
};

// Scene 6 — call to action with bouncing arrow and pulsing call button.
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const bounce = Math.abs(Math.sin(frame * 0.25)) * 40;
  const arrowIn = interpolate(frame, [20, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Stack gap={44}>
      <Badge delay={0} color={COLORS.blueDeep} size={80}>
        ✨ נפתחה ההרשמה!
      </Badge>
      <HeroTextText size={96} delay={8}>
        לחצו לפרטים
        <br />
        ושריינו את המחיר
        <br />
        <span style={{ color: COLORS.gold }}>עכשיו 👇</span>
      </HeroTextText>
      <svg
        width={140}
        height={160}
        viewBox="0 0 140 160"
        style={{ opacity: arrowIn, transform: `translateY(${bounce}px)` }}
      >
        <path
          d="M70 10 V120 M20 80 L70 140 L120 80"
          stroke={COLORS.gold}
          strokeWidth={22}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ filter: `drop-shadow(0 0 16px ${COLORS.gold})` }}
        />
      </svg>
      <CTAButton label="התקשרו עכשיו" delay={26} />
      <HeroTextText size={76} delay={36} weight={700} variant="blue" emoji="📞">
        דברו איתנו
      </HeroTextText>
    </Stack>
  );
};
