import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Crown,
  Disclaimer,
  GoldText,
  Sfx,
  usePop,
  WhiteText,
} from "../DreamLottery/components";
import {
  COLORS,
  FONT,
  GOLD_GRADIENT,
  MEDIA,
  NAVY_GRADIENT,
} from "../DreamLottery/theme";

export const POSTER_FPS = 30;
export const POSTER_DURATION = 450;

// The campaign poster is 1254px square; it sits full-width in the frame.
const SRC = 1254;
const K = 1080 / SRC;
const TOP = 430;
const ALL_IN = 212; // every element is in; the clean poster fades over the seams

type Region = { x: number; y: number; w: number; h: number };

// Element boxes measured on the poster, in poster pixels.
const R = {
  man: { x: 0, y: 20, w: 430, h: 900 },
  logo: { x: 525, y: 35, w: 232, h: 185 },
  badge: { x: 1030, y: 118, w: 215, h: 255 },
  headline: { x: 410, y: 325, w: 805, h: 240 },
  prize: { x: 398, y: 572, w: 830, h: 152 },
  gift: { x: 30, y: 922, w: 508, h: 212 },
  bonus: { x: 540, y: 922, w: 688, h: 212 },
  button: { x: 405, y: 1138, w: 465, h: 90 },
} satisfies Record<string, Region>;

const box = (r: Region): React.CSSProperties => ({
  position: "absolute",
  left: r.x * K,
  top: r.y * K,
  width: r.w * K,
  height: r.h * K,
});

// One poster element, cut out of the poster and animated into place.
const Piece: React.FC<{
  r: Region;
  at: number;
  from?: "pop" | "slam" | "left" | "spin" | "up";
}> = ({ r, at, from = "pop" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - at,
    fps,
    config: { damping: from === "slam" ? 14 : 11 },
  });
  if (frame < at || frame > ALL_IN + 12) return null;
  const transform = {
    pop: `scale(${s})`,
    slam: `scale(${interpolate(s, [0, 1], [2.2, 1])})`,
    left: `translateX(${(1 - s) * -500}px)`,
    spin: `scale(${s}) rotate(${(1 - s) * -200}deg)`,
    up: `translateY(${(1 - s) * 300}px)`,
  }[from];
  return (
    <div
      style={{
        ...box(r),
        overflow: "hidden",
        transform,
        opacity: Math.min(1, s * 2),
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
      }}
    >
      <Img
        src={staticFile(MEDIA.poster)}
        style={{
          position: "absolute",
          left: -r.x * K,
          top: -r.y * K,
          width: 1080,
          height: 1080,
          maxWidth: "none",
        }}
      />
    </div>
  );
};

// Pulsing gold ring around the poster's "enter now" button.
const ButtonGlow: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < ALL_IN) return null;
  const p = ((frame - ALL_IN) % 30) / 30;
  return (
    <div
      style={{
        ...box(R.button),
        borderRadius: 60,
        border: `6px solid ${COLORS.goldLight}`,
        transform: `scale(${1 + p * 0.25})`,
        opacity: 1 - p,
      }}
    />
  );
};

// Light sweep across the poster's ninth-year rosette.
const BadgeShine: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < ALL_IN) return null;
  const p = ((frame - ALL_IN) % 60) / 60;
  return (
    <div style={{ ...box(R.badge), overflow: "hidden", borderRadius: "50%" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)",
          transform: `translateX(${(p * 2 - 1) * 260}px)`,
        }}
      />
    </div>
  );
};

