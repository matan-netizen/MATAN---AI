import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { EarlyBird, OnePlusOne, SuperTicket } from "./badges";
import { clamp, Fade, Flash, GoldTitle, Headline, Particles, Photo, Pill, Shade, Stack, Spotlight, useSpring } from "./components";
import { Endcard } from "./Endcard";
import SCRIPT from "./script.json";
import { VersionShell } from "./Shell";
import { COLORS, FONT, GOLD_METAL, IMG, OFFER, useLayout } from "./theme";

// Version 4 – The Hall of Winners & the Door of Surprises (30s).
// Music: march, full stop at the door (14–16s), drop on the bonuses (16s),
// choir on the reveal (21s), resolve on the endcard (25s).
export const V4_DURATION = 900;
const SC = { hall: 0, door: 360, bonus: 480, reveal: 630, end: 750 };

const CAPTIONS = SCRIPT.v4;

// Winners with a year on the site's winners page, oldest first.
const PLAQUES = [
  { raffle: 4, year: 2021, name: "מיכאל כהן", city: "סן דייגו, קליפורניה", img: IMG.w2021 },
  { raffle: 5, year: 2022, name: "אסף כהן", city: "שבי דרום", img: IMG.w2022 },
  { raffle: 6, year: 2023, name: "מאיר פרידמן", city: "ביתר עילית", img: IMG.w2023 },
  { raffle: 7, year: 2024, name: "משפחת ניסניאן", city: "ווסט המפסטד, ניו יורק", img: IMG.w2024 },
  { raffle: 8, year: 2025, name: "אריה לוריא", city: "ירושלים", img: null },
];

// --- camera ---------------------------------------------------------------
const P = 900; // CSS perspective
const PLAQUE_Z = PLAQUES.map((_, i) => -(1000 + i * 560));
const DOOR_Z = -4300;
const camZ = (f: number) =>
  interpolate(f, [0, 70, 330, 400], [0, 260, 3200, 3800], {
    ...clamp,
    easing: (t) => t * t * (3 - 2 * t),
  });
// Frame where each plaque is closest to readable (~650px in front of camera).
const plaqueFrame = (z: number) => {
  for (let f = 0; f < 420; f++) if (camZ(f) >= -z - 650) return f;
  return 420;
};
const PLAQUE_FRAMES = PLAQUE_Z.map(plaqueFrame);

const CUES = [
  { sfx: "impact", at: 0, volume: 0.6 },
  ...PLAQUE_FRAMES.map((f) => ({ sfx: "ting", at: f, volume: 0.4 })),
  { sfx: "impact", at: SC.bonus, volume: 0.55 },
  { sfx: "pop", at: SC.bonus + 6, volume: 0.6 },
  { sfx: "coins", at: SC.bonus + 8, volume: 0.45 },
  { sfx: "pop", at: SC.bonus + 30, volume: 0.6 },
  { sfx: "pop", at: SC.bonus + 54, volume: 0.6 },
  { sfx: "impact", at: SC.reveal + 14, volume: 0.7 },
  { sfx: "shimmer", at: SC.reveal + 20, volume: 0.5 },
  { sfx: "whoosh", at: SC.end - 6, volume: 0.5 },
  { sfx: "click", at: SC.end + 34, volume: 0.5 },
];

// Positions a plane in the 3D world: centered on (x, y, z), then rotated.
const plane = (w: number, h: number, x: number, y: number, z: number, rot = ""): React.CSSProperties => ({
  position: "absolute",
  left: "50%",
  top: "50%",
  width: w,
  height: h,
  marginLeft: -w / 2,
  marginTop: -h / 2,
  transform: `translate3d(${x}px, ${y}px, ${z}px) ${rot}`,
  backfaceVisibility: "hidden",
});

const STONE =
  "repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 260px, rgba(90,60,20,0.35) 260px 270px, rgba(255,240,200,0.25) 270px 276px, rgba(0,0,0,0) 276px 300px), " +
  "repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 118px, rgba(110,80,40,0.25) 118px 122px), " +
  "linear-gradient(180deg, #2B1D10 0%, #8C6B44 18%, #C9A97A 50%, #8C6B44 85%, #3A2814 100%)";
const FLOOR =
  "repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 236px, rgba(212,175,55,0.35) 236px 240px), " +
  "repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 236px, rgba(212,175,55,0.35) 236px 240px), " +
  "radial-gradient(ellipse at 50% 50%, #E8D9BF 0%, #B49A73 60%, #6E5636 100%)";

