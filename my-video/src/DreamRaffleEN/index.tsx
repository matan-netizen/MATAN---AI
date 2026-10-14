// English-only version of the Dream Raffle 9 promo.
//
// The source cut (public/dream-raffle/source.mp4) already has English
// headlines, but its logo, lower third, prize card, 1+1 offer, impact badges,
// CTA button and end card are in Hebrew, and its interview subtitles sit on
// the outer canvas. This composition plays the source untouched and lays
// matching English graphics exactly over every Hebrew element, re-timed to
// the source's own animations, and moves the subtitles inside the video frame.
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  BgPatch,
  StillPatch,
  CreamPill,
  Flash,
  GoldPill,
  Logo,
  Particles,
  Subtitle,
  usePop,
  useWindow,
} from "./components";
import { COLORS, FONT_FAMILY, GOLD_GRADIENT } from "./theme";

export const DR_FPS = 30;
export const DR_DURATION = 1254; // 41.8 s, same as the source

// Scene cuts in the source (each one is covered by a gold flash).
const CUTS = [4.5, 13.93, 22.87, 35.2];
const END_CARD = 40.0;

// Interview frame (gold border) in the framed scenes, 4.5 s - 35.2 s.
const FRAME = { x: 46, y: 564, w: 988, h: 550 };

// Interview subtitles, timed to the source's speech.
const SUBTITLES: [number, number, string][] = [
  [4.6, 6.87, "I chose to do the will of Hashem —"],
  [6.87, 8.4, "I sit and learn Torah all day."],
  [8.4, 10.3, "You won this apartment."],
  [10.3, 12.0, "How do you feel?"],
  [12.0, 13.93, "Overjoyed. Nobody is happier than me!"],
  [14.0, 16.0, "Did you think you would win?"],
  [16.6, 19.5, "Honestly, no. I didn't think I'd win."],
  [19.9, 21.6, "I got the phone call — and my life changed."],
  [21.6, 22.87, "Everything changed."],
  [23.0, 24.8, "Look — here it is, the apartment."],
  [26.1, 31.0, "Aryeh Luria won this apartment in the 8th Dream Raffle."],
  [31.4, 35.2, "Who will be the winner of the 9th Dream Raffle?"],
];

// When the source shows its (Hebrew) lower third.
const LOWER_THIRD: [number, number][] = [
  [5.2, 8.12],
  [12.55, 14.0],
];

const useT = () => useCurrentFrame() / DR_FPS;

const Logos: React.FC = () => {
  const big1 = useWindow(-1, 4.5, 0.12);
  const small = useWindow(4.5, 35.2, 0.12);
  const big2 = useWindow(35.2, END_CARD, 0.12);
  return (
    <>
      <div style={{ position: "absolute", left: 542 - 140, top: 80, opacity: Math.max(big1, big2) }}>
        <Logo size={280} />
      </div>
      <div style={{ position: "absolute", left: 540 - 108, top: 21, opacity: small }}>
        <Logo size={215} />
      </div>
    </>
  );
};

const LowerThird: React.FC = () => {
  const t = useT();
  const o = Math.max(...LOWER_THIRD.map(([a, b]) => interpolate(t, [a - 0.08, a, b, b + 0.08], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: 952 - FRAME.y, width: 446 - FRAME.x, opacity: o, fontFamily: FONT_FAMILY }}>
      <div style={{ background: GOLD_GRADIENT, borderRadius: "0 12px 0 0", padding: "8px 20px 8px 40px", fontWeight: 900, fontSize: 46, color: COLORS.ink, lineHeight: 1.15 }}>
        Aryeh Luria
      </div>
      <div style={{ background: "#2A1D14", borderRadius: "0 0 12px 0", padding: "10px 20px 10px 40px", fontWeight: 700, fontSize: 27, color: COLORS.white }}>
        Winner of Dream Raffle 8
      </div>
    </div>
  );
};

