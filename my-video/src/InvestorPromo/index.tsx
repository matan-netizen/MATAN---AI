import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import {
  CheckMark,
  EndCard,
  Footage,
  Grade,
  Headline,
  LightFlash,
  PhoneNotification,
  SpecCard,
  Subtitle,
} from "./components";
import {
  CHECK_FROM,
  COLORS,
  DURATION,
  END_CARD_FROM,
  f,
  HEADLINES,
  NOTIFY_FROM,
  SANS,
  SEGMENTS,
  SHOTS,
  SHOW_SUBTITLES,
  SPEC_CARD,
  VO_SLOTS,
  VOICEOVER,
} from "./theme";

export { DURATION as INVESTOR_DURATION, FPS as INVESTOR_FPS } from "./theme";

// Long narration lines are split at punctuation into subtitle chunks, each
// on screen for a share of its slot proportional to its length.
const SUBTITLES = VO_SLOTS.flatMap(({ start, end, text }) => {
  const parts = text.split(/(?<=[,—])\s+/).reduce<string[]>((acc, part) => {
    const last = acc[acc.length - 1];
    if (last && last.length + part.length < 60)
      acc[acc.length - 1] = `${last} ${part}`;
    else acc.push(part);
    return acc;
  }, []);
  const total = parts.reduce((s, p) => s + p.length, 0);
  let t = start;
  return parts.map((part) => {
    const from = t;
    t += ((end - start) * part.length) / total;
    return { from: f(from), to: f(t), text: part.replace(/\s*—$/, "") };
  });
});

const hasVoiceover = VOICEOVER.length > 0;

// Music sits lower under the narration, and lifts on the end card drop.
const musicVolume = (frame: number) =>
  interpolate(
    frame,
    [0, 10, END_CARD_FROM - 5, END_CARD_FROM + 5, DURATION - f(1.5), DURATION],
    [0, 0.55, 0.55, 0.75, 0.75, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  ) * (hasVoiceover ? 0.5 : 1);

// Sound effects from scripts/generate-investor-audio.mjs.
const SFX: { file: string; from: number; volume: number }[] = [
  { file: "pencil", from: 150, volume: 0.45 }, // opening: writing in the notebook
  { file: "cup", from: 452, volume: 0.55 }, // coffee cup set down
  { file: "ping", from: NOTIFY_FROM, volume: 0.65 }, // incoming message
];

export const InvestorPromo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.navy,
        direction: "rtl",
        fontFamily: SANS,
      }}
    >
      {SHOTS.map((shot) => (
        <Sequence
          key={shot.name}
          name={shot.name}
          from={shot.from}
          durationInFrames={shot.duration}
        >
          <Footage
            shot={shot}
            blur={
              shot.from === SPEC_CARD.from
                ? 10
                : shot.from === END_CARD_FROM
                  ? 6
                  : 0
            }
          >
            {shot.from <= CHECK_FROM &&
            CHECK_FROM < shot.from + shot.duration ? (
              <Sequence from={CHECK_FROM - shot.from} layout="none">
                <CheckMark />
              </Sequence>
            ) : null}
          </Footage>
        </Sequence>
      ))}
      <Grade />

      {[
        SEGMENTS.meeting.from,
        SEGMENTS.plans.from,
        SEGMENTS.closing.from,
        END_CARD_FROM,
      ].map((from) => (
        <Sequence
          key={from}
          name="Light flash"
          from={from - 4}
          durationInFrames={16}
        >
          <LightFlash />
        </Sequence>
      ))}

      <Sequence
        name="Spec card"
        from={SPEC_CARD.from}
        durationInFrames={SPEC_CARD.duration}
      >
        <SpecCard />
      </Sequence>

      {HEADLINES.map(({ from, to, emoji, text }) => (
        <Sequence
          key={text}
          name={`Headline: ${text}`}
          from={from}
          durationInFrames={to - from}
        >
          <Headline emoji={emoji} text={text} duration={to - from} />
        </Sequence>
      ))}

      <Sequence
        name="Phone notification"
        from={NOTIFY_FROM}
        durationInFrames={END_CARD_FROM - NOTIFY_FROM}
      >
        <PhoneNotification duration={END_CARD_FROM - NOTIFY_FROM} />
      </Sequence>

      <Sequence name="End card" from={END_CARD_FROM}>
        <EndCard />
      </Sequence>

      {SHOW_SUBTITLES
        ? SUBTITLES.map(({ from, to, text }) => (
            <Sequence
              key={text}
              name={`Subtitle: ${text}`}
              from={from}
              durationInFrames={to - from}
            >
              <Subtitle text={text} duration={to - from} />
            </Sequence>
          ))
        : null}

      {/* Audio */}
      <Html5Audio
        src={staticFile("investor/audio/music.mp3")}
        volume={musicVolume}
      />
      {SFX.map(({ file, from, volume }) => (
        <Sequence
          key={`${file}-${from}`}
          from={from}
          name={`SFX: ${file}`}
          layout="none"
        >
          <Html5Audio
            src={staticFile(`investor/audio/${file}.mp3`)}
            volume={volume}
          />
        </Sequence>
      ))}
      {VOICEOVER.map(({ id }, i) => (
        <Sequence
          key={id}
          from={f(VO_SLOTS[i].start)}
          name={`VO ${id}`}
          layout="none"
        >
          <Html5Audio src={staticFile(`investor/vo/${id}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
