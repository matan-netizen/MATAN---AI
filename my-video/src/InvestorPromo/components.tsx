import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FPS, GOLD_GRADIENT, SANS, SERIF, Shot } from "./theme";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// One shot of source footage with a slow Ken Burns push. Children are
// rendered inside the same transform so overlays stay locked to the image.
export const Footage: React.FC<{
  shot: Shot;
  blur?: number;
  children?: React.ReactNode;
}> = ({ shot, blur = 0, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, shot.duration], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const scale = interpolate(p, [0, 1], shot.zoom);
  const [dx, dy] = shot.drift ?? [0, 0];
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: COLORS.navy }}>
      <AbsoluteFill
        style={{
          transform: `translate(${dx * p}px, ${dy * p}px) scale(${scale})`,
          filter: blur ? `blur(${blur}px)` : undefined,
        }}
      >
        <OffthreadVideo
          src={staticFile(`investor/${shot.file}.mp4`)}
          trimBefore={Math.round(shot.src * FPS)}
          playbackRate={shot.rate}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Warm cinematic grade: soft vignette and a subtle gold tint.
export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 55%, rgba(5,10,20,0.55) 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(201,162,75,0.06) 0%, transparent 40%, rgba(11,21,38,0.55) 100%)",
      }}
    />
  </AbsoluteFill>
);

// Soft gold light sweep on the cut between story segments.
export const LightFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 4, 14], [0, 0.55, 0], clamp);
  const x = interpolate(frame, [0, 14], [-30, 130], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(100deg, transparent ${x - 30}%, rgba(255,236,190,0.9) ${x}%, transparent ${x + 30}%)`,
        mixBlendMode: "screen",
      }}
    />
  );
};

// Lower-third headline: gold bar wipes in, then the text slides in (RTL).
export const Headline: React.FC<{
  emoji: string;
  text: string;
  duration: number;
}> = ({ emoji, text, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const exit = interpolate(frame, [duration - 10, duration], [1, 0], clamp);
  const bar = interpolate(frame, [0, 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "flex-start", // right side in RTL
        padding: "0 110px 210px",
        opacity: exit,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26,
          padding: "22px 40px 26px",
          borderRadius: 18,
          background:
            "linear-gradient(270deg, rgba(11,21,38,0.88) 0%, rgba(11,21,38,0.72) 100%)",
          borderRight: `10px solid ${COLORS.gold}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          transform: `translateX(${(1 - enter) * 80}px) scaleX(${0.6 + 0.4 * bar})`,
          transformOrigin: "right center",
          opacity: enter,
        }}
      >
        <span style={{ fontSize: 66, lineHeight: 1 }}>{emoji}</span>
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 64,
            color: "white",
            letterSpacing: -0.5,
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// Narration subtitle at the bottom of the frame.
export const Subtitle: React.FC<{ text: string; duration: number }> = ({
  text,
  duration,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 6, duration - 6, duration],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 70,
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 42,
          lineHeight: 1.35,
          color: COLORS.cream,
          padding: "10px 28px",
          borderRadius: 12,
          background: "rgba(0,0,0,0.45)",
          textShadow: "0 2px 6px rgba(0,0,0,0.6)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// Hand-drawn graphite check mark, positioned on the notebook page.
export const CheckMark: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 14], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const glow = interpolate(frame, [14, 22, 40], [0, 1, 0.5], clamp);
  const length = 300;
  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <g>
        <path
          d="M 500 575 L 575 670 L 690 528"
          fill="none"
          stroke={`rgba(201,162,75,${0.55 * glow})`}
          strokeWidth={34}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "blur(10px)" }}
        />
        <path
          d="M 500 575 L 575 670 L 690 528"
          fill="none"
          stroke="#2b2b2e"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - draw)}
          opacity={0.88}
        />
      </g>
    </svg>
  );
};

