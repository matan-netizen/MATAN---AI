import React from "react";
import { AbsoluteFill, random, useVideoConfig } from "remotion";
import { COLORS } from "./theme";

// Penthouse position as fractions of the frame, shared with the scenes that
// aim light rays / reveals at it.
export const PENTHOUSE = { x: 0.5, y: 0.34 };

// Dusk skyline of Jerusalem-stone towers drawn in screen pixels, so the
// center tower's penthouse sits at PENTHOUSE in every format.
export const Skyline: React.FC<{ glow?: number; dim?: number }> = ({ glow = 0, dim = 0 }) => {
  const { width, height } = useVideoConfig();
  const towerW = Math.min(width * 0.28, 360);
  const towerTop = height * PENTHOUSE.y;
  const buildings = Array.from({ length: 14 }, (_, i) => {
    const w = (0.07 + random(`bw${i}`) * 0.07) * width;
    const h = (0.25 + random(`bh${i}`) * 0.3) * height;
    const x = (i / 13) * width - w / 2 + (random(`bx${i}`) - 0.5) * 40;
    return { x, w, h, lit: random(`bl${i}`) };
  }).filter((b) => Math.abs(b.x + b.w / 2 - width / 2) > towerW * 0.6);
  const windows = (lit: number, alpha: number) =>
    `repeating-linear-gradient(0deg, transparent 0 22px, rgba(255,196,90,${alpha * lit}) 22px 34px), ` +
    `repeating-linear-gradient(90deg, rgba(10,18,40,1) 0 14px, transparent 14px 34px)`;
  return (
    <AbsoluteFill style={{ filter: `brightness(${1 - dim})` }}>
      {/* back row */}
      {buildings.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x,
            bottom: 0,
            width: b.w,
            height: b.h,
            background: `linear-gradient(180deg, #1C2E5C, ${COLORS.navyDeep})`,
            borderTop: "3px solid rgba(212,175,55,0.25)",
          }}
        >
          <div style={{ position: "absolute", inset: "18px 10px 0 10px", background: windows(b.lit, 0.55), opacity: 0.8 }} />
        </div>
      ))}
      {/* the tower */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - towerW / 2,
          top: towerTop,
          width: towerW,
          bottom: 0,
          background: "linear-gradient(90deg, #142453, #22386E 50%, #0E1B40)",
          borderTop: `4px solid ${COLORS.gold}`,
          boxShadow: "0 0 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* penthouse floor */}
        <div
          style={{
            position: "absolute",
            left: towerW * 0.08,
            right: towerW * 0.08,
            top: towerW * 0.06,
            height: towerW * 0.3,
            background: `linear-gradient(180deg, #FFF3C4, ${COLORS.gold} 60%, #FFB347)`,
            opacity: 0.15 + 0.85 * glow,
            boxShadow: `0 0 ${80 * glow}px ${30 * glow}px rgba(255,210,110,${0.8 * glow})`,
            borderRadius: 6,
          }}
        />
        <div style={{ position: "absolute", inset: `${towerW * 0.45}px ${towerW * 0.1}px 0`, background: windows(0.6, 0.5), opacity: 0.7 }} />
      </div>
    </AbsoluteFill>
  );
};

// Dusk sky gradient.
export const DuskSky: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "linear-gradient(180deg, #050E26 0%, #13285C 35%, #5B3A6E 62%, #D9774A 82%, #F2B266 100%)",
    }}
  />
);
