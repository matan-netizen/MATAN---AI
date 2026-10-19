import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Flash, Particles, Photo } from "../DreamRaffle9/components";
import { IMG } from "../DreamRaffle9/theme";
import { Camera, Confetti, Cursor } from "../DreamRaffle9Anim/art";

// English direct-response cut for the US market ("Rent vs. $0 mortgage"),
// built from the production spec: 33s, text-driven (burned-in captions carry
// the script), music + SFX. Photos are the Dream Raffle gallery, which shows
// the previous year's apartment, so interiors carry that label.

loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat.woff2"),
  weight: "100 900",
});
loadFont({
  family: "Oswald",
  url: staticFile("fonts/Oswald.woff2"),
  weight: "200 700",
});

const SANS = "Montserrat";
const COND = "Oswald";
const C = {
  navy: "#13213C",
  navy2: "#1D3157",
  forest: "#0F3D2E",
  gold: "#D9A441",
  goldHi: "#FFD21F",
  green: "#22C55E",
  greenDark: "#15803D",
  red: "#EF4444",
  white: "#FFFFFF",
  ink: "#0B1220",
};
const STROKE = `0 4px 0 ${C.navy}, 0 0 4px ${C.navy}, 0 0 18px rgba(0,0,0,0.55)`;

export const US_FPS = 30;
const PARTS = [
  { id: "rent", duration: 75 },
  { id: "zero", duration: 75 },
  { id: "deal", duration: 45 },
  { id: "apartment", duration: 135 },
  { id: "offer", duration: 120 },
  { id: "bonus", duration: 105 },
  { id: "idf", duration: 120 },
  { id: "cases", duration: 105 },
  { id: "urgency", duration: 90 },
  { id: "cta", duration: 120 },
] as const;
type PartId = (typeof PARTS)[number]["id"];
export const US_DURATION = PARTS.reduce((s, p) => s + p.duration, 0);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useSpr = (delay = 0, damping = 12, stiffness = 170) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness } });
};

// Kinetic word/line: scale-pop with overshoot; optional shake and pill.
const T: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
  font?: string;
  weight?: number;
  shake?: boolean;
  pill?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  delay = 0,
  size = 96,
  color = C.white,
  font = SANS,
  weight = 900,
  shake,
  pill,
  style,
}) => {
  const frame = useCurrentFrame();
  const s = useSpr(delay);
  if (frame < delay) return null;
  const local = frame - delay;
  const jitter =
    shake && local < 12 ? Math.sin(local * 3.1) * 12 * (1 - local / 12) : 0;
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.02,
        color,
        textAlign: "center",
        whiteSpace: "nowrap",
        textShadow: pill ? undefined : STROKE,
        transform: `translateX(${jitter}px) scale(${s})`,
        opacity: Math.min(1, s * 2),
        ...(pill
          ? {
              background: pill,
              padding: `${size * 0.14}px ${size * 0.42}px`,
              borderRadius: size * 0.22,
              boxShadow: "0 14px 34px rgba(0,0,0,0.35)",
            }
          : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Stack: React.FC<{
  children: React.ReactNode;
  top: number;
  gap?: number;
}> = ({ children, top, gap = 10 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap,
    }}
  >
    {children}
  </div>
);

const Grad: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 50% 35%, ${from} 0%, ${to} 75%)`,
    }}
  />
);

const Darken: React.FC<{ top?: number; bottom?: number }> = ({
  top = 0.55,
  bottom = 0.75,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(11,18,32,${top}) 0%, rgba(11,18,32,0.1) 40%, rgba(11,18,32,0.1) 60%, rgba(11,18,32,${bottom}) 100%)`,
    }}
  />
);

const PrevNote: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 300,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: SANS,
      fontWeight: 600,
      fontSize: 28,
      color: "rgba(255,255,255,0.85)",
    }}
  >
    Photos: previous Dream Raffle apartment
  </div>
);