const Plaque: React.FC<{ p: (typeof PLAQUES)[number]; w: number }> = ({ p, w }) => (
  <div
    style={{
      width: w,
      padding: w * 0.035,
      borderRadius: w * 0.04,
      backgroundImage: GOLD_METAL,
      boxShadow: "0 0 60px rgba(247,227,141,0.35)",
      fontFamily: FONT,
      textAlign: "center",
    }}
  >
    <div style={{ background: "linear-gradient(180deg, #14306E, #0B1F4D)", borderRadius: w * 0.03, padding: w * 0.05 }}>
      <div style={{ width: "100%", aspectRatio: "1", borderRadius: w * 0.02, overflow: "hidden", border: `${w * 0.012}px solid ${COLORS.gold}` }}>
        {p.img ? (
          <Img src={staticFile(p.img)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%" }} />
        ) : (
          <AbsoluteFill style={{ background: "radial-gradient(circle, #F7E38D, #D4AF37 50%, #8A6A16)", justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontWeight: 900, fontSize: w * 0.5, color: "#4A3608" }}>8</div>
          </AbsoluteFill>
        )}
      </div>
      <div style={{ color: COLORS.goldLight, fontWeight: 700, fontSize: w * 0.075, marginTop: w * 0.04 }}>
        הגרלה {p.raffle} · {p.year}
      </div>
      <div style={{ color: COLORS.white, fontWeight: 900, fontSize: w * 0.105, lineHeight: 1.15 }}>{p.name}</div>
      <div style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400, fontSize: w * 0.062 }}>{p.city}</div>
    </div>
  </div>
);

