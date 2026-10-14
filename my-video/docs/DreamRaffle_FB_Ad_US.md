# The Dream Raffle: U.S. Facebook / Instagram Reels Ad

**File:** `out/DreamRaffle_FB_Ad_US.mp4` (rendered from the `DreamRaffleFBAd` Remotion composition)
**Spec:** 1080 × 1920 (9:16), 30 fps, H.264 + AAC 48 kHz, 21.4 s, audio normalized to −14 LUFS, faststart

## Concept: "Do you have a ticket yet?"

The ad opens cold on the host shouting from a balcony with a direct question. That pattern-interrupt works in a muted feed because the question is also captioned. A bold headline sits on screen from frame 0 ("Win a $1.2M apartment in Jerusalem"), so the offer is clear even on the first frame and the thumbnail. Next comes a quick tour of the actual apartment as proof, then the social-proof beat ("7 winners so far: will you be #8?"). The ad closes on urgency ("Now's the time. What are you waiting for?") and a logo end card with one clear CTA.

## Edit decision list

| Ad time | Source | Source in/out | Spoken (captioned) | On-screen text added |
|---|---|---|---|---|
| 0:00–0:01.1 | Balcony clip | 5.00–6.10 | "Do you have a ticket yet?" | Hook headline: **WIN A $1.2M APARTMENT IN JERUSALEM** + caption plate |
| 0:01.1–0:05.5 | Balcony clip | 12.00–16.35 | "What's the Dream Raffle? A $1.2 million apartment in the heart of Yerushalayim." | Hook headline stays |
| 0:05.5–0:07.6 | Apartment-tour clip | 19.40–21.50 | "One bedroom, second bedroom, beautiful bedroom" | **Furniture included** |
| 0:07.6–0:12.3 | Apartment-tour clip | 27.65–32.35 | "Look at this beautiful dining room, this fantastic living room with all the furniture, this kitchen" | **Furniture included** |
| 0:12.3–0:15.6 | Apartment-tour clip | 33.50–36.85 | "We've already had seven winners. You can be the eighth winner" | **7 WINNERS SO FAR / WILL YOU BE #8?** |
| 0:15.6–0:17.7 | Balcony clip | 20.00–22.10 | "Now's the time. What are you waiting for?" | (none) |
| 0:17.7–0:21.4 | End card | (none) | Music only | Logo · **WIN A $1.2M APARTMENT IN JERUSALEM** · **Get Your Ticket →** |

**Captions:** every spoken line has English captions. These are the burned-in captions from the source edits, plus a dedicated caption for the opening question.

**Music:** an original, license-free upbeat instrumental bed (generated with Stable Audio). It sits under the dialogue at about −18 dB and comes up on the end card.

## Key editing choices

- **Cut-downs:** cut points sit on word boundaries from a Whisper transcript, so no line starts or ends mid-word.
- **Balcony shots:** cropped in 1.28× from the top. This keeps a large Hebrew "for sale" banner with a private phone number out of frame.
- **Winners collage:** the source flashes a collage with Hebrew captions for about 0.9 s. That moment is blurred and covered with a large "7 WINNERS" card that matches the spoken line.
- **Logo:** no logo file came through with the request. The end-card logo is the official "The Dream Raffle" badge, cut out of the footage with a precise mask. Its skyline crest and "Back for the 8th year" arc are omitted because they couldn't be separated cleanly from the background. Swap in the original vector/PNG when available (`public/fb-ad/logo.png`).
- **Footage left out:**
  - The Trump-mask clip impersonates a real public figure. It risks ad rejection and implies an endorsement.
  - The yellow-shirt market clip names a URL that conflicts with other materials.
  - Every "last day" line is out, because it is time-sensitive and may be false when the ad runs.

## Ad copy (English)

**Primary text**
> Do you have a ticket yet? 🎟️
> The Dream Raffle is giving away a $1.2 million apartment in the heart of Jerusalem, furniture included.
> We've already had seven winners. You could be the eighth.
> Get your ticket today.

**Headline:** Win a $1.2M Apartment in Jerusalem
**Description:** The Dream Raffle: now in its 8th year.
**CTA button:** Learn More (link to the official ticket page; no URL was supplied, so none is shown in the video)

## Assumptions and items to confirm before launch

1. **Campaign year and figures.** This footage describes the **$1.2M** prize, **7 past winners** and the **8th year**. The earlier Dream Raffle 9 materials cite a $1.3M apartment, so confirm which edition this ad promotes and update the figures if needed.
2. **Destination URL.** The footage mentions `thedreamraffle.com`, a "link in the profile," and an Instagram handle, and earlier materials use `thedreamraffle.co.il`. No URL appears in the ad. Set the correct landing page as the ad's link.
3. **Ad policy and legal.** Meta treats lotteries and raffles as a restricted category that can require prior written permission, and U.S. state laws on raffles and sweepstakes vary. Have the official rules, eligibility and any required disclaimer reviewed; I did not add legal copy because none was provided.
4. **Background signage.** A partial Hebrew roll-up banner appears briefly (about 0.5 s) in the background of the living-room shot (around 0:11). It's incidental scenery, not an overlay. Replace the shot if a strictly Hebrew-free frame is required.