const Check: React.FC<{ size?: number; color?: string }> = ({
  size = 44,
  color = C.green,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={12} fill={color} />
    <path
      d="M6.5 12.5 L10.5 16.5 L17.5 8.5"
      stroke={C.white}
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Heart: React.FC<{ size?: number }> = ({ size = 120 }) => {
  const frame = useCurrentFrame();
  const beat =
    1 + 0.12 * Math.max(0, Math.sin((frame / 30) * Math.PI * 2.4)) ** 6;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        transform: `scale(${beat})`,
        filter: `drop-shadow(0 0 18px ${C.red})`,
      }}
    >
      <path
        d="M12 21 C5 15 2 12 2 8 C2 5 4.5 3 7 3 C9 3 10.8 4.2 12 6 C13.2 4.2 15 3 17 3 C19.5 3 22 5 22 8 C22 12 19 15 12 21 Z"
        fill={C.red}
      />
    </svg>
  );
};

const Key: React.FC<{ size?: number }> = ({ size = 220 }) => (
  <svg
    width={size}
    height={size * 0.5}
    viewBox="0 0 200 100"
    style={{ filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.5))" }}
  >
    <circle
      cx={40}
      cy={50}
      r={32}
      fill="none"
      stroke={C.gold}
      strokeWidth={14}
    />
    <rect x={68} y={43} width={120} height={14} rx={5} fill={C.gold} />
    <rect x={150} y={55} width={12} height={24} rx={3} fill={C.gold} />
    <rect x={172} y={55} width={12} height={18} rx={3} fill={C.gold} />
  </svg>
);

