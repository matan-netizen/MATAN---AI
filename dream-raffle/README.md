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
