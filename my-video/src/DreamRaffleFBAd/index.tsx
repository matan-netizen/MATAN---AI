// 21 s vertical Facebook/Instagram Reels ad for The Dream Raffle (U.S. audience).
//
// Built only from the supplied footage: the balcony "Do you have a ticket yet?"
// clip and the office/apartment-tour clip. Spoken lines carry their own
// burned-in English captions from the source edits; this composition adds the
// hook headline, benefit labels, a music bed and the logo end card.
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";

const FONT = "Heebo";
for (const weight of ["700", "900"]) {
  loadFont({ family: FONT, url: staticFile(`fonts/Heebo-${weight}.ttf`), weight });
}

export const FB_FPS = 30;
const f = (s: number) => Math.round(s * FB_FPS);

const GOLD = "#D4AA4F";
const GOLD_LIGHT = "#F4D98C";
const BROWN = "#3B2E22";
const INK = "#1B140D";

type Shot = {
  src: "balcony" | "office-tour" | "apartment-2026";
  from: number; // seconds into the source clip
  to: number;
  // Balcony footage is cropped up to keep the Hebrew for-sale banner (and its
  // private phone number) out of frame.
  crop?: boolean;
  // Muted, blurred footage under a full-screen prize card. Used where the
  // speaker names last year's prize value, so the current figure is on screen.
  card?: boolean;
  // Apartment footage from an earlier edition: labelled as such.
  old?: boolean;
  // This year's apartment, shown in a frame cropped clear of the source
  // promo's logo and headline.
  gallery?: boolean;
};

// Figures follow the official site (thedreamraffle.co.il): a brand-new $1.3M
// luxury apartment in Jerusalem, 9th year, 1+1 on all orders. Cut points sit on
// word boundaries from the Whisper transcript; lines stating last edition's
// figures ("$1.2 million", "seven winners ... the eighth") are left out.
const SHOTS: Shot[] = [
  { src: "balcony", from: 5.0, to: 6.1, crop: true }, // "Do you have a ticket yet?"
  { src: "balcony", from: 12.0, to: 13.1, crop: true }, // "What's the Dream Raffle?"
  { src: "balcony", from: 13.1, to: 15.4, crop: true, card: true }, // answered by the prize card
  { src: "office-tour", from: 19.4, to: 21.5, old: true }, // "One bedroom, second bedroom, beautiful bedroom"
  { src: "office-tour", from: 27.65, to: 31.0, old: true }, // "Look at this beautiful dining room, this fantastic living room" (stops before "with all the furniture": furnishing is an add-on this year)
  { src: "apartment-2026", from: 0.1, to: 2.1, gallery: true }, // this year's apartment: set table
  { src: "apartment-2026", from: 2.5, to: 4.2, gallery: true }, // this year's apartment: dining area
  { src: "office-tour", from: 24.7, to: 26.25, old: true }, // "And you have a beautiful chance to win"
  { src: "balcony", from: 20.0, to: 22.1, crop: true }, // "Now's the time. What are you waiting for?"
];
const CARD = SHOTS.findIndex((s) => s.card);
const GALLERY = SHOTS.findIndex((s) => s.gallery);
const GALLERY_END = GALLERY + SHOTS.filter((s) => s.gallery).length;

const starts: number[] = [];
SHOTS.reduce((acc, s) => {
  starts.push(acc);
  return acc + f(s.to - s.from);
}, 0);
starts.push(starts[starts.length - 1] + f(SHOTS[SHOTS.length - 1].to - SHOTS[SHOTS.length - 1].from));
const VIDEO_END = starts[SHOTS.length];
const END_CARD = f(3.6);
export const FB_DURATION = VIDEO_END + END_CARD;

const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const len = f(shot.to - shot.from);
  // Slow punch-in keeps static talking shots moving.
  const push = interpolate(frame, [0, len], [1, 1.05]);
  const base = shot.crop ? 1.28 : 1;
  const blur = shot.card ? interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" }) : 0;
  if (shot.gallery) return <GalleryView shot={shot} />;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
      <OffthreadVideo
        src={staticFile(`fb-ad/${shot.src}.mp4`)}
        startFrom={f(shot.from)}
        muted={shot.card}
        style={{
          width: 1080,
          height: 1920,
          transform: `scale(${base * push})`,
          transformOrigin: shot.crop ? "50% 0%" : "50% 50%",
          filter: blur > 0 ? `blur(${blur * 40}px) brightness(${1 - blur * 0.45})` : undefined,
        }}
      />
      {shot.card ? <PrizeCard /> : null}
      {shot.old ? <OldFootageTag /> : null}
    </AbsoluteFill>
  );
};

