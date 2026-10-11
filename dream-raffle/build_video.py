#!/usr/bin/env python3
"""Builds the "The Dream Raffle" (thedreamraffle.co.il) promo from the apartment walkthrough.

    python3 build_video.py                          # captions + original audio, no voiceover
    GOOGLE_TTS_API_KEY=... python3 build_video.py   # + Google Cloud TTS Hebrew voiceover
    python3 build_video.py --tts edge               # + free Microsoft Edge neural voice (pip install edge-tts)
    python3 build_video.py --vo-dir my_recordings   # + your own recordings 01.*, 02.*, 03.*, 04.*

Pipeline (FFmpeg only, needs libass/fribidi/harfbuzz, which stock builds have):
  1. Cut: keep 00:00-05.8 and 07.77-21.97, dropping the unmade-bed shot. The bed stays on
     screen until the hard scene cut at 7.77s, so cutting at 7.2 would leave half a second
     of it; segment 2 is extended to 21.97 so the edit is still 20s long.
  2. Join the two parts with short audio fades at the seam so there is no click.
  3. Upscale the 576x1024 phone clip to 1080x1920, add a bottom gradient and burn the
     Hebrew captions (ASS subtitles, Heebo font, RTL shaped by libass).
  4. Voiceover: one clip per caption slot, silence-trimmed, sped up slightly when a line
     is longer than its slot, placed on the timeline; the original audio is ducked under it.
  5. Loudness-normalise to -14 LUFS (social media target) and export H.264/AAC MP4.
"""

import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_INPUT = HERE / "input" / "WhatsApp Video 2026-10-08 at 15.45.27.mp4"
DEFAULT_OUTPUT = HERE / "output" / "dream-raffle-promo.mp4"
FONTS_DIR = HERE.parent / "my-video" / "public" / "fonts"

# Source ranges (seconds) to keep, in order. 05.8-07.77 is the unmade bed.
SEGMENTS = [(0.0, 5.8), (7.77, 21.97)]
DURATION = sum(end - start for start, end in SEGMENTS)  # 20.0

W, H, FPS = 1080, 1920, 30
SEAM_FADE = 0.04  # audio fade at each cut, seconds
FADE_IN, FADE_OUT = 0.3, 0.6  # picture fade from/to black

URL = "thedreamraffle.co.il"

# On-screen text, timed on the edited (output) timeline: (start, end, white line, gold line).
# Colour changes only at line breaks: libass runs bidi per style run, so a colour
# change in the middle of a Hebrew line scrambles the word order.
CAPTIONS = [
    (0.0, 3.0, "זוכים בדירת יוקרה", "מרוהטת בירושלים!"),
    (3.0, 8.0, "הגרלת החלומות 2026", "מבצע 1+1 בלעדי!"),
    (8.0, 14.0, 'כל כרטיס תומך בחיילי צה"ל', "ובציוד חירום לחזית"),
    (14.0, 20.0, "כנסו עכשיו לעמוד ההגרלה:", URL),
]
FLAG_CAPTION = 2  # the 🇮🇱 in caption 3 is drawn as a vector flag (libass has no colour emoji)

# Voiceover, one line per caption slot.
VO_LINES = [
    (0.0, 3.0, "רוצים לעבור לגור בדירת יוקרה מרוהטת מא' ועד ת' בלב ירושלים?"),
    (3.0, 8.0, "הגרלת החלומות של קרן 'עם ישראל חי' חוזרת – ואתם יכולים לזכות בדירה בשווי 1.3 מיליון דולר! "
               "ובנוסף: מבצע 1+1 על כל הכרטיסים!"),
    (8.0, 14.0, 'כל כרטיס שאתם רוכשים תומך בחיילי צה"ל, במוסדות תורה ובציוד חירום לחזית. תרומה שמנצחת פעמיים!'),
    (14.0, 20.0, "אל תפספסו! נכנסים עכשיו ל-דה דרים רפל דוט קו דוט איי אל, קונים כרטיס ומקבלים עוד אחד במתנה!"),
]
# TTS engines read the domain letter by letter, so line 4 spells it out the way a
# presenter would say it. Recordings passed with --vo-dir are used as they are.

