# Video work in this repo

Always write to the user in Hebrew. All narration and on-screen copy is
Hebrew too, voiced with a native Israeli accent.

The client wants every available tool used on each video, not only Remotion.
For each video, go through this list and use whatever is connected:

- **Remotion** (`my-video/`): the main build and render. Render with
  `npx remotion render <Composition> out/<name>.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
  (Remotion's own Chrome download is blocked by the network policy).
- **Descript** connector: upload source footage to transcribe it (exact quotes,
  cut points on speech) and, where useful, have Agent Underlord do captions or
  rough cuts. Publish links from Descript go to the user.
- **Orshot** connector: brand kit (colors, fonts, logo), stock media, and
  template renders for social sizes (Story / Square / feed) of a finished video
  or its stills.
- **HyperFrames by HeyGen** connector: only its read tools work from Claude
  Code; `compose` / `render_video` are disabled here. Use it only for listing
  or opening existing HeyGen projects.
- **Google Drive** connector: pick up source files the user keeps there, and
  deliver finished renders there when asked.

Voiceover: no TTS key is set yet. `my-video/scripts/generate-voiceover.mjs`
reads `GOOGLE_TTS_API_KEY`; until it exists, carry the narration as on-screen
captions and keep a VOICEOVER slot in the composition.

Never invent campaign facts (odds, ticket counts, winners, dates). Confirmed
figures live in `FACTS` in `my-video/src/DreamLottery/theme.ts`.
