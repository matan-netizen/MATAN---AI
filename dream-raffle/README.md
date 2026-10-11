# The Dream Raffle – promo video

`build_video.py` turns the apartment walkthrough in `input/` into a 20-second,
1080x1920 promo for thedreamraffle.co.il. It cuts out the unmade-bed shot, burns in
the Hebrew captions, adds the voiceover, and writes `output/dream-raffle-promo.mp4`.

Needs Python 3.9+ and FFmpeg built with libass (stock builds have it). Captions use
the Heebo font from `../my-video/public/fonts`.

```bash
python3 build_video.py                          # captions + original audio
GOOGLE_TTS_API_KEY=... python3 build_video.py   # + Google Cloud Hebrew voice (he-IL-Wavenet-B)
pip install edge-tts && python3 build_video.py --tts edge   # + free Edge voice (he-IL-AvriNeural)
python3 build_video.py --vo-dir recordings      # + your own takes: 01.wav … 04.wav (any audio format)
```

Options: `--voice he-IL-HilaNeural` (or another TTS voice), `-i/-o` for other paths, and
`--keep-ass` to save the caption file next to the video.

## Edit

| Kept from source | Shows |
|---|---|
| 00:00.00 – 00:05.80 | Dining table, wine, coffee machine, nightstand |
| ~~00:05.80 – 00:07.77~~ | Unmade bed (cut) |
| 00:07.77 – 00:21.97 | Mirror, mezuzah, living room, dining area, chess table |

The unmade bed stays on screen until the scene cut at 7.77s, so the cut ends there
instead of at 7.2. Segment 2 runs to 21.97 so the video still lasts 20s. The audio has
40 ms fades at the cut so it doesn't click.

## Voiceover timing

Each line starts at its caption slot. If a line runs longer than its slot, it is sped up
to at most 1.3x, and anything still left over pushes the next line later. The script
prints where each line lands. The original audio is ducked under the voice, and the mix
is normalised to -14 LUFS.

At a normal speaking pace, line 2 (≈8s of speech for a 5s slot) and line 3 run
over. If the script reports overruns, shorten those lines in `VO_LINES` or
lengthen the slots.

## Motion-graphics version (Remotion)

The full promo with motion graphics lives in `my-video` as the `DreamRaffle` composition
(`src/DreamRaffle/`). It uses the same footage (`public/dreamraffle/footage.mp4`, rotated
to 1080x1920), plus the logo, mascot and cause photos from thedreamraffle.co.il. It also
has its own score and sound effects.

```bash
cd my-video
npm run dreamraffle-audio                         # regenerate score + SFX (optional, already committed)
ELEVENLABS_API_KEY=... npm run dreamraffle-vo     # optional: TTS voiceover instead of the recording
npx remotion render DreamRaffle out/dream-raffle.mp4
```

The video uses the supplied narration recording (`public/dreamraffle/vo/narration.mp3`,
cut to end on "והבטיחו את הכרטיס שלכם", then a closing sound; 27s video) with sound effects and no
background music; the scene cuts follow its sentence breaks. Running
`dreamraffle-vo` replaces it with a TTS voiceover (then retime `SCENES` in `theme.ts`).
Set `ELEVENLABS_VOICE_ID` to a native Hebrew voice from the ElevenLabs library for the
best accent, or use `GOOGLE_TTS_API_KEY=... npm run dreamraffle-vo -- google`.

## Market video fixes (`DreamRaffleMarket`)

`my-video/src/DreamRaffleMarket/` fixes the Machane Yehuda market video
(`public/dreamraffle/market/main.mp4`, 720x1280) and outputs it at 1080x1920.
The original video plays underneath, sound included, so speech and captions keep their timing.

```bash
cd my-video && npx remotion render DreamRaffleMarket out/dream-raffle-market.mp4
```

1. **Logo:** the logo in the header tile (x 511–679, y 44–166 in source pixels)
   was cropped at the bottom, hiding "שנה תשיעית ברציפות". A patch redraws the tile
   with the whole logo, scaled to fit with even padding. It appears only while the
   header is settled on screen (source frames 78–283, 400–516, 524–573). These
   ranges were measured frame by frame from the video.
2. **Opening (frames 0–75):** the illustrated building is replaced with apartment
   footage in the style of the `DreamRaffle` promo: a push-in on the dining table,
   a dissolve to the living room, warm light leaks, a light sweep, a vignette and
   gold sparkles. "דירה חדשה בירושלים" builds word by word, then "במתנה?" in large
   gold letters with the key icon. A gold flash leads into the market footage.
3. **Price window (frames 279–407):** the illustrated window with the counter is
   replaced with a whip-pan into the living room and mirror shots. It keeps the gold
   "דירה יוקרתית חדשה בירושלים" label and a glass card counting $800,000 → $1,300,000,
   which pulses and glows when it lands. The segment slides out to the left, back
   into the market footage, where the original header slides in.

Style taken from the `DreamRaffle` promo: gold #D4AF37 / #F6DFA0 on dark
brown #291A11, Heebo 900 headlines that spring in word by word, warm screen-blended
light leaks, diagonal light sweeps, gold particles, whip-pan and flash transitions.
