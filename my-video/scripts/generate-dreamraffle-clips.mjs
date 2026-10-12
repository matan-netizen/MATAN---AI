// Generates the AI footage for DreamRaffle on fal.ai in two approved stages,
// so credits are only spent on shots that passed review:
//
//   FAL_KEY=... npm run dreamraffle -- images          # 8 stills (Flux, 4:5)
//   FAL_KEY=... npm run dreamraffle -- videos          # animate them (Wan 2.1 I2V, 480p draft)
//   FAL_KEY=... npm run dreamraffle -- videos --final  # 720p for the approved cut
//
// Add --only 3,5 to (re)generate just those shots. Shots that already have a
// file are skipped, so a re-run never pays twice for the same output.
// Writes public/dreamraffle/img/NN.jpg, public/dreamraffle/clips/NN.mp4 and
// src/DreamRaffle/clips.json (the composition reads it to pick up the clips).
//
// No text is requested from the models: they garble Hebrew, so every word
// on screen is laid over in the Remotion composition instead.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const IMAGE_MODEL = "fal-ai/flux/dev";
const VIDEO_MODEL = "fal-ai/wan-i2v";
const SEED = 42;

// Subject + action + camera + lighting + atmosphere, one shot per scene.
const STYLE =
  "cinematic photograph, warm golden hour light, shallow depth of field, " +
  "rich gold and deep navy color palette, high detail, no text, no letters, no watermark";
const SHOTS = [
  {
    id: "01",
    image: `A golden key turning in the lock of a luxury apartment front door, Jerusalem stone walls and a view of the Jerusalem skyline through a window behind, ${STYLE}`,
    motion: "The key slowly turns in the lock, the camera pushes in gently, warm light flickers",
  },
  {
    id: "02",
    image: `A smartphone ringing on a wooden table, screen glowing, a man's hand reaching to pick it up, cozy home interior, ${STYLE}`,
    motion: "The hand lifts the phone from the table, slow dolly in, the screen glows",
  },
  {
    id: "03",
    image: `A suitcase next to an airplane window, below the window the coastline and green hills of Israel at sunrise, ${STYLE}`,
    motion: "Clouds drift past the window, the land below slowly moves, gentle camera sway",
  },
  {
    id: "04",
    image: `A man's hands opening a luxurious golden envelope on a dark table, light spilling out of the envelope, ${STYLE}`,
    motion: "The hands open the envelope and golden light glows from inside, slow push in",
  },
  {
    id: "05",
    image: `The ancient walls of Jerusalem's Old City at golden hour, warm stone, wide shot, ${STYLE}`,
    motion: "Slow aerial pan along the city walls, birds fly across, sunlight shimmers",
  },
  {
    id: "06",
    image: `A bright, newly furnished luxury living room with large windows overlooking Jerusalem hills, elegant sofa and warm lamps, empty room, ${STYLE}`,
    motion: "Slow dolly forward through the living room toward the windows, curtains move slightly",
  },
  {
    id: "07",
    image: `A glowing golden raffle ticket floating above a dark navy background with sparkling particles, ${STYLE}`,
    motion: "The ticket rotates slowly and sparkles burst around it, camera static",
  },
  {
    id: "08",
    image: `A neat stack of US dollar bills on a dark table lit by a dramatic golden beam of light, sparkling dust in the air, ${STYLE}`,
    motion: "Golden dust drifts through the beam of light, slow push in on the money",
  },
];

const KEY = process.env.FAL_KEY;
if (!KEY) {
  console.error(
    "FAL_KEY is not set. Add your fal.ai API key as an environment variable " +
      "(or network secret), then start a new session and run again.",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const stage = args[0];
const final = args.includes("--final");
const onlyArg = args.indexOf("--only");
const only = onlyArg >= 0 ? args[onlyArg + 1].split(",").map((n) => n.padStart(2, "0")) : null;
if (stage !== "images" && stage !== "videos") {
  console.error("Usage: npm run dreamraffle -- images|videos [--final] [--only 1,3]");
  process.exit(1);
}

const MANIFEST = "src/DreamRaffle/clips.json";
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
const save = () => writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

// fal queue API: submit, poll until done, then fetch the result.
const run = async (model, input) => {
  const headers = { authorization: `Key ${KEY}`, "content-type": "application/json" };
  const submit = await fetch(`https://queue.fal.run/${model}`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  if (!submit.ok) throw new Error(`${model}: ${submit.status} ${await submit.text()}`);
  const { status_url, response_url } = await submit.json();
  for (;;) {
    await new Promise((r) => setTimeout(r, 3000));
    const s = await (await fetch(status_url, { headers })).json();
    if (s.status === "COMPLETED") break;
    if (s.status === "FAILED" || s.error) throw new Error(`${model}: ${JSON.stringify(s)}`);
  }
  const res = await fetch(response_url, { headers });
  if (!res.ok) throw new Error(`${model}: ${res.status} ${await res.text()}`);
  return res.json();
};

const download = async (url, path) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url}: ${res.status}`);
  writeFileSync(path, Buffer.from(await res.arrayBuffer()));
};

mkdirSync("public/dreamraffle/img", { recursive: true });
mkdirSync("public/dreamraffle/clips", { recursive: true });

for (const shot of SHOTS) {
  if (only && !only.includes(shot.id)) continue;
  const entry = (manifest[shot.id] ??= {});

  if (stage === "images") {
    const path = `public/dreamraffle/img/${shot.id}.jpg`;
    if (existsSync(path) && !only) {
      console.log(`${shot.id}: image exists, skipping`);
      continue;
    }
    console.log(`${shot.id}: generating image…`);
    const out = await run(IMAGE_MODEL, {
      prompt: shot.image,
      image_size: { width: 1024, height: 1280 }, // 4:5
      num_inference_steps: 28,
      seed: SEED,
      num_images: 1,
      output_format: "jpeg",
    });
    entry.imageUrl = out.images[0].url;
    entry.image = `dreamraffle/img/${shot.id}.jpg`;
    delete entry.clip; // a new still invalidates the old animation
    await download(entry.imageUrl, path);
  } else {
    if (!entry.imageUrl) {
      console.log(`${shot.id}: no approved image yet, run "images" first`);
      continue;
    }
    const resolution = final ? "720p" : "480p";
    if (entry.clip && entry.resolution === resolution && !only) {
      console.log(`${shot.id}: ${resolution} clip exists, skipping`);
      continue;
    }
    console.log(`${shot.id}: animating at ${resolution}…`);
    const out = await run(VIDEO_MODEL, {
      prompt: shot.motion,
      negative_prompt: "text, letters, watermark, distorted hands, blurry, low quality",
      image_url: entry.imageUrl,
      num_frames: 81, // the model's minimum: ~5s at 16fps
      frames_per_second: 16,
      resolution,
      aspect_ratio: "auto",
      seed: SEED,
    });
    entry.clip = `dreamraffle/clips/${shot.id}.mp4`;
    entry.resolution = resolution;
    await download(out.video.url, `public/${entry.clip}`);
  }
  save();
}
console.log("Done. Preview with: npm run dev → DreamRaffle");