// English raffle ticket.
const Ticket: React.FC<{ free?: boolean; width?: number }> = ({
  free,
  width = 400,
}) => {
  const h = width * 0.56;
  return (
    <div
      style={{
        position: "relative",
        width,
        height: h,
        borderRadius: 26,
        background: free
          ? "linear-gradient(135deg,#7CFF5B,#1DB80A)"
          : "linear-gradient(135deg,#F3D58A,#D9A441 55%,#A8741F)",
        boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 40px ${free ? C.green : C.gold}77`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: C.ink,
        fontFamily: SANS,
      }}
    >
      {[0, 1].map((side) => (
        <div
          key={side}
          style={{
            position: "absolute",
            top: h / 2 - 26,
            [side ? "right" : "left"]: -26,
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: C.navy,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 14,
          borderRadius: 18,
          border: "4px dashed rgba(11,18,32,0.3)",
        }}
      />
      <div
        style={{
          fontWeight: 800,
          fontSize: width * 0.07,
          letterSpacing: "0.08em",
        }}
      >
        THE DREAM RAFFLE 9
      </div>
      <div
        style={{
          fontFamily: COND,
          fontWeight: 700,
          fontSize: width * 0.2,
          lineHeight: 1.05,
        }}
      >
        {free ? "FREE!" : "1 TICKET"}
      </div>
      <div style={{ fontWeight: 700, fontSize: width * 0.06 }}>
        {free ? "BONUS TICKET" : "RAFFLE ENTRY"}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// 0–2.5s: endless rent payments scrolling past, "forever".
const Rent: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = frame * 9;
  return (
    <AbsoluteFill>
      <Grad from="#2B3A55" to="#0E1626" />
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 560,
          width: 800,
          height: 900,
          borderRadius: 40,
          background: "#F4F6FA",
          overflow: "hidden",
          boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
          transform: "rotate(-4deg)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -scroll % 1200,
            left: 0,
            right: 0,
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "26px 44px",
                borderBottom: "2px solid #E2E6EE",
                fontFamily: SANS,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 36, color: C.ink }}>
                  Rent payment
                </div>
                <div
                  style={{ fontWeight: 600, fontSize: 26, color: "#7A8499" }}
                >
                  {MONTHS[i % 12]} {2026 + Math.floor(i / 12)} · Auto-pay
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 40, color: C.red }}>
                −$2,500.00
              </div>
            </div>
          ))}
        </div>
      </div>
      <Stack top={190} gap={0}>
        <T delay={0} size={70} weight={800}>
          Your rent:
        </T>
        <T delay={6} size={190} color={C.red} shake font={COND}>
          $2,500/mo
        </T>
      </Stack>
      <Stack top={1520}>
        <T delay={34} size={150} color={C.white} pill={C.red} shake font={COND}>
          FOREVER.
        </T>
      </Stack>
    </AbsoluteFill>
  );
};

// 2.5–5s: whip into the Jerusalem view; "$0 mortgage. Ever."
const Zero: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = interpolate(frame, [36, 50], [-500, 0], {
    ...clamp,
    easing: Easing.out(Easing.back(1.6)),
  });
  return (
    <AbsoluteFill>
      <Photo src={IMG.view} position="40% 50%" from={1.35} to={1.08} />
      <Darken />
      <Stack top={200} gap={0}>
        <T delay={2} size={70} weight={800}>
          This apartment:
        </T>
        <T delay={8} size={150} color={C.green} font={COND}>
          $0 MORTGAGE
        </T>
        <T delay={22} size={120} font={COND}>
          EVER.
        </T>
      </Stack>
      {frame >= 36 ? (
        <div
          style={{
            position: "absolute",
            left: 430,
            top: 1150,
            transform: `translateY(${drop}px) rotate(${-20 + Math.sin(frame / 4) * 6}deg)`,
          }}
        >
          <Key size={240} />
        </div>
      ) : null}
      <PrevNote />
    </AbsoluteFill>
  );
};

// 5–6.5s: "Here's the deal" over the Old City.
const Deal: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Photo src={IMG.kotel} position="55% 50%" from={1.5} to={1.15} />
      <Darken top={0.3} bottom={0.5} />
      <Stack top={760} gap={30}>
        <T delay={2} size={150} font={COND}>
          HERE&apos;S THE DEAL
        </T>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 70,
                height: 70,
                borderRight: `14px solid ${C.goldHi}`,
                borderBottom: `14px solid ${C.goldHi}`,
                transform: "rotate(45deg)",
                marginTop: -28,
                opacity:
                  0.3 +
                  0.7 * Math.max(0, Math.sin(((frame - i * 4) / 20) * Math.PI)),
              }}
            />
          ))}
        </div>
      </Stack>
    </AbsoluteFill>
  );
};

const TOUR = [
  { src: IMG.living, pos: "50% 50%" },
  { src: IMG.kitchen, pos: "50% 50%" },
  { src: IMG.bedroom, pos: "45% 50%" },
  { src: IMG.balcony, pos: "60% 50%" },
];

// 6.5–11s: the apartment, value counting up.
const Apartment: React.FC = () => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [8, 95], [0, 1300000], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const land = useSpr(95, 8);
  const shot = 34;
  return (
    <AbsoluteFill>
      {TOUR.map((t, i) => (
        <Sequence
          key={t.src}
          from={i * shot}
          durationInFrames={i === 3 ? 135 - 3 * shot : shot}
          layout="none"
        >
          <Photo src={t.src} position={t.pos} from={1.3} to={1.06} />
          {i > 0 ? <Flash /> : null}
        </Sequence>
      ))}
      <Darken top={0.65} bottom={0.85} />
      <Stack top={170} gap={4}>
        <T delay={2} size={64} weight={800}>
          A luxury apartment in
        </T>
        <T delay={6} size={130} color={C.goldHi} font={COND}>
          JERUSALEM
        </T>
      </Stack>
      <Stack top={1180} gap={14}>
        <div
          style={{
            fontFamily: COND,
            fontWeight: 700,
            fontSize: 190,
            color: C.goldHi,
            textShadow: STROKE,
            fontVariantNumeric: "tabular-nums",
            transform: `scale(${1 + 0.12 * Math.min(1, land) - 0.12 * Math.max(0, land - 1)})`,
          }}
        >
          ${(Math.round(v / 1000) * 1000).toLocaleString("en-US")}
        </div>
        <T
          delay={60}
          size={50}
          weight={800}
          pill={C.white}
          color={C.ink}
          style={{ display: "flex", alignItems: "center", gap: 16 }}
        >
          <Check /> FULLY FURNISHED
        </T>
      </Stack>
      <PrevNote />
    </AbsoluteFill>
  );
};

// 11–15s: 1+1 — the ticket clones itself.
const Offer: React.FC = () => {
  const frame = useCurrentFrame();
  const split = useSpr(26, 12);
  const twin = useSpr(30, 9);
  const glow = 0.75 + 0.25 * Math.sin(frame * 0.35);
  return (
    <AbsoluteFill>
      <Grad from={C.navy2} to={C.navy} />
      <Stack top={190} gap={4}>
        <T delay={0} size={46} weight={800} pill={C.red}>
          LIMITED TIME
        </T>
        <T delay={4} size={110} font={COND}>
          BUY 1 TICKET
        </T>
        <T
          delay={30}
          size={150}
          color={C.green}
          font={COND}
          style={{ opacity: glow }}
        >
          GET 1 FREE
        </T>
      </Stack>
      <div
        style={{
          position: "absolute",
          top: 860,
          left: 0,
          width: 1080,
          height: 300,
        }}
      >
        <div style={{ position: "absolute", left: 340 + split * 250, top: 0 }}>
          <Ticket />
        </div>
        <div
          style={{
            position: "absolute",
            left: 340 - split * 250,
            top: 0,
            transform: `scale(${twin})`,
            opacity: frame < 30 ? 0 : 1,
          }}
        >
          <Ticket free />
        </div>
      </div>
      <Stack top={1290}>
        <T delay={60} size={140} pill={C.goldHi} color={C.ink} font={COND}>
          2X THE CHANCES
        </T>
      </Stack>
    </AbsoluteFill>
  );
};

// 15–18.5s: $15,000 early-bird cash bonus, ends Nov 11.
const Bonus: React.FC = () => {
  const frame = useCurrentFrame();
  const badge = useSpr(4, 9);
  const flip = interpolate(frame, [40, 56], [90, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill>
      <Grad from="#17614A" to={C.forest} />
      <Particles at={6} count={70} />
      <Stack top={180} gap={0}>
        <T delay={0} size={70} weight={800}>
          PLUS: EARLY-BIRD
        </T>
      </Stack>
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 330,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, #FFE7A3, #D9A441 55%, #8C5F14)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.5), inset 0 0 0 18px rgba(255,255,255,0.25)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${badge}) rotate(${(1 - badge) * -30}deg)`,
        }}
      >
        <div
          style={{
            fontFamily: COND,
            fontWeight: 700,
            fontSize: 210,
            color: C.ink,
            lineHeight: 1,
          }}
        >
          $15,000
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 64,
            color: C.ink,
            letterSpacing: "0.06em",
          }}
        >
          CASH BONUS
        </div>
      </div>
      {/* Calendar page */}
      <div
        style={{
          position: "absolute",
          left: 360,
          top: 1110,
          width: 360,
          perspective: 900,
        }}
      >
        <div
          style={{
            borderRadius: 26,
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
            transform: `rotateX(${flip}deg)`,
            transformOrigin: "top",
            background: C.white,
          }}
        >
          <div
            style={{
              background: C.red,
              color: C.white,
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 52,
              textAlign: "center",
              padding: "10px 0",
            }}
          >
            NOV
          </div>
          <div
            style={{
              fontFamily: COND,
              fontWeight: 700,
              fontSize: 170,
              textAlign: "center",
              color: C.ink,
              lineHeight: 1.15,
            }}
          >
            11
          </div>
        </div>
      </div>
      <Stack top={1560}>
        <T delay={58} size={64} weight={900} pill={C.red}>
          ENDS NOV 11
        </T>
      </Stack>
    </AbsoluteFill>
  );
};

