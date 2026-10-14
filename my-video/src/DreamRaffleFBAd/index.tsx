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
  Freeze,
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
  src: "balcony" | "office-tour" | "street" | "apartment-2026" | "tour-bedroom" | "tour-dining" | "tour-living";
  from: number; // seconds into the source clip
  to: number; // picture out-point (source seconds)
  // Source second where the dialogue ends. Defaults to `to`; set later for an
  // L-cut (voice finishes under the next shot). Audio fades over ~2 frames.
  audioOut?: number;
  // Playback speed (slow motion for the room and gallery shots).
  rate?: number;
  // Seconds this shot takes to dissolve in over the previous one.
  fadeIn?: number;
  // Seconds the shot keeps playing (silently) under the next one's fade-in
  // (default XFADE). Shortened where the source runs into Hebrew signage.
  tail?: number;
  // Extra punch-in, so two takes from the same street read as an angle change.
  scale?: number;
  // Balcony footage is cropped up to keep the Hebrew for-sale banner (and its
  // private phone number) out of frame.
  crop?: boolean;
  // Muted, blurred footage under a full-screen prize card. Used where the
  // speaker names last year's prize value, so the current figure is on screen.
  card?: boolean;
  // Apartment footage from an earlier edition: labelled as such.
  old?: boolean;
  // Room name shown on the slowed tour shots.
  label?: string;
  // No sync sound (slowed tour shots play under music).
  silent?: boolean;
  // This year's apartment, shown in a frame cropped clear of the source
  // promo's logo and headline.
  gallery?: boolean;
  // Jump cuts inside the source take (seconds, from scene detection). Each is
  // softened with a short dissolve from the last frame before the cut.
  cuts?: number[];
};

// Follows docs/DreamRaffle_FB_Ad_EditGuide.md. Figures follow the official site
// (thedreamraffle.co.il): a brand-new $1.3M luxury apartment in Jerusalem, 9th
// year, 1+1 on all orders. In/out points sit in the silences between words
// (Whisper word timings); lines stating last edition's figures are left out.
const SHOTS: Shot[] = [
  // "Do you have a ticket yet? Hello. Do you have a ticket? Excuse me. Do you
  // have a ticket over there? Now's the time to buy tickets to the Dream
  // Raffle. What's the Dream Raffle?" ("Raffle?" ends 13.13; "A $1.2…" starts
  // 13.21, so the voice runs to 13.18 under the prize card.)
  { src: "balcony", from: 5.0, to: 13.1, audioOut: 13.18, crop: true, cuts: [6.18, 6.82, 7.7, 9.32, 10.37, 12.1] },
  { src: "balcony", from: 13.1, to: 16.6, crop: true, card: true, silent: true },
  // Previous raffle's apartment: stabilized room shots (from office-tour
  // 20.20, 28.80, 30.20), slowed and played under music.
  { src: "tour-bedroom", from: 0, to: 1.25, rate: 0.6, old: true, silent: true, label: "Bedroom" },
  { src: "tour-dining", from: 0, to: 0.95, rate: 0.5, old: true, silent: true, label: "Dining room", fadeIn: 0.5 },
  { src: "tour-living", from: 0, to: 0.8, rate: 0.5, old: true, silent: true, label: "Living room", fadeIn: 0.5 },
  { src: "apartment-2026", from: 0.1, to: 2.2, rate: 0.55, gallery: true, silent: true }, // this year's apartment: set table
  { src: "apartment-2026", from: 2.4, to: 4.05, rate: 0.55, gallery: true, silent: true, fadeIn: 0.5 }, // dining area
  // "Now is the time. This is the beautiful city, and you could be the winner."
  { src: "street", from: 24.15, to: 27.5, cuts: [25.2, 26.5] },
  // One continuous call to action: "But you have to click on the link and fill
  // out your information. Otherwise, we won't know who to give the apartment
  // to. Buy a ticket, but hurry." ("hurry." ends 20.87.)
  { src: "street", from: 14.3, to: 20.95, cuts: [19.63], scale: 1.12, fadeIn: 0.33 },
];
const CARD = SHOTS.findIndex((s) => s.card);
const GALLERY = SHOTS.findIndex((s) => s.gallery);
const GALLERY_END = GALLERY + SHOTS.filter((s) => s.gallery).length;
const STREET_WIN = SHOTS.findIndex((s) => s.src === "street");

const XFADE = f(0.7);
const SOFT_CUT = f(0.35);
const shotLen = (s: Shot) => f((s.to - s.from) / (s.rate ?? 1));
const tailLen = (s: Shot) => (s.tail === undefined ? XFADE : f(s.tail));

const starts: number[] = [];
SHOTS.reduce((acc, s) => {
  starts.push(acc);
  return acc + shotLen(s);
}, 0);
starts.push(starts[starts.length - 1] + shotLen(SHOTS[SHOTS.length - 1]));
const VIDEO_END = starts[SHOTS.length];
const LOGO_CARD = f(5);
// Dedicated call-to-action slide after the logo card.
const CTA_CARD = f(5);
const END_CARD = LOGO_CARD + CTA_CARD;
export const FB_DURATION = VIDEO_END + END_CARD;

