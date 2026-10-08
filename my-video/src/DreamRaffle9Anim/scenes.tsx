import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { LastYearNote, Stamp, Ticket } from "../DreamRaffle9/components";
import {
  Bills,
  Camera,
  Caption,
  Clock,
  Coffee,
  Confetti,
  Cursor,
  House,
  Ltr,
  MortgageStack,
  Person,
  Skyline,
  Sky,
  Sun,
  Title,
  useSpring,
  Watch,
} from "./art";
import { Character, talkFrom, usePose } from "./Character";
import lipsync from "./lipsync.json";
import { C, FONT, IMG } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LIPS = lipsync as Record<string, number[]>;

const Center: React.FC<{
  children: React.ReactNode;
  top: number;
  gap?: number;
}> = ({ children, top, gap = 8 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap,
    }}
  >
    {children}
  </div>
);

const Cream: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 50% 40%, ${C.white} 0%, ${C.cream} 55%, ${C.sand} 100%)`,
    }}
  />
);

const Navy: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 50% 35%, ${C.navy2} 0%, ${C.navy} 70%)`,
    }}
  />
);

// Soft spotlight disc behind the character on cream scenes.
const Disc: React.FC<{ x: number; y: number; r: number; color?: string }> = ({
  x,
  y,
  r,
  color = C.gold,
}) => {
  const s = useSpring(0, 16);
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: color,
        opacity: 0.18,
        transform: `scale(${s})`,
      }}
    />
  );
};

// 1 — Hook: morning on a Jerusalem balcony.
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const pose = usePose([
    {
      at: 0,
      right: [18, -150],
      left: [6, 8],
      lookX: -0.6,
      lookY: -0.4,
      mood: "smile",
      tilt: -4,
    },
    { at: 50, right: [18, -150], lookX: -0.6, lookY: -0.4 },
    {
      at: 62,
      right: [18, -150],
      left: [80, 20],
      lookX: 0,
      lookY: 0,
      tilt: 4,
      mood: "grin",
      pointLeft: true,
    },
    { at: 100, left: [84, 26], tilt: 2 },
  ]);
  const swap = frame >= 58;
  return (
    <AbsoluteFill>
      <Camera
        keys={[
          { at: 0, scale: 1.25, y: 120 },
          { at: 55, scale: 1.0, y: 0 },
          { at: 100, scale: 1.06, y: -20 },
        ]}
      >
        <Sky />
        <Sun x={300} y={700} r={150} />
        <Skyline y={760} drift={-0.6} />
        {/* Balcony rail */}
        <svg
          width={1080}
          height={420}
          style={{ position: "absolute", top: 1500 }}
        >
          <rect x={0} y={0} width={1080} height={18} rx={9} fill={C.white} />
          {Array.from({ length: 19 }).map((_, i) => (
            <rect
              key={i}
              x={20 + i * 58}
              y={18}
              width={10}
              height={400}
              fill={C.white}
              opacity={0.9}
            />
          ))}
          <rect
            x={0}
            y={150}
            width={1080}
            height={270}
            fill="#C88F5C"
            opacity={0.55}
          />
        </svg>
        <Character
          pose={pose}
          size={1050}
          x={560}
          y={830}
          rightItem={<Coffee />}
          seed="hook"
        />
      </Camera>
      {!swap ? (
        <Center top={210}>
          <Title delay={6} size={92}>
            תדמיין שזה
          </Title>
          <Title delay={14} size={112} pill={C.yellow}>
            הנוף שלך
          </Title>
          <Title delay={22} size={92}>
            כל בוקר…
          </Title>
        </Center>
      ) : (
        <Center top={210}>
          <Title delay={58} size={92}>
            הדירה הזאת
          </Title>
          <Title delay={64} size={92}>
            יכולה להיות
          </Title>
          <Title delay={70} size={150} color={C.white} pill={C.green}>
            שלך!
          </Title>
        </Center>
      )}
    </AbsoluteFill>
  );
};

