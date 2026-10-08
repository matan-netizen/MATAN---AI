import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Counter,
  CtaButton,
  DownArrows,
  FinePrint,
  Flash,
  Ltr,
  Mascot,
  Particles,
  Photo,
  Pop,
  Shade,
  Stamp,
  Ticket,
  Whip,
} from "./components";
import { COLORS, FONT, GOLD_GRADIENT, IMG } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Stack: React.FC<{
  children: React.ReactNode;
  top?: number;
  gap?: number;
  justify?: "flex-start" | "center" | "flex-end";
  bottom?: number;
}> = ({ children, top = 0, gap = 10, justify = "flex-start", bottom = 0 }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: justify,
      paddingTop: top,
      paddingBottom: bottom,
      gap,
    }}
  >
    {children}
  </AbsoluteFill>
);

const DarkGold: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(circle at 50% 38%, #5A3E1E 0%, #22160B 55%, #0D0A07 100%)",
    }}
  />
);

// 0–3s — Hook: Jerusalem, the view, the apartment.
export const SceneHook: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={24} layout="none">
      <Photo src={IMG.kotel} position="55% 50%" from={1.5} to={1.1} />
      <Shade strength={0.6} top />
      <Stack top={760}>
        <Pop delay={3} size={190} color={COLORS.yellow} shake>
          ירושלים
        </Pop>
      </Stack>
    </Sequence>
    <Sequence from={24} durationInFrames={24} layout="none">
      <Whip>
        <Photo src={IMG.view} position="40% 50%" from={1.35} to={1.1} />
      </Whip>
    </Sequence>
    <Sequence durationInFrames={48} layout="none">
      <Stack top={230}>
        <Pop delay={4} size={92}>
          תדמיין שזה
        </Pop>
        <Pop delay={10} size={120} color={COLORS.yellow}>
          הנוף שלך
        </Pop>
        <Pop delay={16} size={92}>
          כל בוקר…
        </Pop>
      </Stack>
    </Sequence>
    <Sequence from={48} durationInFrames={42} layout="none">
      <Whip from="left">
        <Photo src={IMG.living} position="45% 50%" from={1.3} to={1.08} />
        <Shade strength={0.9} />
      </Whip>
      <Stack justify="flex-end" bottom={420}>
        <Pop delay={4} size={96}>
          הדירה הזאת
        </Pop>
        <Pop delay={9} size={96}>
          יכולה להיות
        </Pop>
        <Pop delay={14} size={190} color={COLORS.green} shake>
          שלך
        </Pop>
      </Stack>
      <FinePrint>התמונות להמחשה בלבד</FinePrint>
    </Sequence>
  </AbsoluteFill>
);

// 3–10s — Surprise: 660 shekels is all it takes.
export const SceneSurprise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = interpolate(frame, [0, 6, 12], [1.25, 0.97, 1], clamp);
  const cashIn = spring({ frame: frame - 12, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={90} layout="none">
        <AbsoluteFill style={{ transform: `scale(${punch})` }}>
          <DarkGold />
          <Mascot
            src={IMG.mascotPoint}
            delay={0}
            height={1100}
            side="left"
            offset={-60}
          />
          <Img
            src={staticFile(IMG.cash)}
            style={{
              position: "absolute",
              right: 40,
              top: 860,
              width: 520,
              transform: `scale(${cashIn}) rotate(${(1 - cashIn) * 40 - 8}deg)`,
              filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.6))",
            }}
          />
          <Stack top={240} gap={0}>
            <Pop delay={2} size={120}>
              יש לך
            </Pop>
            <Pop delay={10} size={260} color={COLORS.yellow} shake>
              <Ltr>₪660</Ltr>
            </Pop>
            <Pop delay={20} size={120}>
              בכיס?
            </Pop>
          </Stack>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={90} durationInFrames={120} layout="none">
        <Whip>
          <Photo
            src={IMG.dining}
            position="40% 50%"
            from={1.2}
            to={1.05}
            ramp={false}
            filter="brightness(0.45)"
          />
        </Whip>
        <Stack top={230} gap={6}>
          <Pop delay={6} size={110}>
            זה כל מה
          </Pop>
          <Pop delay={18} size={110}>
            שאתה צריך
          </Pop>
          <Pop delay={30} size={110}>
            כדי לזכות
          </Pop>
          <Pop delay={44} size={124} color={COLORS.yellow}>
            בדירת חלומות!
          </Pop>
        </Stack>
        <Sequence from={62} layout="none">
          <Equation />
        </Sequence>
      </Sequence>
    </AbsoluteFill>
  );
};

