import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  FloatingLetters,
  Glow,
  GoldDust,
  LightRays,
  Ornament,
  RevealText,
} from "./effects";
import { ZoharImageCard } from "./ZoharImageCard";
import { COLORS, GOLD_TEXT, IMAGES, SERIF, cue } from "./theme";

const CARD_W = 780;
const CARD_H = 780;

// Scene 4: the Holy Zohar revealed. A man holding the golden
// embossed Zohar in a shimmering gold frame, light radiating from the book,
// Hebrew letters floating over a glowing parchment.
export const Scene4Zohar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = spring({
    frame: frame - 4,
    fps,
    config: { damping: 16, stiffness: 70 },
  });
  const pulse = 0.75 + 0.25 * Math.sin(frame * 0.12);
  // Earlier lines dim slightly as new ones arrive, keeping focus moving down.
  const dim = (from: number) =>
    interpolate(frame, [from, from + 20], [1, 0.6], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${COLORS.purple} 0%, ${COLORS.night} 70%)`,
      }}
    >
      <LightRays x="50%" y="30%" opacity={0.9} spread={0.9} />
      <Glow x="50%" y="30%" size={1700} opacity={0.35 * pulse} />

      {/* Glowing parchment page tilted in 3D behind the card */}
      <AbsoluteFill style={{ perspective: 1400, alignItems: "center" }}>
        <div
          style={{
            marginTop: 150,
            width: 980,
            height: 1100,
            borderRadius: 30,
            background: `radial-gradient(ellipse, ${COLORS.parchment} 0%, #E9D7A6 60%, rgba(233,215,166,0) 100%)`,
            opacity: 0.16 * card,
            transform: `rotateX(18deg) rotateZ(${-3 + Math.sin(frame * 0.02) * 1.5}deg)`,
            boxShadow: `0 0 120px ${COLORS.brightGold}`,
          }}
        />
      </AbsoluteFill>
      <FloatingLetters count={26} opacity={0.9} />

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 900,
            fontSize: 76,
            backgroundImage: GOLD_TEXT,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 0 22px rgba(255,215,0,0.55))",
            opacity: card,
            marginBottom: 14,
          }}
        >
          ספר הזוהר הקדוש
        </div>
        <Ornament delay={10} width={560} />

        {/* Shimmering gold frame: a rotating conic gradient behind the card */}
        <div
          style={{
            position: "relative",
            marginTop: 34,
            width: CARD_W,
            height: CARD_H,
            borderRadius: 36,
            padding: 8,
            overflow: "hidden",
            transform: `scale(${0.7 + 0.3 * card}) translateY(${(1 - card) * 80}px)`,
            opacity: card,
            boxShadow: `0 0 ${60 + 40 * pulse}px rgba(255,215,0,0.55), 0 40px 90px rgba(0,0,0,0.6)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -400,
              background: `conic-gradient(from ${frame * 3}deg, ${COLORS.gold}, #FFF3C4, ${COLORS.brightGold}, #8C6A12, ${COLORS.gold}, #FFF3C4, ${COLORS.gold})`,
            }}
          />
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: 30,
              overflow: "hidden",
            }}
          >
            <ZoharImageCard
              src={IMAGES.zoharMan}
              fallback="zohar"
              zoomFrom={1.05}
              zoomTo={1.18}
              driftX={20}
              objectPosition="50% 50%"
              filter="saturate(1.1) contrast(1.05)"
              vignette={0.45}
            />
            {/* Aura radiating from the Zohar onto the man and scene */}
            <Glow
              x="46%"
              y="40%"
              size={760}
              color={COLORS.brightGold}
              opacity={0.5 * pulse}
            />
            <LightRays x="46%" y="40%" opacity={0.7} spread={0.7} />
          </div>
        </div>
      </AbsoluteFill>

      <GoldDust count={50} intensity={0.9} seed="s4" />

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 1150,
          paddingLeft: 40,
          paddingRight: 40,
          gap: 18,
        }}
      >
        <RevealText
          text="להיות שותף בדף אחד מתוך הזוהר הקדוש."
          {...cue("partner", "zohar", 7)}
          size={56}
          weight={700}
          highlight={["הזוהר", "הקדוש."]}
          style={{ opacity: dim(cue("name", "zohar", 7).delay) }}
        />
        <RevealText
          text="השם שלך נרשם ב“ספר החבריא של הרשב״י”,"
          {...cue("name", "zohar", 7)}
          size={56}
          weight={700}
          highlight={["החבריא", "הרשב״י”,"]}
          style={{ opacity: dim(cue("home", "zohar", 4).delay) }}
        />
        <RevealText
          text="והדף נשלח אליך הביתה."
          {...cue("home", "zohar", 4)}
          size={56}
          weight={700}
          highlight={["הביתה."]}
          style={{ opacity: dim(cue("amulet", "zohar", 7).delay) }}
        />
        <RevealText
          text="זה קמיע עוצמתי אישי שפותח את המחסומים."
          {...cue("amulet", "zohar", 7)}
          size={60}
          weight={900}
          highlight={["קמיע", "עוצמתי", "אישי"]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
