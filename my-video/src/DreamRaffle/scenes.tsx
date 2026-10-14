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
  Watermark,
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
    <Watermark />
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

// 0:09 Inside the apartment.
export const SceneInterior: React.FC = () => (
  <AbsoluteFill>
    <Footage shot="s3-interior" zoom={[1.0, 1.1]} pan={[20, 0]} />
    <Shade strength={0.75} />
    <Watermark />
    <Bottom>
      <div style={{ display: "flex", alignItems: "baseline", gap: 36 }}>
        <GoldText size={110} delay={8}>
          $1.3M
        </GoldText>
        <Label size={40} delay={20}>
          Panoramic Views
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

// 0:26 The mission — Torah, medical equipment, IDF soldiers.
export const SceneMission: React.FC = () => {
  const shots = [
    { shot: "s6a-torah", from: 0, dur: 120, title: "Torah Institutions" },
    {
      shot: "s6b-medic",
      from: 120,
      dur: 70,
      title: "Emergency Medical Equipment",
    },
    { shot: "s6c-idf", from: 190, dur: 96, title: "IDF Soldiers" },
  ] as const;
  return (
    <AbsoluteFill>
      {shots.map((s, i) => (
        <Sequence
          key={s.shot}
          from={s.from}
          durationInFrames={i === shots.length - 1 ? s.dur : s.dur + 8}
        >
          <SceneFade fadeIn={i > 0} frames={8}>
            <Footage shot={s.shot} zoom={[1.02, 1.1]} />
            <Shade strength={0.85} />
            <Watermark />
            <MissionCard index={i + 1} title={s.title} />
          </SceneFade>
        </Sequence>
      ))}
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
        <Label size={28} delay={0} color={COLORS.goldLight}>
          The Dream Raffle · 9th Annual Edition
        </Label>
        <GoldRule delay={6} width={300} />
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
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 40,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: 20,
            color: "rgba(232,220,196,0.75)",
            letterSpacing: 1,
            ...useEnterStyle(150),
          }}
        >
          Grand Prize: $1.3M Jerusalem apartment · Early Bird Draw: $15,000 ·
          Terms and conditions apply. See website for official rules.
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