// "₪660 ticket → apartment" split visual.
const Equation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 12 } });
  const b = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const c = spring({ frame: frame - 18, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 36,
        paddingTop: 760,
      }}
    >
      <div style={{ transform: `scale(${a}) rotate(-6deg)` }}>
        <Ticket width={360} />
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 120,
          color: COLORS.yellow,
          textShadow: `0 0 20px ${COLORS.yellow}`,
          transform: `scale(${b})`,
        }}
      >
        ←
      </div>
      <div
        style={{
          width: 380,
          height: 300,
          borderRadius: 26,
          overflow: "hidden",
          border: `6px solid ${COLORS.goldLight}`,
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          transform: `scale(${c}) rotate(5deg)`,
        }}
      >
        <Img
          src={staticFile(IMG.balcony)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};

const TOUR = [
  { src: IMG.living, pos: "50% 50%" },
  { src: IMG.kitchen, pos: "50% 50%" },
  { src: IMG.bedroom, pos: "45% 50%" },
  { src: IMG.balcony, pos: "60% 50%" },
];
const SHOT = 30;

// 10–14s — The prize: speed-ramped tour with the value counter.
export const SceneApartment: React.FC = () => (
  <AbsoluteFill>
    {TOUR.map((shot, i) => (
      <Sequence
        key={shot.src}
        from={i * SHOT}
        durationInFrames={SHOT}
        layout="none"
      >
        <Photo src={shot.src} position={shot.pos} from={1.35} to={1.08} />
        {i > 0 ? <Flash /> : null}
      </Sequence>
    ))}
    <Shade strength={0.75} top />
    <Shade strength={0.92} />
    <Stack top={200} gap={4}>
      <Pop delay={2} size={84}>
        דירת יוקרה מרוהטת
      </Pop>
      <Pop delay={8} size={104} color={COLORS.yellow}>
        בירושלים
      </Pop>
    </Stack>
    <Stack justify="flex-end" bottom={330} gap={0}>
      <Pop delay={8} size={64} weight={700}>
        בשווי
      </Pop>
      <Counter from={0} to={1300000} start={10} end={90} size={170} />
    </Stack>
    <FinePrint />
  </AbsoluteFill>
);

// 14–16s — Or the cash alternative.
export const SceneCash: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = interpolate(frame, [2, 10], [-700, 0], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const shake = frame > 10 && frame < 18 ? Math.sin(frame * 3) * 14 : 0;
  return (
    <AbsoluteFill style={{ transform: `translateY(${shake}px)` }}>
      <DarkGold />
      {[
        { x: -120, y: 260, r: -25, d: 4 },
        { x: 640, y: 1180, r: 20, d: 8 },
        { x: 620, y: 200, r: 15, d: 12 },
        { x: -80, y: 1250, r: -12, d: 16 },
      ].map(({ x, y, r, d }) => {
        const p = interpolate(frame, [d, d + 12], [0, 1], clamp);
        return (
          <Img
            key={`${x}-${y}`}
            src={staticFile(IMG.cash)}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 560,
              opacity: p,
              transform: `scale(${0.4 + 0.6 * p}) rotate(${r}deg)`,
            }}
          />
        );
      })}
      <Particles at={10} count={70} />
      <Stack justify="center" gap={10}>
        <Pop delay={0} size={110}>
          או
        </Pop>
        <div style={{ transform: `translateY(${drop}px)` }}>
          <Pop delay={2} size={210} color={COLORS.yellow}>
            <Ltr>$700,000</Ltr>
          </Pop>
        </div>
        <div style={{ height: 30 }} />
        <Stamp delay={20} size={110}>
          במזומן!
        </Stamp>
      </Stack>
    </AbsoluteFill>
  );
};