MAX_TEMPO = 1.3   # never speed speech up beyond this
VO_GAP = 0.12     # minimum pause between two lines
BED_DB_UNDER_VO = -12  # original audio level when there is a voiceover
BED_DB_NO_VO = -2

GOLD = "&H37AFD4&"      # #D4AF37, ASS colours are BGR
IL_BLUE = "&HB83800&"   # #0038B8


def run(cmd):
    print("+", " ".join(str(c) for c in cmd[:6]), "..." if len(cmd) > 6 else "", flush=True)
    subprocess.run([str(c) for c in cmd], check=True)


def duration_of(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout
    return float(out.strip())


# --------------------------------------------------------------------------- voiceover

def tts_google(text, out_path, voice):
    key = os.environ.get("GOOGLE_TTS_API_KEY")
    if not key:
        sys.exit("GOOGLE_TTS_API_KEY is not set (a Google Cloud key restricted to the Text-to-Speech API).")
    body = json.dumps({
        "input": {"text": text},
        "voice": {"languageCode": "he-IL", "name": voice or "he-IL-Wavenet-B"},
        "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": 48000, "speakingRate": 1.08, "pitch": -2},
    }).encode()
    req = urllib.request.Request(
        f"https://texttospeech.googleapis.com/v1/text:synthesize?key={key}",
        data=body, headers={"content-type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as res:
        Path(out_path).write_bytes(base64.b64decode(json.load(res)["audioContent"]))


def tts_edge(text, out_path, voice):
    try:
        import asyncio
        import edge_tts
    except ImportError:
        sys.exit("--tts edge needs the edge-tts package: pip install edge-tts")
    comm = edge_tts.Communicate(text, voice or "he-IL-AvriNeural", rate="+8%",
                                proxy=os.environ.get("HTTPS_PROXY"))
    asyncio.run(comm.save(str(out_path)))


def clean_clip(src, dst):
    """48 kHz mono WAV with leading/trailing silence removed."""
    trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05"
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "48000",
         "-af", f"{trim},areverse,{trim},areverse", dst])


def make_voiceover(args, work):
    """Returns [(wav_path, start_seconds, tempo)] or [] when there is no voiceover."""
    raw = []
    if args.vo_dir:
        for i in range(len(VO_LINES)):
            found = sorted(Path(args.vo_dir).glob(f"{i + 1:02d}.*"))
            if not found:
                sys.exit(f"{args.vo_dir} has no {i + 1:02d}.* recording (expected 01.* to {len(VO_LINES):02d}.*).")
            raw.append(found[0])
    elif args.tts != "none":
        engine = args.tts
        if engine == "auto":
            engine = "google" if os.environ.get("GOOGLE_TTS_API_KEY") else "none"
        if engine == "none":
            print("No voiceover: set GOOGLE_TTS_API_KEY, or pass --tts edge or --vo-dir.")
            return []
        synth = tts_google if engine == "google" else tts_edge
        for i, (_, _, text) in enumerate(VO_LINES):
            path = work / f"tts_{i + 1:02d}.{'wav' if engine == 'google' else 'mp3'}"
            synth(text, path, args.voice)
            raw.append(path)
    else:
        return []

    placed, prev_end = [], 0.0
    for i, ((slot_start, slot_end, _), src) in enumerate(zip(VO_LINES, raw)):
        wav = work / f"vo_{i + 1:02d}.wav"
        clean_clip(src, wav)
        length = duration_of(wav)
        start = max(slot_start, prev_end + VO_GAP if i else slot_start)
        room = max(slot_end - start, 0.1)
        tempo = min(max(length / room, 1.0), MAX_TEMPO)
        end = start + length / tempo
        flag = ""
        if end > slot_end + 0.05:
            flag = f"  (runs {end - slot_end:.2f}s past its slot; shorten the line or slow the edit)"
        print(f"VO {i + 1}: {length:5.2f}s -> x{tempo:.2f}, {start:5.2f}-{end:5.2f}{flag}")
        placed.append((wav, start, tempo))
        prev_end = end
    if prev_end > DURATION - 0.2:
        print(f"Warning: the voiceover ends at {prev_end:.2f}s, the video at {DURATION:.2f}s.")
    return placed


