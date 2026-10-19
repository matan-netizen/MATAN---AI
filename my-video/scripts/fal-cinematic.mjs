// Generates the live-action shots for DreamRaffleCine on fal.ai, in two
// stages so the stills can be approved before any video credits are spent:
//
//   FAL_KEY=... node scripts/fal-cinematic.mjs stills        # Flux stills
//   FAL_KEY=... node scripts/fal-cinematic.mjs clips [ids…]  # image-to-video
//
// Stills land in public/dreamcine/stills, clips in public/dreamcine/clips,
// and public/dreamcine/manifest.json records which clips exist (the
// composition falls back to the still/photo for shots without a clip).
//
// Drafts are 720p / 5s with fixed seeds (credit-saving plan). People shots
// use Kling (natural human motion); camera-only shots over the real
// apartment and Jerusalem photos use Wan (cheaper). All characters are
// fictional.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

// Without FAL_KEY, requests go out unauthenticated and rely on an egress
// proxy that injects the fal.ai credentials (e.g. Claude Code cloud sessions).
const KEY = process.env.FAL_KEY;
if (!KEY) {
  console.warn("FAL_KEY is not set; relying on proxy-injected fal.ai auth.");
}

const ROOT = "public/dreamcine";
const STILLS = join(ROOT, "stills");
const CLIPS = join(ROOT, "clips");
mkdirSync(STILLS, { recursive: true });
mkdirSync(CLIPS, { recursive: true });

const MAN =
  "a 28-year-old American Jewish man with a short neat dark beard, a black velvet kippah, " +
  "a white button-down shirt with rolled sleeves, warm brown eyes, friendly face";
const LOOK =
  "cinematic film still, shot on ARRI Alexa, 35mm lens, shallow depth of field, " +
  "natural skin texture, subtle film grain, photorealistic, vertical 9:16 composition";
const NEG =
  "cartoon, illustration, distorted face, extra fingers, deformed hands, text, watermark, logo, blurry";

// Stills generated from text (Flux dev) or edited from another still (Kontext).
const STILL_SHOTS = {
  rent: {
    model: "fal-ai/flux/dev",
    prompt: `stressed and worried, ${MAN}, NOT smiling, furrowed brow, tense jaw, one hand rubbing his temple, standing in a small cramped New York rental apartment kitchen at dusk, staring down at a rent payment notice on his smartphone with a frustrated, exhausted expression, cold blue window light, cluttered countertop, ${LOOK}`,
    seed: 4208,
  },
  key: {
    model: "fal-ai/flux/dev",
    prompt: `extreme close-up of a man's hand turning a brass key in the lock of a new wooden apartment door, warm golden light glowing through the door gap, Jerusalem stone wall in the hallway, ${LOOK}`,
    seed: 4211,
  },
  couch: {
    model: "fal-ai/flux-pro/kontext",
    from: "rent",
    prompt:
      "The same man, same face, kippah and shirt, now sitting relaxed on a modern beige sofa in a bright, " +
      "sunlit luxury apartment with a Jerusalem stone view through large windows, smiling at his smartphone " +
      "as if he just pressed a button, warm golden-hour light, cinematic, photorealistic, vertical 9:16",
    seed: 4219,
  },
};

// Image-to-video shots. `still` = a generated still; `src` = a real photo.
const CLIP_SHOTS = {
  rent: {
    model: "fal-ai/kling-video/v2.1/standard/image-to-video",
    still: "rent",
    prompt:
      "He looks at his phone, exhales a heavy sigh and rubs his forehead in frustration; slow handheld push-in, cold moody light",
  },
  jerusalem: {
    model: "fal-ai/wan-i2v",
    src: "kotel",
    prompt:
      "Slow cinematic aerial drift forward over the Old City of Jerusalem at golden hour, warm sunlight, a few birds crossing, gentle haze",
  },
  living: {
    model: "fal-ai/wan-i2v",
    src: "living",
    prompt:
      "Slow smooth dolly forward through a bright furnished luxury living room, soft sunlight moving across the floor, sheer curtains moving slightly",
  },
  view: {
    model: "fal-ai/wan-i2v",
    src: "view",
    prompt:
      "Slow cinematic push toward the balcony and the panoramic view of Jerusalem, warm afternoon light, gentle breeze in the plants",
  },
  key: {
    model: "fal-ai/kling-video/v2.1/standard/image-to-video",
    still: "key",
    prompt:
      "The hand turns the key and pushes the door open; warm golden light floods out of the apartment; slow push-in, shallow depth of field",
  },
  couch: {
    model: "fal-ai/kling-video/v2.1/standard/image-to-video",
    still: "couch",
    prompt:
      "He taps his phone screen, looks up toward the camera with a big relieved smile and leans back on the sofa; slow dolly-in, warm golden light",
  },
};