// 2 — "If you have 660 shekels…"
export const VoA: React.FC = () => {
  const frame = useCurrentFrame();
  const talk = talkFrom(LIPS["a-660-shekel"], frame);
  const pose = usePose([
    { at: 0, right: [10, 10], left: [30, 40], brow: 0.5, mood: "smile" },
    { at: 22, right: [40, -60], left: [30, 40], brow: 1, lookX: -0.8 },
    { at: 60, right: [55, -40], brow: 0.6, lookX: 0 },
    { at: 100, right: [20, 10], left: [70, 30], tilt: -5, brow: 0.8 },
    {
      at: 140,
      left: [140, 30],
      right: [140, 30],
      hop: 18,
      mood: "grin",
      tilt: 0,
    },
    { at: 174, left: [130, 30], right: [130, 30], hop: 0 },
  ]);
  const card = useSpring(28, 11);
  const house = useSpring(112, 10);
  return (
    <AbsoluteFill>
      <Cream />
      <Camera
        keys={[
          { at: 0, scale: 1.08 },
          { at: 174, scale: 1.0 },
        ]}
      >
        <Disc x={380} y={1120} r={420} />
        <Character
          pose={pose}
          talk={talk}
          size={1060}
          x={140}
          y={620}
          rightItem={
            frame > 22 && frame < 100 ? (
              <Bills open={Math.min(1, (frame - 22) / 8)} />
            ) : undefined
          }
          seed="a"
        />
        {/* The 660 card */}
        <div
          style={{
            position: "absolute",
            left: 520,
            top: 520,
            transform: `scale(${card}) rotate(${(1 - card) * 30 + 6}deg)`,
            opacity:
              frame < 100 ? 1 : interpolate(frame, [100, 110], [1, 0], clamp),
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 150,
              color: C.navy,
              background: C.yellow,
              borderRadius: 40,
              padding: "20px 50px",
              boxShadow: "0 20px 40px rgba(19,33,60,0.25)",
            }}
          >
            <Ltr>₪660</Ltr>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 600,
            top: 380,
            transform: `scale(${house})`,
          }}
        >
          <House size={360} glow />
        </div>
      </Camera>
      <Caption
        top={200}
        lines={[
          { at: 0, text: "אם יש לכם" },
          { at: 25, text: <Ltr>660 ₪</Ltr>, hi: true },
          { at: 72, text: "יש סיכוי טוב" },
          { at: 108, text: "שתזכו בדירה" },
          { at: 140, text: "בירושלים!", hi: true },
        ]}
      />
    </AbsoluteFill>
  );
};

const PHOTOS = [IMG.living, IMG.kitchen, IMG.bedroom, IMG.balcony, IMG.view];

// 3 — The prize: a carousel of the apartment with the value counting up.
export const Apartment: React.FC = () => {
  const frame = useCurrentFrame();
  const value = interpolate(frame, [20, 120], [0, 1300000], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const landed = useSpring(120, 9);
  const peek = usePose([
    { at: 0, lookX: 1, lookY: -0.6, brow: 1, mood: "surprise" },
    { at: 60, lookX: -1, lookY: -0.6 },
    { at: 120, lookX: 0, lookY: -0.4, mood: "grin" },
    { at: 180, lookX: 0.6 },
  ]);
  return (
    <AbsoluteFill>
      <Navy />
      <Center top={150}>
        <Title delay={2} size={78} color={C.white}>
          דירת יוקרה מרוהטת
        </Title>
        <Title delay={8} size={110} pill={C.yellow}>
          בירושלים
        </Title>
      </Center>
      {/* Carousel */}
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 0,
          width: 1080,
          height: 640,
          perspective: 1600,
        }}
      >
        {PHOTOS.map((src, i) => {
          const pos = i - frame / 36;
          const x = 540 + pos * 620 - 310;
          const rot = pos * -24;
          const scale = 1 - Math.min(0.25, Math.abs(pos) * 0.18);
          return (
            <div
              key={src}
              style={{
                position: "absolute",
                left: x,
                top: 0,
                width: 620,
                height: 620,
                borderRadius: 36,
                overflow: "hidden",
                border: `8px solid ${C.white}`,
                boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
                transform: `rotateY(${rot}deg) scale(${scale})`,
                opacity: Math.abs(pos) > 1.6 ? 0 : 1,
              }}
            >
              <Img
                src={staticFile(src)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          );
        })}
      </div>
      <Center top={1220} gap={0}>
        <Title delay={14} size={56} weight={700} color={C.white}>
          בשווי
        </Title>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 150,
            color: C.yellow,
            direction: "ltr",
            transform: `scale(${1 + 0.12 * landed - 0.12 * Math.max(0, landed - 1)})`,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          ${(Math.round(value / 1000) * 1000).toLocaleString("en-US")}
        </div>
      </Center>
      {/* The mascot peeking in from the corner, eyes on the photos. */}
      <div
        style={{
          position: "absolute",
          left: -40,
          top: 1480,
          transform: `translateY(${interpolate(frame, [30, 45], [400, 0], clamp)}px) rotate(12deg)`,
        }}
      >
        <Character pose={peek} size={760} seed="peek" />
      </div>
      <LastYearNote />
    </AbsoluteFill>
  );
};

