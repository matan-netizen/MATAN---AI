import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Backdrop,
  BlurredBackdrop,
  CropVideo,
  Frame,
  Gold,
  Logo,
  Note,
  Pill,
  Rise,
  Sparkles,
  useEnter,
} from "./components";
import { CLIP, COLORS, CROP, FONT, GOLD_GRADIENT, SERIF, SOURCE } from "./theme";

const Column: React.FC<{
  children: React.ReactNode;
  top: number;
  gap?: number;
}> = ({ children, top, gap = 0 }) => (
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

const PHOTO_NOTE = "Pictured: last year's Dream Raffle 8 apartment";

// 1. Hook: the apartment, full frame, and the prize counting up.
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const pop = spring({ frame: frame - 8, fps, config: { damping: 9 } });
  const zoom = interpolate(frame, [0, 150], [1, 1.08]);
  return (
    <AbsoluteFill style={{ background: COLORS.ink }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <OffthreadVideo
          src={staticFile(SOURCE)}
          trimBefore={CLIP.roomOpen * fps}
          playbackRate={0.82}
          muted
          style={{ width: 1080, height: 1920 }}
        />
      </AbsoluteFill>
      <Sparkles count={18} />
      {/* Covers the source's own caption band (y≈1040–1340). */}
      <div
        style={{
          position: "absolute",
          top: 930,
          left: 50,
          right: 50,
          padding: "40px 30px 46px",
          borderRadius: 34,
          background: "linear-gradient(180deg, rgba(43,31,23,0.97), rgba(26,18,12,0.97))",
          border: `3px solid ${COLORS.gold}`,
          boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
          opacity: card,
          transform: `scale(${0.94 + 0.06 * card})`,
          textAlign: "center",
        }}
      >
        <Rise size={54} weight={900} delay={2} style={{ letterSpacing: 3 }}>
          IMAGINE WINNING A
        </Rise>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 150,
            lineHeight: 1.05,
            backgroundImage: GOLD_GRADIENT,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            transform: `scale(${pop})`,
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.5))",
          }}
        >
          $1.3M
        </div>
        <Rise size={60} weight={900} delay={20} style={{ letterSpacing: 1 }}>
          BRAND-NEW APARTMENT
        </Rise>
        <Rise size={60} weight={900} delay={26}>
          IN <Gold>JERUSALEM</Gold>
        </Rise>
      </div>
      <Note bottom={90}>{PHOTO_NOTE}</Note>
    </AbsoluteFill>
  );
};

// 2 + 3. Last year's winner, in the gold frame over a blurred copy.
const WinnerLayout: React.FC<{
  at: number;
  volume?: (f: number) => number;
  children: React.ReactNode;
}> = ({ at, volume, children }) => (
  <AbsoluteFill>
    <BlurredBackdrop crop={CROP.box} at={at} />
    <Sparkles count={20} />
    <Column top={70}>
      <Logo size={190} />
    </Column>
    <Column top={330} gap={8}>
      {children}
    </Column>
    <Column top={640}>
      <Frame>
        <CropVideo crop={CROP.box} width={1000} at={at} volume={volume} />
      </Frame>
    </Column>
    <Column top={1300}>
      <Pill size={40} delay={8}>
        BORN IN NEW YORK · MADE ALIYAH TO JERUSALEM
      </Pill>
    </Column>
  </AbsoluteFill>
);

export const SceneWinner: React.FC = () => (
  <WinnerLayout at={CLIP.wonThis}>
    <Rise size={46} weight={900} color={COLORS.gold} style={{ letterSpacing: 4 }}>
      LAST YEAR&apos;S WINNER
    </Rise>
    <Rise size={96} weight={900} font={SERIF} delay={4}>
      He got the call.
    </Rise>
  </WinnerLayout>
);

export const SceneQuote: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <WinnerLayout
      at={CLIP.phoneCall}
      volume={(f) =>
        interpolate(f, [0, 5, durationInFrames - 4, durationInFrames], [0, 1, 1, 0], {
          extrapolateRight: "clamp",
        })
      }
    >
      <Rise size={46} weight={900} color={COLORS.gold} style={{ letterSpacing: 4 }}>
        ARYEH LURIA · DREAM RAFFLE 8
      </Rise>
      <Rise size={96} weight={900} font={SERIF} delay={0}>
        &ldquo;My life changed.&rdquo;
      </Rise>
    </WinnerLayout>
  );
};

