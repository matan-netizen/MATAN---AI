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
  Footage,
  GoldDust,
  GoldRule,
  GoldText,
  Label,
  LogoBadge,
  Mascot,
  NavyBackdrop,
  Photo,
  SceneFade,
  Shade,
  Ticket,
  useEnter,
} from "../DreamRaffle/components";
import { COLORS, GOLD_GRADIENT, SANS, SERIF } from "../DreamRaffle/theme";
import { IMG } from "./theme";

const Bottom: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{ justifyContent: "flex-end", padding: "0 120px 190px" }}
  >
    {children}
  </AbsoluteFill>
);

// Gold headline with a light sweep passing across it after it lands.
const SheenText: React.FC<React.ComponentProps<typeof GoldText>> = (props) => {
  const frame = useCurrentFrame();
  const start = (props.delay ?? 0) + 14;
  const pos = interpolate(frame, [start, start + 26], [130, -30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <GoldText
      {...props}
      style={{
        ...props.style,
        backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,250,235,0.95) 50%, rgba(255,255,255,0) 60%), ${GOLD_GRADIENT}`,
        backgroundSize: "250% 100%, 100% 100%",
        backgroundPosition: `${pos}% 0, 0 0`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

// 2.5D move: the people (cut out with BiRefNet) push in faster than the
// softened photo behind them.
const Parallax: React.FC<{ src: string; layer: string; focus: string }> = ({
  src,
  layer,
  focus,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;
  const cover: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: focus,
  };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`${IMG}/${src}`)}
        style={{
          ...cover,
          transform: `scale(${interpolate(p, [0, 1], [1.08, 1.12])})`,
          filter: "blur(5px) brightness(0.8)",
        }}
      />
      <Img
        src={staticFile(`dreamraffle-us/layers/${layer}`)}
        style={{
          ...cover,
          transform: `scale(${interpolate(p, [0, 1], [1.0, 1.1])}) translateY(${interpolate(p, [0, 1], [10, -6])}px)`,
          filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.45))",
        }}
      />
    </AbsoluteFill>
  );
};

const Glow: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 55% 50%, ${COLORS.goldLight} 0%, rgba(243,222,156,0) 70%)`,
        opacity: glow,
      }}
    />
  );
};

const Flash: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 6, at, at + 12], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: "#FFF6DD", opacity: o }} />;
};

// 0:00 Hook — the key turns and the door opens onto a home in Jerusalem.
export const SceneHook: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={104}>
      <Footage shot="s7-lock" zoom={[1.0, 1.18]} />
      <Glow from={55} to={100} />
    </Sequence>
    <Sequence from={98}>
      <Photo dir={IMG} src="apt-2.jpg" aspect={1.5} zoom={[1.12, 1.04]} />
      <Shade strength={0.85} />
      <Bottom>
        <SheenText size={120} delay={8}>
          Your home in Jerusalem?
        </SheenText>
      </Bottom>
    </Sequence>
    <Flash at={100} />
  </AbsoluteFill>
);

// 0:05 The grand prize.
export const ScenePrize: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={132}>
      <Photo dir={IMG} src="apt-1.jpg" aspect={1.5} />
    </Sequence>
    <Sequence from={122}>
      <SceneFade fadeIn frames={10}>
        <Photo dir={IMG} src="apt-3.jpg" aspect={0.67} zoom={[1.0, 1.05]} />
      </SceneFade>
    </Sequence>
    <Shade strength={0.85} />
    <Bottom>
      <Label size={30} delay={6} color={COLORS.goldLight}>
        Brand-new · Grand prize
      </Label>
      <SheenText size={128} delay={14} style={{ marginTop: 6 }}>
        $1.3 Million
      </SheenText>
      <Label size={42} delay={24} style={{ marginTop: 6 }}>
        Jerusalem Apartment
      </Label>
      <Label
        size={28}
        delay={120}
        color={COLORS.stone}
        style={{ marginTop: 22, letterSpacing: 3 }}
      >
        2 BR · 2 Full Baths · Big Balcony · Parking
      </Label>
    </Bottom>
  </AbsoluteFill>
);