// 4 — "An apartment for 660 shekels, with no mortgage."
export const VoB: React.FC = () => {
  const frame = useCurrentFrame();
  const talk = talkFrom(LIPS["b-no-mortgage"], frame);
  const pose = usePose([
    {
      at: 0,
      right: [10, 10],
      left: [20, 30],
      lookX: -0.8,
      brow: -0.3,
      mood: "serious",
    },
    { at: 55, left: [20, 30], lookX: -0.8 },
    { at: 66, left: [120, 40], lookX: -1, brow: 1, mood: "grin", lean: -4 },
    { at: 80, left: [30, -30], lean: 2 },
    { at: 114, left: [30, -20], lookX: 0, lean: 0 },
  ]);
  const blow = interpolate(frame, [68, 98], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  return (
    <AbsoluteFill>
      <Cream />
      <Camera
        keys={[
          { at: 0, scale: 1.05, x: 30 },
          { at: 114, scale: 1.0, x: 0 },
        ]}
      >
        <div style={{ position: "absolute", left: 40, top: 640 }}>
          <MortgageStack blow={blow} />
        </div>
        <Character
          pose={pose}
          talk={talk}
          size={1000}
          x={560}
          y={700}
          seed="b"
        />
        <div style={{ position: "absolute", left: 60, top: 860 }}>
          <Stamp delay={82} size={96} color={C.greenDark}>
            בלי משכנתא!
          </Stamp>
        </div>
      </Camera>
      <Caption
        top={200}
        lines={[
          { at: 0, text: "דירה של" },
          { at: 34, text: <Ltr>660 ₪</Ltr>, hi: true },
          { at: 66, text: "בלי משכנתא!", hi: true },
        ]}
      />
    </AbsoluteFill>
  );
};

// 5 — The 1+1 offer: the ticket duplicates; the mascot does a double take.
export const Offer: React.FC = () => {
  const frame = useCurrentFrame();
  const split = useSpring(28, 12);
  const twin = useSpring(32, 9);
  const pose = usePose([
    {
      at: 0,
      lookX: 0,
      lookY: -1,
      brow: 0,
      mood: "smile",
      right: [10, 10],
      left: [10, 10],
    },
    { at: 34, lookX: 0.6, lookY: -1, brow: 0.4 },
    {
      at: 42,
      lookX: 0,
      lookY: 0,
      brow: 1,
      mood: "surprise",
      hop: 30,
      right: [60, 60],
      left: [60, 60],
    },
    { at: 56, hop: 0, lookY: -1 },
    {
      at: 80,
      mood: "grin",
      brow: 0.6,
      lookY: 0,
      right: [150, 20],
      left: [150, 20],
    },
    { at: 120, right: [140, 30], left: [140, 30] },
  ]);
  return (
    <AbsoluteFill>
      <Navy />
      <Center top={130}>
        <Title delay={0} size={50} color={C.white} pill={C.red}>
          מבצע לזמן מוגבל
        </Title>
        <Title delay={34} size={230} color={C.green}>
          <Ltr>1+1</Ltr>
        </Title>
      </Center>
      <div
        style={{
          position: "absolute",
          top: 700,
          left: 0,
          width: 1080,
          height: 300,
        }}
      >
        <div style={{ position: "absolute", left: 340 + split * 250, top: 0 }}>
          <Ticket width={400} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 340 - split * 250,
            top: 0,
            transform: `scale(${twin})`,
            opacity: frame < 32 ? 0 : 1,
          }}
        >
          <Ticket width={400} free />
        </div>
      </div>
      <Center top={1000} gap={22}>
        <Stamp delay={52} size={88} color={C.green}>
          במתנה!
        </Stamp>
        <Title delay={64} size={50} weight={700} color={C.white}>
          קונים כרטיס, מקבלים עוד אחד בחינם
        </Title>
        <Title delay={86} size={96} pill={C.yellow}>
          <Ltr>x2</Ltr> סיכויים!
        </Title>
      </Center>
      <Character pose={pose} size={620} x={390} y={1340} seed="offer" />
    </AbsoluteFill>
  );
};

