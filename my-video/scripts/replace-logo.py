"""Replace the blue-tile logo in a 720x1280 Dream Raffle promo with the new
transparent logo (public/dream/logo-9.png), tracking the tile frame by frame.

Usage: python3 scripts/replace-logo.py IN.mp4 OUT.mp4 public/dream/logo-9.png START END [log.txt]
START/END bound the seconds where the tile can appear (29s promo: 2.5 5.3,
15s promo: 1.2 3.8).
"""
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter

src, out, logo_path, t0, t1 = sys.argv[1:6]
log = open(sys.argv[6], "w") if len(sys.argv) > 6 else None
t0, t1 = float(t0), float(t1)
W, H, FPS = 720, 1280, 30
REGION = 520  # the tile only ever sits in the top part of the frame

logo = Image.open(logo_path).convert("RGBA")

dec = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    stdout=subprocess.PIPE,
)
enc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
     "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", src,
     "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-crf", "18",
     "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "copy",
     "-movflags", "+faststart", out],
    stdin=subprocess.PIPE,
)


def tile_box(f):
    top = f[:REGION].astype(np.int16)
    r, g, b = top[..., 0], top[..., 1], top[..., 2]
    mask = (b > 190) & (g > 130) & (r < 215) & (b - r > 40)
    if mask.sum() < 1500:
        return None
    ys, xs = np.nonzero(mask)
    # Robust bounds so stray sparkles don't stretch the box.
    x0, x1 = np.percentile(xs, [0.5, 99.5]).astype(int)
    y0, y1 = np.percentile(ys, [0.5, 99.5]).astype(int)
    w, h = x1 - x0, y1 - y0
    if w < 40 or h < 40 or not (0.6 < w / h < 1.8):
        return None
    if mask[y0:y1, x0:x1].mean() < 0.12:
        return None
    return x0, y0, x1, y1


def patch(f, box, opacity=1.0):
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    m = max(10, int(0.08 * max(w, h)))  # cover the tile's drop shadow too
    X0, X1 = max(0, x0 - m), min(W - 1, x1 + m)
    Y0, Y1 = max(0, y0 - m), min(H - 1, y1 + m)
    # Background is a vertical gradient: fill each row by blending the
    # pixels just outside the box on the left and right.
    lx, rx = max(0, X0 - 3), min(W - 1, X1 + 3)
    left = f[Y0:Y1, lx].astype(np.float32)
    right = f[Y0:Y1, rx].astype(np.float32)
    t = np.linspace(0, 1, X1 - X0, dtype=np.float32)[None, :, None]
    f[Y0:Y1, X0:X1] = (left[:, None] * (1 - t) + right[:, None] * t).astype(np.uint8)

    # New logo, a little taller than the old tile (it carries the arc text).
    lh = int(h * 1.18)
    lw = int(lh * logo.width / logo.height)
    img = logo.resize((lw, lh), Image.LANCZOS).filter(
        ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2)
    )
    if opacity < 1:
        a = np.array(img)
        a[..., 3] = (a[..., 3] * opacity).astype(np.uint8)
        img = Image.fromarray(a)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    frame = Image.fromarray(f)
    base = frame.convert("RGBA")
    base.alpha_composite(img, (cx - lw // 2, cy - lh // 2))
    return np.array(base.convert("RGB"))


def faint_box(f, center, radius):
    """The tile while it fades and scales in: pixels bluer than their row."""
    cx, cy = center
    ya, yb = max(0, cy - radius), min(H, cy + radius)
    xa, xb = max(0, cx - radius), min(W, cx + radius)
    reg = f[ya:yb].astype(np.int16)
    # Blueness (B-R): the sky tile is far bluer than the purple sky behind
    # it, while clouds are greyer and the gold text is warmer.
    br = reg[..., 2] - reg[..., 0]
    excess = br - np.median(br, axis=1, keepdims=True)
    mask = excess > 9
    mask[:, :xa] = False
    mask[:, xb:] = False
    if mask.sum() < 12:
        return None, 0
    ys, xs = np.nonzero(mask)
    x0, x1 = np.percentile(xs, [1, 99]).astype(int)
    y0, y1 = np.percentile(ys, [1, 99]).astype(int)
    if not (0.6 < (x1 - x0 + 1) / (y1 - y0 + 1) < 1.8):
        return None, 0
    if x1 - x0 < 8 or y1 - y0 < 8:
        return None, 0
    opacity = float(np.clip(excess[mask].mean() / 85, 0.05, 1))
    return (x0, y0 + ya, x1, y1 + ya), opacity


size = W * H * 3
window = []  # frames inside [t0, t1], processed together


def flush():
    boxes = [tile_box(f) for f in window]
    hits = [i for i, b in enumerate(boxes) if b]
    if hits:
        first = boxes[hits[0]]
        center = ((first[0] + first[2]) // 2, (first[1] + first[3]) // 2)
        radius = int(0.75 * max(first[2] - first[0], first[3] - first[1]))
        # Up to 8 frames before the first clear hit, the tile is fading in.
        known = {}  # frame index -> (box, opacity) for the fade-in frames
        for i in range(max(0, hits[0] - 8), hits[0]):
            box, op = faint_box(window[i], center, radius)
            if box:
                # Width is reliable while fading; take height from the
                # tile's real proportions so the box never reaches the text.
                bx0, by0, bx1, by1 = box
                ratio = (first[3] - first[1]) / (first[2] - first[0])
                h2 = int((bx1 - bx0) * ratio / 2)
                cy2 = by0 + h2
                box = (bx0, cy2 - h2, bx1, cy2 + h2)
                known[i] = (box, op)
            if log:
                log.write(f"faint {i} {box} {op:.2f}\n")
        # The scene crossfade can hide the very first faint frames; continue
        # the scale-in backwards from the earliest frame we did find.
        start = min(known) if known else hits[0]
        box, op = known.get(start, (first, 1.0))
        for k, i in enumerate(range(start - 1, max(-1, start - 3), -1)):
            x0, y0, x1, y1 = box
            sc = 0.55 ** (k + 1)
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2 + 20 * (k + 1)
            hw, hh = (x1 - x0) * sc / 2, (y1 - y0) * sc / 2
            guess = (int(cx - hw), int(cy - hh), int(cx + hw), int(cy + hh))
            known[i] = (guess, op * 0.5 ** (k + 1))
        for i, (b, o) in known.items():
            window[i] = patch(window[i], b, o)
    for i, b in enumerate(boxes):
        if b:
            window[i] = patch(window[i], b)
        if log:
            log.write(f"{i} {b}\n")
    for f in window:
        enc.stdin.write(f.tobytes())
    window.clear()


n = 0
while True:
    buf = dec.stdout.read(size)
    if len(buf) < size:
        break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
    t = n / FPS
    if t0 <= t <= t1:
        window.append(f)
    else:
        if window:
            flush()
        enc.stdin.write(f.tobytes())
    n += 1
if window:
    flush()

enc.stdin.close()
enc.wait()
dec.wait()
print("frames", n)