// 0:14 Every order doubled — one ticket splits into two, the second FREE.
export const SceneOffer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame, fps, config: { damping: 14 } });
  const split = spring({ frame: frame - 62, fps, config: { damping: 15 } });
  const stamp = spring({
    frame: frame - 92,
    fps,
    config: { damping: 9, mass: 0.7 },
  });
  const flash = interpolate(frame, [62, 68, 82], [0, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dx = interpolate(split, [0, 1], [0, 320]);
  const top = 440;
  return (
    <AbsoluteFill>
      <NavyBackdrop />
      <GoldDust />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
        <Label size={34} delay={6} color={COLORS.goldLight}>
          Every order doubled
        </Label>
        <SheenText size={128} delay={58} style={{ marginTop: 18 }}>
          1+1 FREE
        </SheenText>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: appear,
          transform: `scale(${interpolate(appear, [0, 1], [0.7, 1])})`,
        }}
      >
        <Ticket
          style={{
            left: 960 - 280 - dx,
            top,
            transform: `rotate(${-4 * split}deg)`,
          }}
        />
        <Ticket
          style={{
            left: 960 - 280 + dx,
            top,
            transform: `rotate(${4 * split}deg)`,
            opacity: split,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 960 + dx + 120,
            top: top - 70,
            width: 210,
            height: 210,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #B3261E 0%, #8A1C16 70%, #6B1510 100%)",
            border: `6px solid ${COLORS.goldLight}`,
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: SERIF,
            fontWeight: 900,
            fontSize: 64,
            color: COLORS.goldLight,
            opacity: stamp > 0.01 ? 1 : 0,
            transform: `scale(${interpolate(stamp, [0, 1], [2.6, 1])}) rotate(${interpolate(stamp, [0, 1], [-30, -12])}deg)`,
          }}
        >
          FREE
        </div>
      </AbsoluteFill>
      <Mascot pose="thumbs-up" height={620} delay={30} style={{ left: 40 }} />
      <AbsoluteFill
        style={{ backgroundColor: COLORS.goldLight, opacity: flash }}
      />
    </AbsoluteFill>
  );
};