const OldFootageTag: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", top: 1250 }}>
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 36,
        color: "white",
        background: "rgba(0,0,0,0.62)",
        padding: "8px 24px",
        borderRadius: 999,
        border: "2px solid rgba(255,255,255,0.35)",
      }}
    >
      Footage from previous raffles
    </div>
  </AbsoluteFill>
);

// Window onto the source promo's apartment shots, clear of its logo (above
// y=380) and headline (below y=1030).
const WINDOW = { y: 380, h: 650 };
const FRAME_W = 1000;
const GalleryView: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const k = FRAME_W / 1080;
  const push = interpolate(frame, [0, f(shot.to - shot.from)], [1, 1.06]);
  const src = staticFile(`fb-ad/${shot.src}.mp4`);
  return (
    <AbsoluteFill style={{ backgroundColor: "#140E09" }}>
      <OffthreadVideo
        src={src}
        startFrom={f(shot.from)}
        muted
        style={{ width: 1080, height: 1920, filter: "blur(36px) brightness(0.45)", transform: "scale(1.15)" }}
      />
      <div
        style={{
          position: "absolute",
          left: (1080 - FRAME_W) / 2,
          top: 640,
          width: FRAME_W,
          height: WINDOW.h * k,
          overflow: "hidden",
          borderRadius: 22,
          border: `5px solid ${GOLD}`,
          boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 40px ${GOLD}55`,
        }}
      >
        <OffthreadVideo
          src={src}
          startFrom={f(shot.from)}
          muted
          style={{
            position: "absolute",
            left: 0,
            top: -WINDOW.y * k,
            width: FRAME_W,
            height: 1920 * k,
            transform: `scale(${push})`,
            transformOrigin: `50% ${((WINDOW.y + WINDOW.h / 2) / 1920) * 100}%`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const GalleryText: React.FC = () => {
  const a = usePop(2);
  const b = usePop(8);
  const c = usePop(16);
  return (
    <AbsoluteFill style={{ alignItems: "center", fontFamily: FONT, fontWeight: 900, textAlign: "center" }}>
      <div style={{ position: "absolute", top: 300, fontSize: 60, color: "white", textTransform: "uppercase", opacity: a }}>
        This year&apos;s apartment
      </div>
      <div
        style={{
          position: "absolute",
          top: 375,
          fontSize: 190,
          lineHeight: 1,
          color: GOLD_LIGHT,
          textShadow: "0 10px 40px rgba(0,0,0,0.6)",
          opacity: b,
          transform: `scale(${interpolate(b, [0, 1], [0.6, 1])})`,
        }}
      >
        $1.3M
      </div>
      <div
        style={{
          position: "absolute",
          top: 1275,
          fontSize: 62,
          lineHeight: 1.15,
          color: INK,
          background: `linear-gradient(180deg, ${GOLD_LIGHT}, ${GOLD})`,
          padding: "16px 40px",
          borderRadius: 24,
          opacity: c,
          transform: `translateY(${(1 - c) * 30}px)`,
        }}
      >
        This year it&apos;s even
        <br />
        more luxurious
      </div>
    </AbsoluteFill>
  );
};

const PrizeCard: React.FC = () => {
  const a = usePop(2);
  const b = usePop(9);
  const c = usePop(16);
  const line = (p: number): React.CSSProperties => ({
    fontFamily: FONT,
    fontWeight: 900,
    textAlign: "center",
    textShadow: "0 10px 40px rgba(0,0,0,0.6)",
    opacity: p,
    transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`,
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...line(a), fontSize: 92, color: "white" }}>A</div>
      <div style={{ ...line(b), fontSize: 230, lineHeight: 1, color: GOLD_LIGHT }}>$1.3M</div>
      <div style={{ ...line(c), fontSize: 66, lineHeight: 1.12, color: "white", textTransform: "uppercase" }}>
        brand-new luxury
        <br />
        apartment in <span style={{ color: GOLD_LIGHT }}>Jerusalem</span>
      </div>
    </AbsoluteFill>
  );
};

const usePop = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 170, mass: 0.6 } });
};

const Headline: React.FC<{ lines: React.ReactNode[]; top?: number; instant?: boolean }> = ({
  lines,
  top = 300,
  instant = false,
}) => {
  return (
    <AbsoluteFill style={{ alignItems: "center", top }}>
      {lines.map((line, i) => (
        <HeadlineLine key={i} delay={instant ? -60 : i * 4}>
          {line}
        </HeadlineLine>
      ))}
    </AbsoluteFill>
  );
};