const ShotView: React.FC<{ shot: Shot; first: boolean }> = ({ shot, first }) => {
  const frame = useCurrentFrame();
  const len = shotLen(shot);
  const rate = shot.rate ?? 1;
  const opacity = first
    ? 1
    : interpolate(frame, [0, f(shot.fadeIn ?? 0.7)], [0, 1], { extrapolateRight: "clamp" });
  // Slow push-in keeps every shot gently moving.
  const push = interpolate(frame, [0, len + XFADE], [1, 1.05]);
  const base = (shot.crop ? 1.28 : 1) * (shot.scale ?? 1);
  const audioOut = shot.audioOut ?? shot.to;
  // Dialogue fades out over ~2 frames ending at audioOut, in the silence
  // before the next word; nothing after it is ever heard.
  const volume = (fr: number) =>
    interpolate(shot.from + (fr / FB_FPS) * rate, [audioOut - 0.07, audioOut], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const video = (extra?: React.CSSProperties) => (
    <OffthreadVideo
      src={staticFile(`fb-ad/${shot.src}.mp4`)}
      startFrom={f(shot.from)}
      playbackRate={rate}
      muted={shot.silent}
      volume={shot.silent ? 0 : volume}
      style={{
        width: 1080,
        height: 1920,
        transform: `scale(${base * push})`,
        transformOrigin: shot.crop ? "50% 0%" : "50% 50%",
        ...extra,
      }}
    />
  );
  // Through the tail (under the next shot's dissolve) the last frame holds,
  // so nothing past the out-point shows (old captions, Hebrew signage).
  // (After an L-cut the hold waits until the voice has finished.)
  const hold = frame >= len + f(Math.max(0, (shot.audioOut ?? shot.to) - shot.to) / (shot.rate ?? 1));
  if (shot.gallery)
    return (
      <Freeze frame={len - 1} active={hold}>
        <GalleryView shot={shot} opacity={opacity} />
      </Freeze>
    );
  return (
    <Freeze frame={len - 1} active={hold}>
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black", opacity }}>
      {video(shot.card ? { filter: "blur(60px) brightness(0.5)" } : undefined)}
      {(shot.cuts ?? []).map((c) => {
        const at = f((c - shot.from) / rate);
        const o = interpolate(frame, [at, at + SOFT_CUT], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (frame < at || o <= 0) return null;
        return (
          <Freeze key={c} frame={at - 1}>
            <AbsoluteFill style={{ opacity: o }}>
              <OffthreadVideo
                src={staticFile(`fb-ad/${shot.src}.mp4`)}
                startFrom={f(shot.from)}
                muted
                style={{
                  width: 1080,
                  height: 1920,
                  transform: `scale(${base * push})`,
                  transformOrigin: shot.crop ? "50% 0%" : "50% 50%",
                }}
              />
            </AbsoluteFill>
          </Freeze>
        );
      })}
      {shot.card ? <PrizeCard /> : null}
      {shot.label ? <RoomLabel text={shot.label} /> : null}
      {shot.old ? <OldFootageTag /> : null}
    </AbsoluteFill>
    </Freeze>
  );
};

const RoomLabel: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  return (
    // Sits over the source's burned-in caption line (y≈950–1240): those
    // captions belong to narration that these silent shots no longer play.
    <AbsoluteFill style={{ alignItems: "center", top: 945 }}>
      <div
        style={{
          width: 1040,
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 50,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: "white",
          background: "#140E09",
          border: `2px solid ${GOLD}`,
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        <span style={{ opacity: interpolate(frame, [4, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          {text}
        </span>
      </div>
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
const GalleryView: React.FC<{ shot: Shot; opacity: number }> = ({ shot, opacity }) => {
  const frame = useCurrentFrame();
  const k = FRAME_W / 1080;
  const push = interpolate(frame, [0, shotLen(shot) + XFADE], [1, 1.08]);
  const src = staticFile(`fb-ad/${shot.src}.mp4`);
  return (
    <AbsoluteFill style={{ backgroundColor: "#140E09", opacity }}>
      <OffthreadVideo
        src={src}
        startFrom={f(shot.from)}
        playbackRate={shot.rate}
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
          playbackRate={shot.rate}
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
  const pulse = 1 + 0.03 * Math.max(0, Math.sin((frame - 30) / 5.7)); // ~1.2 s cycle
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 38%, #5A4532 0%, ${BROWN} 45%, #17110B 100%)`,
        alignItems: "center",
        fontFamily: FONT,
        opacity: interpolate(frame, [0, XFADE], [0, 1], { extrapolateRight: "clamp" }),
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

// Closing call-to-action slide: the offer restated, one clear action.
const CtaCard: React.FC = () => {
  const frame = useCurrentFrame();
  const a = usePop(6);
  const b = usePop(14);
  const c = usePop(22);
  const d = usePop(30);
  const btn = usePop(42);
  const pulse = 1 + 0.035 * Math.max(0, Math.sin((frame - 50) / 5.7));
  const arrow = 10 * Math.sin(frame / 6);
  const pop = (p: number, from = 0.7) => ({ opacity: p, transform: `scale(${interpolate(p, [0, 1], [from, 1])})` });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 42%, #6A4F35 0%, ${BROWN} 50%, #120D08 100%)`,
        alignItems: "center",
        fontFamily: FONT,
        textAlign: "center",
        opacity: interpolate(frame, [0, XFADE], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      <Img
        src={staticFile("fb-ad/logo.png")}
        style={{ position: "absolute", top: 250, width: 300, opacity: a, filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.5))" }}
      />
      <div style={{ position: "absolute", top: 560, fontWeight: 900, fontSize: 84, lineHeight: 1.08, color: "white", textTransform: "uppercase", ...pop(b) }}>
        Don&apos;t miss
        <br />
        your chance!
      </div>
      <div style={{ position: "absolute", top: 790, fontWeight: 900, fontSize: 170, lineHeight: 1, color: GOLD_LIGHT, textShadow: "0 10px 40px rgba(0,0,0,0.5)", ...pop(c, 0.5) }}>
        1+1
      </div>
      <div style={{ position: "absolute", top: 975, fontWeight: 700, fontSize: 50, lineHeight: 1.2, color: "white", ...pop(d) }}>
        Buy 1 ticket, get 1 <span style={{ color: GOLD_LIGHT, fontWeight: 900 }}>FREE</span>
        <br />
        on every order
      </div>
      <div
        style={{
          position: "absolute",
          top: 1180,
          fontWeight: 900,
          fontSize: 70,
          color: INK,
          background: `linear-gradient(180deg, ${GOLD_LIGHT}, ${GOLD})`,
          padding: "30px 80px",
          borderRadius: 999,
          border: "4px solid #FFF0C2",
          boxShadow: `0 14px 36px rgba(0,0,0,0.55), 0 0 50px ${GOLD}99`,
          transform: `scale(${interpolate(btn, [0, 1], [0.5, 1]) * pulse})`,
          opacity: btn,
          whiteSpace: "nowrap",
        }}
      >
        Get Your Ticket Now
      </div>
      <div style={{ position: "absolute", top: 1370, fontWeight: 700, fontSize: 40, color: "white", opacity: btn * 0.9 }}>
        Tap the button below
        <div style={{ fontSize: 64, color: GOLD_LIGHT, transform: `translateY(${arrow}px)` }}>↓</div>
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
    // Prize card, room tour and gallery are one dialogue-free stretch.
    lift(starts[CARD], starts[GALLERY_END]),
    // Swell over the last 0.5 s of the call to action into the end card.
    lift(VIDEO_END - f(0.5) + 3, FB_DURATION + 10),
  );
  const fade = interpolate(frame, [0, 6, FB_DURATION - 12, FB_DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const musicVol = fade * interpolate(up, [0, 1], [0.12, 0.48]);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {SHOTS.map((shot, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={shotLen(shot) + tailLen(shot)}>
          {/* The prize card cuts in already blurred, so the source's old
              "$1,200,000" caption never shows through a crossfade. */}
          <ShotView shot={shot} first={i === 0 || Boolean(shot.card)} />
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
      <Sequence durationInFrames={f(1.1)}>
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
      <Sequence from={starts[STREET_WIN]} durationInFrames={starts[STREET_WIN + 1] - starts[STREET_WIN]}>
        <Headline lines={["9th year running", <Gold key="n">Will you be next?</Gold>]} top={260} />
      </Sequence>

      <Sequence from={VIDEO_END} durationInFrames={LOGO_CARD + XFADE}>
        <EndCard />
      </Sequence>
      <Sequence from={VIDEO_END + LOGO_CARD}>
        <CtaCard />
      </Sequence>

      <Audio src={staticFile("fb-ad/music.mp3")} volume={musicVol} />

      {/* Sound design: the whoosh's hit lands 0.35 s in, on the prize card. */}
      <Sequence from={starts[CARD] - f(0.35)}>
        <Audio src={staticFile("fb-ad/sfx-whoosh-hit.mp3")} volume={0.32} />
      </Sequence>
      <Sequence from={starts[GALLERY] + 3}>
        <Audio src={staticFile("fb-ad/sfx-shimmer.mp3")} volume={0.18} />
      </Sequence>
      <Sequence from={VIDEO_END}>
        <Audio src={staticFile("fb-ad/sfx-impact.mp3")} volume={0.3} />
      </Sequence>
      <Sequence from={VIDEO_END + f(0.9)}>
        <Audio src={staticFile("fb-ad/sfx-chime.mp3")} volume={0.16} />
      </Sequence>
      <Sequence from={VIDEO_END + LOGO_CARD + f(0.6)}>
        <Audio src={staticFile("fb-ad/sfx-shimmer.mp3")} volume={0.16} />
      </Sequence>
      <Sequence from={VIDEO_END + LOGO_CARD + f(1.4)}>
        <Audio src={staticFile("fb-ad/sfx-chime.mp3")} volume={0.16} />
      </Sequence>
    </AbsoluteFill>
  );
};