const CAUSE = [
  { src: IMG.soldiers, label: "Support for IDF soldiers" },
  { src: IMG.ambulance, label: "Emergency medical equipment" },
  { src: IMG.torah, label: "Torah scrolls for IDF bases" },
];

// 18.5–22.5s: every ticket supports IDF soldiers & families.
const Idf: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {CAUSE.map((c, i) => (
        <Sequence key={c.src} from={i * 40} layout="none">
          <AbsoluteFill
            style={{
              opacity: interpolate(frame - i * 40, [0, 10], [0, 1], clamp),
            }}
          >
            <Photo
              src={c.src}
              from={1.14}
              to={1.0}
              ramp={false}
              duration={60}
              filter="sepia(0.2) saturate(1.1) brightness(0.85)"
            />
          </AbsoluteFill>
          <div
            style={{
              position: "absolute",
              top: 1240,
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 40,
                color: C.white,
                background: "rgba(11,18,32,0.7)",
                padding: "10px 26px",
                borderRadius: 14,
              }}
            >
              {c.label}
            </span>
          </div>
        </Sequence>
      ))}
      <Darken top={0.75} bottom={0.85} />
      <Stack top={170} gap={6}>
        <T delay={4} size={64} weight={800}>
          And every ticket
        </T>
        <T delay={10} size={150} color={C.white} font={COND}>
          SUPPORTS
        </T>
        <T delay={16} size={150} color={C.goldHi} font={COND}>
          IDF SOLDIERS
        </T>
        <T delay={30} size={56} weight={800}>
          &amp; their families
        </T>
      </Stack>
      <Stack top={1360} gap={10}>
        <div style={{ opacity: frame > 20 ? 1 : 0 }}>
          <Heart size={130} />
        </div>
        <T delay={40} size={40} weight={700}>
          Am Yisrael Chai Foundation
        </T>
      </Stack>
    </AbsoluteFill>
  );
};