const HeadlineLine: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
  const p = usePop(delay);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 82,
        lineHeight: 1.08,
        color: "white",
        textTransform: "uppercase",
        textAlign: "center",
        background: "rgba(20,14,8,0.78)",
        padding: "8px 26px",
        marginBottom: 10,
        borderRadius: 14,
        transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`,
        opacity: Math.min(1, p * 2),
      }}
    >
      {children}
    </div>
  );
};

const Gold: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: GOLD_LIGHT }}>{children}</span>
);

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = usePop(2);
  const line = usePop(10);
  const offer = usePop(16);
  const btn = usePop(22);
  const pulse = 1 + 0.035 * Math.max(0, Math.sin((frame - 30) / 5));
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 38%, #5A4532 0%, ${BROWN} 45%, #17110B 100%)`,
        alignItems: "center",
        fontFamily: FONT,
        opacity: interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      <Img
        src={staticFile("fb-ad/logo.png")}
        style={{
          position: "absolute",
          top: 360,
          width: 640,
          transform: `scale(${interpolate(logo, [0, 1], [0.7, 1])})`,
          opacity: logo,
          filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.55))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 930,
          textAlign: "center",
          color: "white",
          fontWeight: 900,
          fontSize: 66,
          lineHeight: 1.12,
          textTransform: "uppercase",
          opacity: line,
          transform: `translateY(${(1 - line) * 30}px)`,
        }}
      >
        Win a <span style={{ color: GOLD_LIGHT }}>$1.3M</span> luxury
        <br />
        apartment in Jerusalem
      </div>
      <div
        style={{
          position: "absolute",
          top: 1110,
          fontWeight: 900,
          fontSize: 44,
          color: GOLD_LIGHT,
          border: `3px solid ${GOLD}`,
          padding: "8px 30px",
          borderRadius: 999,
          opacity: offer,
          transform: `scale(${interpolate(offer, [0, 1], [0.7, 1])})`,
        }}
      >
        1+1 · All Orders Doubled
      </div>
      <div
        style={{
          position: "absolute",
          top: 1230,
          fontWeight: 900,
          fontSize: 64,
          color: INK,
          background: `linear-gradient(180deg, ${GOLD_LIGHT}, ${GOLD})`,
          padding: "26px 70px",
          borderRadius: 999,
          border: "4px solid #FFF0C2",
          boxShadow: `0 14px 36px rgba(0,0,0,0.55), 0 0 40px ${GOLD}88`,
          transform: `scale(${interpolate(btn, [0, 1], [0.5, 1]) * pulse})`,
          opacity: btn,
          whiteSpace: "nowrap",
        }}
      >
        Get Your Ticket →
      </div>
    </AbsoluteFill>
  );
};

export const DreamRaffleFBAd: React.FC = () => {
  const frame = useCurrentFrame();
  // Music sits under the dialogue and comes up on the end card.
  // Music sits under the dialogue, lifts over the dialogue-free prize card and
  // gallery, and comes up on the end card.
  const lift = (a: number, b: number) =>
    interpolate(frame, [a - 3, a + 3, b - 3, b + 3], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const up = Math.max(
    lift(starts[CARD], starts[CARD + 1]),
    lift(starts[GALLERY], starts[GALLERY_END]),
    lift(VIDEO_END, FB_DURATION + 10),
  );
  const fade = interpolate(frame, [0, 6, FB_DURATION - 12, FB_DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const musicVol = fade * interpolate(up, [0, 1], [0.12, 0.48]);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {SHOTS.map((shot, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={f(shot.to - shot.from)}>
          <ShotView shot={shot} />
        </Sequence>
      ))}

      {/* Hook: headline on screen from the very first frame. */}
      <Sequence durationInFrames={starts[CARD]}>
        <Headline
          lines={[
            <>
              Win a <Gold>$1.3M</Gold>
            </>,
            "apartment in",
            <Gold key="j">Jerusalem</Gold>,
          ]}
          top={250}
          instant
        />
      </Sequence>
      {/* The source's own caption still shows the previous line for a few
          frames here, so the opening question gets its own caption. */}
      <Sequence durationInFrames={starts[1]}>
        <AbsoluteFill style={{ alignItems: "center", top: 1320 }}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 64,
              color: "white",
              background: "#1A120B",
              padding: "0 40px",
              height: 240,
              display: "flex",
              alignItems: "center",
              borderRadius: 18,
              whiteSpace: "nowrap",
            }}
          >
            Do you have a ticket yet?
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={starts[GALLERY]} durationInFrames={starts[GALLERY_END] - starts[GALLERY]}>
        <GalleryText />
      </Sequence>
      <Sequence from={starts[GALLERY_END]} durationInFrames={starts[GALLERY_END + 1] - starts[GALLERY_END]}>
        <Headline lines={["9th year running", <Gold key="n">Will you be next?</Gold>]} top={260} />
      </Sequence>

      <Sequence from={VIDEO_END}>
        <EndCard />
      </Sequence>

      <Audio src={staticFile("fb-ad/music.mp3")} volume={musicVol} />
    </AbsoluteFill>
  );
};