// 0:18 Early Bird — $15,000 cash draw for orders by Nov. 11.
export const SceneEarlyBird: React.FC = () => {
  const frame = useCurrentFrame();
  const value =
    Math.round(
      interpolate(frame, [16, 80], [0, 15000], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }) / 50,
    ) * 50;
  return (
    <AbsoluteFill>
      <NavyBackdrop />
      <GoldDust count={45} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Label size={40} delay={4} color={COLORS.goldLight}>
          Early Bird Bonus
        </Label>
        <GoldRule delay={10} width={260} />
        <SheenText
          size={230}
          delay={12}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          ${value.toLocaleString("en-US")}
        </SheenText>
        <Label size={52} delay={50} style={{ marginTop: 6 }}>
          Cash Draw
        </Label>
        <div
          style={{
            marginTop: 40,
            padding: "14px 40px",
            borderRadius: 999,
            border: `2px solid ${COLORS.gold}`,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: 4,
            color: COLORS.white,
            ...useEnter(20),
          }}
        >
          ORDER BY NOV. 11
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 0:24 Super Ticket — new this year, added at checkout.
export const SceneSuperTicket: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const badge = spring({ frame: frame - 8, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill>
      <Photo dir={IMG} src="apt-4.jpg" aspect={0.67} zoom={[1.0, 1.06]} />
      <Shade strength={0.9} />
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 300,
          padding: "10px 26px",
          borderRadius: 10,
          background: "#B3261E",
          color: COLORS.white,
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 34,
          letterSpacing: 6,
          transform: `scale(${badge}) rotate(-4deg)`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        NEW
      </div>
      <Bottom>
        <GoldText size={130} delay={14}>
          Super Ticket
        </GoldText>
        <Label size={36} delay={40} style={{ marginTop: 14 }}>
          $25,000 furniture &amp; appliance package
        </Label>
        <Label
          size={26}
          delay={70}
          color={COLORS.stone}
          style={{ marginTop: 16, letterSpacing: 3 }}
        >
          Add it at checkout
        </Label>
      </Bottom>
    </AbsoluteFill>
  );
};

const CauseCard: React.FC<{ title: string }> = ({ title }) => (
  <Bottom>
    <Label size={26} delay={2} color={COLORS.goldLight}>
      Every ticket supports the Am Yisrael Chai Foundation
    </Label>
    <GoldRule delay={6} width={160} />
    <GoldText size={84} delay={8}>
      {title}
    </GoldText>
  </Bottom>
);

// 0:30 The heart of it — the foundation's work, then the tagline.
export const SceneMission: React.FC = () => {
  const shots: {
    from: number;
    dur: number;
    src: string;
    aspect: number;
    title: string;
    layer?: string;
    focus?: string;
  }[] = [
    {
      from: 0,
      dur: 125,
      src: "torah-idf-hd.png",
      aspect: 0.92,
      title: "Torah Scrolls for IDF Bases",
    },
    {
      from: 125,
      dur: 75,
      src: "ambulance.jpg",
      aspect: 1.33,
      layer: "ambulance.png",
      focus: "50% 0%",
      title: "Armored Ambulance for Sderot",
    },
    {
      from: 200,
      dur: 72,
      src: "lone-soldiers.jpg",
      aspect: 1.5,
      layer: "lone-soldiers.png",
      focus: "50% 30%",
      title: "Help for Lone Soldiers",
    },
  ];
  return (
    <AbsoluteFill>
      {shots.map((s, i) => (
        <Sequence key={s.src} from={s.from} durationInFrames={s.dur + 8}>
          <SceneFade fadeIn={i > 0} frames={8}>
            {s.layer ? (
              <Parallax
                src={s.src}
                layer={s.layer}
                focus={s.focus ?? "50% 50%"}
              />
            ) : (
              <Photo dir={IMG} src={s.src} aspect={s.aspect} />
            )}
            <Shade strength={0.9} />
            <CauseCard title={s.title} />
          </SceneFade>
        </Sequence>
      ))}
      <Sequence from={272}>
        <SceneFade fadeIn frames={10}>
          <NavyBackdrop />
          <GoldDust />
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <SheenText size={150} delay={4}>
              One ticket.
            </SheenText>
            <GoldRule delay={24} width={320} />
            <Label size={50} delay={34} style={{ letterSpacing: 6 }}>
              A hundred ways to build
            </Label>
            <Label
              size={50}
              delay={40}
              style={{ marginTop: 12, letterSpacing: 6 }}
            >
              the Land of Israel
            </Label>
          </AbsoluteFill>
        </SceneFade>
      </Sequence>
    </AbsoluteFill>
  );
};

// Past winners as listed in the site's FAQ.
const WINNERS = [
  ["2018", "Hawaii, USA"],
  ["2019", "Toronto, Canada"],
  ["2020", "New Jersey, USA"],
  ["2021", "California, USA"],
  ["2022", "Shavei Darom, Israel"],
  ["2023", "Beitar Illit, Israel"],
  ["2024", "New York, USA"],
  ["2025", "Aryeh Luria · Jerusalem"],
];

const WinnerChip: React.FC<{ year: string; where: string; i: number }> = ({
  year,
  where,
  i,
}) => {
  const last = i === WINNERS.length - 1;
  const enter = useEnter(14 + i * 7, 14);
  return (
    <div
      style={{
        width: last ? 1240 : 600,
        padding: "16px 28px",
        borderRadius: 14,
        display: "flex",
        alignItems: "baseline",
        gap: 24,
        background: last ? GOLD_GRADIENT : "rgba(255,255,255,0.07)",
        border: last ? "none" : "1px solid rgba(243,222,156,0.3)",
        ...enter,
      }}
    >
      <span
        style={{
          fontFamily: SERIF,
          fontWeight: 900,
          fontSize: last ? 46 : 38,
          color: last ? COLORS.navy : COLORS.goldLight,
        }}
      >
        {year}
      </span>
      <span
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: last ? 34 : 28,
          letterSpacing: 2,
          color: last ? COLORS.navy : COLORS.white,
        }}
      >
        {where}
      </span>
    </div>
  );
};

