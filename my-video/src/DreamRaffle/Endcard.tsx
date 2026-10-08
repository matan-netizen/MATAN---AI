import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, Logo, Particles, Pill, useSpring } from "./components";
import { COLORS, FONT, GOLD_METAL, NAVY_BG, OFFER, useLayout } from "./theme";

const PackageCard: React.FC<{ name: string; tickets: string; price: string; delay: number; w: number }> = ({
  name,
  tickets,
  price,
  delay,
  w,
}) => {
  const sp = useSpring(delay, 13);
  return (
    <div
      style={{
        width: w,
        padding: 4,
        borderRadius: w * 0.1,
        backgroundImage: GOLD_METAL,
        transform: `translateY(${(1 - sp) * 60}px)`,
        opacity: sp,
      }}
    >
      <div
        style={{
          borderRadius: w * 0.09,
          background: "linear-gradient(180deg, #14306E, #0B1F4D)",
          padding: `${w * 0.07}px 0`,
          textAlign: "center",
          fontFamily: FONT,
          color: COLORS.white,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: w * 0.17, color: COLORS.goldLight }}>{name}</div>
        <div style={{ fontWeight: 700, fontSize: w * 0.12, opacity: 0.9 }}>{tickets} כרטיסים</div>
        <div style={{ fontWeight: 900, fontSize: w * 0.17, marginTop: w * 0.02 }}>{price}</div>
      </div>
    </div>
  );
};

const CtaButton: React.FC<{ label: string; delay: number; size: number }> = ({ label, delay, size }) => {
  const frame = useCurrentFrame();
  const sp = useSpring(delay, 10);
  const pulse = 1 + 0.035 * Math.max(0, Math.sin(((frame - delay) / 30) * Math.PI * 2.2));
  return (
    <div style={{ transform: `scale(${sp * pulse})`, opacity: Math.min(1, sp * 2), textAlign: "center" }}>
      <div
        style={{
          display: "inline-block",
          background: `linear-gradient(180deg, #19B0A6, ${COLORS.emerald} 55%, ${COLORS.emeraldDark})`,
          border: `4px solid ${COLORS.gold}`,
          borderRadius: 999,
          padding: `${size * 0.25}px ${size * 0.9}px`,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          color: COLORS.white,
          boxShadow: `0 0 ${size}px rgba(16,137,129,0.6), 0 14px 30px rgba(0,0,0,0.5)`,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: size * 0.62,
          color: COLORS.goldLight,
          marginTop: size * 0.25,
          direction: "ltr",
          letterSpacing: 1,
        }}
      >
        {OFFER.url}
      </div>
    </div>
  );
};

export const Endcard: React.FC<{
  cta?: string;
  earlyFirst?: boolean;
  credit?: string;
  children?: React.ReactNode; // optional visual behind/beside the card
}> = ({ cta = "לרכישה עכשיו", earlyFirst, credit, children }) => {
  const frame = useCurrentFrame();
  const { format, t, safeTop, safeBottom } = useLayout();
  const bgIn = interpolate(frame, [0, 10], [0, 1], clamp);

  const early = (
    <Pill key="early" bg={COLORS.coral} size={earlyFirst ? 50 : 40} delay={earlyFirst ? 4 : 22} pulse={earlyFirst}
      sub={OFFER.earlyBirdDeadline}>
      מוקדמים: {OFFER.earlyBird} מזומן
    </Pill>
  );
  const oneplus = (
    <Pill key="oneplus" size={earlyFirst ? 44 : 52} delay={earlyFirst ? 14 : 6} pulse={!earlyFirst}>
      1+1 – כל כרטיס מוכפל בחינם
    </Pill>
  );
  const cardW = format === "vertical" ? 220 : format === "square" ? 200 : 210;
  const packages = (
    <div style={{ display: "flex", gap: 16 * t, flexWrap: "wrap", justifyContent: "center", maxWidth: format === "vertical" ? 980 : 940 }}>
      {OFFER.packages.map((p, i) => (
        <PackageCard key={p.name} {...p} delay={14 + i * 4} w={cardW} />
      ))}
    </div>
  );
  const trust = (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 32 * t,
        color: COLORS.white,
        opacity: interpolate(frame, [30, 45], [0, 0.92], clamp),
        textAlign: "center",
        lineHeight: 1.35,
      }}
    >
      עם ישראל חי · הרכישה שלכם מחזקת
      <br />
      את חיילי צה״ל ומשפחותיהם
    </div>
  );
  const creditEl = credit ? (
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30 * t, color: COLORS.goldLight, opacity: interpolate(frame, [8, 20], [0, 1], clamp) }}>
      {credit}
    </div>
  ) : null;

  return (
    <AbsoluteFill style={{ background: NAVY_BG, opacity: bgIn }}>
      {children}
      <Particles count={30} seed="end" opacity={0.5} speed={0.5} size={8} />
      {format === "landscape" ? (
        <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 90, padding: "60px 120px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <Logo size={330} />
            {creditEl}
            {trust}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
            {earlyFirst ? [early, oneplus] : [oneplus, early]}
            {packages}
            <CtaButton label={cta} delay={34} size={50} />
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: format === "vertical" ? 30 : 16,
            paddingTop: safeTop - (format === "vertical" ? 80 : 30),
            paddingBottom: safeBottom - (format === "vertical" ? 80 : 30),
          }}
        >
          <Logo size={format === "vertical" ? 340 : 200} />
          {creditEl}
          {earlyFirst ? [early, oneplus] : [oneplus, early]}
          {packages}
          {format === "vertical" ? trust : null}
          <CtaButton label={cta} delay={34} size={format === "vertical" ? 58 : 40} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