const Door: React.FC<{ w: number; h: number; open: number }> = ({ w, h, open }) => {
  const panel = (top: string, height: string): React.CSSProperties => ({
    position: "absolute",
    left: "12%",
    right: "12%",
    top,
    height,
    borderRadius: 10,
    boxShadow: "inset 0 0 0 6px rgba(40,20,5,0.55), inset 0 0 0 10px rgba(212,175,55,0.5), inset 0 0 40px rgba(0,0,0,0.5)",
  });
  return (
    <div style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d" }}>
      {/* light behind the door */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse, #FFFFFF 0%, #FFF3C4 40%, #F7C96B 100%)", boxShadow: "0 0 200px 80px rgba(255,230,160,0.8)" }} />
      {/* gold frame */}
      <div style={{ position: "absolute", inset: -w * 0.07, border: `${w * 0.07}px solid transparent`, borderImage: `${GOLD_METAL} 1`, borderBottom: "none" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "100% 50%",
          transform: `rotateY(${open * 105}deg)`,
          background: "repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 18px, rgba(0,0,0,0.08) 18px 20px), linear-gradient(90deg, #4A2511, #7A4320 30%, #8E5228 50%, #6A391B 75%, #3E1E0D)",
          boxShadow: "0 0 0 4px #2A1206",
        }}
      >
        <div style={panel("6%", "38%")} />
        <div style={panel("56%", "38%")} />
        {/* handle */}
        <div style={{ position: "absolute", left: "8%", top: "50%", width: w * 0.05, height: w * 0.2, borderRadius: 999, backgroundImage: GOLD_METAL }} />
        {/* nameplate */}
        <div
          style={{
            position: "absolute",
            left: "16%",
            right: "16%",
            top: "16%",
            padding: `${w * 0.04}px 0`,
            backgroundImage: GOLD_METAL,
            borderRadius: 8,
            textAlign: "center",
            fontFamily: FONT,
            color: "#3E2D05",
            boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: w * 0.15, lineHeight: 1 }}>שנה 9</div>
          <div style={{ fontWeight: 700, fontSize: w * 0.065 }}>שמור לזוכה הבא</div>
        </div>
      </div>
    </div>
  );
};

// The whole hall, one continuous camera move (0 → door), then the door opens.
const Hall: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, format } = useLayout();
  const cz = camZ(frame);
  const HW = format === "landscape" ? width * 0.42 : width * 0.62;
  const floorY = height * 0.38;
  const ceilY = -height * 0.42;
  const wallH = floorY - ceilY;
  const SEG = 400;
  const segs = Array.from({ length: 13 }, (_, i) => 200 - SEG / 2 - i * SEG); // segment centers
  const visible = (zc: number) => zc + SEG / 2 + cz < P * 0.9;
  const doorH = wallH * 0.82;
  const doorW = doorH * 0.52;
  const open = interpolate(frame, [SC.reveal - 6, SC.reveal + 20], [0, 1], { ...clamp, easing: (t) => t * t });
  const plaqueW = format === "landscape" ? 420 : 470;
  const sconce = "radial-gradient(ellipse 30% 22% at 50% 22%, rgba(255,214,140,0.65), rgba(255,214,140,0))";
  return (
    <AbsoluteFill style={{ background: "#120B05", perspective: P, perspectiveOrigin: "50% 50%", overflow: "hidden" }}>
      <AbsoluteFill style={{ transformStyle: "preserve-3d", transform: `translateZ(${cz}px)` }}>
        {segs.filter(visible).map((zc) => (
          <React.Fragment key={zc}>
            <div style={{ ...plane(SEG + 2, wallH, -HW, (floorY + ceilY) / 2, zc, "rotateY(90deg)"), background: `${sconce}, ${STONE}` }} />
            <div style={{ ...plane(SEG + 2, wallH, HW, (floorY + ceilY) / 2, zc, "rotateY(-90deg)"), background: `${sconce}, ${STONE}` }} />
            <div style={{ ...plane(HW * 2, SEG + 2, 0, floorY, zc, "rotateX(90deg)"), background: FLOOR }} />
            <div
              style={{
                ...plane(HW * 2, SEG + 2, 0, ceilY, zc, "rotateX(-90deg)"),
                background: "linear-gradient(90deg, #1A1008, #3A2814 30%, #FFE7B0 48%, #FFE7B0 52%, #3A2814 70%, #1A1008)",
              }}
            />
          </React.Fragment>
        ))}
        {/* back wall around the door */}
        <div style={{ ...plane(HW * 2, wallH, 0, (floorY + ceilY) / 2, DOOR_Z - 2), background: STONE }} />
        <div style={{ ...plane(doorW, doorH, 0, floorY - doorH / 2, DOOR_Z + 2), transformStyle: "preserve-3d" }}>
          <Door w={doorW} h={doorH} open={open} />
        </div>
        {/* light spilling under the door */}
        <div
          style={{
            ...plane(doorW * 2.4, 700, 0, floorY - 2, DOOR_Z + 360, "rotateX(90deg)"),
            background: "radial-gradient(ellipse 40% 50% at 50% 100%, rgba(255,230,160,0.6), rgba(255,230,160,0))",
          }}
        />
        {PLAQUES.map((p, i) => {
          const z = PLAQUE_Z[i];
          // Hide plaques the camera has passed.
          if (z + cz > 150) return null;
          const side = i % 2 === 0 ? 1 : -1; // RTL: first plaque on the right wall
          return (
            <div key={p.year} style={{ ...plane(plaqueW, plaqueW * 1.62, side * (HW - plaqueW * 0.55), floorY - plaqueW * 0.95, z, `rotateY(${-side * 38}deg)`) }}>
              <Plaque p={p} w={plaqueW} />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* warm haze + vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(255,214,140,0.12), rgba(0,0,0,0.55) 85%)" }} />
      <Particles count={35} seed="v4dust" color="#FFE2A0" opacity={0.5} speed={0.4} size={6} />
    </AbsoluteFill>
  );
};

const HallTitles: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [70, 90], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Stack justify="flex-start">
        <GoldTitle size={150} delay={4}>
          8 שנים.
        </GoldTitle>
        <Headline size={64} delay={20}>
          זוכים אמיתיים.
        </Headline>
      </Stack>
    </AbsoluteFill>
  );
};

const DoorTitle: React.FC = () => (
  <Stack justify="flex-start">
    <Headline size={72} delay={10}>
      והדלת הבאה...
    </Headline>
    <GoldTitle size={110} delay={40}>
      שמורה לכם
    </GoldTitle>
  </Stack>
);

const CashStack: React.FC<{ delay: number; w: number }> = ({ delay, w }) => {
  const sp = useSpring(delay, 10);
  return (
    <div style={{ position: "relative", width: w, height: w * 0.7, transform: `scale(${sp})`, opacity: sp }}>
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (i % 2) * 6,
            bottom: i * w * 0.07,
            width: w,
            height: w * 0.42,
            borderRadius: 8,
            background: "linear-gradient(135deg, #3E7B4A, #7DB56F 50%, #3E7B4A)",
            border: "3px solid #CFE7B9",
            boxShadow: "0 6px 12px rgba(0,0,0,0.4)",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: "38%",
          width: "24%",
          bottom: 0,
          height: w * 0.84,
          background: GOLD_METAL,
          borderRadius: 4,
        }}
      />
      <div style={{ position: "absolute", top: -w * 0.32, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: w * 0.22, color: COLORS.goldLight, textShadow: "0 4px 12px rgba(0,0,0,0.7)", direction: "ltr" }}>
        {OFFER.earlyBird}
      </div>
    </div>
  );
};

