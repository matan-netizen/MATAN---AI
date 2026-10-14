# Dream Raffle: Facebook/Instagram Ad Re-Edit Guide

**Deliverable:** 1080 × 1920 (9:16), 30 fps, about 39 s, H.264 High, AAC 48 kHz 192 kbps, −14 LUFS integrated, −1.5 dBTP
**Goal:** remove every jarring cut and clipped word so the ad plays as one smooth, premium story.
**Rule of thumb:** no shot under 1.5 s, no word cut mid-syllable, and no hard cut where a dissolve can carry the moment.

---

## 0. Source files and reference timings

| ID | File | Content |
|---|---|---|
| **BAL** | `public/fb-ad/balcony.mp4` | Host on balcony (orange shirt) |
| **TOUR** | `public/fb-ad/office-tour.mp4` | Previous-raffle apartment tour (white shirt) |
| **STREET** | `public/fb-ad/street.mp4` | Host on Jaffa Road (yellow shirt) |
| **APT26** | `public/fb-ad/apartment-2026.mp4` | This year's apartment (Dream Raffle 9 promo) |
| **LOGO** | `public/fb-ad/logo.png` | End-card logo |
| **MUSIC** | `public/fb-ad/music.mp3` | Licensed-free music bed |

All in/out points below are in **source time** (seconds) and come from a word-level transcript. Pull them in exactly, then confirm against the waveform.

**Jump cuts already inside the sources** (from scene detection), each of which needs softening:
- **BAL:** 6.18 · 6.82 · 7.70 · 9.32 · 10.37 · 12.10 · 13.20
- **TOUR:** 20.17 · 28.80 · 31.88
- **STREET:** 19.63 · 24.13 · 25.20 · 26.50

---

## 1. New timeline at a glance

