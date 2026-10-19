import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Img,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { IMG } from "../DreamRaffle9/theme";
import { Cursor } from "../DreamRaffle9Anim/art";
import manifest from "../../public/dreamcine/manifest.json";

// Cinematic live-action cut of the US "Rent vs. $0 mortgage" ad. The people
// shots are generated on fal.ai (scripts/fal-cinematic.mjs); until a shot's
// clip exists the composition shows its still, the real photo it is
// animated from, or a labelled placeholder, so it doubles as an animatic.
// Score: npm run dreamcine-score.

loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat.woff2"),
  weight: "100 900",
});
loadFont({
  family: "Oswald",
  url: staticFile("fonts/Oswald.woff2"),
  weight: "200 700",
});

const SANS = "Montserrat";
const COND = "Oswald";
const C = {
  gold: "#E8C26A",
  green: "#22C55E",
  greenDark: "#15803D",
  red: "#EF4444",
  white: "#FFFFFF",
  ink: "#0B1220",
};
const SHADOW = "0 3px 18px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.9)";
const HAVE = manifest as Record<string, boolean>;

export const CINE_FPS = 30;

type Shot = {
  id: string;
  duration: number;
  // Real footage of this year's apartment (public/dreamcine/apartment),
  // cut from the client's walkthrough with its burned-in captions cropped off.
  footage?: string;
  // Source shown before the fal.ai clip exists.
  still?: string;
  photo?: string;
  placeholder: string;
  grade: string;
};

const SHOTS: Shot[] = [
  {
    id: "rent",
    duration: 150,
    still: "rent",
    placeholder:
      "Young man in a cramped NYC rental, sighing at the rent charge on his phone",
    grade: "saturate(0.7) hue-rotate(10deg) brightness(0.9) contrast(1.08)",
  },
  {
    id: "jerusalem",
    duration: 120,
    photo: "kotel",
    placeholder: "Aerial drift over the Old City at golden hour",
    grade: "saturate(1.1) contrast(1.05)",
  },
  {
    id: "living",
    duration: 120,
    footage: "living",
    placeholder: "Pan from the sofa to the dining area",
    grade: "saturate(1.05) contrast(1.05) sepia(0.08)",
  },
  {
    id: "view",
    duration: 90,
    footage: "bedroom",
    placeholder: "Pan across the bedroom",
    grade: "saturate(1.08) contrast(1.05) sepia(0.1)",
  },
  {
    id: "key",
    duration: 90,
    still: "key",
    placeholder: "A hand turns a brass key; warm light floods out",
    grade: "saturate(1.05) contrast(1.08) sepia(0.12)",
  },
  {
    id: "cause",
    duration: 120,
    placeholder: "",
    grade: "sepia(0.18) saturate(1.05) brightness(0.85)",
  },
  {
    id: "couch",
    duration: 120,
    still: "couch",
    placeholder:
      "The same man on a sofa in a sunlit Jerusalem apartment, taps his phone and smiles",
    grade: "saturate(1.05) contrast(1.05) sepia(0.1)",
  },
  { id: "end", duration: 150, placeholder: "", grade: "" },
];