// 22.5–26s: worst case / best case split.
const Cases: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [44, 60], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 960,
          overflow: "hidden",
        }}
      >
        <Photo
          src={IMG.torah}
          from={1.15}
          to={1.0}
          ramp={false}
          filter="brightness(0.6)"
        />
        <Stack top={300} gap={10}>
          <T delay={2} size={60} weight={800} pill={C.navy}>
            WORST CASE?
          </T>
          <T delay={10} size={72} weight={900}>
            You supported
          </T>
          <T delay={14} size={72} weight={900} color={C.goldHi}>
            Israel&apos;s heroes
          </T>
          <div style={{ marginTop: 10, opacity: frame > 18 ? 1 : 0 }}>
            <Heart size={80} />
          </div>
        </Stack>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 960,
          width: 1080,
          height: 960,
          overflow: "hidden",
          clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`,
        }}
      >
        <Photo
          src={IMG.balcony}
          from={1.2}
          to={1.05}
          ramp={false}
          filter="brightness(0.7)"
        />
        <Stack top={250} gap={10}>
          <T delay={50} size={60} weight={800} pill={C.green}>
            BEST CASE?
          </T>
          <T delay={58} size={110} weight={900} font={COND}>
            YOU GET THE KEYS
          </T>
          <div
            style={{
              marginTop: 20,
              transform: `rotate(${Math.sin(frame / 4) * 10}deg)`,
              opacity: frame > 64 ? 1 : 0,
            }}
          >
            <Key size={220} />
          </div>
        </Stack>
      </div>
      <div
        style={{
          position: "absolute",
          top: 955,
          left: 0,
          right: 0,
          height: 10,
          background: C.gold,
        }}
      />
    </AbsoluteFill>
  );
};

// 26–29s: the 1+1 deal is closing.
const Urgency: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const left = 1 - frame / durationInFrames;
  const r = 250;
  const circ = 2 * Math.PI * r;
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <AbsoluteFill>
      <Grad from="#4A0D0A" to={C.ink} />
      <Camera
        keys={[
          { at: 0, scale: 1 },
          { at: 90, scale: 1.08 },
        ]}
      >
        <div
          style={{
            position: "absolute",
            left: 240,
            top: 560,
            width: 600,
            height: 600,
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
              stroke={C.red}
              strokeWidth={34}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - left)}
              transform="rotate(-90 300 300)"
            />
          </svg>
          <AbsoluteFill
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <div
              style={{
                fontFamily: COND,
                fontWeight: 700,
                fontSize: 220,
                color: C.green,
                textShadow: `0 0 30px ${C.green}`,
              }}
            >
              1+1
            </div>
          </AbsoluteFill>
        </div>
      </Camera>
      <Stack top={180}>
        <T delay={0} size={72} weight={800}>
          The 1+1 deal
        </T>
        <T delay={6} size={150} font={COND} color={blink ? C.red : C.white}>
          ENDS SOON
        </T>
      </Stack>
      <Stack top={1330}>
        <T delay={34} size={76} weight={900}>
          …and it won&apos;t
        </T>
        <T delay={40} size={110} weight={900} color={C.goldHi} font={COND}>
          COME BACK.
        </T>
      </Stack>
    </AbsoluteFill>
  );
};

// 29–33s: logo, button, tap.
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useSpr(0, 11);
  const btn = useSpr(14, 10);
  const tap = 62;
  const press = frame >= tap && frame < tap + 6;
  const ripple = interpolate(frame - tap, [0, 18], [0, 1], clamp);
  const pulse = 1 + 0.04 * Math.sin(frame * 0.3);
  const shine = (frame % 45) / 45;
  const cx = interpolate(frame, [36, tap], [960, 640], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const cy = interpolate(frame, [36, tap], [1750, 1260], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <AbsoluteFill>
      <Photo
        src={IMG.kotel}
        from={1.05}
        to={1.15}
        ramp={false}
        filter="brightness(0.35) blur(5px)"
      />
      <Stack top={140}>
        <Img
          src={staticFile("dreamus/logo-en.png")}
          style={{
            width: 480,
            transform: `scale(${logo})`,
            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
          }}
        />
      </Stack>
      <Stack top={760} gap={6}>
        <T delay={8} size={76} weight={900}>
          Win a $1.3M home
        </T>
        <T delay={12} size={76} weight={900} color={C.goldHi}>
          in Jerusalem
        </T>
      </Stack>
      <div
        style={{
          position: "absolute",
          top: 1010,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            transform: `scale(${btn * pulse * (press ? 0.93 : 1)})`,
          }}
        >
          {frame >= tap ? (
            <div
              style={{
                position: "absolute",
                inset: -14,
                borderRadius: 40,
                border: `8px solid ${C.green}`,
                transform: `scale(${1 + ripple * 0.3})`,
                opacity: 1 - ripple,
              }}
            />
          ) : null}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 40,
              padding: "30px 70px",
              background: `linear-gradient(135deg, #34D399, ${C.green} 50%, ${C.greenDark})`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 40px ${C.green}66`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: COND,
                fontWeight: 700,
                fontSize: 96,
                color: C.white,
                lineHeight: 1.05,
              }}
            >
              TAP THE LINK »
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 40,
                color: C.white,
              }}
            >
              DOUBLE YOUR CHANCES NOW
            </div>
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 140,
                left: `${-20 + shine * 140}%`,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                transform: "skewX(-20deg)",
              }}
            />
          </div>
        </div>
      </div>
      <Stack top={1400} gap={14}>
        <T delay={24} size={52} weight={800} color={C.goldHi}>
          thedreamraffle.com
        </T>
        <T delay={30} size={34} weight={700} pill={C.navy}>
          1+1 FREE · $15K bonus ends 11/11
        </T>
      </Stack>
      {frame >= 36 ? <Cursor x={cx} y={cy} press={press} /> : null}
      <Confetti at={tap + 2} count={60} />
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 21,
          color: "rgba(255,255,255,0.75)",
        }}
      >
        Subject to official raffle rules · Every ticket supports the Am Yisrael
        Chai Foundation
      </div>
    </AbsoluteFill>
  );
};