// 16–20s — The 1+1 offer: one ticket slot becomes two.
export const SceneOffer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const split = spring({ frame: frame - 30, fps, config: { damping: 12 } });
  const twin = spring({ frame: frame - 36, fps, config: { damping: 9 } });
  const meter = interpolate(frame, [90, 102], [0.5, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(2)),
  });
  const glowPulse = 0.6 + 0.4 * Math.sin(frame * 0.35);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #0F4A12 0%, #07210A 50%, #0D0A07 100%)",
        }}
      />
      <Stack top={170} gap={18}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 54,
            color: COLORS.white,
            background: COLORS.red,
            padding: "10px 34px",
            borderRadius: 999,
            transform: `scale(${spring({ frame, fps, config: { damping: 12 } })})`,
          }}
        >
          מבצע לזמן מוגבל
        </div>
        <Pop
          delay={36}
          size={250}
          color={COLORS.green}
          style={{ opacity: frame < 36 ? 0 : 0.75 + 0.25 * glowPulse }}
        >
          <Ltr>1+1</Ltr>
        </Pop>
      </Stack>
      {/* Two ticket slots: the paid ticket slides right, the free one appears. */}
      <AbsoluteFill style={{ top: 760, height: 380 }}>
        {[0, 1].map((slot) => (
          <div
            key={slot}
            style={{
              position: "absolute",
              top: 0,
              left: slot === 0 ? 570 : 70,
              width: 440,
              height: 270,
              borderRadius: 30,
              border: `5px dashed ${COLORS.green}88`,
              opacity: interpolate(frame, [24, 32], [0, 1], clamp),
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            top: 15,
            left: 320 + split * 270,
          }}
        >
          <Ticket width={400} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 15,
            left: 320 - split * 230,
            transform: `scale(${twin})`,
            opacity: frame < 36 ? 0 : 1,
          }}
        >
          <Ticket width={400} free />
        </div>
      </AbsoluteFill>
      <Stack top={1120} gap={20}>
        <Stamp delay={55} size={96}>
          במתנה!
        </Stamp>
        <Pop delay={68} size={58} weight={700}>
          קונים כרטיס, מקבלים עוד אחד בחינם
        </Pop>
      </Stack>
      {frame >= 90 ? (
        <Stack top={1440}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 120,
              color: COLORS.yellow,
              textShadow: `0 0 24px ${COLORS.yellow}`,
              transform: `scale(${meter})`,
              whiteSpace: "nowrap",
            }}
          >
            <Ltr>x2</Ltr> סיכויים!
          </div>
        </Stack>
      ) : null}
    </AbsoluteFill>
  );
};

const CAUSE = [
  { src: IMG.soldiers, label: "חיילי צה״ל" },
  { src: IMG.ambulance, label: "ציוד רפואי לשעת חירום" },
  { src: IMG.torah, label: "ספרי תורה לבסיסי צה״ל" },
];

