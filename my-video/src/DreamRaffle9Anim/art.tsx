import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const useSpring = (delay = 0, damping = 14, stiffness = 140) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness } });
};

// Smooth camera: scale and pan between keyframes, applied to its children.
export const Camera: React.FC<{
  keys: {
    at: number;
    scale: number;
    x?: number;
    y?: number;
    rotate?: number;
  }[];
  children: React.ReactNode;
}> = ({ keys, children }) => {
  const frame = useCurrentFrame();
  const at = keys.map((k) => k.at);
  const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  const v = (f: (k: (typeof keys)[number]) => number) =>
    keys.length === 1 ? f(keys[0]) : interpolate(frame, at, keys.map(f), ease);
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${v((k) => k.scale)}) translate(${v((k) => k.x ?? 0)}px, ${v((k) => k.y ?? 0)}px) rotate(${v((k) => k.rotate ?? 0)}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Scene entrance: a quick slide-and-scale in, like a smooth push transition.
export const Enter: React.FC<{
  children: React.ReactNode;
  from?: "right" | "bottom";
}> = ({ children, from = "right" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 10], [1, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const t =
    from === "right"
      ? `translateX(${p * 1080}px)`
      : `translateY(${p * 1920}px)`;
  return (
    <AbsoluteFill style={{ transform: `${t} scale(${1 + p * 0.1})` }}>
      {children}
    </AbsoluteFill>
  );
};

// Kinetic headline: each line rises in with a slight overshoot.
export const Title: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
  weight?: number;
  pill?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  delay = 0,
  size = 90,
  color = C.navy,
  weight = 900,
  pill,
  style,
}) => {
  const s = useSpring(delay, 13, 170);
  const frame = useCurrentFrame();
  if (frame < delay) return null;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.08,
        color,
        textAlign: "center",
        whiteSpace: "nowrap",
        transform: `translateY(${(1 - s) * 60}px) scale(${0.85 + 0.15 * s})`,
        opacity: Math.min(1, s * 1.6),
        ...(pill
          ? {
              background: pill,
              padding: `${size * 0.12}px ${size * 0.45}px`,
              borderRadius: size * 0.3,
              boxShadow: "0 12px 30px rgba(19,33,60,0.18)",
            }
          : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Ltr: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>{children}</span>
);

// Voiceover caption: one phrase at a time, keyword highlighted.
export const Caption: React.FC<{
  lines: { at: number; text: React.ReactNode; hi?: boolean }[];
  top?: number;
  dark?: boolean;
}> = ({ lines, top = 1330, dark = false }) => {
  const frame = useCurrentFrame();
  const current = [...lines].reverse().find((l) => frame >= l.at);
  if (!current) return null;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Title
        key={current.at}
        delay={current.at}
        size={78}
        color={current.hi ? C.navy : dark ? C.white : C.navy}
        pill={current.hi ? C.yellow : dark ? "rgba(19,33,60,0.85)" : C.white}
      >
        {current.text}
      </Title>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Illustrations
// ---------------------------------------------------------------------------

export const Sky: React.FC<{ top?: string; bottom?: string }> = ({
  top = C.sky2,
  bottom = C.sky1,
}) => (
  <AbsoluteFill
    style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 75%)` }}
  />
);

export const Sun: React.FC<{ x: number; y: number; r?: number }> = ({
  x,
  y,
  r = 120,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, #FFF3C4 0%, #FFD36B 60%, rgba(255,211,107,0) 72%)",
        transform: `scale(${1 + 0.03 * Math.sin(frame / 10)})`,
      }}
    />
  );
};

// Flat Jerusalem skyline: hills, the Old City wall, towers and cypresses.
// Layers drift at different speeds for parallax.
export const Skyline: React.FC<{ y?: number; drift?: number }> = ({
  y = 1050,
  drift = 0,
}) => {
  const frame = useCurrentFrame();
  const d = frame * drift;
  const crenel = Array.from({ length: 30 }).map((_, i) => (
    <rect key={i} x={i * 40} y={-18} width={22} height={20} fill={C.stone} />
  ));
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: 1080,
        height: 900,
      }}
    >
      <svg
        width={1300}
        height={900}
        style={{ position: "absolute", left: -110 + d * 0.3 }}
      >
        <path
          d="M0 220 Q200 120 420 190 T860 160 T1300 200 L1300 900 L0 900 Z"
          fill="#C9B48A"
          opacity={0.55}
        />
      </svg>
      <svg
        width={1300}
        height={900}
        style={{ position: "absolute", left: -110 + d * 0.6 }}
      >
        <path
          d="M0 300 Q260 230 520 290 T1040 270 T1300 290 L1300 900 L0 900 Z"
          fill="#D9C39A"
        />
        {/* Houses on the hill */}
        {Array.from({ length: 14 }).map((_, i) => (
          <rect
            key={i}
            x={40 + i * 90}
            y={262 + (i % 3) * 14}
            width={64}
            height={46}
            fill={i % 2 ? C.stone : "#EFDDB8"}
          />
        ))}
      </svg>
      <svg
        width={1300}
        height={900}
        style={{ position: "absolute", left: -110 + d }}
      >
        {/* Tower with a small dome */}
        <rect x={760} y={150} width={90} height={260} fill={C.stone} />
        <rect x={750} y={140} width={110} height={24} fill={C.stoneDark} />
        <path d="M770 140 Q805 80 840 140 Z" fill={C.stoneDark} />
        <rect
          x={798}
          y={220}
          width={14}
          height={34}
          rx={7}
          fill={C.stoneDark}
        />
        {/* Second tower */}
        <rect x={280} y={210} width={80} height={200} fill={C.stone} />
        <rect x={272} y={200} width={96} height={20} fill={C.stoneDark} />
        {/* The wall */}
        <g transform="translate(0 380)">
          {crenel}
          <rect x={0} y={0} width={1300} height={520} fill={C.stone} />
          {Array.from({ length: 26 }).map((_, i) => (
            <rect
              key={i}
              x={(i % 13) * 100 + (i > 12 ? 50 : 0)}
              y={i > 12 ? 70 : 20}
              width={92}
              height={42}
              fill="none"
              stroke={C.stoneDark}
              strokeWidth={3}
              opacity={0.5}
            />
          ))}
          <path
            d="M600 520 L600 160 Q650 100 700 160 L700 520 Z"
            fill={C.stoneDark}
            opacity={0.8}
          />
        </g>
        {/* Cypresses */}
        {[120, 190, 980, 1060].map((x, i) => (
          <ellipse
            key={x}
            cx={x}
            cy={300 + (i % 2) * 20}
            rx={26}
            ry={110}
            fill={C.cypress}
          />
        ))}
      </svg>
    </div>
  );
};

// Coffee cup held in the hand, with rising steam that curls into a heart.
export const Coffee: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = (frame % 50) / 50;
  return (
    <g transform="translate(-26 18)">
      <path
        d={`M14 ${-10 - rise * 40} q-10 -14 0 -26 q10 -12 0 -24`}
        stroke="#fff"
        strokeWidth={4}
        fill="none"
        opacity={1 - rise}
      />
      <rect
        x={0}
        y={0}
        width={52}
        height={50}
        rx={10}
        fill={C.white}
        stroke={C.gold}
        strokeWidth={4}
      />
      <path
        d="M52 12 q18 0 18 14 q0 14 -18 14"
        stroke={C.gold}
        strokeWidth={5}
        fill="none"
      />
    </g>
  );
};

// Fan of shekel bills.
export const Bills: React.FC<{ open?: number }> = ({ open = 1 }) => (
  <g transform="translate(-10 20)">
    {[-28, -10, 8].map((r, i) => (
      <g key={r} transform={`rotate(${r * open})`}>
        <rect
          x={-6}
          y={0}
          width={60}
          height={110}
          rx={6}
          fill={i === 2 ? "#7FBF7A" : "#A9D59F"}
          stroke="#4C8B47"
          strokeWidth={3}
        />
        <circle
          cx={24}
          cy={55}
          r={14}
          fill="none"
          stroke="#4C8B47"
          strokeWidth={3}
        />
      </g>
    ))}
  </g>
);

export const Watch: React.FC = () => (
  <g transform="translate(0 -6)">
    <rect x={-20} y={-8} width={40} height={16} fill={C.ink} />
    <circle r={16} fill={C.white} stroke={C.ink} strokeWidth={4} />
    <path d="M0 0 L0 -10 M0 0 L7 3" stroke={C.red} strokeWidth={3} />
  </g>
);

// Simple house icon with a door; `glow` adds a soft halo.
export const House: React.FC<{ size?: number; glow?: boolean }> = ({
  size = 260,
  glow,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    style={{
      overflow: "visible",
      filter: glow ? `drop-shadow(0 0 30px ${C.yellow})` : undefined,
    }}
  >
    <path
      d="M20 95 L100 25 L180 95"
      fill="none"
      stroke={C.navy}
      strokeWidth={14}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x={40} y={90} width={120} height={95} rx={8} fill={C.gold} />
    <rect x={85} y={125} width={32} height={60} rx={4} fill={C.navy} />
    <rect x={52} y={110} width={24} height={24} rx={3} fill={C.cream} />
    <rect x={126} y={110} width={24} height={24} rx={3} fill={C.cream} />
  </svg>
);

// A stack of mortgage papers that can be blown away.
export const MortgageStack: React.FC<{ blow?: number }> = ({ blow = 0 }) => (
  <div style={{ position: "relative", width: 520, height: 600 }}>
    {Array.from({ length: 7 }).map((_, i) => {
      const r = random(`p${i}`);
      const fly = blow * (300 + r * 900);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 60 + (r - 0.5) * 30,
            top: 520 - i * 70,
            width: 400,
            height: 90,
            background: C.white,
            border: `3px solid ${C.navy}22`,
            borderRadius: 10,
            boxShadow: "0 6px 14px rgba(19,33,60,0.15)",
            transform: `translate(${fly * (r > 0.5 ? 1 : -1)}px, ${-fly * 0.6}px) rotate(${(r - 0.5) * 8 + blow * (r - 0.5) * 220}deg)`,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 34,
            color: C.navy,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 1 - blow * 0.6,
          }}
        >
          {
            ["משכנתא", "ריבית", "30 שנה", "ערבים", "עמלות", "משכנתא", "ריבית"][
              i
            ]
          }
        </div>
      );
    })}
  </div>
);

// Analog clock with racing hands.
export const Clock: React.FC<{ size?: number; speed?: number }> = ({
  size = 420,
  speed = 12,
}) => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 2.2) * 3;
  return (
    <svg
      width={size}
      height={size}
      viewBox="-110 -110 220 220"
      style={{ transform: `rotate(${shake}deg)` }}
    >
      <circle r={100} fill={C.white} stroke={C.navy} strokeWidth={10} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x={-3}
          y={-88}
          width={6}
          height={14}
          rx={3}
          fill={C.navy}
          transform={`rotate(${i * 30})`}
        />
      ))}
      <rect
        x={-4}
        y={-55}
        width={8}
        height={60}
        rx={4}
        fill={C.navy}
        transform={`rotate(${frame * speed * 0.08})`}
      />
      <rect
        x={-3}
        y={-80}
        width={6}
        height={86}
        rx={3}
        fill={C.red}
        transform={`rotate(${frame * speed})`}
      />
      <circle r={9} fill={C.navy} />
      <rect
        x={-70}
        y={-125}
        width={40}
        height={20}
        rx={8}
        fill={C.navy}
        transform="rotate(-30)"
      />
      <rect
        x={30}
        y={-125}
        width={40}
        height={20}
        rx={8}
        fill={C.navy}
        transform="rotate(30)"
      />
    </svg>
  );
};

// A small person icon dropping a coin, for the "everyone sends 660" scene.
export const Person: React.FC<{
  color: string;
  x: number;
  y: number;
  delay: number;
  target: [number, number];
}> = ({ color, x, y, delay, target }) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame - delay, [0, 8], [0, 1], clamp);
  const t = interpolate(frame - delay, [10, 34], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const cx = x + 40 + (target[0] - x - 40) * t;
  const cy = y - 10 + (target[1] - y + 10) * t - Math.sin(t * Math.PI) * 160;
  const hop = Math.abs(Math.sin((frame - delay) / 5)) * 8 * appear;
  return (
    <>
      <svg
        width={80}
        height={130}
        viewBox="0 0 80 130"
        style={{
          position: "absolute",
          left: x,
          top: y - hop,
          opacity: appear,
          transform: `scale(${appear})`,
        }}
      >
        <circle cx={40} cy={28} r={22} fill="#F1C29B" />
        <path d="M40 8 Q28 8 22 18 L58 18 Q52 8 40 8 Z" fill={C.ink} />
        <rect x={8} y={54} width={64} height={76} rx={30} fill={color} />
      </svg>
      {t > 0 && t < 1 ? (
        <div
          style={{
            position: "absolute",
            left: cx - 30,
            top: cy - 30,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: C.yellow,
            border: `5px solid ${C.goldDark}`,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 20,
            color: C.navy,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          660
        </div>
      ) : null}
    </>
  );
};

export const Confetti: React.FC<{ at?: number; count?: number }> = ({
  at = 0,
  count = 80,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  const colors = [C.yellow, C.green, C.gold, C.white, "#60A5FA"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const a = random(`ca${i}`) * Math.PI - Math.PI;
        const v = 18 + random(`cv${i}`) * 30;
        const x = 540 + Math.cos(a) * v * t;
        const y = 1000 + Math.sin(a) * v * t + 0.9 * t * t;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 16,
              height: 26,
              borderRadius: 4,
              background: colors[i % colors.length],
              transform: `rotate(${t * (8 + random(`cr${i}`) * 20)}deg)`,
              opacity: interpolate(t, [50, 80], [1, 0], clamp),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Mouse-pointer hand used for the final tap.
export const Cursor: React.FC<{ x: number; y: number; press?: boolean }> = ({
  x,
  y,
  press,
}) => (
  <svg
    width={90}
    height={110}
    viewBox="0 0 90 110"
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${press ? 0.85 : 1})`,
      filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.3))",
    }}
  >
    <path
      d="M10 6 L10 82 L30 64 L44 98 L60 92 L46 58 L74 58 Z"
      fill={C.white}
      stroke={C.navy}
      strokeWidth={6}
      strokeLinejoin="round"
    />
  </svg>
);