// 4. The turn: this year it could be you.
export const SceneTurn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = spring({ frame: frame - 10, fps, config: { damping: 8 } });
  return (
    <AbsoluteFill>
      <BlurredBackdrop crop={CROP.box} at={CLIP.balcony} />
      <Sparkles count={26} />
      <Column top={70}>
        <Logo size={190} />
      </Column>
      <Column top={330}>
        <Rise size={110} weight={900} font={SERIF}>
          This year,
        </Rise>
        <Rise size={110} weight={900} font={SERIF} delay={4}>
          it could be
        </Rise>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 170,
            lineHeight: 1,
            backgroundImage: GOLD_GRADIENT,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            transform: `scale(${punch})`,
            filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.6))",
          }}
        >
          YOU!
        </div>
      </Column>
      <Column top={1010}>
        <Frame delay={4}>
          <CropVideo crop={CROP.box} width={1000} at={CLIP.balcony} />
        </Frame>
      </Column>
    </AbsoluteFill>
  );
};

// 5. This year's grand prize, with apartment footage cycling in the frame.
const PHOTO_W = 1000;
const SHOTS = [
  { crop: CROP.room, at: 2.4, rate: 0.5, len: 100 },
  { crop: CROP.view, at: CLIP.balcony, rate: 0.8, len: 95 },
  { crop: CROP.room, at: CLIP.roomOpen, rate: 0.8, len: 110 },
];
const FEATURES = [
  "2 Bedrooms",
  "2 Full Baths",
  "Large Balcony",
  "Parking + Storage",
  "Shabbat Elevator",
  "Secure Safe Room",
];
// Matches "Two bedrooms, two full baths, a large balcony…" (starts at local 138).
const FEATURE_AT = [140, 158, 176, 194, 222, 236];

export const ScenePrize: React.FC = () => {
  let start = 0;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Sparkles />
      <Column top={50}>
        <Logo size={170} />
      </Column>
      <Column top={268} gap={10}>
        <Pill gold size={36}>
          DREAM RAFFLE 9 · GRAND PRIZE
        </Pill>
        <Rise size={68} weight={900} font={SERIF} delay={6}>
          Brand-New Luxury Apartment
        </Rise>
        <Rise size={48} weight={700} color={COLORS.goldLight} delay={12}>
          Givat Mordechai, Jerusalem
        </Rise>
      </Column>
      <Column top={560}>
        <Frame delay={4}>
          <div
            style={{
              position: "relative",
              width: PHOTO_W,
              height: (PHOTO_W * CROP.room.h) / CROP.room.w,
            }}
          >
            {SHOTS.map((shot, i) => {
              const from = start;
              start += shot.len;
              const isLast = i === SHOTS.length - 1;
              return (
                <Sequence
                  key={i}
                  from={from}
                  durationInFrames={isLast ? 400 : shot.len + 10}
                  layout="none"
                >
                  <ShotFade>
                    <CropVideo
                      crop={shot.crop}
                      width={PHOTO_W}
                      at={shot.at}
                      playbackRate={shot.rate}
                      zoom={[1.02, 1.1]}
                      style={{ position: "absolute", top: 0, left: 0 }}
                    />
                  </ShotFade>
                </Sequence>
              );
            })}
          </div>
        </Frame>
      </Column>
      <Column top={1200}>
        <ValuePlate />
      </Column>
      <div
        style={{
          position: "absolute",
          top: 1395,
          left: 70,
          right: 70,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {FEATURES.map((f, i) => (
          <Pill key={f} size={38} delay={FEATURE_AT[i]}>
            ✓ {f}
          </Pill>
        ))}
      </div>
      <Note bottom={60} size={28}>
        {PHOTO_NOTE}, shown furnished.
        <br />
        Furniture &amp; appliances included only with the Super Ticket upgrade.
      </Note>
    </AbsoluteFill>
  );
};

const ShotFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  return <div style={{ position: "absolute", inset: 0, opacity }}>{children}</div>;
};

