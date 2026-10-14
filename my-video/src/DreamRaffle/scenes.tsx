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
  Footage,
  GoldDust,
  GoldRule,
  GoldText,
  Label,
  NavyBackdrop,
  SceneFade,
  Shade,
  Ticket,
  LogoBadge,
  Mascot,
  Photo,
} from "./components";
import { COLORS, GOLD_GRADIENT, SANS, SERIF } from "./theme";

const Bottom: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{ justifyContent: "flex-end", padding: "0 120px 110px" }}
  >
    {children}
  </AbsoluteFill>
);

// 0:00 Hook — the golden key.
export const SceneHook: React.FC = () => (
  <AbsoluteFill>
    <Footage shot="s1-key" zoom={[1.0, 1.12]} />
    <Shade strength={0.85} />
    <Bottom>
      <GoldText size={150} delay={12}>
        $1.3 Million
      </GoldText>
      <Label size={44} delay={30} style={{ marginTop: 18 }}>
        Jerusalem Apartment
      </Label>
    </Bottom>
  </AbsoluteFill>
);

// 0:04 Grand prize — the view over the Old City.
export const SceneJerusalem: React.FC = () => (
  <AbsoluteFill>
    <Footage shot="s2-jerusalem" zoom={[1.02, 1.1]} pan={[-30, 0]} />
    <Shade strength={0.8} />
    <Bottom>
      <Label size={32} delay={10} color={COLORS.goldLight}>
        Win a luxury apartment in
      </Label>
      <GoldText size={140} delay={18} style={{ marginTop: 8 }}>
        Jerusalem
      </GoldText>
    </Bottom>
  </AbsoluteFill>
);

// 0:09 Inside the apartment — real photos from thedreamraffle.co.il.
export const SceneInterior: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={68}>
      <Photo src="apt-living-1.jpg" aspect={1.5} />
    </Sequence>
    <Sequence from={58}>
      <SceneFade fadeIn frames={10}>
        <Photo src="apt-living-2.jpg" aspect={1.5} zoom={[1.08, 1.02]} />
      </SceneFade>
    </Sequence>
    <Shade strength={0.8} />
    <Bottom>
      <div style={{ display: "flex", alignItems: "baseline", gap: 36 }}>
        <GoldText size={110} delay={8}>
          $1.3M
        </GoldText>
        <Label size={36} delay={20}>
          Furniture &amp; Appliances Included
        </Label>
      </div>
    </Bottom>
  </AbsoluteFill>
);

// 0:13 The offer — one ticket splits into two, the second stamped FREE.
export const SceneOffer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame: frame - 4, fps, config: { damping: 14 } });
  const split = spring({ frame: frame - 70, fps, config: { damping: 15 } });
  const stamp = spring({
    frame: frame - 118,
    fps,
    config: { damping: 9, mass: 0.7 },
  });
  const flash = interpolate(frame, [70, 76, 92], [0, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dx = interpolate(split, [0, 1], [0, 320]);
  const ticketTop = 430;
  return (
    <AbsoluteFill>
      <NavyBackdrop />
      <GoldDust />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
        <GoldText size={128} delay={60}>
          Buy 1, Get 1 FREE
        </GoldText>
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
            top: ticketTop,
            transform: `rotate(${-4 * split}deg)`,
          }}
        />
        <Ticket
          style={{
            left: 960 - 280 + dx,
            top: ticketTop,
            transform: `rotate(${4 * split}deg)`,
            opacity: split,
          }}
        />
        {/* FREE seal stamped onto the second ticket */}
        <div
          style={{
            position: "absolute",
            left: 960 + dx + 120,
            top: ticketTop - 70,
            width: 210,
            height: 210,
            borderRadius: "50%",
            background: `radial-gradient(circle, #B3261E 0%, #8A1C16 70%, #6B1510 100%)`,
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
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 120,
        }}
      >
        <Label size={46} delay={150} color={COLORS.goldLight}>
          Twice the chance to win
        </Label>
      </AbsoluteFill>
      <Mascot pose="thumbs-up" height={640} delay={128} style={{ left: 40 }} />
      <AbsoluteFill
        style={{ backgroundColor: COLORS.goldLight, opacity: flash }}
      />
    </AbsoluteFill>
  );
};

