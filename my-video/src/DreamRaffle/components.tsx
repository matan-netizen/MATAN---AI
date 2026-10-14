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
import {
  CLIPS,
  COLORS,
  GOLD_GRADIENT,
  SANS,
  SERIF,
  Shot,
  STILLS,
} from "./theme";

// Kling clip when one is ready, otherwise a slow push-in on the fal still.
// A clip shorter than its scene is slowed down to fill it.
export const Footage: React.FC<{
  shot: Shot;
  zoom?: [number, number];
  pan?: [number, number];
  blur?: number;
}> = ({ shot, zoom = [1.04, 1.14], pan = [0, 0], blur = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const clipSeconds = CLIPS[shot];
  const filter = blur ? `blur(${blur}px)` : undefined;
  if (clipSeconds) {
    const rate = Math.min(1, (clipSeconds * fps) / durationInFrames);
    return (
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile(`dreamraffle/clips/${shot}.mp4`)}
          playbackRate={rate}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", filter }}
        />
      </AbsoluteFill>
    );
  }
  const p = frame / durationInFrames;
  const scale = interpolate(p, [0, 1], zoom);
  const x = interpolate(p, [0, 1], [0, pan[0]]);
  const y = interpolate(p, [0, 1], [0, pan[1]]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(STILLS[shot])}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
          filter,
        }}
      />
    </AbsoluteFill>
  );
};

// Dark gradient so overlaid text reads over bright footage.
export const Shade: React.FC<{
  from?: "bottom" | "top";
  strength?: number;
}> = ({ from = "bottom", strength = 0.75 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${from === "bottom" ? "0deg" : "180deg"}, rgba(6,18,42,${strength}) 0%, rgba(6,18,42,${strength * 0.4}) 35%, transparent 60%)`,
    }}
  />
);

// Crossfades a scene in over its first frames.
export const SceneFade: React.FC<{
  fadeIn: boolean;
  frames: number;
  children: React.ReactNode;
}> = ({ fadeIn, frames, children }) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn
    ? interpolate(frame, [0, frames], [0, 1], { extrapolateRight: "clamp" })
    : 1;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// Springs in (rise + fade) after `delay` frames.
export const useEnter = (delay: number, damping = 16) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping } });
  return {
    opacity: interpolate(s, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
  };
};

export const GoldText: React.FC<{
  children: React.ReactNode;
  size: number;
  delay?: number;
  serif?: boolean;
  weight?: number;
  spacing?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  size,
  delay = 0,
  serif = true,
  weight = 900,
  spacing = 0,
  style,
}) => {
  const enter = useEnter(delay);
  return (
    <div
      style={{
        fontFamily: serif ? SERIF : SANS,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: spacing,
        backgroundImage: GOLD_GRADIENT,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.55))",
        ...enter,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Label: React.FC<{
  children: React.ReactNode;
  size?: number;
  delay?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size = 34, delay = 0, color = COLORS.white, style }) => {
  const enter = useEnter(delay);
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: size * 0.18,
        textTransform: "uppercase",
        color,
        textShadow: "0 3px 14px rgba(0,0,0,0.6)",
        ...enter,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const GoldRule: React.FC<{ delay?: number; width?: number }> = ({
  delay = 0,
  width = 220,
}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 18], [0, width], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        width: w,
        height: 3,
        background: GOLD_GRADIENT,
        borderRadius: 2,
        margin: "22px 0",
      }}
    />
  );
};

// Drifting gold dust for the graphic scenes.
export const GoldDust: React.FC<{ count?: number }> = ({ count = 60 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      {new Array(count).fill(0).map((_, i) => {
        const size = 3 + random(`s${i}`) * 9;
        const speed = 0.4 + random(`v${i}`) * 1.2;
        const x = random(`x${i}`) * width + Math.sin(frame / 40 + i) * 20;
        const y =
          (((random(`y${i}`) * height - frame * speed) % height) + height) %
          height;
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
              background: COLORS.goldLight,
              opacity: 0.25 + random(`o${i}`) * 0.5,
              filter: `blur(${size > 8 ? 3 : 1}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const NavyBackdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 40%, #183A66 0%, ${COLORS.navy} 45%, ${COLORS.navyDeep} 100%)`,
    }}
  />
);

