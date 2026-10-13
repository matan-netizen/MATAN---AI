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
import { COLORS, CROSSFADE, FONT, HAND, sfx } from "./theme";

export const useEnter = (delay: number, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

// Fades a scene in on top of the previous one (crossfade).
export const SceneFade: React.FC<{
  children: React.ReactNode;
  fadeIn?: boolean;
}> = ({ children, fadeIn = true }) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn
    ? interpolate(frame, [0, CROSSFADE], [0, 1], { extrapolateRight: "clamp" })
    : 1;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// A sound effect at a frame relative to the enclosing scene.
export const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({
  name,
  at,
  volume = 0.7,
}) => (
  <Sequence from={at} name={`SFX: ${name}`} layout="none">
    <Html5Audio src={staticFile(sfx(name))} volume={volume} />
  </Sequence>
);

// Rounded illustration card with a slow push-in and an optional shake.
export const Card: React.FC<{
  src: string;
  width: number;
  height: number;
  delay?: number;
  zoom?: [number, number];
  position?: string;
  shake?: number;
  radius?: number;
  style?: React.CSSProperties;
}> = ({
  src,
  width,
  height,
  delay = 0,
  zoom = [1, 1.1],
  position = "50% 50%",
  shake = 0,
  radius = 48,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = useEnter(delay, 16);
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const jx = shake ? Math.sin(frame * 2.7) * shake : 0;
  const jy = shake ? Math.cos(frame * 3.3) * shake : 0;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        overflow: "hidden",
        boxShadow: "0 30px 70px rgba(15,27,61,0.35)",
        border: `8px solid ${COLORS.white}`,
        opacity: s,
        transform: `translate(${jx}px, ${jy + (1 - s) * 120}px) scale(${0.9 + 0.1 * s})`,
        ...style,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          transform: `scale(${zoom[0] + (zoom[1] - zoom[0]) * p})`,
        }}
      />
    </div>
  );
};