# --------------------------------------------------------------------------- captions

def ass_time(t):
    cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def flag_drawing():
    """Israeli flag 150x108 as ASS vector layers: white field, two stripes, hexagram outline."""
    w, h, cx, cy, r = 150, 108, 75, 54, 22
    hw = round(r * 0.866, 1)
    rect = lambda y0, y1: f"m 0 {y0} l {w} {y0} l {w} {y1} l 0 {y1}"
    up = f"m {cx} {cy - r} l {cx + hw} {cy + r / 2} l {cx - hw} {cy + r / 2}"
    down = f"m {cx} {cy + r} l {cx + hw} {cy - r / 2} l {cx - hw} {cy - r / 2}"
    return [
        (r"\1c&HFFFFFF&\bord0\shad4\4a&H90&", rect(0, h)),
        (rf"\1c{IL_BLUE}\bord0\shad0", rect(10, 27) + " " + rect(h - 27, h - 10)),
        (rf"\1a&HFF&\3c{IL_BLUE}\bord2.6\shad0", up),
        (rf"\1a&HFF&\3c{IL_BLUE}\bord2.6\shad0", down),
    ]


def write_ass(path):
    y = 1520  # centre of the caption block, in the lower third
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Heebo,78,&H00FFFFFF,&H00FFFFFF,&H50000000,&H78000000,-1,0,0,0,100,100,0,0,1,2.5,5,5,60,60,0,-1
Style: Brand,Heebo,34,&H40FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,4,0,1,0,2,8,40,40,90,1
Style: Shape,Heebo,20,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = []
    for i, (start, end, white, gold) in enumerate(CAPTIONS):
        text = f"{white}\\N{{\\c{GOLD}}}{gold}"
        # Fade in while rising 30px, fade out at the end of the slot.
        anim = rf"{{\fad(280,220)\move({W // 2},{y + 30},{W // 2},{y},0,350)\blur0.6}}"
        lines.append(f"Dialogue: 1,{ass_time(start)},{ass_time(end)},Caption,,0,0,0,,{anim}{text}")
        # A thin gold rule above each caption.
        rule = rf"{{\an5\pos({W // 2},{y - 150})\fad(400,220)\1c{GOLD}\bord0\shad0\p1}}m -90 0 l 90 0 l 90 4 l -90 4{{\p0}}"
        lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Shape,,0,0,0,,{rule}")
        if i == FLAG_CAPTION:
            for layer, (tags, shape) in enumerate(flag_drawing()):
                pos = rf"\an7\pos({W // 2 - 75},{y - 300})\fad(300,220)"
                lines.append(f"Dialogue: {2 + layer},{ass_time(start)},{ass_time(end)},Shape,,0,0,0,,"
                             f"{{{pos}{tags}\\p1}}{shape}{{\\p0}}")
    lines.append(f"Dialogue: 0,{ass_time(0.4)},{ass_time(DURATION)},Brand,,0,0,0,,{{\\fad(500,0)}}{URL.upper()}")
    Path(path).write_text(header + "\n".join(lines) + "\n", encoding="utf-8")


# --------------------------------------------------------------------------- render

def ff_path(p):
    """Escape a path for use inside an ffmpeg filter argument."""
    return str(p).replace("\\", "/").replace(":", r"\:").replace("'", r"\'")