// Everything that lives inside the gold interview frame.
const FrameLayer: React.FC = () => {
  const t = useT();
  const visible = useWindow(4.5, 35.2, 0.1);
  const sub = SUBTITLES.find(([a, b]) => t >= a && t < b);
  // Subtitles sit at the bottom of the frame and lift above the lower third
  // while it is on screen, so the two never overlap.
  const lift = Math.max(...LOWER_THIRD.map(([a, b]) => interpolate(t, [a - 0.3, a - 0.05, b + 0.05, b + 0.3], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const watermark = useWindow(22.87, 35.3, 0.05);
  // ...and above the domain bar that masks the burned-in watermark.
  const bottom = interpolate(lift, [0, 1], [26, 176]) + watermark * 58;
  if (visible <= 0) return null;
  return (
    <div style={{ position: "absolute", left: FRAME.x, top: FRAME.y, width: FRAME.w, height: FRAME.h, overflow: "hidden", borderRadius: 16, opacity: visible }}>
      <LowerThird />
      {watermark > 0 ? (
        // Masks the burned-in "TheDreamRaffle.com" (the official domain is .co.il).
        <div style={{ position: "absolute", left: 0, top: 1046 - FRAME.y, width: 470, height: FRAME.h - (1046 - FRAME.y), background: "#18110B", borderTopRightRadius: 10, display: "flex", alignItems: "center", paddingLeft: 22, opacity: watermark, fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 36, color: COLORS.cream }}>
          thedreamraffle.co.il
        </div>
      ) : null}
      {sub ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom, display: "flex", justifyContent: "center" }}>
          <Subtitle text={sub[2]} />
        </div>
      ) : null}
    </div>
  );
};

// Hides the source's subtitles, which sit on the outer canvas under the frame.
const OldSubtitleCover: React.FC = () => {
  const o = useWindow(4.45, 35.7, 0.05);
  return o > 0 ? <BgPatch x={30} y={1745} w={1020} h={135} opacity={o} /> : null;
};

const PrizeCard: React.FC = () => {
  const t = useT();
  const o = useWindow(5.38, 13.93, 0.06);
  const scale = interpolate(t, [5.3, 5.42, 5.72, 5.9], [0.95, 1.2, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute", left: 262, top: 1188, width: 556, height: 554, opacity: o,
        transform: `scale(${scale})`,
        background: "linear-gradient(180deg, #4B3220 0%, #2E1F14 100%)",
        border: `3px solid ${COLORS.gold}`, borderRadius: 26,
        boxShadow: `0 0 30px ${COLORS.gold}55, inset 0 0 40px rgba(0,0,0,0.5)`,
        display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT_FAMILY, color: COLORS.white,
      }}
    >
      <div style={{ marginTop: 18 }}>
        <Logo size={120} arc={false} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 28, color: COLORS.goldLight, letterSpacing: 4, marginTop: 4 }}>GRAND PRIZE</div>
      <div style={{ fontWeight: 900, fontSize: 36, marginTop: 6 }}>Luxury Jerusalem Apartment</div>
      <div style={{ fontWeight: 900, fontSize: 130, lineHeight: 1.05, background: GOLD_GRADIENT, WebkitBackgroundClip: "text", color: "transparent", transform: `scale(${1 + 0.02 * Math.sin(t * 4)})` }}>
        $1.3M
      </div>
      <div style={{ fontWeight: 400, fontSize: 28, opacity: 0.9 }}>Valued at $1.3 Million</div>
    </div>
  );
};