const SCENES: Record<PartId, React.FC> = {
  rent: Rent,
  zero: Zero,
  deal: Deal,
  apartment: Apartment,
  offer: Offer,
  bonus: Bonus,
  idf: Idf,
  cases: Cases,
  urgency: Urgency,
  cta: Cta,
};

// Sound effects per scene (scene-local frames). Files from public/dream9/audio
// (npm run dream9-audio) and public/dreamus/audio (npm run dreamus-sfx).
const SFX: Record<
  PartId,
  { src: string; at: number; volume: number; length?: number }[]
> = {
  rent: [
    { src: "dream9/audio/pop.mp3", at: 6, volume: 0.6 },
    { src: "dreamus/audio/buzzer.mp3", at: 34, volume: 0.55 },
  ],
  zero: [
    { src: "dream9/audio/swoosh.mp3", at: 0, volume: 0.7 },
    { src: "dream9/audio/bassdrop.mp3", at: 8, volume: 0.7 },
    { src: "dreamus/audio/keys.mp3", at: 44, volume: 0.7 },
  ],
  deal: [
    { src: "dream9/audio/riser.mp3", at: 0, volume: 0.4 },
    { src: "dream9/audio/pop.mp3", at: 4, volume: 0.6 },
  ],
  apartment: [
    { src: "dream9/audio/swoosh.mp3", at: 0, volume: 0.5 },
    { src: "dream9/audio/ticker.mp3", at: 8, volume: 0.3, length: 87 },
    { src: "dream9/audio/swoosh.mp3", at: 33, volume: 0.3 },
    { src: "dream9/audio/swoosh.mp3", at: 67, volume: 0.3 },
    { src: "dream9/audio/swoosh.mp3", at: 101, volume: 0.3 },
    { src: "dream9/audio/bassdrop.mp3", at: 95, volume: 0.7 },
  ],
  offer: [
    { src: "dream9/audio/swoosh.mp3", at: 26, volume: 0.6 },
    { src: "dream9/audio/pop.mp3", at: 30, volume: 0.7 },
    { src: "dream9/audio/pop.mp3", at: 36, volume: 0.7 },
    { src: "dream9/audio/stamp.mp3", at: 60, volume: 0.7 },
  ],
  bonus: [
    { src: "dream9/audio/cash.mp3", at: 6, volume: 0.8 },
    { src: "dream9/audio/swoosh.mp3", at: 40, volume: 0.4 },
    { src: "dream9/audio/pop.mp3", at: 58, volume: 0.6 },
  ],
  idf: [{ src: "dreamus/audio/heartbeat.mp3", at: 10, volume: 0.6 }],
  cases: [
    { src: "dream9/audio/swoosh.mp3", at: 44, volume: 0.6 },
    { src: "dreamus/audio/keys.mp3", at: 64, volume: 0.7 },
  ],
  urgency: [{ src: "dream9/audio/ticktock.mp3", at: 0, volume: 0.65 }],
  cta: [
    { src: "dream9/audio/bassdrop.mp3", at: 0, volume: 0.8 },
    { src: "dream9/audio/swoosh.mp3", at: 0, volume: 0.6 },
    { src: "dream9/audio/click.mp3", at: 62, volume: 0.9 },
    { src: "dream9/audio/cash.mp3", at: 64, volume: 0.5 },
  ],
};

