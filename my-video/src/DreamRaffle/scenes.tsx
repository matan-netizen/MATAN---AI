import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  GoldFlare,
  LightLeak,
  Particles,
  Scrim,
  ShineSweep,
  Shot,
  Vignette,
} from "./effects";
import {
  Chevrons,
  Countdown,
  CtaButton,
  FlagBadge,
  KeyIcon,
  KineticText,
  OnePlusOneBadge,
  PrizeCard,
  Tag,
  WavingFlag,
} from "./graphics";
import { COLORS, CTA_PRESS, END_CARD, FONT, IMG, SCENES, SHOTS, URL } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const FadeIn: React.FC<{ frames?: number; children: React.ReactNode }> = ({ frames = 6, children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(frame, [0, frames], [0, 1], clamp) }}>{children}</AbsoluteFill>;
};

const Positioned: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  top,
  children,
  style,
}) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", ...style }}>
    {children}
  </div>
);

const SmallLogo: React.FC<{ delay?: number; width?: number; style?: React.CSSProperties }> = ({
  delay = 0,
  width = 190,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14 } });
  return (
    <Img
      src={staticFile(IMG.logo)}
      style={{
        position: "absolute",
        width,
        opacity: s,
        transform: `scale(${0.7 + 0.3 * s})`,
        filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.5))",
        ...style,
      }}
    />
  );
};

// 00:00–00:03 — dining table and coffee machine, push-in, light leak, glow.
export const SceneHook: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={90} layout="none">
      <Shot at={SHOTS.dining} rate={0.8} zoom={[1.0, 1.2]} origin="45% 55%" />
    </Sequence>
    <Sequence from={86} layout="none">
      <FadeIn frames={4}>
        <Shot at={SHOTS.coffee} rate={0.7} zoom={[1.08, 1.22]} origin="50% 40%" />
      </FadeIn>
    </Sequence>
    <LightLeak intensity={0.5} seed={1} />
    <ShineSweep start={10} duration={30} opacity={0.35} />
    <Vignette />
    <Scrim from="bottom" height={55} />
    <Scrim from="top" height={18} opacity={0.5} />
    <SmallLogo delay={4} style={{ top: 150, left: 445 }} />
    <Positioned top={1140}>
      <KineticText
        text="זוכים *בדירת* *יוקרה* / מרוהטת *בירושלים!*"
        delay={6}
        size={100}
        icon={<KeyIcon size={100} delay={22} />}
      />
    </Positioned>
  </AbsoluteFill>
);