const Seal: React.FC<{ size: number }> = ({ size }) => {
  const points = Array.from({ length: 48 }).map((_, i) => {
    const a = (i / 48) * Math.PI * 2;
    const r = i % 2 === 0 ? 100 : 91;
    return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <defs>
        <radialGradient id="sealG" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFF0B8" />
          <stop offset="55%" stopColor="#E2B24E" />
          <stop offset="100%" stopColor="#A87822" />
        </radialGradient>
      </defs>
      <polygon points={points.join(" ")} fill="url(#sealG)" stroke="#8A611B" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="74" fill="none" stroke="#3B2617" strokeWidth="2" strokeDasharray="4 4" />
      <text x="100" y="112" textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={900} fontSize="62" fill="#24170F">
        1+1
      </text>
      <text x="100" y="140" textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={900} fontSize="15" fill="#24170F" letterSpacing="1">
        FREE TICKET
      </text>
    </svg>
  );
};

const Offer: React.FC = () => {
  const t = useT();
  const scene = useWindow(14.7, 22.87, 0.08);
  const sealPop = usePop(14.82, 10);
  const textPop = usePop(15.0, 14);
  const pillPop = usePop(15.4, 10);
  if (scene <= 0) return null;
  const sealOn = t >= 14.8 ? 1 : 0;
  return (
    <AbsoluteFill style={{ opacity: scene }}>
      <StillPatch x={176} y={1196} w={530} h={330} src="dream-raffle/patch_offer.png" />
      <div style={{ position: "absolute", left: 870 - 212, top: 1360 - 212, width: 424, height: 424, opacity: sealOn, transform: `scale(${interpolate(sealPop, [0, 1], [0.85, 1]) * (1 + 0.02 * Math.sin(t * 5))})` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, #2D2017 62%, rgba(45,32,23,0) 72%)" }} />
        <div style={{ position: "absolute", left: 17, top: 17 }}>
          <Seal size={390} />
        </div>
      </div>
      <div style={{ position: "absolute", right: 1080 - 640, top: 1226, textAlign: "right", fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 52, lineHeight: 1.12, color: COLORS.white, opacity: textPop, transform: `translateX(${(1 - textPop) * -30}px)` }}>
        Buy 1, Get 1 <span style={{ color: COLORS.goldLight }}>FREE</span>
        <br />
        on All Orders!
      </div>
      <div style={{ position: "absolute", right: 1080 - 640, top: 1390, opacity: pillPop > 0.02 ? 1 : 0, transform: `scale(${pillPop})`, transformOrigin: "right center" }}>
        <GoldPill fontSize={27} padding="10px 24px">1+1 FREE Ticket with Every Purchase!</GoldPill>
      </div>
    </AbsoluteFill>
  );
};

const BADGES = [
  { label: "Torah Institutions", img: "impact1.jpg", x: 30, at: 24.45, size: 30 },
  { label: "Lifesaving Emergency Equipment", img: "impact2.jpg", x: 380, at: 24.05, size: 25 },
  { label: "IDF Soldiers", img: "impact3.jpg", x: 730, at: 23.85, size: 30 },
];

const Badge: React.FC<(typeof BADGES)[number]> = ({ label, img, x, at, size }) => {
  const p = usePop(at, 11);
  return (
    <div
      style={{
        position: "absolute", left: x, top: 1210, width: 320, height: 315, borderRadius: 22,
        background: GOLD_GRADIENT, padding: 10, boxSizing: "border-box",
        boxShadow: "0 10px 24px rgba(0,0,0,0.55)",
        opacity: interpolate(p, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${(1 - p) * -70}px) rotate(${(1 - p) * 8}deg)`,
      }}
    >
      <Img src={staticFile(`dream-raffle/${img}`)} style={{ width: 300, height: 222, objectFit: "cover", borderRadius: 14, display: "block" }} />
      <div style={{ height: 73, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: COLORS.ink }}>
        {label}
      </div>
    </div>
  );
};

const Impact: React.FC = () => {
  const scene = useWindow(23.6, 35.2, 0.08);
  if (scene <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: scene }}>
      <StillPatch x={30} y={1180} w={1020} h={500} src="dream-raffle/patch_impact.png" />
      {BADGES.map((b) => (
        <Badge key={b.label} {...b} />
      ))}
    </AbsoluteFill>
  );
};

const CtaButton: React.FC = () => {
  const t = useT();
  const o = useWindow(36.12, END_CARD, 0.06);
  if (o <= 0) return null;
  const s =
    interpolate(t, [36.12, 36.4, 36.7], [0.3, 1.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    (1 + 0.03 * Math.sin((t - 36.7) * 6));
  return (
    <div style={{ position: "absolute", left: 160, top: 960, width: 760, height: 180, display: "flex", alignItems: "center", justifyContent: "center", opacity: o, transform: `scale(${s})` }}>
      <GoldPill fontSize={64} padding="0" style={{ width: 760, height: 170, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", border: `5px solid ${COLORS.goldLight}`, boxShadow: `0 10px 30px rgba(0,0,0,0.6), 0 0 0 10px rgba(246,218,138,0.25)` }}>
        Enter the Raffle →
      </GoldPill>
    </div>
  );
};

const EndCard: React.FC = () => {
  const t = useT();
  const o = interpolate(t, [END_CARD - 0.3, END_CARD - 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logo = usePop(END_CARD + 0.05, 11);
  const pill1 = usePop(END_CARD + 0.2, 11);
  const pill2 = usePop(END_CARD + 0.35, 11);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: o, background: "radial-gradient(circle at 50% 42%, #4C3221 0%, #2D2017 55%, #1C130C 100%)" }}>
      <Particles count={70} seed="end" />
      <div style={{ position: "absolute", left: 540 - 270, top: 470, transform: `scale(${interpolate(logo, [0, 1], [0.6, 1])})`, opacity: logo }}>
        <Logo size={540} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, display: "flex", justifyContent: "center", transform: `scale(${pill1})` }}>
        <GoldPill fontSize={44} padding="14px 40px">Buy 1, Get 1 FREE on All Orders!</GoldPill>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1250, display: "flex", justifyContent: "center", transform: `scale(${pill2})` }}>
        <CreamPill fontSize={56}>thedreamraffle.co.il</CreamPill>
      </div>
    </AbsoluteFill>
  );
};

export const DreamRaffleEN: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.patch }}>
    <OffthreadVideo src={staticFile("dream-raffle/source.mp4")} />
    <OldSubtitleCover />
    <PrizeCard />
    <Offer />
    <Impact />
    <FrameLayer />
    <CtaButton />
    <Logos />
    <EndCard />
    {CUTS.map((c) => (
      <Flash key={c} at={c} />
    ))}
  </AbsoluteFill>
);
