import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  CornerBadge,
  Disclaimer,
  Footage,
  GoldText,
  NinthYearBadge,
  Panel,
  PosterBackdrop,
  Sfx,
  Shade,
  TopBanner,
  usePop,
  WhiteText,
} from "./components";
import { COLORS, FACTS, FONT, GOLD_GRADIENT, MEDIA, SCENES } from "./theme";

// Choice card for the hook: "200 ₪" or "an apartment in Jerusalem".
const ChoiceCard: React.FC<{
  title: string;
  sub: string;
  delay: number;
  crossAt?: number;
  winner?: boolean;
}> = ({ title, sub, delay, crossAt, winner }) => {
  const frame = useCurrentFrame();
  const s = usePop(delay, 11);
  const cross = usePop(crossAt ?? 100000, 8);
  const glow = winner ? interpolate(Math.sin(frame / 5), [-1, 1], [20, 55]) : 0;
  return (
    <div
      style={{
        width: 860,
        padding: "38px 30px",
        borderRadius: 34,
        textAlign: "center",
        fontFamily: FONT,
        position: "relative",
        backgroundImage: winner ? GOLD_GRADIENT : undefined,
        backgroundColor: winner ? undefined : "rgba(255,255,255,0.12)",
        border: winner ? "none" : "4px solid rgba(255,255,255,0.5)",
        color: winner ? COLORS.navy : COLORS.white,
        boxShadow: winner ? `0 0 ${glow}px ${COLORS.gold}` : "none",
        transform: `scale(${s * (1 - cross * 0.08)})`,
        opacity: Math.min(1, s * 2) * (1 - cross * 0.35),
      }}
    >
      <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 1 }}>
        {title}
      </div>
      <div style={{ fontSize: 50, fontWeight: 700, marginTop: 10 }}>{sub}</div>
      {crossAt !== undefined ? (
        <svg
          width={420}
          height={300}
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${cross * 1.0}) rotate(${(1 - cross) * 40}deg)`,
          }}
        >
          <path
            d="M15 15 L85 85 M85 15 L15 85"
            stroke={COLORS.red}
            strokeWidth={14}
            strokeLinecap="round"
          />
        </svg>
      ) : null}
    </div>
  );
};

// 1 — Hook: disqualify the people who took the 200 shekels.
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const shake =
    frame > 66 && frame < 80 ? Math.sin(frame * 3) * (80 - frame) * 1.4 : 0;
  return (
    <AbsoluteFill>
      <PosterBackdrop />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          transform: `translateX(${shake}px)`,
        }}
      >
        <WhiteText size={70} delay={0}>
          שאלנו בשוק מחנה יהודה:
        </WhiteText>
        <ChoiceCard title="200 ₪" sub="מזומן ביד" delay={6} crossAt={34} />
        <WhiteText size={64} delay={12} style={{ color: COLORS.gold }}>
          או
        </WhiteText>
        <ChoiceCard
          title="דירה בירושלים"
          sub={`בשווי ${FACTS.prize}`}
          delay={18}
          winner
        />
        <div style={{ height: 30 }} />
        <GoldText size={150} delay={64}>
          אל תהיה פראייר!
        </GoldText>
      </AbsoluteFill>
      <Sfx src={MEDIA.pop} at={6} />
      <Sfx src={MEDIA.pop} at={18} />
      <Sfx src={MEDIA.rumble} at={34} volume={0.8} />
      <Sfx src={MEDIA.chime} at={64} volume={0.5} />
    </AbsoluteFill>
  );
};

// 2 — The ask: "Do you want an apartment in Jerusalem as a gift?"
export const SceneAskClip: React.FC = () => (
  <AbsoluteFill>
    <Footage src={SCENES.askClip.src} punchAt={[45, 120, 225, 310]} />
    <Shade />
    <TopBanner at={8} until={110}>
      דירה בירושלים? ברור שכן!
    </TopBanner>
    <TopBanner at={120} until={200}>
      דירת יוקרה בשווי 1.3 מיליון דולר!
    </TopBanner>
    <TopBanner at={215} until={305} gold={false}>
      מכירת הכרטיסים החלה!
    </TopBanner>
    <TopBanner at={309} until={403}>
      הקישור בפרופיל: אינסטגרם · טיקטוק · פייסבוק
    </TopBanner>
    <CornerBadge />
  </AbsoluteFill>
);

// Counts the prize value up to 1.3.
const PrizeCounter: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [delay, delay + 30], [0, 1.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <GoldText size={260} delay={delay}>
      {v.toFixed(1)}
    </GoldText>
  );
};

// 3 — The prize and the ninth year in a row.
export const ScenePrize: React.FC = () => (
  <AbsoluteFill>
    <PosterBackdrop />
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", gap: 26 }}
    >
      <GoldText size={120} delay={0}>
        מכירת הכרטיסים
        <br />
        החלה!
      </GoldText>
      <Panel delay={14} style={{ width: 920 }}>
        <WhiteText size={66} delay={18}>
          דירת יוקרה חדשה בירושלים
        </WhiteText>
        <WhiteText size={46} weight={700} delay={22}>
          בשווי
        </WhiteText>
        <PrizeCounter delay={24} />
        <WhiteText size={80} delay={30} style={{ marginTop: -20 }}>
          מיליון דולר
        </WhiteText>
      </Panel>
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <NinthYearBadge size={290} delay={82} />
        <div>
          <GoldText size={92} delay={90} style={{ textAlign: "right" }}>
            9 שנים
            <br />
            ברציפות!
          </GoldText>
          <WhiteText
            size={44}
            weight={700}
            delay={100}
            style={{ textAlign: "right" }}
          >
            זה לא חלום – זו מסורת
          </WhiteText>
        </div>
      </div>
      <WhiteText size={38} weight={700} delay={108}>
        קרן &quot;עם ישראל חי&quot; · פועלת מאז {FACTS.foundedYear}
      </WhiteText>
    </AbsoluteFill>
    <Sfx src={MEDIA.riser} at={0} volume={0.4} />
    <Sfx src={MEDIA.chime} at={54} volume={0.6} />
    <Sfx src={MEDIA.rumble} at={82} volume={0.9} />
  </AbsoluteFill>
);

// 4 — Where the money goes: back to the people of Israel.
// Banner timings follow the speech in the take (starts at 13.4s).
export const SceneCauseClip: React.FC = () => (
  <AbsoluteFill>
    <Footage src={SCENES.causeClip.src} punchAt={[64, 120, 168, 200]} />
    <Shade />
    <TopBanner at={4} until={58} gold={false}>
      כרטיס {FACTS.ticket} ₪ – ועכשיו 1+1!
    </TopBanner>
    <TopBanner at={60} until={118}>
      כל הכסף חוזר לעם ישראל
    </TopBanner>
    <TopBanner at={120} until={166}>
      לחיילים הבודדים
    </TopBanner>
    <TopBanner at={168} until={198}>
      למשפחות השכולות
    </TopBanner>
    <TopBanner at={200} until={267} gold={false}>
      אתה לא רק קונה כרטיס – אתה עושה מצווה!
    </TopBanner>
    <CornerBadge />
  </AbsoluteFill>
);

// Gift box drawn in CSS for the 1+1 offer.
const GiftBox: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const s = usePop(delay, 8);
  const lid = interpolate(frame, [delay + 12, delay + 22], [0, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        width: 200,
        height: 190,
        position: "relative",
        transform: `scale(${s})`,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 10,
          width: 180,
          height: 140,
          background: "#F4F1EA",
          borderRadius: 10,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 82,
          width: 36,
          height: 140,
          backgroundImage: GOLD_GRADIENT,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 20 + lid,
          left: 0,
          width: 200,
          height: 46,
          background: "#FFFFFF",
          borderRadius: 10,
          transform: `rotate(${lid / 3}deg)`,
          boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 82,
            width: 36,
            height: 46,
            backgroundImage: GOLD_GRADIENT,
          }}
        />
      </div>
    </div>
  );
};

// Stack of dollar bills for the bonus draw.
const CashStack: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{ width: 220, height: 190, position: "relative", flexShrink: 0 }}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const y = interpolate(
          frame,
          [delay + i * 3, delay + i * 3 + 8],
          [-400, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 10,
              bottom: i * 26,
              width: 200,
              height: 70,
              borderRadius: 8,
              background: "linear-gradient(180deg, #CFE3C5, #8DB07D)",
              border: "3px solid #5E8150",
              transform: `translateY(${y}px) rotate(${(i % 2 ? 1 : -1) * 3}deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 40,
              color: "#3D5A32",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 85,
                width: 30,
                height: "100%",
                backgroundImage: GOLD_GRADIENT,
              }}
            />
            $
          </div>
        );
      })}
    </div>
  );
};

