import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FONT_FAMILY } from "../RealEstatePromo/theme";

// Clean-up of the supplied 9:16 reel (public/uziel-reel/source.mp4),
// opened by a 2.5s title card:
//  - the "clideo.com" watermark in the bottom-right corner is cropped out
//    by a slight zoom anchored at the top (ZOOM);
//  - the shots that show women are covered by stills (the project's
//    renders and a supplied aerial of the street), animated with a slow
//    pan and push-in (public/uziel/*.jpg) with the reel's caption panels recreated on top,
//    faded in and out on the same timings as the original captions;
//  - the original music is replaced by scripts/generate-uziel-reel-music.mjs.

export const REEL_FPS = 24;
const f0 = (s: number) => Math.round(s * REEL_FPS);
// Title card added in front of the reel; everything after it is the
// cleaned-up source, shifted by INTRO.
const INTRO = f0(2.5);
export const REEL_DURATION = INTRO + 30 * REEL_FPS;
const f = (s: number) => Math.round(s * REEL_FPS);

const ZOOM = 1.06;
const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const GOLD = "#D5AE75";

type PanelSpec = {
  header?: string;
  title: string;
  titleGold?: boolean;
  lines?: string[];
};

// The reel's caption panel: dark translucent box with a gold bar above it,
// bottom edge at y≈1450 in the 1080×1920 source.
const Panel: React.FC<PanelSpec & { opacity: number }> = ({
  header,
  title,
  titleGold,
  lines = [],
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      bottom: 1920 - 1450,
      left: "50%",
      transform: "translateX(-50%)",
      opacity,
      fontFamily: FONT_FAMILY,
      direction: "rtl",
      textAlign: "center",
      color: "#fff",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -26,
        left: "50%",
        width: 96,
        height: 5,
        marginLeft: -48,
        borderRadius: 3,
        background: GOLD,
      }}
    />
    <div
      style={{
        background: "rgba(12,12,14,0.5)",
        border: "2px solid rgba(255,255,255,0.18)",
        borderRadius: 34,
        padding: "26px 54px 30px",
        whiteSpace: "nowrap",
        textShadow: "0 2px 8px rgba(0,0,0,0.35)",
      }}
    >
      {header ? (
        <div style={{ fontSize: 44, fontWeight: 700, color: GOLD }}>
          {header}
        </div>
      ) : null}
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          lineHeight: 1.2,
          color: titleGold ? GOLD : "#fff",
        }}
      >
        {title}
      </div>
      {lines.map((l) => (
        <div
          key={l}
          style={{
            fontSize: 44,
            fontWeight: 400,
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {l}
        </div>
      ))}
    </div>
  </div>
);

const PANELS: Record<string, PanelSpec> = {
  hook: {
    title: "הזדמנות נדל״נית מנצחת",
    lines: ["בלב רמת גן", "מרחק נגיעה מבני ברק"],
  },
  location: {
    title: "צמוד לבני ברק ולגבעתיים",
    lines: [
      "לוקיישן מרכזי עם פוטנציאל אדיר",
      "לשכירות זמינה ולהשבחה ארוכת טווח",
    ],
  },
  terms: {
    header: "תנאי מימון",
    title: "משלמים 15% בלבד בחתימה",
    lines: ["והיתרה באכלוס"],
  },
  spec: {
    header: "מפרט עשיר",
    title: "מגדל יוקרה + בנייני בוטיק",
    lines: ["חדר כושר לדיירים · מיזוג VRF · בית חכם"],
  },
  presale: {
    title: "הזדמנות פרי-סייל חמה",
    titleGold: true,
    lines: ["5 דירות מיוחדות", "מתחת למחירי השוק"],
  },
};

type Cue = {
  panel: keyof typeof PANELS;
  in: [number, number];
  out?: [number, number];
};

// Source shots that show women (exact source frame ranges), covered by a
// render. Cue times are in seconds of the source and
// copy the original captions' fades.
const COVERS: {
  from: number;
  to: number;
  image: string;
  pan: [number, number];
  cues: Cue[];
}[] = [
  {
    from: 72 / REEL_FPS,
    to: 143 / REEL_FPS,
    image: "street-aerial",
    pan: [62, 38],
    cues: [
      { panel: "hook", in: [0, 0], out: [3.2, 3.9] },
      { panel: "location", in: [4.5, 5.0] },
    ],
  },
  {
    from: 216 / REEL_FPS,
    to: 285 / REEL_FPS,
    image: "hero-rooftop",
    pan: [40, 55],
    cues: [{ panel: "terms", in: [0, 0] }],
  },
  {
    from: 360 / REEL_FPS,
    to: 434 / REEL_FPS,
    image: "penthouse-living",
    pan: [25, 55],
    cues: [{ panel: "spec", in: [0, 0] }],
  },
  {
    from: 434 / REEL_FPS,
    to: 509 / REEL_FPS,
    image: "skyline-sunset",
    pan: [70, 85],
    cues: [
      { panel: "spec", in: [0, 0], out: [18.2, 18.6] },
      { panel: "presale", in: [19.6, 20.0] },
    ],
  },
];

const Cover: React.FC<(typeof COVERS)[number]> = ({
  from,
  to,
  image,
  pan,
  cues,
}) => {
  const frame = useCurrentFrame();
  const len = f(to - from);
  const t = from + frame / REEL_FPS;
  const p = frame / len;
  return (
    <AbsoluteFill>
      <Img
        src={staticFile(`uziel/${image}.jpg`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${interpolate(p, [0, 1], pan)}% 50%`,
          transform: `scale(${interpolate(p, [0, 1], [1.12, 1.02])})`,
        }}
      />
      {cues.map((c, i) => {
        const fadeIn =
          c.in[1] > c.in[0] ? interpolate(t, c.in, [0, 1], clamp) : 1;
        const fadeOut = c.out ? interpolate(t, c.out, [1, 0], clamp) : 1;
        return (
          <Panel key={i} {...PANELS[c.panel]} opacity={fadeIn * fadeOut} />
        );
      })}
    </AbsoluteFill>
  );
};

// Opening title card, in the reel's own caption style.
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / REEL_FPS;
  const rise = (start: number) => ({
    opacity: interpolate(t, [start, start + 0.35], [0, 1], clamp),
    transform: `translateY(${interpolate(t, [start, start + 0.35], [40, 0], clamp)}px)`,
  });
  return (
    <AbsoluteFill
      style={{ opacity: interpolate(frame, [INTRO, INTRO + 6], [1, 0], clamp) }}
    >
      <Img
        src={staticFile("uziel/tower-night.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "62% 50%",
          transform: `scale(${interpolate(frame, [0, INTRO], [1.15, 1.05], clamp)})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 420,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          direction: "rtl",
          color: "#fff",
          textShadow: "0 4px 18px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            fontSize: 112,
            fontWeight: 900,
            lineHeight: 1.1,
            ...rise(0.1),
          }}
        >
          אל תפספסו
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1.15,
            color: GOLD,
            ...rise(0.4),
          }}
        >
          את ההשקעה הזאת
        </div>
      </div>
      <Panel
        title="5 דירות להשקעה"
        lines={["במיקום נדיר"]}
        opacity={interpolate(t, [0.9, 1.3], [0, 1], clamp)}
      />
    </AbsoluteFill>
  );
};

export const UzielReelClean: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{ transform: `scale(${ZOOM})`, transformOrigin: "50% 0%" }}
      >
        <Sequence durationInFrames={INTRO + 6}>
          <Intro />
        </Sequence>
        <Sequence from={INTRO}>
          <OffthreadVideo src={staticFile("uziel-reel/source.mp4")} muted />
          {COVERS.map((c) => (
            <Sequence
              key={c.from}
              from={f(c.from)}
              durationInFrames={f(c.to - c.from)}
            >
              <Cover {...c} />
            </Sequence>
          ))}
        </Sequence>
      </AbsoluteFill>
      <Html5Audio
        src={staticFile("uziel-reel/music.mp3")}
        volume={(fr) =>
          interpolate(
            fr,
            [0, 6, REEL_DURATION - 24, REEL_DURATION],
            [0, 0.85, 0.85, 0],
            clamp,
          )
        }
      />
    </AbsoluteFill>
  );
};