const START = PARTS.reduce<Record<string, number>>((acc, p, i) => {
  acc[p.id] = i === 0 ? 0 : acc[PARTS[i - 1].id] + PARTS[i - 1].duration;
  return acc;
}, {});

// Music: the 45s groove, quiet during the IDF beat, filtered down for urgency.
const musicVolume = (f: number) => {
  const idf = START.idf;
  const urg = START.urgency;
  const base = interpolate(
    f,
    [
      0,
      75,
      80,
      idf,
      idf + 10,
      idf + 110,
      idf + 120,
      urg,
      urg + 10,
      US_DURATION - 15,
      US_DURATION,
    ],
    [0.25, 0.25, 0.55, 0.55, 0.15, 0.15, 0.55, 0.55, 0.3, 0.55, 0],
    clamp,
  );
  return base;
};

export const DreamRaffleUS: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink, fontFamily: SANS }}>
    <Html5Audio
      src={staticFile("dream9/audio/music-anim.mp3")}
      volume={musicVolume}
    />
    {PARTS.map((p) => {
      const Scene = SCENES[p.id];
      return (
        <Sequence
          key={p.id}
          name={p.id}
          from={START[p.id]}
          durationInFrames={p.duration}
        >
          {SFX[p.id].map(({ src, at, volume, length }) => (
            <Sequence
              key={`${src}-${at}`}
              from={at}
              durationInFrames={length}
              layout="none"
            >
              <Html5Audio src={staticFile(src)} volume={volume} />
            </Sequence>
          ))}
          <Scene />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
