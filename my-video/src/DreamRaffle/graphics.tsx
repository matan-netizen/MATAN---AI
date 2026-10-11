import React from "react";
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, GOLD_GRADIENT, IMG } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useSpring = (delay: number, damping = 12, mass = 0.6) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass } });
};

const goldText: React.CSSProperties = {
  background: GOLD_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.55)) drop-shadow(0 0 18px rgba(212,175,55,0.45))",
};

// ---------------------------------------------------------------------------
// Kinetic typography
// ---------------------------------------------------------------------------

// Hebrew headline that springs in word by word. In `text`, *word* is gold and
// " / " breaks the line. `icon` is placed after the last word.
export const KineticText: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size?: number;
  icon?: React.ReactNode;
  exitAt?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, stagger = 3, size = 92, icon, exitAt, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = text.split(" / ").map((line) => line.split(" "));
  const exit = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 8], [0, 1], clamp);
  let n = 0;
  return (
    <div
      style={{
        direction: "rtl",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.12,
        textAlign: "center",
        opacity: 1 - exit,
        transform: `translateY(${-exit * 40}px)`,
        ...style,
      }}
    >
      {lines.map((words, li) => (
        <div
          key={li}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${size * 0.26}px` }}
        >
          {words.map((raw, wi) => {
            const gold = raw.startsWith("*") && raw.endsWith("*");
            const word = gold ? raw.slice(1, -1) : raw;
            const i = n++;
            const s = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 11, mass: 0.5 } });
            const last = li === lines.length - 1 && wi === words.length - 1;
            return (
              <span
                key={wi}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: size * 0.2,
                  opacity: Math.min(1, s * 1.5),
                  transform: `translateY(${(1 - s) * 70}px) scale(${0.55 + 0.45 * s})`,
                  filter: `blur(${Math.max(0, 1 - s) * 8}px)`,
                }}
              >
                <span
                  style={
                    gold
                      ? goldText
                      : {
                          color: COLORS.white,
                          textShadow: "0 4px 14px rgba(0,0,0,0.65), 0 0 2px rgba(0,0,0,0.6)",
                        }
                  }
                >
                  {word}
                </span>
                {last && icon ? icon : null}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Gold pill label, e.g. above a headline.
export const Tag: React.FC<{ children: React.ReactNode; delay?: number; size?: number }> = ({
  children,
  delay = 0,
  size = 40,
}) => {
  const s = useSpring(delay, 14);
  return (
    <div
      style={{
        display: "inline-block",
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        color: COLORS.brown,
        background: GOLD_GRADIENT,
        padding: `${size * 0.2}px ${size * 0.7}px`,
        borderRadius: 999,
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        transform: `scale(${s})`,
        direction: "rtl",
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

// Gold key (the 🔑 in the hook), swinging gently.
export const KeyIcon: React.FC<{ size?: number; delay?: number }> = ({ size = 90, delay = 0 }) => {
  const frame = useCurrentFrame();
  const s = useSpring(delay, 9);
  const swing = Math.sin((frame - delay) / 6) * 8 * Math.exp(-Math.max(0, frame - delay) / 40);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        transform: `rotate(${-35 + swing}deg) scale(${s})`,
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5)) drop-shadow(0 0 14px rgba(246,223,160,0.7))",
      }}
    >
      <defs>
        <linearGradient id="keyGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={COLORS.goldLight} />
          <stop offset="0.5" stopColor={COLORS.gold} />
          <stop offset="1" stopColor={COLORS.goldDeep} />
        </linearGradient>
      </defs>
      <circle cx="28" cy="50" r="20" fill="none" stroke="url(#keyGold)" strokeWidth="10" />
      <rect x="44" y="45" width="50" height="10" rx="3" fill="url(#keyGold)" />
      <rect x="74" y="55" width="8" height="16" rx="2" fill="url(#keyGold)" />
      <rect x="86" y="55" width="8" height="11" rx="2" fill="url(#keyGold)" />
    </svg>
  );
};

// Israeli flag artwork; `slice` limits the viewBox to one vertical strip.
const FlagArt: React.FC<{ width: number; height: number; slice?: [number, number] }> = ({
  width,
  height,
  slice = [0, 220],
}) => (
  <svg
    width={width}
    height={height}
    viewBox={`${slice[0]} 0 ${slice[1]} 160`}
    preserveAspectRatio="none"
    style={{ display: "block" }}
  >
    <rect width="220" height="160" fill="#fff" />
    <rect y="15" width="220" height="25" fill={COLORS.ilBlue} />
    <rect y="120" width="220" height="25" fill={COLORS.ilBlue} />
    <g fill="none" stroke={COLORS.ilBlue} strokeWidth="5.5">
      <path d="M110 52 L136 97 L84 97 Z" />
      <path d="M110 108 L136 63 L84 63 Z" />
    </g>
  </svg>
);

// Israeli flag rippling in the wind: the flag is cut into vertical slices
// that are each shifted and shaded along a travelling sine wave.
export const WavingFlag: React.FC<{ width?: number; amplitude?: number }> = ({
  width = 220,
  amplitude = 9,
}) => {
  const frame = useCurrentFrame();
  const height = (width * 160) / 220;
  const slices = 28;
  const w = width / slices;
  return (
    <div style={{ position: "relative", width, height: height + amplitude * 2 }}>
      {Array.from({ length: slices }, (_, i) => {
        const phase = i / slices;
        // The pole side (right, for a flag read RTL) barely moves.
        const damp = 0.25 + 0.75 * (1 - phase);
        const wave = Math.sin(phase * Math.PI * 2.2 - frame / 5);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * w,
              top: amplitude + wave * amplitude * damp,
              width: w + 0.6,
              height,
              filter: `brightness(${1 + wave * 0.12 * damp})`,
            }}
          >
            <FlagArt width={w + 0.6} height={height} slice={[(i * 220) / slices, 220 / slices + 0.2]} />
          </div>
        );
      })}
    </div>
  );
};

// Round gold badge with the waving flag and a caption, popping in with a spin.
export const FlagBadge: React.FC<{ delay?: number; size?: number; label?: string }> = ({
  delay = 0,
  size = 300,
  label = "גאים לתמוך",
}) => {
  const frame = useCurrentFrame();
  const s = useSpring(delay, 10);
  const glow = 0.5 + 0.5 * Math.sin((frame - delay) / 7);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        padding: size * 0.035,
        background: GOLD_GRADIENT,
        boxShadow: `0 0 ${30 + 30 * glow}px rgba(246,223,160,${0.5 + 0.3 * glow}), 0 16px 40px rgba(0,0,0,0.45)`,
        transform: `scale(${s}) rotate(${(1 - s) * -180}deg)`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 35%, #FFFFFF, ${COLORS.cream})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: size * 0.02,
          overflow: "hidden",
        }}
      >
        <WavingFlag width={size * 0.58} amplitude={size * 0.025} />
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: size * 0.105,
            color: COLORS.ilBlue,
            direction: "rtl",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Offer graphics
// ---------------------------------------------------------------------------

const starburst = (points: number, outer: number, inner: number) =>
  Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI * i) / points - Math.PI / 2;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(" ");

// "1+1 כרטיס במתנה" starburst badge with a pulsing glow and expanding rings.
export const OnePlusOneBadge: React.FC<{ delay?: number; size?: number }> = ({ delay = 0, size = 380 }) => {
  const frame = useCurrentFrame();
  const s = useSpring(delay, 8, 0.7);
  const t = Math.max(0, frame - delay);
  const pulse = 1 + 0.045 * Math.sin(t / 4);
  const glow = 0.55 + 0.45 * Math.sin(t / 4);
  return (
    <div style={{ position: "relative", width: size, height: size, transform: `scale(${s * pulse})` }}>
      {[0, 1].map((k) => {
        const p = ((t + k * 15) % 30) / 30;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `6px solid ${COLORS.goldLight}`,
              transform: `scale(${0.8 + p * 0.7})`,
              opacity: (1 - p) * 0.8 * Math.min(1, t / 10),
            }}
          />
        );
      })}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${t * 0.8}deg)`,
          filter: `drop-shadow(0 0 ${12 + 26 * glow}px rgba(255,220,130,${0.6 + 0.4 * glow})) drop-shadow(0 10px 18px rgba(0,0,0,0.45))`,
        }}
      >
        <defs>
          <radialGradient id="burstGold" cx="0.45" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#FFF4CF" />
            <stop offset="0.45" stopColor={COLORS.gold} />
            <stop offset="1" stopColor={COLORS.goldDeep} />
          </radialGradient>
        </defs>
        <polygon points={starburst(20, 49, 42)} fill="url(#burstGold)" />
        <circle cx="50" cy="50" r="37" fill="none" stroke={COLORS.brown} strokeWidth="1.2" strokeDasharray="2 2" />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          color: COLORS.brown,
          textAlign: "center",
          direction: "rtl",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: size * 0.34, lineHeight: 0.95, direction: "ltr" }}>1+1</div>
        <div style={{ fontWeight: 900, fontSize: size * 0.1, lineHeight: 1.1 }}>כרטיס במתנה</div>
      </div>
      <ShineMask size={size} start={delay + 12} />
    </div>
  );
};