const ValuePlate: React.FC = () => {
  const s = useEnter(18, 10);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "16px 46px",
        borderRadius: 24,
        background: "rgba(26,18,12,0.9)",
        border: `3px solid ${COLORS.gold}`,
        transform: `scale(${s})`,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 40,
          color: COLORS.cream,
          letterSpacing: 2,
        }}
      >
        VALUED AT
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 104,
          lineHeight: 1,
          backgroundImage: GOLD_GRADIENT,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        $1.3 MILLION
      </div>
    </div>
  );
};

// 6. The offer: 1+1 on every order, then the early-bird bonus.
const BONUS_AT = 99;

export const SceneOffer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seal = spring({ frame: frame - 4, fps, config: { damping: 10 } });
  const move = spring({ frame: frame - BONUS_AT, fps, config: { damping: 16 } });
  const spin = interpolate(frame, [0, 250], [-8, 8]);
  return (
    <AbsoluteFill>
      <BlurredBackdrop crop={CROP.room} at={CLIP.roomPan} />
      <Sparkles count={40} />
      <Column top={60}>
        <div style={{ opacity: 1 - move }}>
          <Logo size={170} />
        </div>
      </Column>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          transform: `translateY(${-300 * move}px) scale(${1 - 0.3 * move})`,
          transformOrigin: "50% 330px",
        }}
      >
        <Column top={330}>
          <Rise size={50} weight={900} color={COLORS.gold} style={{ letterSpacing: 5 }}>
            RIGHT NOW · ALL ORDERS
          </Rise>
        </Column>
        <Column top={440}>
          <div
            style={{
              width: 470,
              height: 470,
              borderRadius: 470,
              background: GOLD_GRADIENT,
              border: `10px dashed rgba(122,78,30,0.55)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${seal}) rotate(${spin}deg)`,
              boxShadow: `0 0 80px rgba(226,176,74,0.55), 0 30px 60px rgba(0,0,0,0.5)`,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 200,
                lineHeight: 1,
                color: COLORS.ink,
              }}
            >
              1+1
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 46,
                color: COLORS.ink,
                letterSpacing: 3,
              }}
            >
              FREE TICKET
            </div>
          </div>
        </Column>
        <Column top={960}>
          <Rise size={92} weight={900} delay={14}>
            BUY 1, GET 1 <Gold>FREE</Gold>
          </Rise>
          <Rise size={50} weight={700} color={COLORS.cream} delay={20}>
            Every order is doubled
          </Rise>
        </Column>
      </div>
      <Sequence from={BONUS_AT} layout="none">
        <BonusCard />
      </Sequence>
    </AbsoluteFill>
  );
};