const START: Record<string, number> = {};
SHOTS.reduce((t, s) => {
  START[s.id] = t;
  return t + s.duration;
}, 0);
export const CINE_DURATION = SHOTS.reduce((t, s) => t + s.duration, 0);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Slow push for stills/photos so the animatic still feels like camera work.
const Push: React.FC<{ src: string; filter: string }> = ({ src, filter }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], [1.04, 1.14], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${s})`,
          filter,
        }}
      />
    </AbsoluteFill>
  );
};

const Footage: React.FC<{ shot: Shot }> = ({ shot }) => {
  if (shot.footage || HAVE[shot.id]) {
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile(
            shot.footage
              ? `dreamcine/apartment/${shot.footage}.mp4`
              : `dreamcine/clips/${shot.id}.mp4`,
          )}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: shot.grade,
          }}
        />
      </AbsoluteFill>
    );
  }
  if (shot.still && HAVE[`still:${shot.still}`]) {
    return (
      <Push
        src={staticFile(`dreamcine/stills/${shot.still}.jpg`)}
        filter={shot.grade}
      />
    );
  }
  if (shot.photo) {
    return (
      <Push
        src={staticFile(`dreamcine/src/${shot.photo}.jpg`)}
        filter={shot.grade}
      />
    );
  }
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #1F2A44, #0B1220)",
        alignItems: "center",
        justifyContent: "center",
        padding: 120,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: "0.2em",
          color: C.gold,
          marginBottom: 20,
        }}
      >
        AI SHOT · PENDING
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 44,
          color: "rgba(255,255,255,0.8)",
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {shot.placeholder}
      </div>
    </AbsoluteFill>
  );
};

// Film look: vignette and moving grain (letterbox bars are drawn on top).
const FilmLook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.08,
          mixBlendMode: "overlay",
        }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={Math.floor(random(`g${frame}`) * 1000)}
          />
        </filter>
        <rect width={1080} height={1920} filter="url(#grain)" />
      </svg>
    </>
  );
};

// Cinematic title: fades and rises in slowly, with letter-spacing settling.
const Title: React.FC<{
  children: React.ReactNode;
  at: number;
  size?: number;
  color?: string;
  font?: string;
  weight?: number;
  out?: number;
}> = ({
  children,
  at,
  size = 84,
  color = C.white,
  font = SANS,
  weight = 800,
  out,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || (out !== undefined && frame > out + 8)) return null;
  const p = interpolate(frame - at, [0, 14], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const o =
    out !== undefined ? interpolate(frame, [out, out + 8], [1, 0], clamp) : 1;
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        color,
        textAlign: "center",
        lineHeight: 1.08,
        textShadow: SHADOW,
        opacity: p * o,
        transform: `translateY(${(1 - p) * 30}px)`,
        letterSpacing: `${(1 - p) * 0.12}em`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

const Lines: React.FC<{
  children: React.ReactNode;
  top?: number;
  bottom?: number;
}> = ({ children, top, bottom }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top,
      bottom,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
    }}
  >
    {children}
  </div>
);

const CAUSE = [
  { src: IMG.soldiers, label: "Support for IDF soldiers" },
  { src: IMG.ambulance, label: "Emergency medical equipment" },
  { src: IMG.torah, label: "Torah scrolls for IDF bases" },
];

const Cause: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {CAUSE.map((c, i) => (
        <Sequence key={c.src} from={i * 40} layout="none">
          <AbsoluteFill
            style={{
              opacity: interpolate(frame - i * 40, [0, 12], [0, 1], clamp),
            }}
          >
            <Push
              src={staticFile(c.src)}
              filter="sepia(0.18) saturate(1.05) brightness(0.8)"
            />
          </AbsoluteFill>
          <div
            style={{
              position: "absolute",
              bottom: 300,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 34,
              color: "rgba(255,255,255,0.9)",
              textShadow: SHADOW,
            }}
          >
            {c.label}
          </div>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  const btn = spring({ frame: frame - 34, fps, config: { damping: 11 } });
  const tap = 80;
  const press = frame >= tap && frame < tap + 6;
  const ripple = interpolate(frame - tap, [0, 18], [0, 1], clamp);
  const pulse = 1 + 0.03 * Math.sin(frame * 0.25);
  const cx = interpolate(frame, [50, tap], [960, 640], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const cy = interpolate(frame, [50, tap], [1750, 1240], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <AbsoluteFill>
      <Push
        src={staticFile("dreamcine/src/kotel.jpg")}
        filter="brightness(0.35) blur(4px) saturate(1.1)"
      />
      <Lines top={170}>
        {/* Cream backing: the logo's dark-brown arc text ("Back for the 9th
            year") and skyline outline vanish on the dark end card. */}
        <div
          style={{
            padding: "34px 40px 30px",
            borderRadius: 48,
            background: "#F6EEDF",
            boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
            opacity: logo,
            transform: `scale(${0.9 + 0.1 * logo})`,
          }}
        >
          <Img
            src={staticFile("dreamus/logo-en.png")}
            style={{ width: 400, display: "block" }}
          />
        </div>
      </Lines>
      <Lines top={780}>
        <Title at={14} size={70}>
          Win a $1.3M home
        </Title>
        <Title at={20} size={70} color={C.gold}>
          in Jerusalem
        </Title>
      </Lines>
      <div
        style={{
          position: "absolute",
          top: 1010,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            transform: `scale(${btn * pulse * (press ? 0.94 : 1)})`,
            opacity: Math.min(1, btn * 2),
          }}
        >
          {frame >= tap ? (
            <div
              style={{
                position: "absolute",
                inset: -12,
                borderRadius: 36,
                border: `7px solid ${C.green}`,
                transform: `scale(${1 + ripple * 0.3})`,
                opacity: 1 - ripple,
              }}
            />
          ) : null}
          <div
            style={{
              borderRadius: 36,
              padding: "28px 64px",
              background: `linear-gradient(135deg, #34D399, ${C.green} 50%, ${C.greenDark})`,
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: COND,
                fontWeight: 700,
                fontSize: 90,
                color: C.white,
                lineHeight: 1.05,
              }}
            >
              TAP THE LINK »
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 38,
                color: C.white,
              }}
            >
              DOUBLE YOUR CHANCES NOW
            </div>
          </div>
        </div>
      </div>
      <Lines top={1400}>
        <Title at={44} size={48} color={C.gold}>
          thedreamraffle.com
        </Title>
        <Title at={50} size={32} weight={700}>
          1+1 FREE · $15K bonus ends 11/11
        </Title>
      </Lines>
      {frame >= 50 ? <Cursor x={cx} y={cy} press={press} /> : null}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 21,
          color: "rgba(255,255,255,0.75)",
        }}
      >
        Subject to official raffle rules · Every ticket supports the Am Yisrael
        Chai Foundation
      </div>
    </AbsoluteFill>
  );
};