def build(args):
    if not Path(args.input).exists():
        sys.exit(f"Input not found: {args.input}")
    if duration_of(args.input) < SEGMENTS[-1][1]:
        sys.exit(f"Input is shorter than {SEGMENTS[-1][1]}s.")
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            sys.exit(f"{tool} not found on PATH.")

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        ass = work / "captions.ass"
        write_ass(ass)
        if args.keep_ass:
            shutil.copy(ass, out.with_suffix(".ass"))
        vo = make_voiceover(args, work)

        inputs = ["-i", args.input]
        for wav, _, _ in vo:
            inputs += ["-i", wav]

        f = []
        # 1-2. Cut and join picture and sound.
        for k, (a, b) in enumerate(SEGMENTS):
            seg = b - a
            f.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{k}]")
            f.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aresample=48000,"
                     f"afade=t=in:d={SEAM_FADE},afade=t=out:st={seg - SEAM_FADE:.3f}:d={SEAM_FADE}[a{k}]")
        n = len(SEGMENTS)
        f.append("".join(f"[v{k}][a{k}]" for k in range(n)) + f"concat=n={n}:v=1:a=1[vcat][acat]")

        # 3. Picture: 1080x1920, bottom gradient for legibility, captions, fades.
        f.append(f"[vcat]scale={W}:{H}:flags=lanczos,setsar=1,fps={FPS},format=yuv420p[vs]")
        f.append(f"color=c=black:s={W}x900:r={FPS}:d={DURATION},format=rgba,"
                 f"geq=r=0:g=0:b=0:a='200*pow(Y/H\\,1.7)'[grad]")
        f.append(f"[vs][grad]overlay=0:{H - 900}:shortest=1,"
                 f"ass='{ff_path(ass)}':fontsdir='{ff_path(FONTS_DIR)}',"
                 f"fade=t=in:d={FADE_IN},fade=t=out:st={DURATION - FADE_OUT}:d={FADE_OUT},format=yuv420p[vout]")

        # 4. Sound: voiceover over the ducked original audio.
        if vo:
            for i, (_, start, tempo) in enumerate(vo):
                ms = int(start * 1000)
                f.append(f"[{i + 1}:a]atempo={tempo:.4f},adelay={ms}|{ms},apad[vo{i}]")
            f.append("".join(f"[vo{i}]" for i in range(len(vo)))
                     + f"amix=inputs={len(vo)}:normalize=0:duration=longest,"
                     f"atrim=0:{DURATION},aformat=channel_layouts=stereo,asplit[vomix][vokey]")
            f.append(f"[acat]volume={BED_DB_UNDER_VO}dB[bed]")
            f.append("[bed][vokey]sidechaincompress=threshold=0.02:ratio=6:attack=15:release=350[ducked]")
            f.append("[ducked][vomix]amix=inputs=2:normalize=0:duration=first[amix]")
        else:
            f.append(f"[acat]volume={BED_DB_NO_VO}dB[amix]")
        # 5. Loudness and end fade.
        f.append(f"[amix]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,"
                 f"afade=t=in:d={FADE_IN},afade=t=out:st={DURATION - FADE_OUT}:d={FADE_OUT}[aout]")

        run(["ffmpeg", "-v", "error", "-stats", "-y", *inputs,
             "-filter_complex", ";".join(f), "-map", "[vout]", "-map", "[aout]",
             "-t", f"{DURATION:.3f}",
             "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high",
             "-pix_fmt", "yuv420p", "-r", str(FPS),
             "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
             "-movflags", "+faststart", out])
    print(f"Done: {out}  ({duration_of(out):.2f}s, {W}x{H}, voiceover: {'yes' if vo else 'no'})")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("-i", "--input", default=str(DEFAULT_INPUT))
    p.add_argument("-o", "--output", default=str(DEFAULT_OUTPUT))
    p.add_argument("--tts", choices=["auto", "google", "edge", "none"], default="auto",
                   help="auto = Google Cloud TTS when GOOGLE_TTS_API_KEY is set, otherwise none")
    p.add_argument("--voice", help="TTS voice (default he-IL-Wavenet-B / he-IL-AvriNeural; "
                                   "female: he-IL-Wavenet-A / he-IL-HilaNeural)")
    p.add_argument("--vo-dir", help="folder with recorded lines 01.* to 04.* (overrides --tts)")
    p.add_argument("--keep-ass", action="store_true", help="also save the caption file next to the video")
    build(p.parse_args())


if __name__ == "__main__":
    main()
