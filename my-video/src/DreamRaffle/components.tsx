import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, CROSSFADE, FONT, GOLD_GRADIENT, SOURCE } from "./theme";

type Crop = { x: number; y: number; w: number; h: number };

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

export const useEnter = (delay: number, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

// Shows one region of the source video, scaled to `width`, with a slow push-in.
export const CropVideo: React.FC<{
  src?: string;
  srcSize?: { w: number; h: number };
  crop: Crop;
  width: number;
  at: number;
  playbackRate?: number;
  volume?: number | ((f: number) => number);
  zoom?: [number, number];
  filter?: string;
  style?: React.CSSProperties;
}> = ({
  src = SOURCE,
  srcSize = { w: 1080, h: 1920 },
  crop,
  width,
  at,
  playbackRate = 1,
  volume = 0,
  zoom = [1, 1.06],
  filter,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const s = width / crop.w;
  const z = interpolate(frame, [0, durationInFrames], zoom, {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        width,
        height: crop.h * s,
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${z})`,
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          trimBefore={Math.round(at * fps)}
          playbackRate={playbackRate}
          volume={volume}
          muted={volume === 0}
          style={{
            position: "absolute",
            left: -crop.x * s,
            top: -crop.y * s,
            width: srcSize.w * s,
            height: srcSize.h * s,
            maxWidth: "none",
            filter,
          }}
        />
      </div>
    </div>
  );
};

// A blurred, darkened copy of a clip filling the whole frame.
export const BlurredBackdrop: React.FC<{
  crop: Crop;
  at: number;
  src?: string;
  srcSize?: { w: number; h: number };
}> = ({ crop, at, src, srcSize }) => {
  const width = Math.max(1080, (1920 / crop.h) * crop.w);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <CropVideo
        src={src}
        srcSize={srcSize}
        crop={crop}
        width={width}
        at={at}
        zoom={[1.1, 1.15]}
        filter="blur(28px) brightness(0.38) saturate(1.2)"
      />
    </AbsoluteFill>
  );
};

// Brand background: deep cocoa with a warm glow and drifting gold specks.
export const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 35%, #4A3424 0%, ${COLORS.cocoa} 55%, ${COLORS.ink} 100%)`,
    }}
  />
);

export const Sparkles: React.FC<{ count?: number }> = ({ count = 34 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`x${i}`) * 1080;
        const speed = 0.4 + random(`s${i}`) * 0.9;
        const y = (random(`y${i}`) * 2100 - frame * speed) % 2100;
        const size = 3 + random(`z${i}`) * 5;
        const twinkle =
          0.35 + 0.65 * Math.abs(Math.sin(frame / 12 + random(`t${i}`) * 6));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y < 0 ? y + 2100 : y,
              width: size,
              height: size,
              borderRadius: size,
              background: COLORS.goldLight,
              opacity: twinkle * 0.8,
              boxShadow: `0 0 ${size * 3}px ${COLORS.gold}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Text that rises into place.
export const Rise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  weight?: number;
  color?: string;
  font?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  delay = 0,
  size = 72,
  weight = 700,
  color = COLORS.white,
  font = FONT,
  style,
}) => {
  const s = useEnter(delay, 200);
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.12,
        textAlign: "center",
        opacity: s,
        transform: `translateY(${(1 - s) * 40}px)`,
        textShadow: "0 4px 18px rgba(0,0,0,0.55)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Gold: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: COLORS.gold }}>{children}</span>
);

// Official 9th-year logo (public/dream/logo.png) on a cream badge, so its
// dark lettering stays readable over the dark video.
export const Logo: React.FC<{ size?: number; delay?: number }> = ({
  size = 220,
  delay = 0,
}) => {
  const s = useEnter(delay, 12);
  return (
    <div
      style={{
        padding: size * 0.08,
        borderRadius: size * 0.14,
        background: COLORS.cream,
        border: `3px solid ${COLORS.gold}`,
        boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
        transform: `scale(${s})`,
        lineHeight: 0,
      }}
    >
      <Img src={staticFile("dream/logo.png")} style={{ width: size }} />
    </div>
  );
};

// Gold-framed card around a clip or photo.
export const Frame: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const s = useEnter(delay, 15);
  return (
    <div
      style={{
        padding: 6,
        borderRadius: 26,
        background: GOLD_GRADIENT,
        boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        opacity: Math.min(1, s * 1.4),
        transform: `scale(${0.92 + 0.08 * s})`,
        ...style,
      }}
    >
      <div style={{ borderRadius: 21, overflow: "hidden", lineHeight: 0 }}>
        {children}
      </div>
    </div>
  );
};

// Pill label.
export const Pill: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  gold?: boolean;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, size = 40, gold = false, style }) => {
  const s = useEnter(delay, 16);
  return (
    <div
      style={{
        display: "inline-block",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: size * 0.04,
        color: gold ? COLORS.ink : COLORS.goldLight,
        background: gold ? GOLD_GRADIENT : "rgba(26,18,12,0.82)",
        border: gold ? "none" : `2px solid ${COLORS.gold}`,
        padding: `${size * 0.28}px ${size * 0.7}px`,
        borderRadius: 999,
        opacity: s,
        transform: `scale(${0.8 + 0.2 * s})`,
        boxShadow: "0 10px 26px rgba(0,0,0,0.4)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Small, always-legible note (photo credits, disclosures).
export const Note: React.FC<{
  children: React.ReactNode;
  bottom?: number;
  size?: number;
}> = ({ children, bottom = 70, size = 30 }) => (
  <div
    style={{
      position: "absolute",
      left: 60,
      right: 60,
      bottom,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.3,
        color: COLORS.cream,
        textAlign: "center",
        background: "rgba(26,18,12,0.85)",
        padding: "12px 26px",
        borderRadius: 16,
      }}
    >
      {children}
    </div>
  </div>
);

// Full-bleed landscape photo in the vertical frame: a slow camera move
// across it (x from/to in 0..1 of the overflow) with a gentle push-in.
export const PhotoPan: React.FC<{
  src: string;
  x?: [number, number];
  zoom?: [number, number];
  originY?: number;
  filter?: string;
}> = ({ src, x = [0.3, 0.7], zoom = [1, 1.08], originY = 0.5, filter }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: (t) => t * (2 - t) * 0.5 + t * 0.5,
  });
  const z = zoom[0] + (zoom[1] - zoom[0]) * p;
  const h = 1920 * z;
  const w = (h * 16) / 9;
  const left = -(w - 1080) * (x[0] + (x[1] - x[0]) * p);
  const top = -(h - 1920) * originY;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left,
          top,
          width: w,
          height: h,
          maxWidth: "none",
          filter: filter ?? "contrast(1.06) saturate(1.08)",
        }}
      />
    </AbsoluteFill>
  );
};

// Dark gradient behind text at the top or bottom of a photo.
export const Shade: React.FC<{
  top?: boolean;
  size?: number;
  strength?: number;
}> = ({ top = false, size = 760, strength = 0.92 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      [top ? "top" : "bottom"]: 0,
      height: size,
      background: `linear-gradient(${top ? "180deg" : "0deg"}, rgba(26,18,12,${strength}) 0%, rgba(26,18,12,${strength * 0.75}) 45%, rgba(26,18,12,0) 100%)`,
    }}
  />
);

// Gold text with a light sweep passing across it.
export const GoldText: React.FC<{
  children: React.ReactNode;
  size: number;
  delay?: number;
  font?: string;
  style?: React.CSSProperties;
}> = ({ children, size, delay = 0, font = FONT, style }) => {
  const frame = useCurrentFrame();
  const sweep = interpolate((frame - delay - 10) % 75, [0, 30], [-60, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.04,
        backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep - 12}%, rgba(255,250,230,0.95) ${sweep}%, rgba(255,255,255,0) ${sweep + 12}%), ${GOLD_GRADIENT}`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.55))",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Finishing layers that sit over every scene.
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)",
    }}
  />
);

export const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  return (
    <AbsoluteFill
      style={{ pointerEvents: "none", opacity: 0.07, mixBlendMode: "overlay" }}
    >
      <svg width="1080" height="1920">
        <filter id={`grain${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={seed}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1080" height="1920" filter={`url(#grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

// Warm light flash used on scene cuts (place it in a Sequence at the cut).
export const LightLeak: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 4, 14], [0, 0.55, 0], {
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame, [0, 14], [20, 80]);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: o,
        mixBlendMode: "screen",
        background: `radial-gradient(ellipse at ${x}% 30%, rgba(255,214,140,0.95) 0%, rgba(240,150,60,0.55) 30%, rgba(0,0,0,0) 70%)`,
      }}
    />
  );
};
