# The Dream Raffle (9th Annual Edition): English Promo Video
## Production Script and AI Media Roadmap

| | |
|---|---|
| **Deliverable** | Vertical promo, 1080 × 1920 (9:16), 30 fps, **42 s** master, plus a 15 s cutdown |
| **Reference cut** | `DreamRaffle_EN_1.mp4` (41.8 s, 1080 × 1920). This plan keeps its structure and fixes its localization gaps |
| **Website** | https://thedreamraffle.co.il/ |
| **Source footage** | [Dream Raffle Assets Drive](https://drive.google.com/drive/folders/1lpFg6ba28jFL-5DfgVmG6AtzLQJ43psl?usp=sharing): winner interview, balcony walk-through, impact photos, presenter cut-out |
| **AI pipeline** | [fal.ai dashboard](https://fal.ai/dashboard) |
| **Assembly** | Remotion (`my-video/`), following the pattern of `src/RealEstatePromo` |

---

## 0. What the reference cut gets wrong (fix list)

I reviewed the uploaded reference cut frame by frame. The English headline captions are already in place, but these elements are still in Hebrew or in the wrong position:

| # | Time | Problem in reference | Fix |
|---|---|---|---|
| 1 | Whole video | Top logo "הגרלת החלומות / שנה תשיעית ברציפות" is in Hebrew | Swap in the English logo lockup (§2A) |
| 2 | 0:06–0:15 | Winner lower-third "אריה לוריא – הזוכה בהגרלת החלומות 8" is in Hebrew | **"Aryeh Luria – Winner of Dream Raffle 8"** |
| 3 | 0:06–0:15 | Prize card "הפרס הגדול / דירת יוקרה בירושלים / בשווי 1.3 מיליון דולר" is in Hebrew | **"Grand Prize: Luxury Jerusalem Apartment Valued at $1.3M"** |
| 4 | 0:06–0:36 | **Interview subtitles sit at the bottom of the outer canvas**, below the frame | Move every subtitle **inside the video frame container** (§2B) |
| 5 | 0:15–0:24 | 1+1 badge copy "קונים כרטיס אחד ומקבלים עוד אחד במתנה / כל ההזמנות מוכפלות" is in Hebrew | **"1+1 Free Ticket!"** / **"All Orders Doubled!"** |
| 6 | 0:24–0:36 | Impact badges "מוסדות תורה / ציוד חירום להצלת חיים / חיילי צה״ל" are in Hebrew | **"Torah Institutions" / "Lifesaving Emergency Equipment" / "IDF Soldiers"** |
| 7 | 0:24–0:36 | The burned-in watermark in the frame reads **TheDreamRaffle.com**, but the official domain is **.co.il** | Mask it and replace it with `thedreamraffle.co.il`, or crop it out |
| 8 | 0:36–0:39 | CTA button "כניסה להגרלה ←" is in Hebrew | **"Enter the Raffle →"** (the arrow flips for LTR) |
| 9 | 0:39–0:42 | End card logo and "1+1 מתנה על כל הכרטיסים" are in Hebrew | English logo, plus **"1+1 Free Ticket on All Orders!"** |

---

## 1. Brand system

### Palette (sampled from the reference)
| Token | Hex | Use |
|---|---|---|
| `espresso` | `#24180F` | Canvas background, vignette |
| `walnut` | `#4A3322` | Cards, caption plates |
| `gold` | `#D9A441` | Frame borders, highlight words, buttons |
| `goldLight` | `#F3D27A` | Button gradient top, sparkles |
| `cream` | `#FBF3E2` | URL pill, body text on dark |
| `ink` | `#1A120B` | Text on gold and cream |

### Typography
- **Headlines:** Heebo ExtraBold or Rubik Bold (both cover Latin and Hebrew, so they match the original), 64–72 px, white, with the highlight word in `gold`.
- **Subtitles:** Heebo SemiBold, 40 px, white on a `#000000B3` plate with 10 px radius and 12/20 px padding.
- **Lower third:** Heebo Bold, 38 px name and 26 px role.

### Motion language
A gold dust particle layer runs the whole time at 20% opacity. Cards enter with a 12-frame scale from 0.92 to 1 plus a fade. Headline words reveal one at a time, 4 frames apart. The frame border has a slow gold shimmer sweep every 2 s.

---

## 2. Graphics and localization

### A. Logo and badges
| Element | Hebrew source | English final |
|---|---|---|
| Main logo | הגרלת החלומות – שנה תשיעית ברציפות | **The Dream Raffle – 9th Consecutive Year** |
| Deal badge (gold seal) | 1+1 כרטיס במתנה! / כל ההזמנות מוכפלות! | **1+1 Free Ticket!** / **All Orders Doubled!** |
| CTA button | כניסה להגרלה ← | **Enter the Raffle →** |

**Logo lockup:** keep the Jerusalem-skyline crest. Set "THE DREAM RAFFLE" on the dark band in two lines, "THE DREAM" over "RAFFLE", and run the arc text "9th Consecutive Year" around the bottom of the medallion.

### B. Frame layout and subtitle positioning (mandatory)

```
┌──────────────── 1080 ────────────────┐
│            [ LOGO  y 60–200 ]         │
│   ┌──── Headline plate y 230–420 ──┐  │
│   └────────────────────────────────┘  │
│ ┌──── VIDEO FRAME  x 40–1040 ───────┐ │  y 560
│ │ [Lower third: top-left, inset 24] │ │
│ │                                   │ │
│ │      (interview footage)          │ │
│ │                                   │ │
│ │   ┌── SUBTITLE PLATE ──────────┐  │ │  bottom inset 32 px
│ │   └────────────────────────────┘  │ │
│ └───────────────────────────────────┘ │  y 1125  (4 px gold border, 18 px radius)
│   [ Prize card / 1+1 seal / badges ]  │  y 1180–1600
│                                       │
│        (platform UI safe zone)        │  y 1650–1920: no text
└───────────────────────────────────────┘
```

Rules:
1. **Subtitles are children of the frame container,** never of the canvas. In Remotion, render `<Subtitle/>` inside the same `<div>` that has `overflow: hidden` and the gold border. Position it `absolute; bottom: 32px; left: 50%; translateX(-50%); max-width: 88%`.
2. At most 2 lines and 42 characters per line. Keep each subtitle up for at least 1.2 s.
3. **The lower third moves to the top-left inside the frame** so it never collides with subtitles. This replaces its bottom-left position in the reference.
4. Text inside the frame must keep a 4.5:1 contrast ratio. The subtitle plate guarantees this over the white-wall interview background.

| Overlay | Final English copy | Placement |
|---|---|---|
| Winner tag (lower third) | **Aryeh Luria – Winner of Dream Raffle 8** | Inside frame, top-left |
| Prize banner | **Grand Prize: Luxury Jerusalem Apartment Valued at $1.3M** | Card under frame, with "$1.3M" at 120 px gold |
| Impact badge 1 | **Torah Institutions** | Badge row under frame, left |
| Impact badge 2 | **Lifesaving Emergency Equipment** | Center. Wraps to 2 lines at 26 px |
| Impact badge 3 | **IDF Soldiers** | Right |

---

## 3. fal.ai model stack

| Job | Model | Endpoint |
|---|---|---|
| Luxury apartment and interior stills | FLUX.2 [pro] / FLUX 1.1 [pro] Ultra | `fal-ai/flux-pro/v2`, `fal-ai/flux-pro/v1.1-ultra` |
| Character-consistent people and expressions | Nano Banana 2 | `fal-ai/nano-banana-2` |
| On-screen text graphics (badges, seal, button, end card) | Ideogram V3 / Recraft V3 | `fal-ai/ideogram/v3`, `fal-ai/recraft-v3` |
| Image-to-video and motion control | Kling 3.0 Motion Control | `fal-ai/kling-video/v3.0/motion-control` |
| Cinematic Jerusalem B-roll (text-to-video) | Veo 3.1 | `fal-ai/veo-3.1` |
| Fast social variants and drafts | Wan 2.5 / 2.7 | `fal-ai/wan-2.5` |
| Voiceover | ElevenLabs TTS | `fal-ai/elevenlabs/text-to-speech` |

> **Before the first run,** confirm each endpoint ID and its current input schema on the model's fal page. Endpoint IDs and parameter names change between versions. Run drafts on Wan first and spend Veo and Kling credits only on approved shots.

**Rule for real footage:** the winner interview and the balcony scene are **real recorded footage from the Drive**. AI is used only for B-roll, transitions, backgrounds and graphics. **Never generate or alter the face, likeness or words of Aryeh Luria or any other real person.** Use AI-generated people only in clearly generic, non-testimonial shots.

---

## 4. Scene-by-scene script (42 s master)

**VO voice:** a warm, confident male narrator with a mid-Atlantic English accent and slight Israeli warmth. Pace is about 150 wpm. ElevenLabs settings: `stability 0.45`, `similarity_boost 0.8`, `style 0.35`.

**Music:** an uplifting cinematic bed (strings and soft piano) that builds at 0:24 and swells at the CTA. Duck it −14 dB under VO and interview audio.

---

### SCENE 1: HOOK (0:00–0:03 · 90 frames)
**Visual:** a macro dolly past a set dining table in the prize apartment (wine bottles, flower vase, glassware) with warm afternoon light. Logo at the top.
**Headline (on canvas):** "He **won** an apartment **in Jerusalem.**"
**VO:** "Last year, one ticket changed everything."
**Source:** the reference shot from Drive. If you need a cleaner plate, generate one with the prompts below.

- **FLUX 1.1 [pro] Ultra still** (`aspect_ratio: "9:16"`, `raw: true`):
  > Photorealistic macro close-up of an elegant set dining table in a newly built luxury Jerusalem apartment, two bottles of Israeli red wine, crystal glasses, a glass vase of yellow and green lisianthus flowers, white plates, linen napkins, warm golden-hour light through sheer curtains, shallow depth of field, Jerusalem stone visible through window bokeh, architectural digest style, 85mm lens, no people, no text
- **Kling 3.0 Motion Control** (image-to-video, 5 s, trimmed to 3 s):
  > Slow lateral dolly right past the wine bottles, gentle rack focus from the bottles to the flowers, dust particles drifting in sunbeams, subtle and steady, no new objects

---

### SCENE 2: TURN TO VIEWER (0:03–0:06 · 90 frames)
**Visual:** a wide shot of the dining room with a pendant lamp glowing. The camera pushes in.
**Headline:** "This year – it could be **you!**"
**VO:** "This year… it could be you."

- **FLUX.2 [pro]** (`image_size: portrait_16_9`):
  > Wide interior of a modern luxury Jerusalem apartment dining area, round oak table set for dinner, brass pendant lamp glowing warmly, cream walls, large window with view of Jerusalem stone buildings at golden hour, minimalist high-end furnishings, photorealistic real-estate photography, vertical composition, empty room, no text
- **Kling 3.0 Motion Control:**
  > Slow cinematic push-in toward the table, pendant lamp light flickers on softly, warm lens bloom, 3 seconds

**Transition:** a gold light-leak wipe into Scene 3.

---

### SCENE 3: MEET THE WINNER (0:06–0:15 · 270 frames)
**Layout:** framed interview (§2B) with the prize card below it.
**Headline:** "Meet last year's **winner!**"
**Inside frame, top-left lower third (0:06.5–0:10):** **Aryeh Luria – Winner of Dream Raffle 8**
**Prize card (under frame):** "GRAND PRIZE · Luxury Jerusalem Apartment · **$1.3M** · Valued at $1.3M"

**Interview subtitles (inside the frame, bottom-center):**
| In | Out | Speaker | Subtitle |
|---|---|---|---|
| 0:07.0 | 0:09.0 | Aryeh | I sit and learn Torah all day. |
| 0:09.2 | 0:10.8 | Interviewer | How do you feel? |
| 0:11.0 | 0:14.6 | Aryeh | Overjoyed. Nobody is happier than me! |

**Source:** the real interview footage from Drive only. Keep the original audio and play no VO over it.
**Graphic asset (Ideogram V3,** `style: DESIGN`, transparent PNG**):**
> Luxury prize card graphic, dark walnut brown rounded rectangle with thin gold border and soft inner glow, small crest logo on top, text "GRAND PRIZE" small caps, "Luxury Jerusalem Apartment", large metallic gold "$1.3M", small "Valued at $1.3M", elegant premium typography, flat front view, transparent background

> In practice, build typography in Remotion as live text and use Ideogram or Recraft only for decorative textures such as the gold seal ring and frame shimmer. Live text keeps the copy pixel-sharp and editable.

---

### SCENE 4: THE OFFER (0:15–0:24 · 270 frames)
**Layout:** the interview continues in the frame. Below it, the **1+1 gold seal** spins in, with offer copy beside it.
**Headline:** "This time – it could be **you!**"
**Seal:** **1+1** · "Free Ticket!"
**Offer copy (beside the seal):** "Buy one ticket, get one **free!**"
**Pill under the copy:** **All Orders Doubled!**

**Interview subtitles (inside the frame):**
| In | Out | Subtitle |
|---|---|---|
| 0:16.0 | 0:19.0 | Did you expect to win? *(interviewer: verify against transcript)* |
| 0:19.2 | 0:21.6 | Honestly, no. I didn't think I'd win. |
| 0:22.0 | 0:23.8 | Everything changed. |

**VO (ducked under interview, enters at 0:22.5):** "And right now, every ticket comes with a free one."

**Seal asset (Recraft V3,** `style: vector_illustration`**):**
> Circular gold medal seal with serrated starburst edge, embossed metallic gold gradient, dotted inner ring, large bold "1+1" in dark brown in the center, small curved text "FREE TICKET" below, premium luxury sale badge, isolated on transparent background

**Motion:** the seal rotates from −25° to 0° with a spring (`damping 12`), then a gold glint sweeps across it every 1.5 s.

---

### SCENE 5: IMPACT (0:24–0:36 · 360 frames)
**Layout:** balcony footage in the frame (Aryeh with the presenter, Jerusalem panorama behind). Three impact badge cards below.
**Headline:** "One ticket. A hundred ways to build the **Land of Israel**"
**Badges (staggered entry, 6 frames apart):** **Torah Institutions** · **Lifesaving Emergency Equipment** · **IDF Soldiers**
**Watermark fix:** mask the burned-in "TheDreamRaffle.com" (bottom-left of frame) with a blurred patch and overlay a small cream pill reading `thedreamraffle.co.il`.

**Subtitles (inside the frame):**
| In | Out | Subtitle |
|---|---|---|
| 0:25.0 | 0:28.5 | Aryeh Luria won this apartment… |
| 0:29.0 | 0:32.5 | *(transcribe actual balcony dialogue)* |
| 0:33.0 | 0:35.8 | Who will be the winner of the 9th Dream Raffle? |

**VO (0:24–0:28, before the balcony audio):** "Every ticket supports Torah institutions, lifesaving emergency equipment, and IDF soldiers."

**Optional B-roll cutaway (0:28–0:30, inside the frame), Veo 3.1** (`aspect_ratio: "9:16"`, `duration: "4s"`, `generate_audio: false`):
> Cinematic aerial drone shot gliding over Jerusalem at golden hour, Jerusalem stone residential neighborhoods, the Old City walls and golden dome glowing in the distance, warm haze, slow forward motion, photorealistic, 4K, no text, no people in close-up

**Badge photos:** use the real impact photos from Drive (yeshiva students, ambulance team, soldiers receiving packages). If a stand-in is needed, generate a generic, non-identifiable scene with Nano Banana 2:
> Documentary-style photo of a modern Israeli emergency ambulance with a team of paramedics in high-visibility vests standing beside it, daylight, Jerusalem street, faces natural and non-identifiable at distance, editorial photo, no text

---

### SCENE 6: CTA (0:36–0:39 · 90 frames)
**Visual:** an apartment interior background, blurred and darkened 40%. The presenter cut-out (gold jacket, pointing at the viewer) slides in from the bottom-left.
**Headline:** "**Enter now** and secure your ticket!"
**URL pill:** `thedreamraffle.co.il` with an animated chevron below it pointing to the button.
**Button:** **Enter the Raffle →** in a gold gradient (`goldLight` to `gold`) with ink text and a pulse scale of 1 → 1.04 → 1 every 20 frames.
**VO:** "Enter now at thedreamraffle dot co dot il."

**Presenter animation, Kling 3.0 Motion Control** (from the existing cut-out still; reference-video motion: a pointing gesture toward the camera with a slight lean):
> The man in the gold jacket smiles and points confidently at the camera, slight forward lean, subtle nod, background stays transparent and static

---

### SCENE 7: END CARD (0:39–0:42 · 90 frames)
**Visual:** espresso background with gold particles. The large English logo lockup scales in.
**Logo:** **The Dream Raffle – 9th Consecutive Year**
**Pill 1 (gold):** **1+1 Free Ticket on All Orders!**
**Pill 2 (cream):** `thedreamraffle.co.il`
**VO:** "The Dream Raffle. Ninth year running."
**SFX:** a soft chime on the logo landing.

---

## 5. Voiceover master script (ElevenLabs via fal)

```
[0:00] Last year, one ticket changed everything.
[0:03] This year… it could be you.
[0:22.5] And right now, every ticket comes with a free one.
[0:24] Every ticket supports Torah institutions, lifesaving emergency equipment, and IDF soldiers.
[0:36] Enter now at thedreamraffle dot co dot il.
[0:39] The Dream Raffle. Ninth year running.
```

Generate one clip per line, matching the approach in `scripts/generate-voiceover.mjs`, so each scene can be timed to its clip length:

```js
import { fal } from "@fal-ai/client";
const out = await fal.subscribe("fal-ai/elevenlabs/text-to-speech", {
  input: {
    text: "Last year, one ticket changed everything.",
    voice: "<approved male narrator voice>",
    stability: 0.45,
    similarity_boost: 0.8,
    style: 0.35,
  },
});
// out.data.audio.url -> save to public/dream-raffle/vo/01.mp3
```

---

## 6. 15-second cutdown (Reels, Shorts, Status)

| Time | Content |
|---|---|
| 0:00–0:02 | Scene 1 hook: "He won an apartment in Jerusalem." |
| 0:02–0:07 | Scene 3, compressed: winner frame + lower third + "$1.3M" card; subtitle "Overjoyed. Nobody is happier than me!" (inside the frame) |
| 0:07–0:11 | Scene 4 seal: "1+1 Free Ticket! · All Orders Doubled!" |
| 0:11–0:15 | Scene 6 CTA + URL + "Enter the Raffle →" |

Render drafts with **Wan 2.5** for speed, then finalize from the master assets.

---

## 7. Production pipeline

1. **Ingest:** pull the interview, balcony, impact photos and presenter cut-out from Drive into `public/dream-raffle/`.
2. **Transcribe and translate the interview:** export an SRT, then fix the timings against the tables above.
3. **Generate stills** (FLUX, Ideogram, Recraft): 2–4 variants each. Pick the best.
4. **Animate** (Kling for approved stills, Veo for the aerial). Draft on Wan first.
5. **Generate the VO** (ElevenLabs), one file per line.
6. **Assemble in Remotion** as a new composition, `DreamRaffle9EN` (1080×1920, 30 fps, 1260 frames), with a `theme.ts` from §1 and a `FramedClip` component that **owns the subtitle layer**.
7. **QA** against the checklist below.
8. **Export:** H.264 MP4 at 12 Mbps with AAC 320k, plus the 15 s cutdown and a 1:1 variant if needed.

---

## 8. QA checklist

- [ ] No Hebrew text anywhere on screen: logo, lower third, prize card, seal, pills, badges, button, end card
- [ ] **Every interview subtitle renders inside the gold video frame,** none on the outer canvas
- [ ] The lower third and subtitles never overlap
- [ ] The domain reads **thedreamraffle.co.il** everywhere, and the ".com" watermark is masked
- [ ] The "$1.3M" figure and "9th" edition are consistent across all graphics
- [ ] The CTA arrow points right (→) for LTR
- [ ] No text inside the bottom 270 px (platform UI) or the top 60 px
- [ ] No AI-generated or altered likeness of real people
- [ ] Loudness is −14 LUFS integrated, and the VO is intelligible on phone speakers
- [ ] Legal and raffle terms line added if the platform requires it (confirm wording with the client)
