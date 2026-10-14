import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_FAMILY, GOLD_GRADIENT } from "./theme";

// Seconds -> frames at the composition's 30 fps.
export const sec = (s: number) => Math.round(s * 30);

// 0 -> 1 spring that starts at `startSec` (absolute composition time).
export const usePop = (startSec: number, damping = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - sec(startSec),
    fps,
    config: { damping, stiffness: 180, mass: 0.6 },
  });
};

// Visible between two absolute times, with a short fade at each edge.
export const useWindow = (fromSec: number, toSec: number, fade = 0.15) => {
  const t = useCurrentFrame() / 30;
  return interpolate(
    t,
    [fromSec - fade, fromSec, toSec, toSec + fade],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};

/* ------------------------------------------------------------------ */
/* English logo: Jerusalem skyline crest, "THE DREAM / RAFFLE" plaque, */
/* "9th Consecutive Year" arc. Replaces the Hebrew medallion.          */
/* ------------------------------------------------------------------ */
export const Logo: React.FC<{ size: number; arc?: boolean }> = ({
  size,
  arc = true,
}) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <defs>
      <radialGradient id="medal" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#D2A884" />
        <stop offset="100%" stopColor="#8E6446" />
      </radialGradient>
      <linearGradient id="plaque" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E9C9A6" />
        <stop offset="100%" stopColor="#C49470" />
      </linearGradient>
      <path id="arcPath" d="M 34 128 A 68 68 0 0 0 166 128" />
    </defs>
    {/* Opaque backing disc so nothing underneath shows through. */}
    <circle cx="100" cy="112" r="80" fill="#2A1C13" />
    <circle cx="100" cy="112" r="74" fill="url(#medal)" stroke="#5A3B27" strokeWidth="3" />
    {/* Skyline */}
    <g fill="#F2DDBE" stroke="#7A5236" strokeWidth="1.2">
      <rect x="52" y="30" width="16" height="22" />
      <rect x="66" y="22" width="14" height="30" />
      <rect x="80" y="32" width="18" height="20" />
      <path d="M98 52 V28 a10 10 0 0 1 20 0 V52 Z" />
      <rect x="118" y="26" width="12" height="26" />
      <rect x="130" y="34" width="18" height="18" />
    </g>
    <rect x="44" y="50" width="112" height="28" rx="6" fill="url(#plaque)" stroke="#5A3B27" strokeWidth="2.5" />
    <text x="100" y="70" textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={900} fontSize="17" fill="#3B2617" letterSpacing="1">
      THE DREAM
    </text>
    <rect x="28" y="78" width="144" height="38" rx="3" fill="#24170F" stroke="#E9C9A6" strokeWidth="2" />
    <text x="100" y="106" textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={900} fontSize="27" fill="#FFF6E6" letterSpacing="2">
      RAFFLE
    </text>
    {arc ? (
      <text fontFamily={FONT_FAMILY} fontWeight={700} fontSize="12" fill="#2A1C13" letterSpacing="0.6">
        <textPath href="#arcPath" startOffset="50%" textAnchor="middle">
          9TH CONSECUTIVE YEAR
        </textPath>
      </text>
    ) : null}
  </svg>
);

/* Twinkling gold dust used on patches and the end card. */
export const Particles: React.FC<{ count: number; seed: string; height?: number }> = ({
  count,
  seed,
  height = 1920,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: count }).map((_, i) => {
        const x = random(`${seed}x${i}`) * 1080;
        const y = random(`${seed}y${i}`) * height;
        const r = 1.5 + random(`${seed}r${i}`) * 3;
        const phase = random(`${seed}p${i}`) * Math.PI * 2;
        const o = 0.35 + 0.65 * Math.abs(Math.sin(frame / 18 + phase));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y - ((frame * 0.4 * (1 + r / 4)) % 40),
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: COLORS.goldLight,
              boxShadow: `0 0 ${r * 4}px ${COLORS.gold}`,
              opacity: o,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* Feathered patch in the video's background tone; hides what's under it. */
export const BgPatch: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  opacity?: number;
  feather?: number;
}> = ({ x, y, w, h, opacity = 1, feather = 26 }) => (
  <div
    style={{
      position: "absolute",
      left: x - feather,
      top: y - feather,
      width: w + feather * 2,
      height: h + feather * 2,
      opacity,
      background: COLORS.patch,
      maskImage: `linear-gradient(to right, transparent 0, #000 ${feather}px, #000 calc(100% - ${feather}px), transparent 100%), linear-gradient(to bottom, transparent 0, #000 ${feather}px, #000 calc(100% - ${feather}px), transparent 100%)`,
      maskComposite: "intersect",
      WebkitMaskComposite: "source-in",
    }}
  />
);

/* Same shape as BgPatch, but filled with a still of the source background */
/* grabbed before the Hebrew element appeared (cropped to x - feather,     */
/* y - feather), so the texture and particles match.                      */
export const StillPatch: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  src: string;
  feather?: number;
}> = ({ x, y, w, h, src, feather = 30 }) => (
  <Img
    src={staticFile(src)}
    style={{
      position: "absolute",
      left: x - feather,
      top: y - feather,
      width: w + feather * 2,
      height: h + feather * 2,
      maskImage: `linear-gradient(to right, transparent 0, #000 ${feather}px, #000 calc(100% - ${feather}px), transparent 100%), linear-gradient(to bottom, transparent 0, #000 ${feather}px, #000 calc(100% - ${feather}px), transparent 100%)`,
      maskComposite: "intersect",
      WebkitMaskComposite: "source-in",
    }}
  />
);

export const Subtitle: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      fontFamily: FONT_FAMILY,
      fontWeight: 700,
      fontSize: 38,
      lineHeight: 1.25,
      color: COLORS.white,
      background: "rgba(0,0,0,0.74)",
      padding: "10px 22px",
      borderRadius: 10,
      textAlign: "center",
      textWrap: "balance",
      maxWidth: 880,
    }}
  >
    {text}
  </div>
);

export const GoldPill: React.FC<{
  children: React.ReactNode;
  fontSize: number;
  padding: string;
  style?: React.CSSProperties;
}> = ({ children, fontSize, padding, style }) => (
  <div
    style={{
      fontFamily: FONT_FAMILY,
      fontWeight: 900,
      fontSize,
      color: COLORS.ink,
      background: GOLD_GRADIENT,
      padding,
      borderRadius: 999,
      border: `3px solid ${COLORS.goldLight}`,
      boxShadow: `0 6px 18px rgba(0,0,0,0.5), 0 0 22px ${COLORS.gold}66`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

export const CreamPill: React.FC<{ children: React.ReactNode; fontSize: number }> = ({
  children,
  fontSize,
}) => (
  <div
    style={{
      fontFamily: FONT_FAMILY,
      fontWeight: 900,
      fontSize,
      color: COLORS.ink,
      background: COLORS.cream,
      padding: "14px 40px",
      borderRadius: 999,
      border: `4px solid ${COLORS.gold}`,
      boxShadow: `0 0 26px ${COLORS.gold}aa`,
    }}
  >
    {children}
  </div>
);

/* Full-frame gold flash, layered over the source's own flash so the English */
/* overlays dissolve together with the original graphics.                    */
export const Flash: React.FC<{ at: number }> = ({ at }) => {
  const t = useCurrentFrame() / 30;
  const o = interpolate(
    t,
    [at - 0.2, at, at + 0.15, at + 0.5],
    [0, 0.95, 0.9, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        background: "radial-gradient(circle at 50% 45%, #FFF7DC 0%, #F1D79A 45%, #D9AE5C 100%)",
      }}
    />
  );
};