// 0:21 Early Bird — $15,000 counts up.
export const SceneEarlyBird: React.FC = () => {
  const frame = useCurrentFrame();
  const value =
    Math.round(
      interpolate(frame, [20, 85], [0, 15000], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }) / 50,
    ) * 50;
  return (
    <AbsoluteFill>
      <Footage shot="s3-interior" zoom={[1.15, 1.2]} blur={14} />
      <AbsoluteFill style={{ backgroundColor: "rgba(6,18,42,0.78)" }} />
      <GoldDust count={40} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Label size={40} delay={4} color={COLORS.goldLight}>
          Early Bird Bonus
        </Label>
        <GoldRule delay={10} width={260} />
        <GoldText
          size={230}
          delay={14}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          ${value.toLocaleString("en-US")}
        </GoldText>
        <Label size={52} delay={60} style={{ marginTop: 10 }}>
          Draw
        </Label>
        <Label
          size={28}
          delay={95}
          color={COLORS.stone}
          style={{ marginTop: 34, letterSpacing: 3 }}
        >
          Enter early for automatic entry
        </Label>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MissionCard: React.FC<{ index: number; title: string }> = ({
  index,
  title,
}) => (
  <Bottom>
    <Label size={28} delay={4} color={COLORS.goldLight}>
      {`0${index}`} · Every ticket supports
    </Label>
    <GoldRule delay={8} width={160} />
    <GoldText size={84} delay={10}>
      {title}
    </GoldText>
  </Bottom>
);

// 0:26 The mission — real activity photos from thedreamraffle.co.il.
export const SceneMission: React.FC = () => {
  const groups = [
    {
      from: 0,
      dur: 100,
      title: "Torah Institutions",
      photos: [
        { src: "torah-1.jpg", aspect: 1.78 },
        { src: "torah-2.jpg", aspect: 1.5 },
      ],
    },
    {
      from: 100,
      dur: 90,
      title: "Emergency Medical Equipment",
      photos: [
        { src: "medical-1.jpg", aspect: 1.33 },
        { src: "medical-2.jpg", aspect: 1.33 },
      ],
    },
    {
      from: 190,
      dur: 96,
      title: "IDF Soldiers",
      photos: [
        { src: "idf-1.jpg", aspect: 1.5 },
        { src: "idf-2.jpg", aspect: 0.92 },
      ],
    },
  ];
  return (
    <AbsoluteFill>
      {groups.map((g, i) => {
        const half = Math.round(g.dur / 2);
        return (
          <Sequence
            key={g.title}
            from={g.from}
            durationInFrames={i === groups.length - 1 ? g.dur : g.dur + 8}
          >
            <SceneFade fadeIn={i > 0} frames={8}>
              <Sequence durationInFrames={half + 8}>
                <Photo {...g.photos[0]} />
              </Sequence>
              <Sequence from={half}>
                <SceneFade fadeIn frames={8}>
                  <Photo {...g.photos[1]} />
                </SceneFade>
              </Sequence>
              <Shade strength={0.9} />
              <MissionCard index={i + 1} title={g.title} />
            </SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(Math.max(0, frame - 150) / 6) * 0.03;
  const button = useEnterStyle(150);
  return (
    <AbsoluteFill>
      <Footage shot="s2-jerusalem" zoom={[1.1, 1.16]} blur={10} />
      <AbsoluteFill style={{ backgroundColor: "rgba(6,18,42,0.8)" }} />
      <GoldDust count={45} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <LogoBadge size={210} style={useEnterStyle(0)} />
        <Label
          size={24}
          delay={8}
          color={COLORS.goldLight}
          style={{ marginTop: 22 }}
        >
          The Dream Raffle · 9th Annual Edition
        </Label>
        <GoldRule delay={12} width={300} />
        <GoldText size={96} delay={20}>
          Two Tickets. One Dream.
        </GoldText>
        <Label size={44} delay={70} style={{ marginTop: 26 }}>
          Buy 1, Get 1 FREE
        </Label>
        <div
          style={{
            marginTop: 44,
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 92,
            color: COLORS.white,
            letterSpacing: 1,
            textShadow: "0 6px 24px rgba(0,0,0,0.6)",
            ...useEnterStyle(110),
          }}
        >
          thedreamraffle.co.il
        </div>
        <div
          style={{
            marginTop: 40,
            padding: "22px 64px",
            borderRadius: 999,
            backgroundImage: GOLD_GRADIENT,
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: 5,
            color: COLORS.navy,
            boxShadow: "0 14px 40px rgba(201,161,74,0.45)",
            opacity: button.opacity,
            transform: `${button.transform} scale(${pulse})`,
          }}
        >
          GET YOUR TICKETS NOW
        </div>
      </AbsoluteFill>
      <Mascot pose="pointing" height={760} delay={120} style={{ left: 90 }} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 40,
          paddingLeft: 460,
          paddingRight: 60,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: 20,
            textAlign: "center",
            lineHeight: 1.5,
            color: "rgba(232,220,196,0.75)",
            letterSpacing: 1,
            ...useEnterStyle(150),
          }}
        >
          Presented by the Am Yisrael Chai Foundation · Grand Prize: $1.3M
          Jerusalem apartment · Early Bird Draw: $15,000 · Terms and conditions
          apply. See website for official rules.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const useEnterStyle = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  return {
    opacity: s,
    transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
  };
};

// 0:35 CTA — the key turns, then the end card.
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [40, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={78}>
        <Footage shot="s7-lock" zoom={[1.0, 1.15]} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 60% 50%, ${COLORS.goldLight} 0%, rgba(243,222,156,0) 70%)`,
            opacity: glow,
          }}
        />
      </Sequence>
      <Sequence from={68}>
        <SceneFade fadeIn frames={10}>
          <EndCard />
        </SceneFade>
      </Sequence>
    </AbsoluteFill>
  );
};