// 20–23s — The value: every ticket supports Am Yisrael Chai.
export const SceneCause: React.FC = () => {
  const frame = useCurrentFrame();
  const underline = interpolate(frame, [50, 66], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      {CAUSE.map((c, i) => {
        const opacity = interpolate(frame - i * 30, [0, 10], [0, 1], clamp);
        return (
          <Sequence key={c.src} from={i * 30} layout="none">
            <AbsoluteFill style={{ opacity }}>
              <Photo
                src={c.src}
                from={1.12}
                to={1.0}
                ramp={false}
                duration={40}
                filter="sepia(0.25) saturate(1.1) brightness(0.8)"
              />
            </AbsoluteFill>
            <div
              style={{
                position: "absolute",
                top: 1180,
                left: 0,
                right: 0,
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 46,
                  color: COLORS.white,
                  background: "rgba(13,10,7,0.65)",
                  padding: "10px 28px",
                  borderRadius: 14,
                  opacity: interpolate(frame - i * 30, [4, 12], [0, 1], clamp),
                }}
              >
                {c.label}
              </span>
            </div>
          </Sequence>
        );
      })}
      <Shade strength={0.8} top />
      <Shade strength={0.9} />
      <Stack top={190} gap={8}>
        <Pop delay={2} size={78} weight={700}>
          וכל כרטיס תומך בקרן
        </Pop>
        <Pop delay={10} size={136} color={COLORS.yellow}>
          ״עם ישראל חי״
        </Pop>
        <Pop delay={22} size={54} weight={700}>
          חיילים · משפחות · פצועים
        </Pop>
      </Stack>
      <Stack justify="flex-end" bottom={330} gap={8}>
        <Pop delay={44} size={110}>
          זוכים ונותנים
        </Pop>
        <div
          style={{
            width: 520 * underline,
            height: 12,
            borderRadius: 6,
            background: COLORS.green,
            boxShadow: `0 0 20px ${COLORS.green}`,
          }}
        />
      </Stack>
    </AbsoluteFill>
  );
};

// 23–26s — Urgency: a draining timer ring.
export const SceneUrgency: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const left = 1 - frame / durationInFrames;
  const r = 250;
  const circ = 2 * Math.PI * r;
  const blink = Math.floor(frame / 8) % 2 === 0;
  const beat = 1 + 0.06 * Math.max(0, Math.cos((frame / 15) * Math.PI * 2));
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #4A0D0A 0%, #1A0605 55%, #0D0A07 100%)",
        }}
      />
      <Stack top={160} gap={6}>
        <Pop delay={0} size={92}>
          אבל תקשיב,
        </Pop>
        <Pop delay={8} size={92}>
          המבצע הזה
        </Pop>
      </Stack>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 60,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 600,
            height: 600,
            transform: `scale(${beat})`,
          }}
        >
          <svg
            width={600}
            height={600}
            style={{ position: "absolute", inset: 0 }}
          >
            <circle
              cx={300}
              cy={300}
              r={r}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={34}
              fill="none"
            />
            <circle
              cx={300}
              cy={300}
              r={r}
              stroke={COLORS.yellow}
              strokeWidth={34}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - left)}
              transform="rotate(-90 300 300)"
              style={{ filter: `drop-shadow(0 0 16px ${COLORS.yellow})` }}
            />
          </svg>
          <AbsoluteFill
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 170,
                color: COLORS.green,
                textShadow: `0 0 24px ${COLORS.green}`,
              }}
            >
              <Ltr>1+1</Ltr>
            </div>
          </AbsoluteFill>
        </div>
      </AbsoluteFill>
      <Stack justify="flex-end" bottom={480}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 120,
            color: blink ? COLORS.red : COLORS.yellow,
            textShadow: `0 0 26px ${blink ? COLORS.red : COLORS.yellow}`,
            opacity: frame < 20 ? 0 : 1,
          }}
        >
          נסגר בקרוב!
        </div>
      </Stack>
    </AbsoluteFill>
  );
};