// 0:44 Proof — a winner every year since 2018.
export const SceneProof: React.FC = () => (
  <AbsoluteFill>
    <NavyBackdrop />
    <GoldDust count={40} />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
      <GoldText size={88} delay={2}>
        A winner every year since 2018
      </GoldText>
      <div
        style={{
          marginTop: 50,
          width: 1240,
          display: "flex",
          flexWrap: "wrap",
          gap: 22,
          justifyContent: "space-between",
        }}
      >
        {WINNERS.map(([year, where], i) => (
          <WinnerChip key={year} year={year} where={where} i={i} />
        ))}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

const useEnterStyle = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  return {
    opacity: s,
    transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
  };
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(Math.max(0, frame - 90) / 6) * 0.03;
  const button = useEnterStyle(90);
  return (
    <AbsoluteFill>
      <Photo dir={IMG} src="apt-1.jpg" aspect={1.5} zoom={[1.1, 1.16]} />
      <AbsoluteFill
        style={{
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(6,18,42,0.84)",
        }}
      />
      <GoldDust count={45} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 50,
          textAlign: "center",
        }}
      >
        <LogoBadge size={190} style={useEnterStyle(0)} />
        <Label
          size={26}
          delay={10}
          color={COLORS.goldLight}
          style={{ marginTop: 22 }}
        >
          Grand prize drawing · March 11, 2027 · Live from Jerusalem
        </Label>
        <div
          style={{
            marginTop: 34,
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 104,
            color: COLORS.white,
            textShadow: "0 6px 24px rgba(0,0,0,0.6)",
            ...useEnterStyle(40),
          }}
        >
          TheDreamRaffle.com
        </div>
        <Label size={36} delay={64} style={{ marginTop: 18 }}>
          Choose your package · 1+1 FREE
        </Label>
        <div
          style={{
            marginTop: 34,
            padding: "22px 80px",
            borderRadius: 999,
            backgroundImage: GOLD_GRADIENT,
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 38,
            letterSpacing: 6,
            color: COLORS.navy,
            boxShadow: "0 14px 40px rgba(201,161,74,0.45)",
            opacity: button.opacity,
            transform: `${button.transform} scale(${pulse})`,
          }}
        >
          ENTER NOW
        </div>
      </AbsoluteFill>
      <Mascot pose="pointing" height={720} delay={60} style={{ left: 80 }} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 70px 34px 470px",
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: 21,
            lineHeight: 1.5,
            textAlign: "center",
            color: "rgba(232,220,196,0.85)",
            ...useEnterStyle(100),
          }}
        >
          Grand prize drawing March 11, 2027, in Jerusalem, streamed live.
          Winner may choose $700,000 cash (before taxes) instead of the
          apartment. Winner pays applicable taxes and must agree to publication
          of their name, photo and video. Raffle ticket purchases are not
          tax-deductible. The Dream Raffle is a project of the Am Yisrael Chai
          Foundation, a 501(c)(3). Full details at TheDreamRaffle.com.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 0:49 CTA — the key turns again and opens onto the end card.
export const SceneCTA: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={56}>
      <Footage shot="s7-lock" zoom={[1.1, 1.22]} />
      <Glow from={18} to={52} />
    </Sequence>
    <Sequence from={50}>
      <EndCard />
    </Sequence>
    <Flash at={52} />
  </AbsoluteFill>
);