const BonusCard: React.FC = () => {
  const s = useEnter(4, 13);
  return (
    <div
      style={{
        position: "absolute",
        top: 930,
        left: 60,
        right: 60,
        padding: "44px 30px 50px",
        borderRadius: 34,
        background: "linear-gradient(180deg, rgba(43,31,23,0.96), rgba(26,18,12,0.96))",
        border: `4px solid ${COLORS.gold}`,
        boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
        textAlign: "center",
        opacity: Math.min(1, s * 1.5),
        transform: `translateY(${(1 - s) * 160}px)`,
      }}
    >
      <Pill gold size={40} delay={8}>
        EARLY-BIRD BONUS DRAWING
      </Pill>
      <div
        style={{
          marginTop: 20,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 170,
          lineHeight: 1,
          backgroundImage: GOLD_GRADIENT,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        $15,000
      </div>
      <Rise size={64} weight={900} delay={12}>
        IN CASH
      </Rise>
      <Rise size={52} weight={700} color={COLORS.goldLight} delay={30} style={{ marginTop: 18 }}>
        Order by November 11
      </Rise>
    </div>
  );
};

// 7. Where the money goes.
const CAUSES = [
  { img: "dream/cause-torah.jpg", label: "Torah\nInstitutions" },
  { img: "dream/cause-ems.jpg", label: "Lifesaving\nEquipment" },
  { img: "dream/cause-idf.jpg", label: "IDF\nSoldiers" },
];

export const SceneImpact: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Sparkles />
    <Column top={60}>
      <Logo size={170} />
    </Column>
    <Column top={320}>
      <Rise size={90} weight={900} font={SERIF}>
        One ticket.
      </Rise>
      <Rise size={66} weight={700} font={SERIF} delay={6}>
        A hundred ways to build
      </Rise>
      <Rise size={66} weight={700} font={SERIF} delay={10}>
        the <Gold>Land of Israel.</Gold>
      </Rise>
    </Column>
    <div
      style={{
        position: "absolute",
        top: 760,
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {CAUSES.map((c, i) => (
        <CauseCard key={c.img} {...c} delay={12 + i * 7} />
      ))}
    </div>
    <Column top={1340}>
      <Rise size={40} weight={400} color={COLORS.cream} delay={30}>
        Proceeds support the work of the
      </Rise>
      <Rise size={44} weight={700} color={COLORS.goldLight} delay={32}>
        Am Yisrael Chai Foundation
      </Rise>
    </Column>
  </AbsoluteFill>
);

const CauseCard: React.FC<{ img: string; label: string; delay: number }> = ({
  img,
  label,
  delay,
}) => {
  const s = useEnter(delay, 13);
  return (
    <div
      style={{
        width: 316,
        borderRadius: 24,
        overflow: "hidden",
        background: GOLD_GRADIENT,
        padding: 5,
        boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
        opacity: Math.min(1, s * 1.4),
        transform: `translateY(${(1 - s) * 120}px)`,
      }}
    >
      <Img
        src={staticFile(img)}
        style={{
          width: 306,
          height: 360,
          objectFit: "cover",
          borderRadius: "20px 20px 0 0",
          display: "block",
        }}
      />
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 38,
          lineHeight: 1.1,
          color: COLORS.ink,
          textAlign: "center",
          padding: "16px 4px 14px",
          whiteSpace: "pre-line",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// 8. Call to action + disclosures.
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.035 * Math.sin(frame / 6);
  return (
    <AbsoluteFill>
      <Backdrop />
      <Sparkles count={44} />
      <Column top={50}>
        <Logo size={250} />
      </Column>
      <Column top={355} gap={4}>
        <Rise size={40} weight={900} color={COLORS.gold} style={{ letterSpacing: 5 }}>
          GRAND PRIZE DRAWING
        </Rise>
        <Rise size={92} weight={900} font={SERIF} delay={4}>
          March 11, 2027
        </Rise>
        <Rise size={40} weight={400} color={COLORS.cream} delay={8}>
          Live-streamed from Jerusalem
        </Rise>
      </Column>
      <Column top={690}>
        <Sequence from={10} layout="none">
          <EnterButton scale={pulse} />
        </Sequence>
      </Column>
      <Column top={905} gap={20}>
        <Rise size={70} weight={900} delay={16}>
          thedreamraffle<Gold>.com</Gold>
        </Rise>
        <Pill size={38} delay={24}>
          BUY 1, GET 1 FREE ON ALL ORDERS
        </Pill>
      </Column>
      <Disclosures />
    </AbsoluteFill>
  );
};

const EnterButton: React.FC<{ scale: number }> = ({ scale }) => {
  const s = useEnter(0, 10);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 84,
        color: COLORS.ink,
        background: GOLD_GRADIENT,
        padding: "26px 90px",
        borderRadius: 999,
        boxShadow: `0 0 60px rgba(226,176,74,0.6), 0 20px 40px rgba(0,0,0,0.5)`,
        transform: `scale(${s * scale})`,
        whiteSpace: "nowrap",
      }}
    >
      ENTER NOW →
    </div>
  );
};

// Taken from the site's FAQ; kept on screen for the whole closing scene.
const Disclosures: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 50,
      right: 50,
      bottom: 60,
      padding: "26px 30px",
      borderRadius: 22,
      background: "rgba(26,18,12,0.9)",
      border: "1px solid rgba(226,176,74,0.45)",
      fontFamily: FONT,
      fontSize: 29,
      lineHeight: 1.38,
      color: COLORS.cream,
      textAlign: "center",
    }}
  >
    The Dream Raffle is a project of the Am Yisrael Chai Foundation, a 501(c)(3)
    nonprofit. Raffle ticket purchases are not tax-deductible. The winner pays all
    applicable taxes. Cash option: $700,000 (before taxes). The winner&apos;s name
    and photo will be published. Apartment pictured is last year&apos;s prize.
    Full details and FAQ: thedreamraffle.com
  </div>
);