// Phone mockup showing the campaign page; the button gets tapped.
const Phone: React.FC<{ tapAt: number }> = ({ tapAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const t = frame - tapAt;
  const press = t >= 0 && t < 6 ? 0.92 : 1;
  const ripple = interpolate(t, [0, 18], [0, 1], clamp);
  const ticket = spring({
    frame: frame - tapAt - 8,
    fps,
    config: { damping: 9 },
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 270,
        top: 560,
        width: 540,
        height: 980,
        transform: `translateY(${(1 - enter) * 1200}px) rotate(-4deg)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 70,
          background: "#111",
          border: "10px solid #2a2a2a",
          boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 14,
            borderRadius: 56,
            background: "#F7F1E6",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Img
            src={staticFile(IMG.balcony)}
            style={{ width: "100%", height: 300, objectFit: "cover" }}
          />
          <Img
            src={staticFile(IMG.logo)}
            style={{ width: 170, marginTop: -80 }}
          />
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 40,
              color: COLORS.brown,
              textAlign: "center",
              marginTop: 10,
              lineHeight: 1.15,
            }}
          >
            דירת יוקרה בשווי
            <br />
            <Ltr>$1.3M</Ltr> בירושלים!
          </div>
          <div
            style={{
              position: "relative",
              marginTop: 40,
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 38,
              color: COLORS.white,
              background: "#1DB80A",
              borderRadius: 999,
              padding: "22px 40px",
              transform: `scale(${press})`,
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            }}
          >
            1+1 מתנה – להשתתפות
            {t >= 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 300,
                  height: 300,
                  marginLeft: -150,
                  marginTop: -150,
                  borderRadius: "50%",
                  border: "8px solid rgba(255,255,255,0.9)",
                  transform: `scale(${ripple})`,
                  opacity: 1 - ripple,
                }}
              />
            ) : null}
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 30,
              color: COLORS.brown,
              marginTop: 30,
            }}
          >
            <Ltr>₪660</Ltr> + כרטיס במתנה
          </div>
        </div>
      </div>
      {/* Ticket popping out of the screen after the tap. */}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: -140,
          transform: `scale(${ticket}) rotate(8deg) translateY(${(1 - ticket) * 200}px)`,
          opacity: frame < tapAt + 8 ? 0 : 1,
        }}
      >
        <Ticket width={400} free />
      </div>
    </div>
  );
};

// 26–30s — CTA: tap the link now.
export const SceneCTA: React.FC = () => (
  <AbsoluteFill>
    <DarkGold />
    <Stack top={150} gap={4}>
      <Pop delay={2} size={96}>
        לחץ עכשיו על הקישור
      </Pop>
      <Pop delay={10} size={84} color={COLORS.green}>
        ותפוס את ה־<Ltr>1+1</Ltr> במתנה!
      </Pop>
    </Stack>
    <Phone tapAt={36} />
    <Mascot
      src={IMG.mascotPoint}
      delay={16}
      height={700}
      side="left"
      offset={-110}
    />
    <Stack justify="flex-end" bottom={150} gap={16}>
      <Pop delay={70} size={64} color={COLORS.yellow}>
        אולי הדירה הבאה תהיה שלך!
      </Pop>
      <DownArrows delay={76} />
    </Stack>
  </AbsoluteFill>
);

// 30–35s — End card.
export const SceneEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 4, fps, config: { damping: 11 } });
  return (
    <AbsoluteFill>
      <Photo
        src={IMG.kotel}
        from={1.05}
        to={1.18}
        ramp={false}
        filter="brightness(0.4) blur(4px)"
      />
      <Particles at={0} count={50} />
      <Stack justify="center" gap={22} bottom={120}>
        <Img
          src={staticFile(IMG.logo)}
          style={{
            width: 430,
            transform: `scale(${logo}) rotate(${(1 - logo) * -15}deg)`,
            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
          }}
        />
        <Pop delay={14} size={86}>
          הגרלת החלומות <span style={{ color: COLORS.yellow }}>9</span>
        </Pop>
        <Pop delay={24} size={60} weight={700} color={COLORS.white}>
          החלום שלך, הניצחון של כולנו.
        </Pop>
        <div style={{ height: 40 }} />
        <CtaButton delay={36} size={58}>
          <Ltr>1+1</Ltr> במתנה ← לחצו כאן
        </CtaButton>
        <div style={{ height: 6 }} />
        <Pop delay={46} size={50} weight={700} color={COLORS.goldLight}>
          <Ltr>thedreamraffle.co.il</Ltr>
        </Pop>
        <div
          style={{
            marginTop: 10,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 36,
            color: COLORS.ink,
            backgroundImage: GOLD_GRADIENT,
            padding: "8px 28px",
            borderRadius: 999,
            opacity: interpolate(frame, [52, 60], [0, 1], clamp),
          }}
        >
          כל כרטיס תומך ב״עם ישראל חי״
        </div>
      </Stack>
      <FinePrint>בכפוף לתקנון ההגרלה · התמונות להמחשה בלבד</FinePrint>
    </AbsoluteFill>
  );
};