// Red countdown chip, pulsing.
const Deadline: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const s = usePop(delay, 9);
  const pulse = 1 + Math.max(0, Math.sin((frame - delay) / 4)) * 0.05;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 96,
        color: COLORS.white,
        backgroundColor: COLORS.red,
        padding: "18px 60px",
        borderRadius: 30,
        boxShadow: `0 0 50px ${COLORS.red}`,
        transform: `scale(${s * pulse})`,
        opacity: Math.min(1, s * 2),
      }}
    >
      רק עד {FACTS.bonusDeadline}!
    </div>
  );
};

// 5 — The offers: 1+1 tickets and the $15,000 early-bird draw.
export const SceneBonus: React.FC = () => (
  <AbsoluteFill>
    <PosterBackdrop />
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", gap: 40 }}
    >
      <WhiteText size={76} delay={0}>
        ועכשיו תקשיבו טוב:
      </WhiteText>
      <Panel delay={8} style={{ width: 940 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div>
            <GoldText size={170} delay={12}>
              1+1
            </GoldText>
            <WhiteText size={60} delay={16}>
              מתנה על הכרטיסים
            </WhiteText>
            <WhiteText size={44} weight={700} delay={26}>
              2 כרטיסים – {FACTS.ticket} ₪ בלבד
            </WhiteText>
            <GoldText size={60} delay={30}>
              רק {FACTS.perTicketWithGift} ₪ לכרטיס!
            </GoldText>
          </div>
          <GiftBox delay={14} />
        </div>
      </Panel>
      <Panel delay={48} style={{ width: 940 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div>
            <WhiteText size={60} delay={52}>
              הגרלת בונוס
            </WhiteText>
            <GoldText size={160} delay={56}>
              {FACTS.bonus}
            </GoldText>
            <WhiteText size={46} weight={700} delay={60}>
              למצטרפים מוקדם
            </WhiteText>
          </div>
          <CashStack delay={54} />
        </div>
      </Panel>
      <Deadline delay={100} />
    </AbsoluteFill>
    <Sfx src={MEDIA.pop} at={8} />
    <Sfx src={MEDIA.chime} at={14} volume={0.5} />
    <Sfx src={MEDIA.pop} at={48} />
    <Sfx src={MEDIA.chime} at={56} volume={0.6} />
    <Sfx src={MEDIA.rumble} at={100} volume={0.8} />
  </AbsoluteFill>
);

// 6 — "Go in and follow us ... Am Yisrael Chai" from the market.
export const SceneFollowClip: React.FC = () => (
  <AbsoluteFill>
    <Footage src={SCENES.followClip.src} punchAt={[4, 70, 196]} />
    <Shade />
    <TopBanner at={4} until={60} gold={false}>
      היכנסו לקישור בפרופיל!
    </TopBanner>
    <TopBanner at={66} until={196}>
      כל שקל חוזר בחסד לעם ישראל
    </TopBanner>
    <TopBanner at={200} until={260}>
      עם ישראל חי – ממחנה יהודה!
    </TopBanner>
    <CornerBadge />
  </AbsoluteFill>
);

// Arrow bouncing down towards the profile link.
const DownArrow: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const s = usePop(delay, 10);
  const bob = Math.sin((frame - delay) / 4) * 18;
  return (
    <svg
      width={150}
      height={150}
      viewBox="0 0 100 100"
      style={{ transform: `translateY(${bob}px) scale(${s})` }}
    >
      <path
        d="M50 10 L50 75 M22 50 L50 80 L78 50"
        stroke={COLORS.gold}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

// Pulsing gold button, like the poster's "enter now".
const EnterButton: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const s = usePop(delay, 10);
  const pulse = 1 + Math.max(0, Math.sin((frame - delay) / 5)) * 0.06;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 96,
        color: COLORS.navy,
        backgroundImage: GOLD_GRADIENT,
        padding: "26px 90px",
        borderRadius: 100,
        border: `6px solid ${COLORS.goldLight}`,
        boxShadow: `0 0 ${40 + (pulse - 1) * 600}px ${COLORS.gold}`,
        transform: `scale(${s * pulse})`,
      }}
    >
      היכנסו עכשיו ›
    </div>
  );
};

// Recap of the offer, so each cut ends with every number on screen.
const FactStrip: React.FC<{ delay: number }> = ({ delay }) => {
  const s = usePop(delay, 12);
  const chip: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 900,
    fontSize: 40,
    lineHeight: 1.15,
    textAlign: "center",
    color: COLORS.navy,
    backgroundImage: GOLD_GRADIENT,
    padding: "14px 24px",
    borderRadius: 20,
  };
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        opacity: Math.min(1, s * 2),
        transform: `scale(${s})`,
      }}
    >
      <div style={chip}>
        1+1 מתנה
        <br />
        {FACTS.perTicketWithGift} ₪ לכרטיס
      </div>
      <div
        style={{
          ...chip,
          backgroundImage: "none",
          backgroundColor: COLORS.red,
          color: COLORS.white,
        }}
      >
        בונוס {FACTS.bonus}
        <br />
        עד {FACTS.bonusDeadline}
      </div>
    </div>
  );
};