// Text that rises into place.
export const Rise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  delay = 0,
  size = 80,
  weight = 900,
  color = COLORS.navy,
  style,
}) => {
  const s = useEnter(delay, 200);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.15,
        textAlign: "center",
        opacity: s,
        transform: `translateY(${(1 - s) * 50}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Headline revealed word by word (right to left, in reading order).
export const Words: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size?: number;
  color?: string;
  highlight?: string[];
  highlightColor?: string;
}> = ({
  text,
  delay = 0,
  stagger = 5,
  size = 92,
  color = COLORS.navy,
  highlight = [],
  highlightColor = COLORS.blue,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: `0 ${size * 0.25}px`,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.2,
        textAlign: "center",
      }}
    >
      {text.split(" ").map((w, i) => {
        const s = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 12 },
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: highlight.includes(w) ? highlightColor : color,
              opacity: Math.min(1, s * 1.5),
              transform: `translateY(${(1 - s) * 40}px) scale(${0.7 + 0.3 * s})`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// The storyboard's handwritten aside.
export const Handwritten: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
  rotate?: number;
}> = ({ children, delay = 0, size = 92, color = COLORS.ink, rotate = -6 }) => {
  const frame = useCurrentFrame();
  // A left-to-right wipe would fight the RTL reading direction, so the
  // reveal sweeps from the right edge.
  const reveal = interpolate(frame - delay, [0, 24], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        fontFamily: HAND,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.0,
        color,
        textAlign: "center",
        transform: `rotate(${rotate}deg)`,
        clipPath: `inset(0 0 0 ${100 - reveal}%)`,
      }}
    >
      {children}
    </div>
  );
};

// Pop-in wrapper.
export const Pop: React.FC<{
  children: React.ReactNode;
  delay?: number;
  damping?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, damping = 10, style }) => {
  const s = useEnter(delay, damping);
  return (
    <div
      style={{
        transform: `scale(${s})`,
        opacity: Math.min(1, s * 2),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Question marks that pop in and bob around a point.
export const QuestionMarks: React.FC<{
  marks: { x: number; y: number; size: number; delay: number }[];
  color?: string;
}> = ({ marks, color = "#64748B" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {marks.map(({ x, y, size, delay }, i) => {
        const s = spring({ frame: frame - delay, fps, config: { damping: 8 } });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y + Math.sin((frame + i * 13) / 9) * 10,
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: size,
              color,
              opacity: Math.min(1, s * 2),
              transform: `scale(${s}) rotate(${(i % 2 ? 1 : -1) * 12}deg)`,
              textShadow: "0 6px 14px rgba(0,0,0,0.15)",
            }}
          >
            ?
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// Icons (inline SVG so they stay crisp at any size)
// ---------------------------------------------------------------------------

export const PhoneGlyph: React.FC<{ size: number; color?: string }> = ({
  size,
  color = COLORS.white,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill={color}
      d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
    />
  </svg>
);

// Generic chat bubble with a handset, in the spirit of a messaging icon.
export const ChatGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path
      fill={COLORS.white}
      d="M24 4C12.95 4 4 12.5 4 23c0 3.7 1.1 7.2 3.1 10.1L5 43l10.2-2.6A21 21 0 0 0 24 42c11.05 0 20-8.5 20-19S35.05 4 24 4z"
    />
    <g transform="translate(13 12) scale(0.92)">
      <PhoneGlyphPath color={COLORS.green} />
    </g>
  </svg>
);
const PhoneGlyphPath: React.FC<{ color: string }> = ({ color }) => (
  <path
    fill={color}
    d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
  />
);

export const CoinsIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    {[46, 38, 30].map((y, i) => (
      <g key={y}>
        <ellipse cx="24" cy={y + 6} rx="16" ry="6" fill="#B7791F" />
        <rect x="8" y={y} width="32" height="6" fill="#D69E2E" />
        <ellipse
          cx="24"
          cy={y}
          rx="16"
          ry="6"
          fill={i === 2 ? "#F6E05E" : "#ECC94B"}
        />
      </g>
    ))}
    <circle
      cx="46"
      cy="44"
      r="14"
      fill={COLORS.yellow}
      stroke="#B7791F"
      strokeWidth="2"
    />
    <circle cx="41" cy="41" r="2" fill={COLORS.ink} />
    <circle cx="51" cy="41" r="2" fill={COLORS.ink} />
    <path
      d="M40 47q6 6 12 0"
      stroke={COLORS.ink}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export const MonitorIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <rect x="6" y="8" width="52" height="34" rx="4" fill={COLORS.navy} />
    <rect x="10" y="12" width="44" height="26" rx="2" fill="#DBEAFE" />
    <polyline
      points="14,32 24,24 32,28 46,16"
      stroke={COLORS.blue}
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="28" y="42" width="8" height="10" fill={COLORS.navy} />
    <rect x="18" y="52" width="28" height="5" rx="2.5" fill={COLORS.navy} />
  </svg>
);

export const TargetIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle
      cx="30"
      cy="34"
      r="24"
      fill="#FEE2E2"
      stroke={COLORS.navy}
      strokeWidth="4"
    />
    <circle
      cx="30"
      cy="34"
      r="15"
      fill="#FCA5A5"
      stroke={COLORS.navy}
      strokeWidth="4"
    />
    <circle cx="30" cy="34" r="6" fill="#DC2626" />
    <line
      x1="30"
      y1="34"
      x2="54"
      y2="10"
      stroke={COLORS.navy}
      strokeWidth="4"
      strokeLinecap="round"
    />
    <polygon points="54,4 60,10 54,12 52,10" fill={COLORS.navy} />
  </svg>
);

// Big rounded CTA button: icon on the right (RTL), label and number.
export const CtaButton: React.FC<{
  color: string;
  shade: string;
  icon: React.ReactNode;
  label: string;
  number: string;
  delay: number;
  pulse?: boolean;
  pressAt?: number;
}> = ({ color, shade, icon, label, number, delay, pulse = true, pressAt }) => {
  const frame = useCurrentFrame();
  const s = useEnter(delay, 9);
  const beat =
    pulse && frame > delay + 20 ? 1 + 0.025 * Math.sin((frame - delay) / 5) : 1;
  const press =
    pressAt !== undefined
      ? 1 - 0.06 * Math.max(0, 1 - Math.abs(frame - pressAt) / 4)
      : 1;
  return (
    <div
      style={{
        position: "relative",
        width: 940,
        display: "flex",
        alignItems: "center",
        gap: 34,
        padding: "34px 46px",
        borderRadius: 60,
        background: `linear-gradient(180deg, ${color}, ${shade})`,
        boxShadow: `0 18px 0 ${shade}, 0 34px 60px rgba(0,0,0,0.3)`,
        transform: `scale(${s * beat * press})`,
        opacity: Math.min(1, s * 2),
      }}
    >
      <div
        style={{
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div
        style={{ fontFamily: FONT, color: COLORS.white, textAlign: "right" }}
      >
        <div style={{ fontSize: 54, fontWeight: 700 }}>{label}</div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: COLORS.yellow,
            direction: "ltr",
            lineHeight: 1.05,
            letterSpacing: 1,
          }}
        >
          {number}
        </div>
      </div>
      {pressAt !== undefined && frame >= pressAt ? (
        <Ripple start={pressAt} />
      ) : null}
    </div>
  );
};

const Ripple: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - start, [0, 26], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        right: 120,
        top: "50%",
        width: 600,
        height: 600,
        marginTop: -300,
        marginRight: -300,
        borderRadius: "50%",
        border: `14px solid rgba(255,255,255,${0.7 * (1 - p)})`,
        transform: `scale(${0.1 + p})`,
        pointerEvents: "none",
      }}
    />
  );
};

// A finger that slides in and taps at `tapAt`.
export const TapFinger: React.FC<{
  x: number;
  y: number;
  enterAt: number;
  tapAt: number;
}> = ({ x, y, enterAt, tapAt }) => {
  const frame = useCurrentFrame();
  const s = useEnter(enterAt, 14);
  const dip = Math.max(0, 1 - Math.abs(frame - tapAt) / 5);
  const out = interpolate(frame, [tapAt + 25, tapAt + 40], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontSize: 170,
        opacity: s * out,
        transform: `translate(${(1 - s) * 300}px, ${(1 - s) * 300 + dip * 24}px) rotate(-20deg) scale(${1 - dip * 0.08})`,
        filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.35))",
      }}
    >
      👆
    </div>
  );
};

// Soft background with drifting dots, shared by the light scenes.
export const LightBackdrop: React.FC<{ tint?: string }> = ({
  tint = COLORS.sky,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 30%, ${COLORS.white} 0%, ${tint} 75%)`,
      }}
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: ((i * 173) % 1080) - 40,
            top: ((i * 331 + frame * (0.6 + (i % 3) * 0.3)) % 2100) - 120,
            width: 40 + (i % 4) * 26,
            height: 40 + (i % 4) * 26,
            borderRadius: "50%",
            background: i % 3 === 0 ? COLORS.yellow : COLORS.navy,
            opacity: 0.07,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
