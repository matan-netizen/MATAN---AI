// "Your Key to Jerusalem": 59s English-only spot for a U.S. audience.
// Every claim comes from thedreamraffle.co.il (home page and FAQ).
export const FPS = 30;
export const DURATION = 1780;
export const CROSSFADE = 10;

export const SCENES = {
  hook: { from: 0, duration: 164 },
  prize: { from: 164, duration: 252 },
  offer: { from: 416, duration: 132 },
  earlyBird: { from: 548, duration: 164 },
  superTicket: { from: 712, duration: 200 },
  mission: { from: 912, duration: 406 },
  proof: { from: 1318, duration: 147 },
  cta: { from: 1465, duration: 315 },
};

// ElevenLabs v3 "Brian" lines (public/dreamraffle-us/vo), pauses trimmed and
// sped up 7% (line 6: 9%). `from` is the start frame.
export const VO = [6, 164, 416, 548, 712, 912, 1318, 1465].map((from, i) => ({
  src: `dreamraffle-us/vo/0${i + 1}.mp3`,
  from,
}));

// Site photos with any readable Hebrew blurred.
export const IMG = "dreamraffle-us/img";