const GiftBox: React.FC<{ delay: number; w: number; color: string }> = ({ delay, w, color }) => {
  const sp = useSpring(delay, 9);
  const ribbon = `linear-gradient(90deg, transparent 42%, ${COLORS.gold} 42%, #FFF0A8 50%, ${COLORS.gold} 58%, transparent 58%)`;
  return (
    <div style={{ position: "relative", width: w, height: w, transform: `translateY(${(1 - sp) * 200}px)`, opacity: sp }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: w * 0.78, borderRadius: 10, background: `${ribbon}, ${color}`, boxShadow: "0 16px 30px rgba(0,0,0,0.5)" }} />
      <div style={{ position: "absolute", left: -w * 0.05, right: -w * 0.05, bottom: w * 0.76, height: w * 0.2, borderRadius: 10, background: `${ribbon}, ${color}`, filter: "brightness(1.15)" }} />
    </div>
  );
};

const Bonuses: React.FC = () => {
  const { format } = useLayout();
  const base = format === "vertical" ? 230 : 170;
  return (
    <AbsoluteFill>
      <Stack justify="flex-start" gap={18}>
        <EarlyBird delay={4} size={format === "vertical" ? 54 : 42} />
        <OnePlusOne delay={28} size={format === "vertical" ? 52 : 40} />
        <SuperTicket delay={52} size={format === "vertical" ? 50 : 38} />
      </Stack>
      <AbsoluteFill
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          padding: format === "vertical" ? "0 50px 430px" : format === "square" ? "0 60px 240px" : "0 330px 150px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <GiftBox delay={60} w={base * 0.8} color={`linear-gradient(180deg, #19B0A6, ${COLORS.emerald})`} />
          <GiftBox delay={66} w={base * 0.55} color={`linear-gradient(180deg, #FF6B6B, ${COLORS.coral})`} />
        </div>
        <CashStack delay={10} w={base} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ROOMS = [IMG.balcony2, IMG.living, IMG.dining];
const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(ROOMS.length - 1, Math.floor(frame / 40));
  return (
    <AbsoluteFill>
      <Photo src={ROOMS[idx]} from={1.25} to={1.05} duration={40} filter="saturate(1.1)" />
      <Shade top={0.3} bottom={0.75} />
      <Spotlight strength={0.45} />
      <Flash at={0} dur={22} peak={1} />
      <Particles count={40} seed="v4r" />
      <Stack>
        {/* The gallery photos are of last year's prize apartment. */}
        <Pill size={42} delay={12} bg={COLORS.navy}>
          זוהי הדירה של שנה שעברה
        </Pill>
        <GoldTitle size={150} delay={22}>
          {OFFER.prize}
        </GoldTitle>
        <Headline size={64} delay={34}>
          דירת יוקרה בירושלים
        </Headline>
        <Headline size={60} delay={48} color={COLORS.goldLight}>
          הדירה שלכם עדיין מחכה
        </Headline>
      </Stack>
    </AbsoluteFill>
  );
};

export const V4HallOfWinners: React.FC = () => (
  <VersionShell version="v4" captions={CAPTIONS} cues={CUES} endFrom={SC.end}>
    <Sequence name="Hall (continuous glide)" from={SC.hall} durationInFrames={SC.reveal + 24}>
      <Hall />
    </Sequence>
    <Sequence name="Titles" from={SC.hall} durationInFrames={95}>
      <HallTitles />
    </Sequence>
    <Sequence name="Door title" from={SC.door} durationInFrames={SC.bonus - SC.door}>
      <Fade>
        <DoorTitle />
      </Fade>
    </Sequence>
    <Sequence name="Bonuses" from={SC.bonus} durationInFrames={SC.reveal - SC.bonus}>
      <Bonuses />
    </Sequence>
    <Sequence name="Reveal" from={SC.reveal + 14} durationInFrames={SC.end - SC.reveal - 4}>
      <Reveal />
    </Sequence>
    <Sequence name="Endcard" from={SC.end}>
      <Endcard cta="הצטרפו להיכל הזוכים" credit="8 שנים · זוכים אמיתיים" />
    </Sequence>
  </VersionShell>
);