const headers = {
  ...(KEY ? { Authorization: `Key ${KEY}` } : {}),
  "Content-Type": "application/json",
};

// fal queue API: submit, poll status, then fetch the result. Without a key,
// use the synchronous fal.run endpoint (the host the proxy authenticates).
const run = async (model, input) => {
  if (!KEY) {
    // curl, not fetch: video jobs can outlast undici's 5-minute header timeout.
    const out = execFileSync(
      "curl",
      ["-sS", "--fail-with-body", "--max-time", "1500", "-X", "POST",
       "-H", "Content-Type: application/json", "--data-binary", "@-",
       `https://fal.run/${model}`],
      { input: JSON.stringify(input), maxBuffer: 64 << 20 },
    );
    return JSON.parse(out.toString());
  }
  const sub = await fetch(`https://queue.fal.run/${model}`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  if (!sub.ok) throw new Error(`${model}: ${sub.status} ${await sub.text()}`);
  const { status_url, response_url } = await sub.json();
  for (;;) {
    await new Promise((r) => setTimeout(r, 4000));
    const st = await (await fetch(status_url, { headers })).json();
    if (st.status === "COMPLETED") break;
    if (st.status === "FAILED" || st.error)
      throw new Error(`${model}: ${JSON.stringify(st)}`);
    process.stdout.write(".");
  }
  const res = await fetch(response_url, { headers });
  if (!res.ok) throw new Error(`${model}: ${res.status} ${await res.text()}`);
  return res.json();
};

const download = async (url, path) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download ${url}: ${r.status}`);
  writeFileSync(path, Buffer.from(await r.arrayBuffer()));
  console.log(`\n  saved ${path}`);
};

const dataUri = (path) =>
  `data:image/jpeg;base64,${readFileSync(path).toString("base64")}`;

const stage = process.argv[2];
const only = process.argv.slice(3);
const pick = (obj) =>
  Object.entries(obj).filter(([id]) => !only.length || only.includes(id));

if (stage === "stills") {
  for (const [id, s] of pick(STILL_SHOTS)) {
    console.log(`still: ${id} (${s.model})`);
    const input =
      s.model === "fal-ai/flux/dev"
        ? {
            prompt: s.prompt,
            image_size: { width: 768, height: 1344 },
            num_images: 1,
            seed: s.seed,
            num_inference_steps: 28,
            guidance_scale: 3.5,
          }
        : {
            prompt: s.prompt,
            image_url: dataUri(join(STILLS, `${s.from}.jpg`)),
            seed: s.seed,
            aspect_ratio: "9:16",
          };
    const out = await run(s.model, input);
    await download(out.images[0].url, join(STILLS, `${id}.jpg`));
    const manifestPath = join(ROOT, "manifest.json");
    const manifest = existsSync(manifestPath)
      ? JSON.parse(readFileSync(manifestPath, "utf8"))
      : {};
    manifest[`still:${id}`] = true;
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  }
  console.log(
    "\nStills done. Review them in public/dreamcine/stills before running `clips`.",
  );
} else if (stage === "clips") {
  const manifestPath = join(ROOT, "manifest.json");
  const manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf8"))
    : {};
  for (const [id, c] of pick(CLIP_SHOTS)) {
    const image = c.still
      ? join(STILLS, `${c.still}.jpg`)
      : join(ROOT, "src", `${c.src}.jpg`);
    if (!existsSync(image)) {
      console.log(`skip ${id}: ${image} missing`);
      continue;
    }
    console.log(`clip: ${id} (${c.model})`);
    const input = c.model.includes("kling")
      ? {
          prompt: c.prompt,
          image_url: dataUri(image),
          duration: "5",
          negative_prompt: NEG,
          cfg_scale: 0.5,
        }
      : {
          prompt: c.prompt,
          image_url: dataUri(image),
          resolution: "720p",
          aspect_ratio: "9:16",
          num_frames: 81,
          seed: 4200,
          negative_prompt: NEG,
        };
    const out = await run(c.model, input);
    await download(out.video.url, join(CLIPS, `${id}.mp4`));
    manifest[id] = true;
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  }
  console.log("\nClips done.");
} else {
  console.error("usage: node scripts/fal-cinematic.mjs stills|clips [ids…]");
  process.exit(1);
}