// Light glint across a round badge.
const ShineMask: React.FC<{ size: number; start: number }> = ({ size, start }) => {
  const frame = useCurrentFrame();
  const p = interpolate((frame - start) % 45, [0, 18], [-40, 140], clamp);
  return (
    <div
      style={{
        position: "absolute",
        inset: size * 0.08,
        borderRadius: "50%",
        background: `linear-gradient(115deg, transparent ${p - 12}%, rgba(255,255,255,0.75) ${p}%, transparent ${p + 12}%)`,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

// The grand prize card: logo, label, a "$1.3M" count-up and the subtitle.
export const PrizeCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const s = useSpring(delay, 13);
  const value = interpolate(frame, [delay + 6, delay + 34], [0, 1.3], {
    ...clamp,
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  return (
    <div
      style={{
        width: 620,
        padding: "34px 40px 40px",
        borderRadius: 40,
        background: `linear-gradient(160deg, rgba(74,50,34,0.94), rgba(41,26,17,0.96))`,
        border: `3px solid ${COLORS.gold}`,
        boxShadow: `0 24px 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(212,175,55,0.15)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        fontFamily: FONT,
        direction: "rtl",
        opacity: s,
        transform: `translateX(${(1 - s) * 260}px) rotate(${(1 - s) * 6}deg)`,
      }}
    >
      <Img src={staticFile(IMG.logo)} style={{ width: 170 }} />
      <div style={{ color: COLORS.goldLight, fontWeight: 700, fontSize: 36, marginTop: 6 }}>הפרס הגדול</div>
      <div style={{ color: COLORS.white, fontWeight: 900, fontSize: 48 }}>דירת יוקרה בירושלים</div>
      <div style={{ ...goldText, fontWeight: 900, fontSize: 150, lineHeight: 1, direction: "ltr" }}>
        ${value.toFixed(1)}M
      </div>
      <div style={{ color: COLORS.cream, fontWeight: 400, fontSize: 34 }}>בשווי 1.3 מיליון דולר</div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// CTA graphics
// ---------------------------------------------------------------------------

// Chunky 3D button with a pulsing halo; it is pressed down at `pressAt`.
export const CtaButton: React.FC<{ delay?: number; pressAt: number; label: string }> = ({
  delay = 0,
  pressAt,
  label,
}) => {
  const frame = useCurrentFrame();
  const s = useSpring(delay, 9);
  const t = Math.max(0, frame - delay);
  const pulse = 1 + 0.035 * Math.sin(t / 4.5);
  // Press: down over 3 frames, back up over 6.
  const press = interpolate(frame, [pressAt, pressAt + 3, pressAt + 9], [0, 1, 0], clamp);
  const depth = 16 * (1 - press);
  const halo = (t % 36) / 36;
  return (
    <div style={{ position: "relative", transform: `scale(${s * (press > 0 ? 1 : pulse)})` }}>
      <div
        style={{
          position: "absolute",
          inset: -10,
          borderRadius: 999,
          border: `5px solid ${COLORS.goldLight}`,
          transform: `scale(${1 + halo * 0.25})`,
          opacity: (1 - halo) * 0.9,
        }}
      />
      <div style={{ position: "relative", borderRadius: 999, background: COLORS.goldDeep, paddingBottom: depth }}>
        <div
          style={{
            transform: `translateY(${16 - depth}px)`,
            borderRadius: 999,
            padding: "30px 84px",
            background: `linear-gradient(180deg, #FFF0C4 0%, ${COLORS.gold} 48%, #B98A33 100%)`,
            boxShadow: `inset 0 3px 0 rgba(255,255,255,0.7), 0 ${depth + 10}px 30px rgba(0,0,0,0.45)`,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 72,
            color: COLORS.brown,
            direction: "rtl",
            display: "flex",
            alignItems: "center",
            gap: 24,
            whiteSpace: "nowrap",
          }}
        >
          {label}
          <span style={{ fontSize: 64, transform: `translateX(${-8 * Math.abs(Math.sin(t / 5))}px)` }}>←</span>
        </div>
      </div>
    </div>
  );
};

// Animated chevrons pointing down at the button.
export const Chevrons: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - delay);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, t / 8) }}>
      {[0, 1, 2].map((i) => {
        const o = 0.25 + 0.75 * Math.max(0, Math.sin((t - i * 4) / 5));
        return (
          <svg key={i} width={70} height={34} viewBox="0 0 70 34" style={{ opacity: o, marginTop: -6 }}>
            <path d="M6 6 L35 28 L64 6" fill="none" stroke={COLORS.goldLight} strokeWidth={9} strokeLinecap="round" />
          </svg>
        );
      })}
    </div>
  );
};

// Ring timer counting down the seconds left in the video.
export const Countdown: React.FC<{ delay?: number; seconds: number; size?: number }> = ({
  delay = 0,
  seconds,
  size = 210,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSpring(delay, 12);
  const elapsed = Math.max(0, frame - delay) / fps;
  const left = Math.max(0, seconds - elapsed);
  const r = 44;
  const circ = 2 * Math.PI * r;
  const tick = 1 - (left % 1); // 0→1 within each second, for the digit bump
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: `scale(${s})`,
        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.45))",
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <circle cx="50" cy="50" r="48" fill="rgba(41,26,17,0.85)" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={left < 3 ? "#FF5A3C" : COLORS.gold}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - left / seconds)}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          direction: "rtl",
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: size * 0.3,
            color: COLORS.white,
            direction: "ltr",
            fontVariantNumeric: "tabular-nums",
            transform: `scale(${1 + 0.15 * Math.max(0, 1 - tick * 5)})`,
          }}
        >
          00:{String(Math.ceil(left)).padStart(2, "0")}
        </div>
        <div style={{ fontWeight: 700, fontSize: size * 0.1, color: COLORS.goldLight }}>הזמן אוזל!</div>
      </div>
    </div>
  );
};