// Gold-foil raffle ticket built in CSS so its text stays sharp.
export const Ticket: React.FC<{ style?: React.CSSProperties }> = ({
  style,
}) => (
  <div
    style={{
      position: "absolute",
      width: 560,
      height: 260,
      borderRadius: 22,
      background: `linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 45%, #E9C978 70%, ${COLORS.goldDark} 100%)`,
      boxShadow:
        "0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 6px rgba(255,255,255,0.25)",
      display: "flex",
      alignItems: "center",
      ...style,
    }}
  >
    <div
      style={{
        flex: 1,
        padding: "0 40px",
        borderRight: `4px dashed ${COLORS.navy}55`,
        height: "75%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 6,
          color: COLORS.navy,
        }}
      >
        9TH ANNUAL
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 900,
          fontSize: 54,
          lineHeight: 1,
          color: COLORS.navy,
          marginTop: 8,
        }}
      >
        The Dream
        <br />
        Raffle
      </div>
    </div>
    <div
      style={{
        width: 130,
        textAlign: "center",
        fontFamily: SANS,
        fontWeight: 900,
        fontSize: 26,
        letterSpacing: 4,
        color: COLORS.navy,
        transform: "rotate(-90deg)",
      }}
    >
      ADMIT ONE
    </div>
  </div>
);

// The English 9th-edition logo (scripts/build-dreamraffle-logo.py) on a
// cream badge, since its curved tagline is dark brown.
export const LogoBadge: React.FC<{
  size: number;
  style?: React.CSSProperties;
}> = ({ size, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.18,
      background: `linear-gradient(180deg, #FFF8E8 0%, ${COLORS.stone} 100%)`,
      boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
      border: `${Math.max(2, size / 60)}px solid ${COLORS.gold}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    <Img
      src={staticFile("dreamraffle/site/logo-9-en.png")}
      style={{ width: "86%", height: "86%", objectFit: "contain" }}
    />
  </div>
);

// Brand mark in the top corner of every scene before the end card.
export const Watermark: React.FC = () => (
  <LogoBadge size={128} style={{ position: "absolute", top: 36, right: 48 }} />
);

// A real photo from thedreamraffle.co.il with a slow push-in. Photos much
// narrower than 16:9 sit on a blurred copy of themselves instead of being
// cropped.
export const Photo: React.FC<{
  src: string;
  aspect: number;
  zoom?: [number, number];
  dir?: string;
}> = ({ src, aspect, zoom = [1.02, 1.1], dir = "dreamraffle/site" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], zoom);
  const file = staticFile(`${dir}/${src}`);
  if (aspect >= 1.45) {
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={file}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }}
        />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill
      style={{ overflow: "hidden", backgroundColor: COLORS.navyDeep }}
    >
      <Img
        src={file}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(40px) brightness(0.55)",
          transform: "scale(1.2)",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img
          src={file}
          style={{
            height: "92%",
            borderRadius: 18,
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            transform: `scale(${scale})`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// The raffle's mascot (cut-out PNG from the site) rising in from below.
export const Mascot: React.FC<{
  pose: "pointing" | "thumbs-up" | "ayc";
  height: number;
  delay: number;
  style?: React.CSSProperties;
}> = ({ pose, height, delay, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 13 } });
  return (
    <Img
      src={staticFile(`dreamraffle/site/mascot-${pose}.png`)}
      style={{
        position: "absolute",
        bottom: 0,
        height,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [height * 0.35, 0])}px)`,
        filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.55))",
        ...style,
      }}
    />
  );
};
