import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Glow, GoldDust, Ornament, RevealText } from "./effects";
import { ZoharImageCard } from "./ZoharImageCard";
import { COLORS, GOLD_TEXT, IMAGES, SANS } from "./theme";

const BANNER_H = 860;

// Points on the study-hall banner (scholars' heads), in 1080-wide coords.
const SCHOLARS = [
  { x: 560, y: 270 },
  { x: 112, y: 400 },
  { x: 255, y: 385 },
  { x: 800, y: 360 },
  { x: 1010, y: 365 },
  { x: 370, y: 350 },
];
// Where the viewer "stands": just above the CTA button.
const VIEWER = { x: 540, y: 1420 };

const GoldenBeams: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient
          id="beam"
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={VIEWER.y}
          x2={0}
          y2={200}
        >
          <stop offset="0%" stopColor={COLORS.brightGold} stopOpacity={0.9} />
          <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0.15} />
        </linearGradient>
      </defs>
      {SCHOLARS.map((s, i) => {
        const start = 20 + i * 6;
        const draw = interpolate(frame, [start, start + 30], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const len = Math.hypot(s.x - VIEWER.x, s.y - VIEWER.y);
        // Particle travelling along the beam, looping.
        const t = ((frame - start) % 45) / 45;
        const px = VIEWER.x + (s.x - VIEWER.x) * t;
        const py = VIEWER.y + (s.y - VIEWER.y) * t;
        return (
          <g key={i}>
            <line
              x1={VIEWER.x}
              y1={VIEWER.y}
              x2={s.x}
              y2={s.y}
              stroke="url(#beam)"
              strokeWidth={3}
              strokeDasharray={len}
              strokeDashoffset={len * (1 - draw)}
              style={{ filter: `drop-shadow(0 0 8px ${COLORS.brightGold})` }}
            />
            {draw >= 1 ? (
              <circle
                cx={px}
                cy={py}
                r={7}
                fill="#FFF6CC"
                style={{ filter: `drop-shadow(0 0 12px ${COLORS.brightGold})` }}
              />
            ) : null}
            <circle
              cx={s.x}
              cy={s.y}
              r={10 * draw}
              fill={COLORS.brightGold}
              opacity={0.8}
            />
          </g>
        );
      })}
    </svg>
  );
};

const Thumb: React.FC<{
  src: string | null;
  delay: number;
  rotate: number;
}> = ({ src, delay, rotate }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14 } });
  return (
    <div
      style={{
        width: 290,
        height: 230,
        borderRadius: 22,
        overflow: "hidden",
        border: `4px solid ${COLORS.gold}`,
        boxShadow: `0 0 30px rgba(255,215,0,0.4), 0 20px 40px rgba(0,0,0,0.5)`,
        transform: `scale(${s}) rotate(${rotate * s}deg)`,
        background: COLORS.purple,
      }}
    >
      {src ? (
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}
    </div>
  );
};

// Pulsing golden CTA with a glowing aura.
const CTAButton: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 9, stiffness: 160 } });
  const pulse = 1 + 0.045 * Math.sin(frame * 0.22);
  const shine = interpolate(frame % 75, [0, 40], [-300, 1100], {
    extrapolateRight: "clamp",
  });
  const ring = (frame % 40) / 40;

  return (
    <div style={{ position: "relative", transform: `scale(${pop * pulse})` }}>
      <div
        style={{
          position: "absolute",
          inset: -10,
          borderRadius: 999,
          border: `5px solid ${COLORS.brightGold}`,
          opacity: (1 - ring) * 0.8,
          transform: `scale(${1 + ring * 0.25})`,
        }}
      />
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "36px 56px",
          borderRadius: 999,
          backgroundImage: GOLD_TEXT,
          color: "#2B1D05",
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 54,
          whiteSpace: "nowrap",
          direction: "rtl",
          boxShadow: `0 0 60px ${COLORS.brightGold}, 0 0 140px rgba(255,215,0,0.45), inset 0 4px 0 rgba(255,255,255,0.7)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: shine,
            width: 140,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
            transform: "skewX(-20deg)",
          }}
        />
        <span style={{ position: "relative" }}>{label}</span>
      </div>
    </div>
  );
};

// Scene 5 (21–30s): call to action. The Chavria study hall above, golden
// beams linking the viewer to the scholars, and a pulsing CTA.
export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.7 + 0.3 * Math.sin(frame * 0.1);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 75%, ${COLORS.purple} 0%, ${COLORS.night} 65%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: BANNER_H,
        }}
      >
        <ZoharImageCard
          src={IMAGES.studyHall}
          fallback="hall"
          zoomFrom={1}
          zoomTo={1.1}
          objectPosition="50% 30%"
          filter="brightness(0.85) saturate(0.95) sepia(0.15)"
          vignette={0.5}
        />
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, rgba(15,20,36,0.1) 0%, rgba(15,20,36,0) 45%, ${COLORS.night} 100%)`,
          }}
        />
      </div>
      <Glow x="50%" y="74%" size={1300} opacity={0.35 * glow} />
      <GoldenBeams />
      <GoldDust count={60} intensity={1} seed="s5" />

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 830, gap: 26 }}>
        <RevealText
          text="זה הזמן שלך להתחבר לשפע ולהגשים את כל החלומות"
          delay={8}
          stagger={4}
          size={82}
          weight={900}
          highlight={["לשפע", "החלומות"]}
          style={{ padding: "0 70px" }}
        />
        <Ornament delay={40} width={600} />
        <div style={{ display: "flex", gap: 22, marginTop: 10 }}>
          <Thumb src={IMAGES.ringZohar} delay={50} rotate={4} />
          <Thumb src={IMAGES.zoharMan} delay={58} rotate={0} />
          <Thumb src={IMAGES.stormZohar} delay={66} rotate={-4} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 1480 }}>
        <CTAButton label="👉 להצטרפות וקבלת הדף האישי" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