const CROWD = [
  C.green,
  "#60A5FA",
  C.gold,
  "#F472B6",
  C.red,
  "#A78BFA",
  "#34D399",
];

// 6 — "I turned to ordinary people, everyone sends 660 and that's how I give."
export const VoC: React.FC = () => {
  const frame = useCurrentFrame();
  const talk = talkFrom(LIPS["c-everyone-sends"], frame);
  const pose = usePose([
    { at: 0, right: [30, -40], left: [20, 20], brow: 0.3, mood: "smile" },
    {
      at: 40,
      right: [45, -70],
      left: [25, 30],
      lookX: -0.5,
      lookY: 0.6,
      tilt: -4,
    },
    {
      at: 80,
      right: [25, -30],
      left: [55, -60],
      lookX: 0.4,
      lookY: 0.6,
      tilt: 4,
    },
    {
      at: 120,
      right: [50, -80],
      left: [30, 20],
      lookX: 0,
      lookY: 0.4,
      tilt: 0,
    },
    { at: 140, right: [40, -60], left: [40, -60] },
    {
      at: 152,
      right: [140, 30],
      left: [140, 30],
      mood: "grin",
      lookY: 0,
      hop: 10,
    },
    { at: 192, hop: 0 },
  ]);
  const lid = interpolate(frame, [146, 156], [0, -75], clamp);
  const prize = useSpring(150, 10);
  const target: [number, number] = [540, 1330];
  return (
    <AbsoluteFill>
      <Cream />
      <Character pose={pose} talk={talk} size={760} x={350} y={330} seed="c" />
      {CROWD.map((color, i) => (
        <Person
          key={color}
          color={color}
          x={i < 4 ? 40 + i * 95 : 690 + (i - 4) * 110}
          y={1640}
          delay={30 + i * 14}
          target={target}
        />
      ))}
      {/* The fund's box */}
      <div
        style={{
          position: "absolute",
          left: 340,
          top: 1300,
          width: 400,
          height: 260,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 200 - prize * 130,
            top: -140 - prize * 160,
            transform: `scale(${prize})`,
          }}
        >
          <House size={260} glow />
        </div>
        <div
          style={{
            position: "absolute",
            left: -10,
            top: -26,
            width: 420,
            height: 50,
            borderRadius: 12,
            background: C.goldDark,
            transform: `rotate(${lid}deg)`,
            transformOrigin: "0% 100%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            top: 20,
            borderRadius: 18,
            background: C.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 52,
            color: C.navy,
            boxShadow: "0 20px 40px rgba(19,33,60,0.25)",
          }}
        >
          ״עם ישראל חי״
        </div>
      </div>
      <Center top={1100}>
        <Title delay={160} size={44} weight={700} pill={C.white}>
          חיילים · משפחות · פצועים
        </Title>
      </Center>
      <Caption
        top={170}
        lines={[
          { at: 0, text: "פניתי לפשוטי העם" },
          { at: 62, text: "שכל אחד שולח" },
          {
            at: 100,
            text: (
              <>
                את ה־<Ltr>660 ₪</Ltr>
              </>
            ),
            hi: true,
          },
          { at: 146, text: "ובזה אני מחלק!" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 7 — Urgency: the clock races; he checks his watch, sweating.
export const Urgency: React.FC = () => {
  const frame = useCurrentFrame();
  const pose = usePose([
    {
      at: 0,
      left: [20, -130],
      right: [10, 10],
      lookX: 0.8,
      lookY: 0.8,
      brow: -0.5,
      mood: "worried",
    },
    { at: 45, left: [20, -130], lookX: 0.8, lookY: 0.8 },
    { at: 55, left: [10, 10], lookX: 0, lookY: 0, brow: 1, mood: "surprise" },
    { at: 90, mood: "worried" },
  ]);
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <AbsoluteFill>
      <Navy />
      <Camera
        keys={[
          { at: 0, scale: 1.0 },
          { at: 90, scale: 1.08 },
        ]}
      >
        <div style={{ position: "absolute", left: 330, top: 300 }}>
          <Clock size={420} />
        </div>
        <Character
          pose={pose}
          size={900}
          x={300}
          y={980}
          leftItem={<Watch />}
          sweat
          seed="urg"
        />
      </Camera>
      <Center top={130}>
        <Title delay={0} size={70} color={C.white}>
          מבצע ה־<Ltr>1+1</Ltr>
        </Title>
      </Center>
      <Center top={760}>
        <Title
          delay={10}
          size={110}
          color={C.white}
          pill={blink ? C.red : "#B91C1C"}
        >
          נסגר בקרוב!
        </Title>
      </Center>
    </AbsoluteFill>
  );
};

// Dice and a gamepad, crossed out: "no games here".
const NoGames: React.FC<{ delay: number }> = ({ delay }) => {
  const s = useSpring(delay, 11);
  const x = useSpring(delay + 12, 9);
  return (
    <div
      style={{
        position: "relative",
        width: 420,
        height: 260,
        transform: `scale(${s})`,
      }}
    >
      <svg width={420} height={260} viewBox="0 0 420 260">
        <rect
          x={20}
          y={60}
          width={140}
          height={140}
          rx={26}
          fill={C.white}
          stroke={C.navy}
          strokeWidth={8}
          transform="rotate(-10 90 130)"
        />
        {[
          [60, 100],
          [120, 160],
          [90, 130],
        ].map(([cx, cy]) => (
          <circle
            key={cx}
            cx={cx}
            cy={cy}
            r={12}
            fill={C.navy}
            transform="rotate(-10 90 130)"
          />
        ))}
        <path
          d="M220 110 Q220 70 270 70 L350 70 Q400 70 400 110 L400 170 Q400 200 370 190 L340 160 L280 160 L250 190 Q220 200 220 170 Z"
          fill={C.navy}
        />
        <rect x={252} y={108} width={36} height={12} rx={4} fill={C.white} />
        <rect x={264} y={96} width={12} height={36} rx={4} fill={C.white} />
        <circle cx={350} cy={104} r={10} fill={C.yellow} />
        <circle cx={372} cy={126} r={10} fill={C.green} />
      </svg>
      <svg
        width={420}
        height={260}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <path
          d="M30 30 L390 230 M390 30 L30 230"
          stroke={C.red}
          strokeWidth={26}
          strokeLinecap="round"
          strokeDasharray={420}
          strokeDashoffset={420 * (1 - x)}
        />
      </svg>
    </div>
  );
};

// 8 — "No games here. You can win, and big. Am Yisrael Chai."
export const VoD: React.FC = () => {
  const frame = useCurrentFrame();
  const talk = talkFrom(LIPS["d-win-big"], frame);
  const wag = Math.sin(frame / 3) * 18;
  const pose = usePose([
    {
      at: 0,
      right: [150, 10],
      left: [10, 10],
      brow: -1,
      mood: "serious",
      pointRight: true,
      tilt: -4,
    },
    { at: 38, right: [150, 10], pointRight: true },
    {
      at: 46,
      right: [140, 30],
      left: [140, 30],
      brow: 1,
      mood: "grin",
      pointRight: false,
      tilt: 0,
    },
    { at: 88, right: [165, 10], left: [165, 10], hop: 40 },
    { at: 100, hop: 0 },
    { at: 145, right: [120, 40], left: [120, 40] },
  ]);
  const wagPose =
    frame < 40
      ? {
          ...pose,
          right: [pose.right[0], pose.right[1] + wag] as [number, number],
        }
      : pose;
  return (
    <AbsoluteFill>
      <Cream />
      <Camera
        keys={[
          { at: 0, scale: 1.12, y: 60 },
          { at: 40, scale: 1.0, y: 0 },
          { at: 145, scale: 1.04 },
        ]}
      >
        <Disc x={540} y={1150} r={460} color={C.green} />
        {frame < 44 ? (
          <div style={{ position: "absolute", left: 330, top: 470 }}>
            <NoGames delay={4} />
          </div>
        ) : null}
        <Character
          pose={wagPose}
          talk={talk}
          size={1080}
          x={280}
          y={720}
          seed="d"
        />
      </Camera>
      <Confetti at={86} />
      <Caption
        top={200}
        lines={[
          { at: 0, text: "אין משחקים פה." },
          { at: 42, text: "אתם יכולים לנצח" },
          { at: 84, text: "ובגדול!", hi: true },
          { at: 112, text: "עם ישראל חי!", hi: true },
        ]}
      />
    </AbsoluteFill>
  );
};

// 9 — Call to action.
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const btn = useSpring(40, 10);
  const tap = 120;
  const press = frame >= tap && frame < tap + 6;
  const ripple = interpolate(frame - tap, [0, 20], [0, 1], clamp);
  const pulse = 1 + 0.035 * Math.sin(frame * 0.28);
  const shine = (frame % 50) / 50;
  const cx = interpolate(frame, [80, tap], [980, 620], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const cy = interpolate(frame, [80, tap], [1700, 1215], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const pose = usePose([
    { at: 0, right: [10, 10], left: [10, 10], mood: "smile" },
    { at: 30, left: [95, 0], pointLeft: true, lookX: 1, brow: 0.6 },
    { at: 120, left: [95, 0], pointLeft: true, lookX: 1 },
    {
      at: 130,
      left: [150, 20],
      right: [150, 20],
      pointLeft: false,
      mood: "grin",
      hop: 24,
      lookX: 0,
    },
    { at: 145, hop: 0 },
  ]);
  const logo = useSpring(4, 12);
  return (
    <AbsoluteFill>
      <Navy />
      <div style={{ position: "absolute", left: 0, top: 0, opacity: 0.18 }}>
        <Skyline y={1280} drift={-0.3} />
      </div>
      <Center top={110} gap={10}>
        <Img
          src={staticFile(IMG.logo)}
          style={{ width: 300, transform: `scale(${logo})` }}
        />
      </Center>
      <Center top={470} gap={6}>
        <Title delay={12} size={72} color={C.white}>
          אל תישארו רק עם הסיכוי —
        </Title>
        <Title delay={22} size={104} color={C.yellow}>
          רכשו כרטיס עכשיו!
        </Title>
        <div style={{ height: 18 }} />
        <Title delay={32} size={50} weight={700} color={C.navy} pill={C.green}>
          <Ltr>1+1</Ltr> במתנה · <Ltr>₪660</Ltr> לכרטיס
        </Title>
      </Center>
      {/* Button */}
      <div
        style={{
          position: "absolute",
          top: 1110,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            transform: `scale(${btn * pulse * (press ? 0.93 : 1)})`,
          }}
        >
          {frame >= tap ? (
            <div
              style={{
                position: "absolute",
                inset: -14,
                borderRadius: 999,
                border: `8px solid ${C.green}`,
                transform: `scale(${1 + ripple * 0.35})`,
                opacity: 1 - ripple,
              }}
            />
          ) : null}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 84,
              color: C.white,
              background: `linear-gradient(135deg, #34D399, ${C.green} 50%, ${C.greenDark})`,
              borderRadius: 999,
              padding: "34px 90px",
              boxShadow: `0 20px 50px rgba(0,0,0,0.45), 0 0 40px ${C.green}66`,
              whiteSpace: "nowrap",
            }}
          >
            לרכישת כרטיס &gt;&gt;
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 140,
                left: `${-20 + shine * 140}%`,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                transform: "skewX(-20deg)",
              }}
            />
          </div>
        </div>
      </div>
      <Center top={1330} gap={14}>
        <Title delay={56} size={48} weight={700} color={C.white}>
          <Ltr>thedreamraffle.co.il</Ltr>
        </Title>
        <Title delay={64} size={36} weight={700} color={C.navy} pill={C.gold}>
          כל כרטיס תומך ב״עם ישראל חי״
        </Title>
      </Center>
      <Character pose={pose} size={560} x={30} y={1330} seed="cta" />
      {frame >= 80 ? <Cursor x={cx} y={cy} press={press} /> : null}
      <Confetti at={tap + 2} count={60} />
      <div
        style={{
          position: "absolute",
          bottom: 34,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 26,
          color: "rgba(255,255,255,0.75)",
        }}
      >
        בכפוף לתקנון ההגרלה
      </div>
    </AbsoluteFill>
  );
};

export const SCENE_COMPONENTS = {
  hook: Hook,
  voA: VoA,
  apartment: Apartment,
  voB: VoB,
  offer: Offer,
  voC: VoC,
  urgency: Urgency,
  voD: VoD,
  cta: Cta,
};