// Phone-style notification banner dropping in from the top.
export const PhoneNotification: React.FC<{ duration: number }> = ({
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 140 } });
  const exit = interpolate(frame, [duration - 10, duration], [0, 1], clamp);
  const y = interpolate(enter, [0, 1], [-220, 0]) - exit * 220;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 50 }}>
      <div
        style={{
          transform: `translateY(${y}px)`,
          width: 900,
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: "26px 34px",
          borderRadius: 34,
          background: "rgba(250,250,252,0.92)",
          boxShadow: "0 25px 70px rgba(0,0,0,0.4)",
          fontFamily: SANS,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            flexShrink: 0,
            borderRadius: 22,
            background: `linear-gradient(135deg, ${COLORS.navy}, #23406b)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 54,
          }}
        >
          🏡
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 28,
              color: "#6b6f78",
              fontWeight: 700,
            }}
          >
            <span>השקעות נדל"ן</span>
            <span style={{ fontWeight: 400 }}>עכשיו</span>
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: "#111",
              marginTop: 4,
            }}
          >
            ✅ העסקה אושרה בהצלחה!
          </div>
          <div style={{ fontSize: 30, color: "#333", marginTop: 2 }}>
            צמוד לבני ברק ולגבעתיים | ביקוש שיא
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Offer card over the blurred blueprint: headline and three selling points.
export const SpecCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    ["💰", "מחירי פרי-סייל חסרי תקדים ל-5 הדירות הראשונות"],
    ["😎", "תנאי תשלום נוחים"],
    ["🏢", "מפרט פרימיום"],
  ];
  const title = spring({ frame, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(11,21,38,0.55)",
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 900,
          fontSize: 92,
          backgroundImage: GOLD_GRADIENT,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          opacity: title,
          transform: `translateY(${(1 - title) * 30}px)`,
          marginBottom: 40,
        }}
      >
        מיקום מנצח וביקוש שיא
        {/* Emoji outside the gradient clip so they keep their colours. */}
        <span style={{ color: "white", fontSize: 76 }}> ‼️🤩</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 22,
        }}
      >
        {items.map(([emoji, label], i) => {
          const s = spring({
            frame: frame - 8 - i * 5,
            fps,
            config: { damping: 15, stiffness: 130 },
          });
          return (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                whiteSpace: "nowrap",
                padding: "22px 30px",
                borderRadius: 18,
                background: "rgba(251,247,238,0.1)",
                border: `2px solid rgba(201,162,75,0.7)`,
                opacity: s,
                transform: `scale(${0.85 + 0.15 * s})`,
              }}
            >
              <span style={{ fontSize: 50 }}>{emoji}</span>
              <span
                style={{
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 48,
                  color: "white",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// End card: location promise, value proposition and a pulsing CTA button.
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 16 } });
  const b = spring({ frame: frame - 8, fps, config: { damping: 16 } });
  const c = spring({
    frame: frame - 18,
    fps,
    config: { damping: 11, stiffness: 150 },
  });
  const pulse = 1 + 0.035 * Math.sin(Math.max(0, frame - 30) / 5);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse at center, rgba(11,21,38,0.55) 0%, rgba(11,21,38,0.88) 75%)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 44,
          color: COLORS.lightGold,
          letterSpacing: 2,
          opacity: a,
          transform: `translateY(${(1 - a) * 20}px)`,
        }}
      >
        📍 צמוד לבני ברק ולגבעתיים
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 900,
          fontSize: 118,
          lineHeight: 1.1,
          marginTop: 16,
          backgroundImage: GOLD_GRADIENT,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          opacity: a,
          transform: `scale(${0.9 + 0.1 * a})`,
        }}
      >
        מיקום מנצח וביקוש שיא
        <span style={{ color: "white", fontSize: 96 }}> ‼️🤩</span>
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 42,
          lineHeight: 1.4,
          maxWidth: 1400,
          color: "white",
          marginTop: 18,
          opacity: b,
          transform: `translateY(${(1 - b) * 20}px)`,
        }}
      >
        לוקיישן מבוקש במיוחד שיוצר פוטנציאל אדיר לעליית ערך ולשכירות גבוהה
        וזמינה בכל ימות השנה!
      </div>
      <div
        style={{
          marginTop: 56,
          padding: "26px 70px 30px",
          borderRadius: 999,
          background: GOLD_GRADIENT,
          color: COLORS.navy,
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 54,
          boxShadow: `0 0 ${30 + 20 * (pulse - 1) * 28}px rgba(241,217,160,0.55)`,
          opacity: c,
          transform: `scale(${(0.6 + 0.4 * c) * pulse})`,
        }}
      >
        👇🏻 לחצו כאן להשארת פרטים 👇🏻
      </div>
    </AbsoluteFill>
  );
};
