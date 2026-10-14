import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { COLORS, SANS } from "../DreamRaffle/theme";
import CAPTIONS from "./captions.json";

type Word = [string, number, number];

// Word-synced captions from fal Whisper timestamps, for muted autoplay.
// They stop before the end card, which spells out the URL itself.
export const Captions: React.FC<{ until: number }> = ({ until }) => {
  const frame = useCurrentFrame();
  const phrases = (CAPTIONS as Word[][]).filter((p) => p[0][1] < until);
  const i = phrases.findIndex(
    (p, k) =>
      frame >= p[0][1] - 2 &&
      frame < (phrases[k + 1]?.[0][1] ?? p[p.length - 1][2] + 12) - 2,
  );
  if (i < 0 || frame >= until) return null;
  const phrase = phrases[i];
  const pop = interpolate(
    frame,
    [phrase[0][1] - 2, phrase[0][1] + 3],
    [0.92, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 64,
      }}
    >
      <div
        style={{
          padding: "12px 30px",
          borderRadius: 16,
          background: "rgba(6,18,42,0.72)",
          border: "1px solid rgba(243,222,156,0.25)",
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 48,
          letterSpacing: 0.5,
          color: COLORS.white,
          transform: `scale(${pop})`,
          display: "flex",
          gap: 14,
        }}
      >
        {phrase.map(([w, start], k) => (
          <span
            key={k}
            style={{
              color:
                frame >= start - 1
                  ? COLORS.goldLight
                  : "rgba(255,255,255,0.55)",
              textShadow:
                frame >= start - 1 ? "0 0 18px rgba(243,222,156,0.35)" : "none",
            }}
          >
            {w}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Film finish: soft vignette plus animated grain.
export const FilmFinish: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`g${Math.floor(frame / 2)}`) * 1000);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)",
        }}
      />
      <svg
        width="100%"
        height="100%"
        style={{ opacity: 0.07, mixBlendMode: "overlay" }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={seed}
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

// Scene entrance: a quick zoom-blur instead of a flat crossfade.
export const ZoomIn: React.FC<{
  on: boolean;
  frames: number;
  children: React.ReactNode;
}> = ({ on, frames, children }) => {
  const frame = useCurrentFrame();
  if (!on) return <AbsoluteFill>{children}</AbsoluteFill>;
  const t = interpolate(frame, [0, frames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const ease = 1 - Math.pow(1 - t, 3);
  return (
    <AbsoluteFill
      style={{
        opacity: ease,
        transform: `scale(${1.08 - 0.08 * ease})`,
        filter: `blur(${(1 - ease) * 14}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
