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
  src: "balcony" | "office-tour";
  from: number; // seconds into the source clip
  to: number;
  // Balcony footage is cropped up to keep the Hebrew for-sale banner (and its
  // private phone number) out of frame.
  crop?: boolean;
  // Source-time window to blur and cover (the source's winners collage
  // carries Hebrew captions).
  mask?: [number, number];
};

// Cut points sit on word boundaries from the Whisper transcript.
const SHOTS: Shot[] = [
  { src: "balcony", from: 5.0, to: 6.1, crop: true }, // "Do you have a ticket yet?"
  { src: "balcony", from: 12.0, to: 16.35, crop: true }, // "What's the Dream Raffle? A $1.2 million apartment in the heart of Yerushalayim."
  { src: "office-tour", from: 19.4, to: 21.5 }, // "One bedroom, second bedroom, beautiful bedroom"
  { src: "office-tour", from: 27.65, to: 32.35 }, // "Look at this beautiful dining room ... this kitchen"
  { src: "office-tour", from: 33.5, to: 36.85, mask: [34.5, 35.5] }, // "We've already had seven winners. You can be the eighth winner"
  { src: "balcony", from: 20.0, to: 22.1, crop: true }, // "Now's the time. What are you waiting for?"
];

const starts: number[] = [];
SHOTS.reduce((acc, s) => {
  starts.push(acc);
  return acc + f(s.to - s.from);
}, 0);
const VIDEO_END = starts[starts.length - 1] + f(SHOTS[SHOTS.length - 1].to - SHOTS[SHOTS.length - 1].from);
const END_CARD = f(3.6);
export const FB_DURATION = VIDEO_END + END_CARD;

const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const len = f(shot.to - shot.from);
  // Slow punch-in keeps static talking shots moving.
  const push = interpolate(frame, [0, len], [1, 1.05]);
  const base = shot.crop ? 1.28 : 1;
  const t = shot.from + frame / FB_FPS;
  const masked = shot.mask
    ? interpolate(t, [shot.mask[0] - 0.08, shot.mask[0], shot.mask[1], shot.mask[1] + 0.08], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
      <OffthreadVideo
        src={staticFile(`fb-ad/${shot.src}.mp4`)}
        startFrom={f(shot.from)}
        style={{
          width: 1080,
          height: 1920,
          transform: `scale(${base * push})`,
          transformOrigin: shot.crop ? "50% 0%" : "50% 50%",
          filter: masked > 0 ? `blur(${masked * 40}px) brightness(${1 - masked * 0.35})` : undefined,
        }}
      />
      {masked > 0 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: masked }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 210, lineHeight: 1, color: GOLD_LIGHT, textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>7</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color: "white", textShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>WINNERS</div>
        </AbsoluteFill>
      ) : null}
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

const Chip: React.FC<{ text: string; top?: number }> = ({ text, top = 330 }) => {
  const p = usePop(3);
  return (
    <AbsoluteFill style={{ alignItems: "center", top }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 58,
          color: INK,
          background: `linear-gradient(180deg, ${GOLD_LIGHT}, ${GOLD})`,
          padding: "14px 36px",
          borderRadius: 999,
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          transform: `translateY(${(1 - p) * -40}px)`,
          opacity: p,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = usePop(2);
  const line = usePop(10);
  const btn = usePop(18);
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
        Win a <span style={{ color: GOLD_LIGHT }}>$1.2M</span> apartment
        <br />
        in Jerusalem
      </div>
      <div
        style={{
          position: "absolute",
          top: 1150,
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
  const musicVol = interpolate(
    frame,
    [0, 6, VIDEO_END - 6, VIDEO_END + 6, FB_DURATION - 12, FB_DURATION],
    [0, 0.12, 0.12, 0.5, 0.5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {SHOTS.map((shot, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={f(shot.to - shot.from)}>
          <ShotView shot={shot} />
        </Sequence>
      ))}

      {/* Hook: headline on screen from the very first frame. */}
      <Sequence  durationInFrames={starts[2]}>
        <Headline
          lines={[
            <>
              Win a <Gold>$1.2M</Gold>
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
      <Sequence  durationInFrames={starts[1]}>
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
      <Sequence from={starts[2]} durationInFrames={starts[4] - starts[2]}>
        <Chip text="Furniture included" />
      </Sequence>
      <Sequence from={starts[4]} durationInFrames={starts[5] - starts[4]}>
        <Headline lines={["7 winners so far", <Gold key="n">Will you be #8?</Gold>]} top={260} />
      </Sequence>

      <Sequence from={VIDEO_END}>
        <EndCard />
      </Sequence>

      <Audio src={staticFile("fb-ad/music.mp3")} volume={musicVol} />
    </AbsoluteFill>
  );
};
