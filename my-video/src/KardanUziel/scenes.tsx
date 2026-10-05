import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Bubble,
  Disclaimer,
  KenBurns,
  Logo,
  Rise,
  Shade,
  Tag,
} from "./components";
import { BLUE_GRADIENT, COLORS, COPPER_GRADIENT, FONT, IMG } from "./theme";

// 1 — Hero: the tower's crown at dusk, logo and the brand line.
export const SceneHero: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
    <KenBurns src={IMG.towerTop} position="22% 50%" from={1.15} to={1.0} />
    <Shade from={0.4} to={0.96} />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
      <Bubble delay={40} size={66}>
        בשבילכם זו דירה.
        <br />
        בשבילנו זה בית
      </Bubble>
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 220,
        gap: 24,
      }}
    >
      <Logo size={210} delay={6} />
      <Rise delay={14} size={170} weight={900}>
        קרדן
      </Rise>
      <Rise delay={22} size={86} weight={700} style={{ marginTop: -20 }}>
        בעוזיאל רמת גן
      </Rise>
    </AbsoluteFill>
    <Disclaimer />
  </AbsoluteFill>
);

// Map pin dropped on the project in the aerial photo.
const Pin: React.FC<{ x: number; y: number; delay: number }> = ({
  x,
  y,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: frame - delay, fps, config: { damping: 9 } });
  const ring = ((frame - delay) % 36) / 36;
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {frame > delay ? (
        <div
          style={{
            position: "absolute",
            left: -60,
            top: -60,
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: `6px solid ${COLORS.copper}`,
            opacity: 1 - ring,
            transform: `scale(${0.4 + ring * 1.4})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: -38,
          top: -110,
          width: 76,
          height: 76,
          borderRadius: "50% 50% 50% 0",
          transform: `translateY(${(1 - drop) * -300}px) rotate(-45deg)`,
          background: COLORS.copper,
          border: "6px solid white",
          boxShadow: "0 10px 24px rgba(0,0,0,0.4)",
          opacity: drop > 0.01 ? 1 : 0,
        }}
      />
    </div>
  );
};

const CHIPS = [
  { icon: "🚊", text: "הרכבת הקלה" },
  { icon: "🛣️", text: "נתיבי איילון" },
  { icon: "🌳", text: "פארקים וגינות" },
  { icon: "☕", text: "בתי קפה ומסעדות" },
];

// 2 — Location: aerial view with a pin, and what's around the corner.
export const SceneLocation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <KenBurns src={IMG.aerial} position="35% 50%" from={1.0} to={1.1}>
        <Pin x={540} y={640} delay={14} />
      </KenBurns>
      <Shade from={0.42} to={0.97} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
        <Bubble background={COPPER_GRADIENT} delay={4} size={64}>
          לחיות את העיר,
          <br />
          בקצב שלך.
        </Bubble>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 170,
          gap: 30,
        }}
      >
        <Rise delay={30} size={70} weight={900}>
          עוזיאל 13–15
        </Rise>
        <Rise delay={36} size={52} weight={400} style={{ marginTop: -16 }}>
          בלב האיכותי של רמת גן
        </Rise>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            marginTop: 10,
          }}
        >
          {CHIPS.map(({ icon, text }, i) => {
            const s = spring({
              frame: frame - 50 - i * 7,
              fps,
              config: { damping: 14 },
            });
            return (
              <div
                key={text}
                style={{
                  fontFamily: FONT,
                  fontSize: 42,
                  fontWeight: 700,
                  color: COLORS.white,
                  background: "rgba(255,255,255,0.12)",
                  border: "2px solid rgba(255,255,255,0.35)",
                  borderRadius: 999,
                  padding: "16px 30px",
                  textAlign: "center",
                  opacity: s,
                  transform: `scale(${0.7 + 0.3 * s})`,
                  whiteSpace: "nowrap",
                }}
              >
                {icon} {text}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Disclaimer />
    </AbsoluteFill>
  );
};

const TYPES = ["2–5 חד׳", "מיני פנטהאוז", "פנטהאוזים"];

// 3 — Tower or boutique: the night render and the apartment mix.
export const SceneChoice: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <KenBurns src={IMG.night} position="68% 50%" from={1.08} to={1.0} />
      <Shade from={0.6} to={0.75} top />
      <Shade from={0.5} to={0.97} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 160, gap: 14 }}>
        <Rise delay={4} size={84} weight={900}>
          מגדל יוקרה או בניין בוטיק.
        </Rise>
        <Rise delay={16} size={64} weight={400} color="#BFE3F2">
          לכם נותר רק לבחור…
        </Rise>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 190,
          gap: 30,
        }}
      >
        <div style={{ display: "flex", gap: 18 }}>
          {TYPES.map((t, i) => {
            const s = spring({
              frame: frame - 40 - i * 8,
              fps,
              config: { damping: 13 },
            });
            return (
              <div
                key={t}
                style={{
                  fontFamily: FONT,
                  fontSize: 44,
                  fontWeight: 900,
                  color: COLORS.white,
                  backgroundImage: i === 1 ? COPPER_GRADIENT : BLUE_GRADIENT,
                  borderRadius: 18,
                  padding: "26px 28px",
                  opacity: s,
                  transform: `translateY(${(1 - s) * 60}px)`,
                  boxShadow: "0 14px 30px rgba(0,0,0,0.4)",
                  whiteSpace: "nowrap",
                }}
              >
                {t}
              </div>
            );
          })}
        </div>
        <Rise delay={70} size={50} weight={400}>
          מרפסות גדולות עם נוף לקו הרקיע של גוש דן
        </Rise>
      </AbsoluteFill>
      <Disclaimer />
    </AbsoluteFill>
  );
};

// One half of the amenities split screen, sliding in from the side.
const Panel: React.FC<{
  src: string;
  label: string;
  from: "left" | "right";
  delay: number;
  top: number;
  color: string;
}> = ({ src, label, from, delay, top, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  const dir = from === "left" ? -1 : 1;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: 1080,
        height: 700,
        overflow: "hidden",
        transform: `translateX(${(1 - s) * 1100 * dir}px)`,
      }}
    >
      <KenBurns src={src} from={1.0} to={1.12} />
      <div style={{ position: "absolute", top: 36, right: 40 }}>
        <Tag background={color} delay={delay + 14} size={52}>
          {label}
        </Tag>
      </div>
    </div>
  );
};

// 4 — Amenities: designer lobby, gym, kindergartens downstairs.
export const SceneAmenities: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
      <Rise delay={0} size={70} weight={900} color={COLORS.navy}>
        הכל מתחת לבית
      </Rise>
    </AbsoluteFill>
    <Panel
      src={IMG.lobby}
      label="לובי מעוצב"
      from="right"
      delay={6}
      top={250}
      color={COLORS.copper}
    />
    <Panel
      src={IMG.gym}
      label="חדר כושר מתקדם"
      from="left"
      delay={30}
      top={970}
      color={COLORS.blue}
    />
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 90,
      }}
    >
      <Rise delay={70} size={56} weight={700} color={COLORS.slate}>
        וגני ילדים צמודים לבניין
      </Rise>
    </AbsoluteFill>
    <div
      style={{
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT,
        fontSize: 24,
        color: "rgba(47,58,66,0.6)",
      }}
    >
      ההדמיה להמחשה בלבד
    </div>
  </AbsoluteFill>
);

const SHOTS = [
  { src: IMG.apt2, label: "דירת 2 חד׳", pos: "40% 50%", color: COLORS.blue },
  { src: IMG.apt3, label: "דירת 3 חד׳", pos: "45% 50%", color: COLORS.copper },
  { src: IMG.penthouse, label: "פנטהאוז", pos: "38% 50%", color: COLORS.rust },
  {
    src: IMG.terrace,
    label: "מרפסת הפנטהאוז",
    pos: "45% 50%",
    color: COLORS.sage,
  },
];
const SHOT_LEN = 38;

// 5 — Apartments: quick cuts through the interiors.
export const SceneApartments: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = (i: number) =>
    interpolate(frame - i * SHOT_LEN, [0, 6], [0.5, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      {SHOTS.map((shot, i) => (
        <Sequence
          key={shot.label}
          from={i * SHOT_LEN}
          durationInFrames={
            i === SHOTS.length - 1 ? 150 - i * SHOT_LEN : SHOT_LEN
          }
          layout="none"
        >
          <KenBurns src={shot.src} position={shot.pos} from={1.12} to={1.0} />
          <Shade from={0.55} to={0.9} />
          <div style={{ position: "absolute", bottom: 300, right: 60 }}>
            <Tag background={shot.color} delay={3} size={64}>
              {shot.label}
            </Tag>
          </div>
          {i > 0 ? (
            <AbsoluteFill
              style={{ backgroundColor: "white", opacity: flash(i) }}
            />
          ) : null}
        </Sequence>
      ))}
      <Shade from={0.6} to={0.7} top />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <Rise delay={4} size={72} weight={900}>
          בית נולד הרבה לפני המפתח
        </Rise>
      </AbsoluteFill>
      <Disclaimer />
    </AbsoluteFill>
  );
};

// 6 — End card: logo, project name, phone and site.
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btn = spring({ frame: frame - 40, fps, config: { damping: 10 } });
  const pulse = 1 + 0.04 * Math.sin(frame * 0.25);
  const ring = (frame % 40) / 40;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <KenBurns
        src={IMG.night}
        position="68% 50%"
        from={1.05}
        to={1.15}
        filter="brightness(0.45) blur(3px)"
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 26,
          paddingBottom: 80,
        }}
      >
        <Bubble background={COPPER_GRADIENT} delay={0} size={58}>
          אתם חשובים לנו
        </Bubble>
        <div style={{ height: 30 }} />
        <Logo size={240} delay={8} />
        <Rise delay={14} size={150} weight={900}>
          קרדן
        </Rise>
        <Rise delay={20} size={78} weight={700} style={{ marginTop: -24 }}>
          בעוזיאל רמת גן
        </Rise>
        <Rise delay={28} size={40} weight={400} color="#BFE3F2">
          קרדן נדל״ן · בונים בתים מאז 1988
        </Rise>
        <div style={{ height: 40 }} />
        <div
          style={{
            position: "relative",
            transform: `scale(${btn * pulse})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: 999,
              border: `5px solid ${COLORS.copper}`,
              opacity: (1 - ring) * btn,
              transform: `scale(${1 + ring * 0.25})`,
            }}
          />
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 64,
              color: COLORS.white,
              backgroundImage: COPPER_GRADIENT,
              borderRadius: 999,
              padding: "30px 70px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
              whiteSpace: "nowrap",
            }}
          >
            📞{" "}
            <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>
              *9199
            </span>{" "}
            · תאמו פגישה
          </div>
        </div>
        <Rise delay={56} size={44} weight={400} style={{ direction: "ltr" }}>
          kardan-nadlan.co.il
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
