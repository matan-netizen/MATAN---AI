// Generates DreamRaffle's music and sound effects with ElevenLabs (music +
// sound-effects v2) through fal.ai. Output is not deterministic, so the files
// in public/dream/audio are the committed takes; rerun only to replace them.
//
//   npm run dream-audio            # everything
//   npm run dream-audio -- ring    # just the named files
//
// Needs FAL_KEY, or a proxy that injects fal.ai credentials.
// The music sections follow the scene windows in src/DreamRaffle/theme.ts.

import { mkdirSync, writeFileSync } from "node:fs";

const COMPOSITION_PLAN = {
  positive_global_styles: [
    "cinematic uplifting corporate",
    "modern pop orchestral hybrid",
    "warm strings",
    "piano",
    "punchy modern drums",
    "hopeful",
    "premium commercial",
    "instrumental",
    "120 bpm",
    "major key",
  ],
  negative_global_styles: [
    "vocals",
    "lyrics",
    "singing",
    "choir",
    "lo-fi",
    "dark",
    "aggressive",
    "dubstep",
  ],
  sections: [
    {
      section_name: "Hook",
      positive_local_styles: [
        "ticking pulse",
        "plucked piano ostinato",
        "anticipation",
        "light percussion",
        "tension",
      ],
      negative_local_styles: ["full drums"],
      duration_ms: 5200,
      lines: [],
    },
    {
      section_name: "Story",
      positive_local_styles: [
        "emotional",
        "soft piano",
        "warm strings pad",
        "intimate",
        "sparse",
      ],
      negative_local_styles: ["drums"],
      duration_ms: 8000,
      lines: [],
    },
    {
      section_name: "Build",
      positive_local_styles: [
        "driving",
        "four on the floor kick",
        "claps",
        "rising strings",
        "energetic",
        "bright synth plucks",
      ],
      negative_local_styles: [],
      duration_ms: 18000,
      lines: [],
    },
    {
      section_name: "Lift",
      positive_local_styles: [
        "riser",
        "snare roll",
        "tension build",
        "filter sweep",
      ],
      negative_local_styles: [],
      duration_ms: 3400,
      lines: [],
    },
    {
      section_name: "Finale",
      positive_local_styles: [
        "triumphant",
        "full anthem",
        "big drums",
        "soaring strings",
        "final resolving hit and ring out",
      ],
      negative_local_styles: [],
      duration_ms: 8400,
      lines: [],
    },
  ],
};

const EFFECTS = {
  ring: [
    "modern smartphone ringtone with vibration buzz, bright clean marimba ring, two short rings, no music",
    2.2,
  ],
  whoosh: ["fast cinematic whoosh transition swish, clean, short", 0.8],
  impact: [
    "deep cinematic boom impact hit with shimmer tail, trailer reveal",
    1.8,
  ],
  shimmer: ["magical gold sparkle shimmer chime, bright glitter twinkle", 1.5],
  ding: ["bright positive notification ding, coin reward chime, clean", 1.0],
  riser: ["short cinematic riser swell build up tension, ending abruptly", 2.6],
};

const KEY = process.env.FAL_KEY;
const outDir = "public/dream/audio";
mkdirSync(outDir, { recursive: true });

const run = async (model, body) => {
  const res = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(KEY ? { authorization: `Key ${KEY}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${model}: ${res.status} ${await res.text()}`);
  const { audio } = await res.json();
  return Buffer.from(await (await fetch(audio.url)).arrayBuffer());
};

const only = process.argv.slice(2);
const wanted = (name) => only.length === 0 || only.includes(name);

if (wanted("music")) {
  writeFileSync(
    `${outDir}/music.mp3`,
    await run("fal-ai/elevenlabs/music", {
      composition_plan: COMPOSITION_PLAN,
    }),
  );
  console.log("music");
}
for (const [name, [text, seconds]] of Object.entries(EFFECTS)) {
  if (!wanted(name)) continue;
  writeFileSync(
    `${outDir}/${name}.mp3`,
    await run("fal-ai/elevenlabs/sound-effects/v2", {
      text,
      duration_seconds: seconds,
      prompt_influence: 0.6,
    }),
  );
  console.log(name);
}
