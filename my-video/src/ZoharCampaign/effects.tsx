import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, CROSSFADE, GOLD_TEXT, SERIF } from "./theme";

// Fades a scene in and out so neighbouring sequences crossfade.
export const SceneFrame: React.FC<{
  children: React.ReactNode;
  fadeIn?: boolean;
  fadeOut?: boolean;
}> = ({ children, fadeIn = true, fadeOut = true }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inOp = fadeIn
    ? interpolate(frame, [0, CROSSFADE], [0, 1], { extrapolateRight: "clamp" })
    : 1;
  const outOp = fadeOut
    ? interpolate(
        frame,
        [durationInFrames - CROSSFADE, durationInFrames],
        [1, 0],
        {
          extrapolateLeft: "clamp",
        },
      )
    : 1;
  return (
    <AbsoluteFill style={{ opacity: Math.min(inOp, outOp) }}>
      {children}
    </AbsoluteFill>
  );
};

// Floating golden dust particles drifting upward.
export const GoldDust: React.FC<{
  count?: number;
  intensity?: number;
  seed?: string;
}> = ({ count = 50, intensity = 1, seed = "dust" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${k}-${i}`);
        const size = 3 + r("s") * 9;
        const speed = 0.6 + r("v") * 1.8;
        const y =
          height + 40 - ((frame * speed + r("y") * height) % (height + 80));
        const x = r("x") * width + Math.sin(frame * 0.02 + i) * 40;
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.05 + i * 1.7));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: COLORS.brightGold,
              opacity: twinkle * intensity * 0.85,
              boxShadow: `0 0 ${size * 3}px ${COLORS.amber}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Rotating divine light rays emanating from a point.
export const LightRays: React.FC<{
  x?: string;
  y?: string;
  opacity?: number;
  spread?: number;
}> = ({ x = "50%", y = "40%", opacity = 1, spread = 1 }) => {
  const frame = useCurrentFrame();
  const rot = frame * 0.15;
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "screen",
        background: `repeating-conic-gradient(from ${rot}deg at ${x} ${y}, rgba(255,215,0,0.22) 0deg, rgba(255,215,0,0) ${6 * spread}deg, rgba(255,215,0,0) ${14 * spread}deg)`,
        maskImage: `radial-gradient(circle at ${x} ${y}, black 0%, transparent 70%)`,
        WebkitMaskImage: `radial-gradient(circle at ${x} ${y}, black 0%, transparent 70%)`,
      }}
    />
  );
};

// Soft radial glow.
export const Glow: React.FC<{
  x?: string;
  y?: string;
  size?: number;
  color?: string;
  opacity?: number;
}> = ({
  x = "50%",
  y = "50%",
  size = 900,
  color = COLORS.brightGold,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: `calc(${x} - ${size / 2}px)`,
      top: `calc(${y} - ${size / 2}px)`,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
      opacity,
      mixBlendMode: "screen",
    }}
  />
);

// Hebrew letters floating in 3D over a glowing parchment.
const LETTERS = "אבגדהוזחטיכלמנסעפצקרשת".split("");
export const FloatingLetters: React.FC<{
  count?: number;
  opacity?: number;
}> = ({ count = 26, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ perspective: 1200, opacity, pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`letter-${k}-${i}`);
        const z = -400 + r("z") * 700;
        const x = r("x") * width;
        const y =
          height * 0.15 + r("y") * height * 0.7 - frame * (0.4 + r("v"));
        const rotY = Math.sin(frame * 0.02 + i) * 35;
        const appear = interpolate(frame, [i * 2, i * 2 + 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 60 + r("s") * 70,
              color: COLORS.brightGold,
              opacity: appear * (0.35 + 0.5 * r("o")),
              transform: `translateZ(${z}px) rotateY(${rotY}deg)`,
              textShadow: `0 0 20px ${COLORS.amber}, 0 0 40px ${COLORS.gold}`,
            }}
          >
            {LETTERS[Math.floor(r("l") * LETTERS.length)]}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

type RevealProps = {
  text: string;
  delay?: number;
  stagger?: number;
  size?: number;
  font?: string;
  weight?: number;
  gold?: boolean;
  color?: string;
  // Words to render in gold even when the rest is plain.
  highlight?: string[];
  lineHeight?: number;
  style?: React.CSSProperties;
};

// Word-by-word spring reveal for RTL Hebrew lines.
export const RevealText: React.FC<RevealProps> = ({
  text,
  delay = 0,
  stagger = 4,
  size = 80,
  font = SERIF,
  weight = 700,
  gold = false,
  color = COLORS.parchment,
  highlight = [],
  lineHeight = 1.3,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div
      style={{
        direction: "rtl",
        textAlign: "center",
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        color,
        textShadow: "0 4px 24px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.6)",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const s = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 200, stiffness: 90 },
        });
        const isGold = gold || highlight.some((h) => w.includes(h));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: s,
              transform: `translateY(${(1 - s) * 30}px)`,
              filter: `blur(${(1 - s) * 8}px)`,
              marginLeft: "0.25em",
            }}
          >
            {isGold ? (
              <span
                style={{
                  backgroundImage: GOLD_TEXT,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textShadow: "none",
                  filter: "drop-shadow(0 0 18px rgba(255,215,0,0.45))",
                }}
              >
                {w}
              </span>
            ) : (
              w
            )}
          </span>
        );
      })}
    </div>
  );
};

// Thin ornamental gold divider.
export const Ornament: React.FC<{ delay?: number; width?: number }> = ({
  delay = 0,
  width = 520,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: p }}>
      <div
        style={{
          width: (width / 2) * p,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${COLORS.gold})`,
        }}
      />
      <div
        style={{
          width: 18,
          height: 18,
          transform: "rotate(45deg)",
          background: COLORS.brightGold,
          boxShadow: `0 0 18px ${COLORS.brightGold}`,
        }}
      />
      <div
        style={{
          width: (width / 2) * p,
          height: 3,
          background: `linear-gradient(270deg, transparent, ${COLORS.gold})`,
        }}
      />
    </div>
  );
};

// Bright white-gold bloom, screen-blended so it lifts whatever is beneath.
export const RevealFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(frame, [0, 3, durationInFrames], [0, 1, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 35%, #FFFFFF 0%, #FFF3C4 35%, ${COLORS.amber} 100%)`,
        mixBlendMode: "screen",
        opacity,
      }}
    />
  );
};
