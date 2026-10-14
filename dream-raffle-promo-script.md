# The Dream Raffle — 9th Annual Edition
## AI Promo Video Script & Fal.ai Production Roadmap

| | |
|---|---|
| **Format** | 40-second promo (master), 16:9 + 9:16 + 1:1 cutdowns |
| **Website / CTA** | [thedreamraffle.co.il](https://thedreamraffle.co.il/) |
| **Source assets** | [Dream Raffle Assets Drive](https://drive.google.com/drive/folders/1lpFg6ba28jFL-5DfgVmG6AtzLQJ43psl?usp=sharing) |
| **Render hub** | [fal.ai Dashboard](https://fal.ai/dashboard) |
| **Audience** | English-speaking Jewish community worldwide: US, Canada, UK, South Africa, Australia |
| **Tone** | Inspiring, prestigious, trustworthy, warm, high-energy, action-oriented |

**Core offer, said the same way everywhere:**
- 🏙️ **Grand Prize:** a $1.3 million luxury apartment in Jerusalem
- 🎟️ **1+1 FREE:** buy one ticket, get one free
- ⏰ **Early Bird Bonus:** automatic entry into the $15,000 Early Bird Draw
- 🕊️ **Mission:** proceeds support Torah institutions, emergency medical equipment, and IDF soldiers

> ⚠️ **Compliance check before launch:** Confirm the draw date, ticket price, Early Bird deadline, legal terms ("No purchase necessary" or local equivalent, licensing/permit number) and all prize figures against thedreamraffle.co.il. Add the required disclaimer as a 2-second legal end-card or small lower-third. I left the deadline and draw date as `[DATE]` placeholders on purpose; please don't make them up.

---

## 1. Video Concept & Hook Options

**Master concept: "Your Key to Jerusalem."**
A single golden key ties the video together. It shows up in the hook, opens the apartment door, turns into a raffle ticket, splits into two tickets for the 1+1 offer, and ends on the website URL. The idea is simple: one ticket gets you two chances at a home in Jerusalem, and every ticket also does good in Israel.

Pick one hook for the master cut. The other two make good A/B variants for paid social.

### Hook A — Direct Response (best for cold paid traffic)
> **VO:** "What if one ticket could get you the keys to a $1.3 million home in Jerusalem — and a second ticket came free?"
> **OST:** `$1.3M JERUSALEM APARTMENT` → `BUY 1, GET 1 FREE`
> **Visual:** Fast push-in on a golden key spinning in mid-air. It lands in a man's palm, the hand closes, and we hard-cut to the skyline.
> **Why it works:** Prize, price advantage and curiosity all land in the first 3 seconds, before the thumb scrolls.

### Hook B — Emotional / Charity (best for warm audiences, retargeting, community lists)
> **VO:** "Some tickets buy a chance. This one builds a future — for Israel, and maybe for you."
> **OST:** `ONE TICKET. TWO MISSIONS.`
> **Visual:** Dawn over the Old City. A soldier's silhouette at the Kotel plaza fades into the glow of the apartment window.
> **Why it works:** It leads with purpose and lets the prize follow. That builds trust and suits donors who give for mitzvah first.

### Hook C — Luxury Real Estate (best for aspirational and lifestyle placements)
> **VO:** "Floor-to-ceiling windows. The golden stones of Jerusalem at your feet. This could be your address."
> **OST:** `YOUR HOME IN JERUSALEM?`
> **Visual:** A slow cinematic glide through a sunlit penthouse living room toward a panoramic window over the Old City.
> **Why it works:** It sells the dream first. Premium visuals signal a premium, legitimate prize.

---

## 2. Scene-by-Scene Script Breakdown (40 seconds, master cut using Hook A)

> **Global style lock:** append this to every image/video prompt for visual consistency:
> `warm golden-hour palette, Jerusalem stone tones, deep navy and gold accents, cinematic 35mm, shallow depth of field, soft film grain, premium real-estate commercial look, photorealistic`
>
> **Brand palette:** Navy `#0B1F3A` · Gold `#C9A14A` · Jerusalem Stone `#E8DCC4` · White `#FFFFFF`
> **Typeface pairing:** Serif display (e.g., Playfair Display) for headlines; clean sans (e.g., Montserrat) for body and URL.
>
> **People in frame:** stick to modest, dignified depictions consistent with the campaign's religious audience: men, fathers and sons, Torah scholars, soldiers and paramedics. No glamour casting.

---

### SCENE 1 — The Hook
**⏱ 00:00 – 00:04**

| Element | Content |
|---|---|
| **VO** | "What if one ticket could get you the keys to a $1.3 million home in Jerusalem…" |
| **OST** | `$1.3 MILLION` (gold, punch-in) → `JERUSALEM APARTMENT` |
| **Visual** | Macro shot of an ornate golden key spinning in slow motion against a deep navy background with drifting gold particles. On the beat, a man's hand catches it. |
| **Transition** | Light flare whip into Scene 2. |

**🛠 Tool:** [FLUX.2 [pro]](https://fal.ai/models/fal-ai/flux-pro/v2) (keyframe) → [Kling 3.0 Motion Control](https://fal.ai/models/fal-ai/kling-video/v3.0/motion-control) (animate)

**FLUX.2 prompt (keyframe):**
```
Ultra-detailed macro product shot of an ornate antique golden house key with a subtle Star of David engraved on the bow, floating in mid-air, deep navy blue background, drifting golden bokeh particles, dramatic rim lighting, luxury commercial aesthetic, 8k, photorealistic, warm golden-hour palette, deep navy and gold accents, cinematic 35mm, shallow depth of field
```
*Settings: 16:9 (1920×1080) and 9:16 (1080×1920) separately; guidance ~3.5; save the seed for re-use.*

**Kling 3.0 Motion Control prompt (image-to-video, 5s):**
```
The golden key slowly rotates 360 degrees in mid-air, golden particles drift upward, camera pushes in gently, at the end a man's hand enters from below frame and closes around the key, smooth cinematic motion, luxury commercial
```
*Motion: slow dolly-in + clockwise object rotation. Trim to 4s.*

---

### SCENE 2 — The Grand Prize Reveal (Jerusalem)
**⏱ 00:04 – 00:10**

| Element | Content |
|---|---|
| **VO** | "…with breathtaking views of the Holy City?" |
| **OST** | `WIN A LUXURY APARTMENT IN JERUSALEM` |
| **Visual** | Sweeping aerial drone shot over the Old City walls at golden hour. The camera passes over the Kotel area and the Jerusalem stone rooftops, then glides toward a modern luxury residential tower with glass balconies. |
| **Source option** | Use real drone footage from the Assets Drive first if available. Fall back to AI only if needed. |

**🛠 Tool:** [Veo 3.1](https://fal.ai/models/fal-ai/veo-3.1) (text-to-video)

**Veo 3.1 prompt:**
```
Cinematic aerial drone shot at golden hour over Jerusalem, sweeping slowly over the ancient Old City stone walls and golden Jerusalem-stone rooftops, warm sunlight, light haze, the camera glides forward toward an elegant modern luxury residential building with glass balconies overlooking the city, majestic, inspiring, premium real-estate commercial, photorealistic, smooth stabilized motion, no text, no people in close-up
```
*Settings: 16:9, 8s, audio OFF (we score separately). Trim to 6s.*

> **Accuracy note:** AI models can invent landmarks. Review every Jerusalem render for geographic plausibility, and favor real Drive footage of the actual apartment and view wherever possible. The prize must not be misrepresented.

---

### SCENE 3 — Inside the Dream
**⏱ 00:10 – 00:16**

| Element | Content |
|---|---|
| **VO** | "Imagine walking into your own luxury apartment… worth one-point-three million dollars." |
| **OST** | `$1.3M` · `PANORAMIC VIEWS` · `FULLY FINISHED` *(confirm features on the site)* |
| **Visual** | A slow interior glide through a sunlit, high-end living room: Jerusalem stone accent wall, warm oak floors, a Shabbat table set with silver candlesticks and challah cover, and floor-to-ceiling windows framing the Old City. |

**🛠 Tool:** [FLUX 1.1 [pro] Ultra](https://fal.ai/models/fal-ai/flux-pro/v1.1-ultra) (hero still) → [Kling 3.0 Motion Control](https://fal.ai/models/fal-ai/kling-video/v3.0/motion-control)

**FLUX 1.1 Ultra prompt:**
```
Interior architectural photography of a luxury penthouse living room in Jerusalem, Jerusalem stone accent wall, warm white oak flooring, elegant cream and navy furniture, a dining table set for Shabbat with silver candlesticks and an embroidered challah cover, floor-to-ceiling windows revealing a panoramic golden-hour view of the Old City of Jerusalem, sunlight streaming in, Architectural Digest style, ultra realistic, 8k, warm golden-hour palette, deep navy and gold accents
```
*Settings: raw mode OFF, aspect 16:9 and 9:16; generate 4 variants, choose the best.*

**Kling 3.0 Motion Control prompt:**
```
Slow cinematic forward dolly through the luxury living room toward the panoramic window, sunlight flares gently across the lens, sheer curtains move softly in a breeze, steady elegant camera movement, real-estate commercial
```
*Motion: forward dolly + slight pan right; 5s → trim to 6s with a 1s speed ramp.*

---

### SCENE 4 — The Offer: 1+1 FREE
**⏱ 00:16 – 00:23**

| Element | Content |
|---|---|
| **VO** | "And right now, for a limited time — buy one ticket, and get a second ticket FREE. That's double your chances to win." |
| **OST** | Big animated stamp: `BUY 1 GET 1 FREE` → sub-line `2× THE CHANCES TO WIN` |
| **Visual** | The golden key from Scene 1 morphs into an elegant gold-foil raffle ticket, which splits into two identical tickets with a burst of light. A "FREE" gold seal stamps onto the second ticket. |

**🛠 Tools:** [Ideogram V3](https://fal.ai/models/fal-ai/ideogram/v3) (ticket graphic with text) → [Kling 3.0 Motion Control](https://fal.ai/models/fal-ai/kling-video/v3.0/motion-control) (split animation). Use [Recraft V3](https://fal.ai/models/fal-ai/recraft-v3) as an alternative for a clean vector stamp.

**Ideogram V3 prompt (static ticket pair):**
```
Two luxurious gold-foil raffle tickets side by side on a deep navy velvet background, elegant serif typography reading "THE DREAM RAFFLE" on both tickets, the right ticket has a large embossed gold seal stamped "FREE", a large headline above reading "BUY 1 GET 1 FREE", premium, prestigious, soft golden glow, sharp legible text, centered composition
```
*Settings: style "Design", magic prompt OFF (keeps the text exact), 16:9 + 9:16.*

**Recraft V3 prompt (transparent stamp overlay):**
```
Circular embossed gold wax-seal badge with the text "1+1 FREE" in bold serif letters, ornate laurel border, luxury style, isolated on transparent background, vector illustration
```

**Kling 3.0 Motion Control prompt:**
```
A single golden raffle ticket glows and splits into two identical tickets that slide apart left and right, a burst of golden light and sparkles, a gold seal drops onto the right ticket with a satisfying stamp impact, celebratory, premium motion graphics feel
```

> **Editor tip:** Even with Ideogram, rebuild the final OST in the editor (Remotion/After Effects/CapCut) as live text so the offer stays pixel-sharp and easy to update.

---

### SCENE 5 — Early Bird Bonus
**⏱ 00:23 – 00:28**

| Element | Content |
|---|---|
| **VO** | "Get in early, and you're automatically entered into our fifteen-thousand-dollar Early Bird Draw." |
| **OST** | `EARLY BIRD BONUS` → `$15,000 DRAW` → `ENDS [DATE]` |
| **Visual** | A gold countdown clock or sand-timer graphic with "$15,000" counting up in gold numerals. Gold confetti falls on the reveal. |

**🛠 Tool:** [Ideogram V3](https://fal.ai/models/fal-ai/ideogram/v3) → [Wan 2.5](https://fal.ai/models/fal-ai/wan-2.5) (fast motion, social-ready)

**Ideogram V3 prompt:**
```
Premium promotional banner, deep navy background, elegant gold hourglass on the left, large shining gold numerals "$15,000" in the center, headline above reading "EARLY BIRD BONUS DRAW", gold confetti, luxury lottery aesthetic, crisp legible typography
```

**Wan 2.5 prompt (image-to-video, 5s):**
```
Gold sand flows through the hourglass, golden confetti falls gently from above, the numbers shimmer with a light sweep, subtle camera push-in, celebratory and urgent
```

---

### SCENE 6 — The Mission (Why It Matters)
**⏱ 00:28 – 00:35**

| Element | Content |
|---|---|
| **VO** | "And every ticket makes a difference — supporting Torah institutions, emergency medical equipment, and the brave soldiers of the IDF." |
| **OST** | Three quick icon cards: `📖 TORAH INSTITUTIONS` · `🚑 EMERGENCY MEDICAL EQUIPMENT` · `🇮🇱 IDF SOLDIERS` |
| **Visual** | A three-shot montage of about 2.3s each: (1) a warm beit midrash with young men learning Gemara at long wooden tables; (2) a modern Israeli ambulance with a male paramedic loading new equipment; (3) IDF soldiers at sunrise on a Jerusalem overlook, smiling, with the flag waving. |
| **Source option** | Real footage from the Assets Drive is strongly preferred here because authenticity drives donations. |

**🛠 Tool:** [Nano Banana 2](https://fal.ai/models/fal-ai/nano-banana-2) (consistent characters) → [Kling 3.0 Motion Control](https://fal.ai/models/fal-ai/kling-video/v3.0/motion-control). Use [Veo 3.1](https://fal.ai/models/fal-ai/veo-3.1) for the soldier shot if you need native motion.

**Nano Banana 2 prompt — Shot 6a (Torah):**
```
Warm, inspiring photo inside a traditional beit midrash study hall, young men in white shirts and kippot learning Talmud in pairs at long wooden tables, open Gemara volumes, bookshelves full of sefarim, warm window light, joyful focused expressions, documentary photorealism
```

**Nano Banana 2 prompt — Shot 6b (Medical):**
```
A male Israeli paramedic in a Magen David Adom-style uniform loading new state-of-the-art emergency medical equipment into a modern white ambulance, bright clean daylight, proud and professional expression, documentary photorealism
```
> Use a generic uniform. Don't reproduce real organization logos unless you have permission and the organization is an actual beneficiary.

**Veo 3.1 prompt — Shot 6c (IDF):**
```
Golden sunrise on a Jerusalem hilltop overlook, a small group of young Israeli soldiers in olive-green uniforms stand together smiling, an Israeli flag waves gently in the breeze behind them, the Jerusalem skyline glowing in the background, slow cinematic push-in, hopeful, proud, photorealistic, no weapons in focus
```

**Kling prompt (for 6a / 6b stills):**
```
Subtle natural motion: gentle head and hand movements, pages turning softly, slow cinematic push-in, warm documentary feel
```

---

### SCENE 7 — Call to Action
**⏱ 00:35 – 00:40**

| Element | Content |
|---|---|
| **VO** | "Two tickets. One dream. Double the mitzvah. Get your 1-plus-1 free tickets now at thedreamraffle.co.il — before this offer ends!" |
| **OST** | `BUY 1 GET 1 FREE` (top) · `THEDREAMRAFFLE.CO.IL` (huge, gold, center) · `ORDER NOW — LIMITED TIME` (pulsing button) · logo + `9th Annual Edition` · legal line (bottom, small) |
| **Visual** | The golden key returns and turns in a lock. The apartment door swings open to a burst of golden light that resolves into the end card: Jerusalem skyline at dusk, deep navy overlay, gold typography, two tickets fanned beside the URL. |

**🛠 Tool:** [Ideogram V3](https://fal.ai/models/fal-ai/ideogram/v3) (end-card background/plate) → [Kling 3.0 Motion Control](https://fal.ai/models/fal-ai/kling-video/v3.0/motion-control) (door/key move)

**Ideogram V3 prompt (end-card plate — leave room for live text):**
```
Luxury end card background, Jerusalem skyline at dusk softly blurred, deep navy gradient overlay, two gold-foil raffle tickets fanned on the right side, elegant gold light rays, large empty space in the center for text, premium, prestigious, cinematic
```

**Kling 3.0 Motion Control prompt (key + door):**
```
Close-up of an ornate golden key turning in a polished brass lock of a modern luxury apartment door, the door swings open revealing bright golden light flooding through, smooth cinematic motion, magical yet realistic
```

> **Build the final CTA text as live editor text, not baked into AI images.** Add the official logo from the Drive. Hold the end card for at least 2s, and 3s+ on 9:16.

---

## 3. Full Voiceover Script (clean read for the VO artist / TTS)

> What if one ticket could get you the keys to a $1.3 million home in Jerusalem… with breathtaking views of the Holy City?
>
> Imagine walking into your own luxury apartment… worth one-point-three million dollars.
>
> And right now, for a limited time — buy one ticket, and get a second ticket FREE. That's double your chances to win.
>
> Get in early, and you're automatically entered into our fifteen-thousand-dollar Early Bird Draw.
>
> And every ticket makes a difference — supporting Torah institutions, emergency medical equipment, and the brave soldiers of the IDF.
>
> Two tickets. One dream. Double the mitzvah. Get your 1-plus-1 free tickets now at thedreamraffle.co.il — before this offer ends!

*About 105 words, which fits ~40s at an energetic 155–160 wpm.*
*For a 30s cut, drop Scene 3's VO line and shorten Scene 6 to "Every ticket supports Torah, lifesaving medical care, and IDF soldiers."*

---

## 4. Audio & Music Direction

### Voiceover
- **Tool:** [ElevenLabs TTS via Fal](https://fal.ai/models/fal-ai/elevenlabs/text-to-speech), model `eleven_multilingual_v2` (or the latest ElevenLabs model offered on Fal)
- **Voice profile:** Mature male narrator, 35–50, warm baritone, neutral North American accent so it carries across US/UK/SA/AU. Trustworthy "premium brand" announcer, not a shouting game-show host. Test 2–3 voices; a "deep, warm, documentary" archetype works well here.
- **Settings (starting point):** Stability `0.45` · Similarity `0.80` · Style `0.35` · Speaker boost ON · Speed `1.05`
- **Pace and delivery map:**
  - Hook (0–10s): curious and intriguing, with a slight build on "$1.3 million"
  - Interior (10–16s): softer, slower, aspirational. Let "imagine" breathe
  - Offer (16–28s): energy up, faster, punch "FREE" and "double"
  - Mission (28–35s): sincere, warm, a touch slower and lower
  - CTA (35–40s): confident, urgent, very clear on the URL. Spell it with micro-pauses: "the · dream · raffle · dot co dot I-L"
- **Pronunciation:** "co.il" = "co dot I-L"; "IDF" = "I-D-F"; "mitzvah" = "MITZ-vah"

### Music
- **Style:** Cinematic, uplifting orchestral-hybrid with strings, warm piano motif, soft choir pad and a modern pulse. Optional subtle Middle-Eastern/Jewish melodic color (oud or clarinet ornament) in the intro.
- **Structure:**
  - 0–10s: piano + string swell, building wonder
  - 10–16s: lush, open, airy (luxury moment)
  - 16–28s: percussion and pulse kick in, tempo feel ~118–124 BPM, celebratory
  - 28–35s: drop to emotional strings, heartfelt
  - 35–40s: full triumphant resolve + final hit on the URL
- **Source:** Licensed library tracks (Artlist / Musicbed / Epidemic: search "inspiring cinematic orchestral uplifting"). If you prefer AI music, generate on Fal and confirm the commercial license.
- **Mix:** Duck music −14 to −18 LUFS under the VO. Final master at −14 LUFS integrated for social, −23 LUFS for broadcast. Add SFX: key "ting" (0:01), whoosh (0:04), ticket "split" shimmer (0:19), stamp thud (0:21), lock click + door swoosh (0:35).

---

## 5. Call to Action (CTA) Package

**Primary CTA (VO + end card):**
> **"Get your 1+1 FREE tickets now at thedreamraffle.co.il — before this offer ends!"**

**Alternative CTA lines (for A/B tests and cutdowns):**
1. "Buy one, get one free — double your chances at a $1.3M Jerusalem home. Go to thedreamraffle.co.il now."
2. "Your key to Jerusalem is waiting. Claim your free second ticket at thedreamraffle.co.il."
3. "Win a home. Build a future for Israel. 1+1 free tickets — today only at thedreamraffle.co.il." *(only if a real deadline applies)*

**Ad copy companions (paid social):**
- **Headline:** `Win a $1.3M Jerusalem Apartment — Buy 1, Get 1 FREE`
- **Primary text:** `🏙️ A luxury home in Jerusalem could be yours. 🎟️ For a limited time, every ticket comes with a FREE second ticket, plus automatic entry into the $15,000 Early Bird Draw. 🕊️ Every ticket supports Torah institutions, emergency medical equipment and IDF soldiers. 👉 thedreamraffle.co.il`
- **Button:** `Learn More` / `Shop Now` (test both)
- **Tracking:** `https://thedreamraffle.co.il/?utm_source={platform}&utm_medium=paid_video&utm_campaign=dr9_1plus1&utm_content={hookA|hookB|hookC}`

---

## 6. Production Roadmap (Fal.ai Workflow)

| Step | Task | Tool | Output |
|---|---|---|---|
| 1 | Pull and review real footage, logo, apartment photos and fonts from the Assets Drive | Google Drive | Asset list; mark which scenes AI only *supplements* |
| 2 | Generate keyframes (Scenes 1, 3) with a locked seed + style suffix | FLUX.2 [pro] / FLUX 1.1 Ultra | 4 variants per scene, 16:9 + 9:16 |
| 3 | Generate people stills (Scene 6a/6b) | Nano Banana 2 | Consistent, modest, documentary-style |
| 4 | Generate text graphics (Scenes 4, 5, 7) | Ideogram V3 / Recraft V3 | Ticket, stamp, banners, end-card plate |
| 5 | Animate stills | Kling 3.0 Motion Control | 5s clips per scene |
| 6 | Generate B-roll (Scene 2, 6c) | Veo 3.1 | 8s cinematic clips |
| 7 | Quick social variants / re-renders | Wan 2.5 | Fast 9:16 iterations |
| 8 | Voiceover | ElevenLabs TTS via Fal | WAV, per-section takes |
| 9 | Edit, live-text OST, music, SFX, captions | Remotion (`/my-video` in this repo), Descript or CapCut | 40s master |
| 10 | Export cutdowns | Editor | 16:9 (YouTube), 9:16 (Reels/Shorts/TikTok/Stories), 1:1 (Feed), 15s & 30s versions |
| 11 | Compliance and accuracy review | Human | Prize figures, dates, legal line, landmark accuracy, beneficiary claims |

**Credit-saving tips**
- Draft every scene in Wan 2.5 or at low resolution first. Spend Veo 3.1 / Kling credits only on approved compositions.
- Lock seeds and the global style suffix so you don't have to re-roll for consistency.
- Generate 9:16 natively instead of cropping 16:9. It costs a little more per clip but saves re-renders.
- Always burn in captions: most social video is watched muted.

---

## 7. Cutdown Variants (quick reference)

| Version | Scenes | Use |
|---|---|---|
| **15s "Offer"** | 1 → 4 → 7 | Pre-roll, Stories. VO: "Win a $1.3M home in Jerusalem. Buy one ticket, get one FREE. thedreamraffle.co.il" |
| **30s "Standard"** | 1 → 2 → 4 → 5 → 6 (short) → 7 | Main paid social |
| **40s "Master"** | All 7 scenes | YouTube, website, email |
| **20s "Mission" (Hook B)** | 6 → 2 → 4 → 7 | Retargeting, community WhatsApp/email lists |