// Titles per shot (shot-local frames).
const TITLES: Record<string, React.ReactNode> = {
  rent: (
    <>
      <Lines top={260}>
        <Title at={10} size={64} weight={700}>
          Your rent:
        </Title>
        <Title at={18} size={170} color={C.red} font={COND} weight={700}>
          $2,500/mo
        </Title>
      </Lines>
      <Lines bottom={330}>
        <Title at={80} size={130} font={COND} weight={700}>
          FOREVER.
        </Title>
      </Lines>
    </>
  ),
  jerusalem: (
    <Lines top={300}>
      <Title at={8} size={64} weight={700}>
        This apartment:
      </Title>
      <Title at={16} size={150} color={C.green} font={COND} weight={700}>
        $0 MORTGAGE
      </Title>
      <Title at={40} size={110} font={COND} weight={700}>
        EVER.
      </Title>
    </Lines>
  ),
  living: (
    <Lines top={260}>
      <Title at={6} size={52} weight={700}>
        A $1.3 million luxury apartment
      </Title>
      <Title at={14} size={130} color={C.gold} font={COND} weight={700}>
        IN JERUSALEM
      </Title>
      <Title at={50} size={52} weight={700}>
        Fully furnished
      </Title>
    </Lines>
  ),
  view: (
    <Lines top={300}>
      <Title at={4} size={110} font={COND} weight={700}>
        BUY 1 TICKET
      </Title>
      <Title at={20} size={150} color={C.green} font={COND} weight={700}>
        GET 1 FREE
      </Title>
      <Title at={44} size={56} weight={800} color={C.gold}>
        Double your chances
      </Title>
    </Lines>
  ),
  key: (
    <Lines top={300}>
      <Title at={6} size={60} weight={700}>
        Plus an early-bird
      </Title>
      <Title at={12} size={150} color={C.gold} font={COND} weight={700}>
        $15,000
      </Title>
      <Title at={20} size={80} font={COND} weight={700}>
        CASH BONUS
      </Title>
      <Title at={46} size={50} weight={800} color={C.red}>
        Ends November 11
      </Title>
    </Lines>
  ),
  cause: (
    <Lines top={260}>
      <Title at={8} size={60} weight={700}>
        And every ticket supports
      </Title>
      <Title at={16} size={140} color={C.gold} font={COND} weight={700}>
        IDF SOLDIERS
      </Title>
      <Title at={30} size={56} weight={700}>
        &amp; their families
      </Title>
    </Lines>
  ),
  couch: (
    <>
      <Lines top={240}>
        <Title at={4} size={54} weight={700} out={56}>
          Worst case?
        </Title>
        <Title at={8} size={54} weight={700} out={56}>
          You supported Israel&apos;s heroes.
        </Title>
        <Title
          at={22}
          size={96}
          color={C.gold}
          font={COND}
          weight={700}
          out={56}
        >
          BEST CASE?
        </Title>
        <Title
          at={28}
          size={96}
          color={C.gold}
          font={COND}
          weight={700}
          out={56}
        >
          YOU GET THE KEYS.
        </Title>
      </Lines>
      <Lines top={240}>
        <Title at={66} size={64} weight={700}>
          The 1+1 deal ends soon
        </Title>
        <Title at={76} size={110} color={C.red} font={COND} weight={700}>
          DON&apos;T MISS IT
        </Title>
      </Lines>
    </>
  ),
};

export const DreamRaffleCine: React.FC = () => {
  const frame = useCurrentFrame();
  const bars = interpolate(frame, [0, 24], [260, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "black", fontFamily: SANS }}>
      <Html5Audio src={staticFile("dreamcine/score.mp3")} />
      {SHOTS.map((shot, i) => (
        <Sequence
          key={shot.id}
          name={shot.id}
          from={START[shot.id]}
          durationInFrames={shot.duration + (i < SHOTS.length - 1 ? 10 : 0)}
        >
          <CrossFade first={i === 0}>
            {shot.id === "cause" ? (
              <Cause />
            ) : shot.id === "end" ? (
              <End />
            ) : (
              <Footage shot={shot} />
            )}
            {TITLES[shot.id] ?? null}
          </CrossFade>
        </Sequence>
      ))}
      <FilmLook />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: bars,
          background: "black",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: bars,
          background: "black",
        }}
      />
    </AbsoluteFill>
  );
};

// Each shot dissolves in over the previous one (which runs 10 frames long).
const CrossFade: React.FC<{ children: React.ReactNode; first: boolean }> = ({
  children,
  first,
}) => {
  const frame = useCurrentFrame();
  const o = first ? 1 : interpolate(frame, [0, 10], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