// 00:03–00:07 — split screen: bedroom/mirror footage over the prize card and 1+1 badge.
export const SceneOffer: React.FC = () => {
  const frame = useCurrentFrame();
  const seam = 1000;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 75%, ${COLORS.brownMid}, ${COLORS.brown} 70%)` }}>
      <Particles count={45} seed="offer" area={{ top: seam, height: 920 }} size={12} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: seam, overflow: "hidden", borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }}>
        {/* Slowed so the shots fill the scene; the nightstand stops before the bed (5.8s). */}
        <Sequence durationInFrames={76} layout="none">
          <Shot at={SHOTS.nightstand} rate={0.55} zoom={[1.1, 1.2]} />
        </Sequence>
        <Sequence from={72} layout="none">
          <FadeIn frames={4}>
            <Shot at={SHOTS.mirror} rate={0.5} zoom={[1.05, 1.18]} />
          </FadeIn>
        </Sequence>
        <LightLeak intensity={0.35} seed={4} />
        <Scrim from="bottom" height={50} opacity={0.8} />
        <Positioned top={690}>
          <KineticText text="הגרלת החלומות *2026* / מבצע *1+1* בלעדי!" delay={8} size={86} />
        </Positioned>
      </div>
      {/* Gold seam line between the panels */}
      <div
        style={{
          position: "absolute",
          top: seam - 3,
          left: interpolate(frame, [0, 20], [540, 60], clamp),
          right: interpolate(frame, [0, 20], [540, 60], clamp),
          height: 6,
          borderRadius: 3,
          background: `linear-gradient(90deg, transparent, ${COLORS.goldLight}, transparent)`,
          boxShadow: `0 0 20px ${COLORS.gold}`,
        }}
      />
      <div style={{ position: "absolute", top: 1070, right: 40 }}>
        <PrizeCard delay={16} />
      </div>
      <div style={{ position: "absolute", top: 880, left: 10 }}>
        <OnePlusOneBadge delay={26} size={360} />
      </div>
      <Particles count={14} seed="offer-top" area={{ top: 820, height: 500 }} size={16} />
    </AbsoluteFill>
  );
};

const PhotoCard: React.FC<{ src: string; label: string; delay: number; tilt: number; from: "left" | "right" }> = ({
  src,
  label,
  delay,
  tilt,
  from,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 13, mass: 0.7 } });
  const dir = from === "left" ? -1 : 1;
  return (
    <div
      style={{
        width: 470,
        padding: 14,
        paddingBottom: 10,
        borderRadius: 26,
        background: `linear-gradient(160deg, ${COLORS.goldLight}, ${COLORS.gold} 50%, ${COLORS.goldDeep})`,
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        opacity: Math.min(1, s * 1.4),
        transform: `translateX(${(1 - s) * dir * 700}px) rotate(${tilt + (1 - s) * dir * 12}deg)`,
      }}
    >
      <Img src={staticFile(src)} style={{ width: "100%", height: 300, objectFit: "cover", borderRadius: 16, display: "block" }} />
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: COLORS.brown, textAlign: "center", direction: "rtl", paddingTop: 6 }}>
        {label}
      </div>
    </div>
  );
};

// 00:07–00:13 — mezuzah and living room, flag badge, warm gold flare, the cause photos.
export const SceneCause: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={95} layout="none">
      <Shot at={SHOTS.mezuzah} rate={0.5} zoom={[1.05, 1.16]} origin="40% 40%" />
    </Sequence>
    <Sequence from={89} layout="none">
      <FadeIn frames={6}>
        <Shot at={SHOTS.sofa} rate={0.7} zoom={[1.15, 1.02]} />
      </FadeIn>
    </Sequence>
    {/* Warm gold grade */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(212,150,60,0.35), rgba(120,70,20,0.25))", mixBlendMode: "soft-light" }} />
    <GoldFlare x={540} y={330} size={1000} />
    <Vignette strength={0.6} />
    <Scrim from="bottom" height={55} opacity={0.85} />
    <Positioned top={140}>
      <FlagBadge delay={10} size={330} label='תומכים בצה"ל' />
    </Positioned>
    <div style={{ position: "absolute", top: 560, left: 30 }}>
      <PhotoCard src={IMG.soldiers} label='חיילי צה"ל' delay={150} tilt={-5} from="left" />
    </div>
    <div style={{ position: "absolute", top: 640, right: 30 }}>
      <PhotoCard src={IMG.emergency} label="ציוד חירום לחזית" delay={166} tilt={4} from="right" />
    </div>
    <Positioned top={1210}>
      <KineticText
        text={'כל כרטיס תומך בחיילי *צה"ל* / ובציוד *חירום* *לחזית*'}
        delay={14}
        stagger={3}
        size={84}
        icon={<WavingFlag width={100} amplitude={4} />}
      />
    </Positioned>
    <Particles count={18} seed="cause" size={9} />
  </AbsoluteFill>
);

const UrlPill: React.FC<{ delay: number; size?: number }> = ({ delay, size = 62 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        direction: "ltr",
        color: COLORS.brown,
        background: COLORS.cream,
        border: `4px solid ${COLORS.gold}`,
        borderRadius: 999,
        padding: `${size * 0.18}px ${size * 0.6}px`,
        boxShadow: `0 0 30px rgba(246,223,160,0.6), 0 12px 30px rgba(0,0,0,0.45)`,
        transform: `scale(${s})`,
      }}
    >
      {URL}
    </div>
  );
};

// 00:13–00:20 — living room and chess table, 3D button, countdown, closing card.
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mascot = spring({ frame: frame - 28, fps, config: { damping: 14 } });
  const end = interpolate(frame, [END_CARD, END_CARD + 10], [0, 1], clamp);
  const endLogo = spring({ frame: frame - END_CARD - 2, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={100} layout="none">
        <Shot at={SHOTS.livingWide} rate={0.75} zoom={[1.0, 1.12]} />
      </Sequence>
      <Sequence from={96} layout="none">
        <FadeIn frames={5}>
          <Shot at={SHOTS.chess} rate={0.9} zoom={[1.05, 1.2]} />
        </FadeIn>
      </Sequence>
      <AbsoluteFill style={{ background: "rgba(25,15,8,0.45)" }} />
      <LightLeak intensity={0.3} seed={7} />
      <Vignette strength={0.7} />
      <div style={{ position: "absolute", top: 170, left: 50 }}>
        <Countdown delay={18} seconds={2} size={200} />
      </div>
      <SmallLogo delay={6} width={180} style={{ top: 160, right: 60 }} />
      <Positioned top={440}>
        <KineticText text="כנסו *עכשיו* / לעמוד ההגרלה:" delay={8} size={100} exitAt={END_CARD - 6} />
      </Positioned>
      <Positioned top={720} style={{ opacity: 1 - end }}>
        <UrlPill delay={22} />
      </Positioned>
      <Positioned top={850} style={{ opacity: 1 - end }}>
        <Chevrons delay={34} />
      </Positioned>
      <Positioned top={960} style={{ opacity: 1 - end }}>
        <CtaButton delay={30} pressAt={CTA_PRESS} label="כניסה להגרלה" />
      </Positioned>
      <Img
        src={staticFile(IMG.mascot)}
        style={{
          position: "absolute",
          left: 10,
          bottom: -60,
          height: 820,
          transform: `translateY(${(1 - mascot) * 900}px)`,
          filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.6))",
          opacity: 1 - end,
        }}
      />
      <Particles count={30} seed="cta" size={10} />

      {/* Closing card on the score's final hit */}
      <AbsoluteFill
        style={{
          opacity: end,
          background: `radial-gradient(circle at 50% 40%, ${COLORS.brownMid}, ${COLORS.brown} 75%)`,
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
        }}
      >
        <Particles count={50} seed="end" size={12} />
        <Img
          src={staticFile(IMG.logo)}
          style={{ width: 460, transform: `scale(${endLogo})`, filter: "drop-shadow(0 0 40px rgba(246,223,160,0.45))" }}
        />
        <Tag delay={END_CARD + 8} size={54}>
          1+1 מתנה על כל הכרטיסים
        </Tag>
        <UrlPill delay={END_CARD + 12} size={66} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SCENE_TIMELINE = [
  { name: "Hook", Component: SceneHook, entrance: "none", ...SCENES.hook },
  { name: "Offer", Component: SceneOffer, entrance: "whip", ...SCENES.offer },
  { name: "Cause", Component: SceneCause, entrance: "zoom", ...SCENES.cause },
  { name: "CTA", Component: SceneCTA, entrance: "flash", ...SCENES.cta },
] as const;