// 7 — Call to action: buy a ticket through the profile link.
export const SceneCTA: React.FC = () => {
  const poster = usePop(22, 12);
  return (
    <AbsoluteFill>
      <PosterBackdrop dim={0.6} />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", gap: 30 }}
      >
        <NinthYearBadge size={260} delay={0} />
        <WhiteText size={80} delay={6}>
          אז מה אתה מחכה?
        </WhiteText>
        <GoldText size={110} delay={14}>
          קנה כרטיס עכשיו!
        </GoldText>
        <Img
          src={staticFile(MEDIA.poster)}
          style={{
            width: 330,
            borderRadius: 24,
            border: `6px solid ${COLORS.gold}`,
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            transform: `scale(${poster})`,
          }}
        />
        <FactStrip delay={28} />
        <WhiteText size={72} delay={34}>
          הקישור בפרופיל
        </WhiteText>
        <DownArrow delay={40} />
        <EnterButton delay={46} />
        <GoldText size={110} delay={110}>
          עם ישראל חי!
        </GoldText>
      </AbsoluteFill>
      <Disclaimer />
      <Sfx src={MEDIA.rumble} at={0} volume={0.7} />
      <Sfx src={MEDIA.pop} at={46} />
      <Sfx src={MEDIA.chime} at={110} volume={0.7} />
    </AbsoluteFill>
  );
};