const Poster: React.FC = () => {
  const frame = useCurrentFrame();
  const base = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const clean = interpolate(frame, [ALL_IN, ALL_IN + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const push = interpolate(frame, [ALL_IN, POSTER_DURATION], [1, 1.04], {
    extrapolateLeft: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: TOP,
        left: 0,
        width: 1080,
        height: 1080,
        overflow: "hidden",
        transform: `scale(${push})`,
        boxShadow: "0 0 80px rgba(232,182,74,0.35)",
      }}
    >
      {/* Blurred, dimmed poster under the pieces as they arrive. */}
      <Img
        src={staticFile(MEDIA.poster)}
        style={{
          position: "absolute",
          inset: 0,
          width: 1080,
          height: 1080,
          maxWidth: "none",
          filter: "blur(10px) brightness(0.45)",
          transform: "scale(1.04)",
          opacity: base,
        }}
      />
      <Piece r={R.logo} at={40} />
      <Piece r={R.headline} at={60} from="slam" />
      <Piece r={R.prize} at={86} from="up" />
      <Piece r={R.man} at={106} from="left" />
      <Piece r={R.badge} at={128} from="spin" />
      <Piece r={R.gift} at={152} from="up" />
      <Piece r={R.bonus} at={166} from="up" />
      <Piece r={R.button} at={186} />
      <Img
        src={staticFile(MEDIA.poster)}
        style={{
          position: "absolute",
          inset: 0,
          width: 1080,
          height: 1080,
          maxWidth: "none",
          opacity: clean,
        }}
      />
      <BadgeShine />
      <ButtonGlow />
    </div>
  );
};

// Nine year markers lighting up in turn; the ninth gets the crown.
const YearRow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 12,
      }}
    >
      {Array.from({ length: 9 }, (_, i) => {
        const at = 22 + i * 7;
        const lit = spring({ frame: frame - at, fps, config: { damping: 10 } });
        const last = i === 8;
        const size = last ? 118 : 80;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {last ? (
              <div style={{ transform: `scale(${lit})`, marginBottom: -6 }}>
                <Crown size={70} />
              </div>
            ) : null}
            <div
              style={{
                width: size,
                height: size,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: size * 0.55,
                color: lit > 0.5 ? COLORS.navy : "rgba(255,255,255,0.35)",
                backgroundImage: lit > 0.5 ? GOLD_GRADIENT : undefined,
                border: `4px solid ${lit > 0.5 ? COLORS.goldLight : "rgba(255,255,255,0.3)"}`,
                transform: `scale(${0.85 + lit * 0.15})`,
                boxShadow:
                  last && lit > 0.5
                    ? `0 0 ${30 * lit}px ${COLORS.gold}`
                    : "none",
              }}
            >
              {i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Gold pill under the poster pointing to the profile link.
const LinkButton: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const s = usePop(delay, 10);
  const pulse = 1 + Math.max(0, Math.sin((frame - delay) / 5)) * 0.05;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 58,
        color: COLORS.navy,
        backgroundImage: GOLD_GRADIENT,
        padding: "18px 60px",
        borderRadius: 80,
        border: `5px solid ${COLORS.goldLight}`,
        boxShadow: `0 0 ${30 + (pulse - 1) * 500}px ${COLORS.gold}`,
        transform: `scale(${s * pulse})`,
      }}
    >
      לרכישה – הקישור בפרופיל ›
    </div>
  );
};

export const DreamPoster: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = (frame * 0.4) % 360;
  return (
    <AbsoluteFill
      style={{
        background: NAVY_GRADIENT,
        direction: "rtl",
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.16,
          background: `repeating-conic-gradient(from ${sweep}deg at 50% 50%, ${COLORS.gold} 0deg 6deg, transparent 6deg 24deg)`,
        }}
      />
      <Html5Audio
        src={staticFile(MEDIA.music)}
        loop
        volume={(f) =>
          interpolate(
            f,
            [0, 8, POSTER_DURATION - 30, POSTER_DURATION],
            [0, 0.7, 0.7, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )
        }
      />

      {/* Top: the ninth year in a row. */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <GoldText size={112} delay={6}>
          שנה 9 ברציפות!
        </GoldText>
        <YearRow />
      </div>

      <Poster />

      {/* Bottom: furnished, offer and the link. */}
      <div
        style={{
          position: "absolute",
          top: TOP + 1080 + 28,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <WhiteText size={54} delay={226}>
          דירה מרוהטת לגמרי · 1+1 מתנה
        </WhiteText>
        <LinkButton delay={250} />
        <GoldText size={70} delay={330}>
          עם ישראל חי!
        </GoldText>
      </div>
      <Disclaimer />

      <Sfx src={MEDIA.chime} at={6} volume={0.4} />
      <Sfx src={MEDIA.rumble} at={78} volume={0.8} />
      {[40, 60, 86, 106, 128, 152, 166, 186].map((at) => (
        <Sfx key={at} src={MEDIA.pop} at={at} volume={0.5} />
      ))}
      <Sfx src={MEDIA.chime} at={ALL_IN} volume={0.6} />
      <Sfx src={MEDIA.pop} at={250} volume={0.5} />
    </AbsoluteFill>
  );
};