| # | Ad time | Section | Source | Transition **into** this section |
|---|---|---|---|---|
| 1 | 0:00.00 – 0:08.20 | Hook: balcony | BAL 5.00 – 13.18 | none (first frame) |
| 2 | 0:08.20 – 0:11.70 | $1.3M prize card | BAL 13.10 – 16.60, muted and blurred | L-cut + whoosh/hit (fix #1) |
| 3 | 0:11.70 – 0:17.30 | Apartment tour, previous raffle | TOUR, 3 room shots at 50–60% speed | 15-frame cross-dissolves (fix #2) |
| 4 | 0:17.30 – 0:24.10 | This year's apartment | APT26, 2 shots at 55% speed | 20-frame cross-dissolve + shimmer SFX |
| 5 | 0:24.10 – 0:27.45 | "You could be the winner" | STREET 24.15 – 27.50 | 20-frame cross-dissolve |
| 6 | 0:27.45 – 0:34.10 | Call to action, one continuous take | STREET 14.30 – 20.95 | punch-in "angle change" + 10-frame dissolve (fixes #3, #4) |
| 7 | 0:34.10 – 0:39.10 | End card | LOGO + text | 15-frame dissolve + soft impact SFX |

**Removed entirely:**
- the 1.9 s kitchen insert "Do me a favor…" (was at 0:27)
- the 1.15 s balcony "What are you waiting for?" (was at 0:35)

---

## 2. Step-by-step instructions

### Step 1: Hook, balcony (0:00.00 – 0:08.20) · *fixes issue #1*

**Visual**
- Place **BAL 5.00 → 13.18**, cropped in 1.28× anchored to the top edge. The crop keeps the Hebrew for-sale banner and its phone number out of frame.
- Add a slow push-in from 100% to 105% across the whole clip.
- **Soften the source's internal jump cuts** at 6.18, 6.82, 7.70, 9.32, 10.37 and 12.10. At each one, hold the last frame before the cut for 10 frames and dissolve it out over the new angle (a "frame-hold dissolve"). The cut at 12.10 falls on "What's," so it matters most.
- Keep the hook headline overlay ("WIN A $1.3M APARTMENT IN JERUSALEM") from frame 0. Keep the "Do you have a ticket yet?" caption plate for 0:00–0:01.1.

**Audio**
- "What's the Dream Raffle?" ends at **13.13**, and the next word ("A $1.2…", last year's figure) starts at **13.21**. Set the out-point at **13.18** with a **2-frame (≈60 ms) audio fade-out**. The question then completes and nothing of "$1.2M" leaks through.
- **L-cut:** let the tail of "Raffle?" (13.10 → 13.18) play over the first frames of the prize card. The picture cuts at 0:08.10 and the voice ends at 0:08.18.

**Transition**
- At **0:08.10**, add a **whoosh** that rises into a soft **hit** landing exactly at 0:08.20, when the $1.3M card is fully on screen. Keep it around −12 dB under the dialogue peak.

### Step 2: $1.3M prize card (0:08.20 – 0:11.70)

**Visual**
- Use BAL 13.10 → 16.60, **fully blurred (60 px) from the first frame** and darkened 50%. Last year's burned-in "$1,200,000" caption must never be readable, even during a fade.
- Animate the text in order:
  1. "A" at 0:08.27
  2. "$1.3M" at 0:08.50
  3. "BRAND-NEW LUXURY APARTMENT IN JERUSALEM" at 0:08.73
- Each line scales in from 60% to 100% with a gentle spring, with no bounce overshoot past 105%.

**Audio**
- Mute the source. Bring the music up from −18 dB (under the dialogue) to **−8 dB**, with a 6-frame ramp.

### Step 3: Apartment tour, previous raffle (0:11.70 – 0:17.30) · *fixes issue #2*

The original cut used the real-time, handheld walk-through with its fast narration. Replace it with **three slowed, stabilized room shots under music**:

| Room | Source in → out | Speed | On-screen length | On-screen label |
|---|---|---|---|---|
| Bedroom | TOUR 20.20 → 21.45 | 60% | 2.1 s | "Bedroom" |
| Dining room | TOUR 28.80 → 29.75 | 50% | 1.9 s | "Dining room" |
| Living room | TOUR 30.20 → 31.00 | 50% | 1.6 s | "Living room" |

**Visual**
- Apply **stabilization** to each shot (Warp Stabilizer, "Smooth motion", 8–12%; or the equivalent). Crop in up to 108% to hide stabilizer edges.
- Add a slow push-in from 100% to 104% per shot.
- **Transitions between rooms:** 15-frame cross-dissolves. A smooth whip-pan (8–10 frames, directional blur in the walking direction) also works between dining and living; don't mix both styles.
- Keep the **"Footage from previous raffles"** tag visible for this whole section, at the same position, without re-animating it per shot.
- Room labels: small caps, white, bottom-left of the upper safe zone, with a 6-frame fade.

**Audio**
- Remove the sync narration (it is fast and would be pitch-shifted at these speeds). Music stays at −8 dB.
- Optional: a very soft room-tone or "air" ambience at −30 dB, for continuity.

**Never use:** TOUR after **31.00**. A Hebrew roll-up banner enters frame there.

### Step 4: This year's apartment (0:17.30 – 0:24.10)

**Visual**
- Two shots from APT26, each **at 55% speed**, inside a gold-framed window cropped to source y 380–1030 (clear of the promo's own logo and headline):
  - Set table: APT26 0.10 → 2.20, which plays about 3.8 s.
  - Dining area: APT26 2.40 → 4.05, which plays about 3.0 s.
- 20-frame cross-dissolve **into** the section; 15-frame cross-dissolve between the two shots.
- Text: "THIS YEAR'S APARTMENT", "$1.3M" and the gold note **"This year it's even more luxurious"**. The text is animated once for the whole section and does not re-pop on the second shot.
- Background: the same footage blurred (36 px) and darkened to 45%.

**Audio**
- Music stays at −8 dB. Add a subtle **shimmer/sparkle SFX** at 0:17.40 (around −16 dB).

### Step 5: "You could be the winner" (0:24.10 – 0:27.45)

**Visual**
- Use STREET **24.15 → 27.50**, with a 20-frame cross-dissolve in from the gallery.
- The source has jump cuts at **25.20** and **26.50**. Soften both with 8–10-frame frame-hold dissolves, as in Step 1.
- Overlay "9TH YEAR RUNNING / WILL YOU BE NEXT?" across the whole shot.

**Audio**
- Dialogue: "Now is the time. This is the beautiful city, and you could be the winner." "Winner." ends at **27.45**, and the next word ("Am…") starts at 27.53. Out at **27.50**, with a 2-frame fade.
- Duck the music back to −18 dB over 6 frames as the dialogue starts.

### Step 6: Call to action, one continuous take (0:27.45 – 0:34.10) · *fixes issues #3 and #4*

**Visual**
- **Delete** the kitchen insert ("Do me a favor…") and the balcony "What are you waiting for?". The call to action now plays as **one uninterrupted street take**.
- Use STREET **14.30 → 20.95**.
- Because this follows another street shot (same location, same shirt), disguise the join as a **camera-angle change**: scale this clip to **112%**, reframed slightly, against 100% on the previous shot, joined by a **10-frame dissolve**. Two street shots at the same framing would read as a jump cut.
- The source has a jump cut at **19.63**, right before "Buy a ticket". Soften it with a frame-hold dissolve. Alternatively, punch in to 118% from 19.63 onward so it reads as a deliberate "close-up for emphasis."

**Audio**
- Dialogue: "But you have to click on the link and fill out your information. Otherwise, we won't know who to give the apartment to. Buy a ticket, but hurry."
- **"Hurry." ends at 20.87.** The old edit cut at 20.65, which caused the "Buy a ticket, but…" issue. Out at **20.95**, with a 3-frame fade. The next word ("A…") starts at 20.99, so stop before it.
- Let the music swell from −18 dB to −8 dB over the last 0.5 s, carrying the energy into the end card.

### Step 7: End card (0:34.10 – 0:39.10)

**Visual**
- 15-frame dissolve from the street take.
- Animate the elements in this order:
  1. Logo at +0.07 s
  2. "WIN A $1.3M LUXURY APARTMENT IN JERUSALEM" at +0.33 s
  3. "1+1 · All Orders Doubled" at +0.53 s
  4. "Get Your Ticket →" button at +0.73 s
- After it lands, the button gets a slow pulse (scale 100% ↔ 103%, about a 1.2 s cycle).

**Audio**
- A soft **impact/boom** at 0:34.10 (around −14 dB) and a light **chime** when the button lands.
- Music at −8 dB, fading out over the final 0.4 s.

---

## 3. Global rules for the whole edit

**Transitions**
- Use only cross-dissolves (10–20 frames), frame-hold dissolves, and the single whoosh hit-cut at 0:08.
- No hard cuts between different scenes.
- No flashy wipes or spins.

**Audio edits**
- Every dialogue in/out point sits in the silence between words, with a 2–3-frame fade.
- No dialogue overlaps another dialogue line.

**Music**
- −18 dB under dialogue, −8 dB in dialogue-free sections.
- Ramps of 6 frames or longer, never a jump.

**Captions**
- Every spoken word stays captioned.
- If the source's burned-in caption lags behind the new in-point (as at 0:00), cover it with a matching caption plate.

**Safe zones**
- Keep all text between y = 250 and y = 1500. The Reels UI covers the top ~14% and the bottom ~20%.

**Content**
- Don't use any line that states last edition's figures: "$1.2 million," "seven winners… the eighth," "now in its eighth year," "after Purim," "last day," "with all the furniture."
- Previous-raffle apartment footage always carries the "Footage from previous raffles" tag.

**Final QA**
- Watch once with sound and once muted (most feed viewers watch muted).
- Scrub every transition frame by frame for clipped syllables, flash frames, or any Hebrew signage entering the frame.
- Measure loudness: −14 LUFS integrated, true peak at or below −1.5 dBTP.
