"""Re-engrave the year on the gold medal in the WinnerPromo source video.

The medal's rim reads "שנה שמינית ברציפות" (8th year); this rewrites it to
"שנה תשיעית ברציפות" (9th year) in every frame of the medal scene, keeping the
metal's own texture and lighting from each frame.

How it works:
  1. The medal is tracked against a reference frame (SIFT + RANSAC homography).
  2. In the reference frame the rim is an ellipse (fitted to the thin ring line
     inside the rim). Each frame's rim is unwrapped into a straight strip.
  3. In the strip, everything after "שנה" is erased (inpainted from the gold
     above and below it) and "תשיעית ברציפות" is engraved by darkening that gold
     to the colour of the existing letters, with a small bevel.
  4. The strip is wrapped back onto the frame. Only medal-coloured pixels are
     replaced, so the fingers stay on top. The caption box is see-through
     (about 78% dark grey), with the rim showing faintly behind it: inside
     the box the medal is un-composited, fixed, and the box laid back over
     it; the caption's own text pixels are never touched.

  python3 scripts/fix-medal-year.py public/winner-promo/source.mp4 \
      public/winner-promo/source-fixed.mp4

Needs opencv-python-headless, numpy, Pillow (with raqm) and ffmpeg.
"""

import json
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SRC, OUT = sys.argv[1], sys.argv[2]
FONT = "public/fonts/Heebo-900.ttf"

# Medal scene (source frames), including the crossfades in and out.
SCENE = (481, 636)
FADE_IN = (481, 489)  # medal fades in over the speaker (first visible at 481)
FADE_OUT = (623, 636)  # tickets fade in over the medal
REF = 540  # reference frame: medal sharp and front-on

# Ring line ellipse in the reference frame (fitted to the thin dark line).
ELL = dict(cx=570.805, cy=1188.363, a=338.763, b=386.028, ang=85.2328)

# Unwrapped strip: column = degrees along the rim (reading direction is
# right-to-left, like normal Hebrew), row = radius as a multiple of the ring.
TH0, TH1, R0, R1 = -75.0, 70.0, 1.02, 1.28
KX, KY = 8.0, 380.0
SW, SH = int((TH1 - TH0) * KX), int((R1 - R0) * KY)

# In the strip, "שנה" ends at column 832 and the old year text spans columns
# 220–811. Its letters do not sit exactly on the fitted ellipse: their top
# and bottom rows were measured along the rim (frame 488, where the whole
# text is visible) and the new text follows the same path.
TEXT_COLS = (205, 826)
NEW_SPAN = (220, 811)
PATH = {  # column: (top row, bottom row)
    231: (19, 79),
    520: (31, 89),
    860: (28, 88),
    990: (19, 72),
}
NEW_TEXT = "תשיעית ברציפות"
# Colour of the existing letters' core relative to the gold around them (B, G, R).
LETTER_RATIO = np.array([0.5, 0.56, 0.63])


def ell_frame():
    t = np.deg2rad(ELL["ang"])
    return ELL["cx"], ELL["cy"], ELL["a"], ELL["b"], np.cos(t), np.sin(t)


def strip_to_ref():
    """Reference-frame pixel coordinates of every strip pixel."""
    cx, cy, a, b, c, s = ell_frame()
    xs, ys = np.meshgrid(np.arange(SW), np.arange(SH))
    th = np.deg2rad(TH1 - xs / KX)
    r = R0 + ys / KY
    ex, ey = r * a * np.cos(th), r * b * np.sin(th)
    return np.stack([cx + ex * c - ey * s, cy + ex * s + ey * c], axis=-1)


def ref_to_strip(pts):
    """Strip coordinates (col, row) of reference-frame points."""
    cx, cy, a, b, c, s = ell_frame()
    dx, dy = pts[..., 0] - cx, pts[..., 1] - cy
    x, y = dx * c + dy * s, -dx * s + dy * c
    th = np.degrees(np.arctan2(y / b, x / a))
    r = np.hypot(x / a, y / b)
    return (TH1 - th) * KX, (r - R0) * KY


def glyph_mask():
    """New year text as a soft mask in strip space, following PATH."""
    font = ImageFont.truetype(FONT, 200)
    img = Image.new("L", (3000, 500), 0)
    ImageDraw.Draw(img).text(
        (50, 100), NEW_TEXT, font=font, fill=255, direction="rtl",
        stroke_width=4, stroke_fill=255,
    )
    glyph = np.asarray(img.crop(img.getbbox()), np.float32) / 255
    gh, gw = glyph.shape
    cols = np.array(sorted(PATH))
    tops = np.polyfit(cols, [PATH[c][0] for c in cols], 2)
    bots = np.polyfit(cols, [PATH[c][1] for c in cols], 2)
    # Strip column → glyph column (right edge of the text at NEW_SPAN[1]),
    # strip row → glyph row between the measured top and bottom at that column.
    xs, ys = np.meshgrid(np.arange(SW, dtype=np.float32), np.arange(SH, dtype=np.float32))
    top, bot = np.polyval(tops, xs), np.polyval(bots, xs)
    gx = (xs - NEW_SPAN[0]) / (NEW_SPAN[1] - NEW_SPAN[0]) * (gw - 1)
    gy = (ys - top) / (bot - top) * (gh - 1)
    m = cv2.remap(glyph, gx.astype(np.float32), gy.astype(np.float32), cv2.INTER_LINEAR,
                  borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    # The footage is soft; match its edge blur.
    return cv2.GaussianBlur(m, (0, 0), 1.1)


def letters(strip):
    """Old engraved letters in an unwrapped strip (dark brown on gold)."""
    hsv = cv2.cvtColor(strip, cv2.COLOR_BGR2HSV)
    g = strip.mean(axis=2)
    bg = cv2.GaussianBlur(
        cv2.medianBlur(g.astype(np.uint8), 41).astype(np.float32), (0, 0), 9
    )
    d = (g < bg - 22) & (hsv[..., 0] >= 5) & (hsv[..., 0] <= 30) & (hsv[..., 1] > 55)
    m = np.zeros(d.shape, np.uint8)
    m[8:94, TEXT_COLS[0] : TEXT_COLS[1]] = d[8:94, TEXT_COLS[0] : TEXT_COLS[1]]
    return m


def engrave(strip, glyph, old):
    """Erase the old letters (inpaint the gold) and engrave the new text."""
    gold = cv2.inpaint(strip, old, 7, cv2.INPAINT_TELEA).astype(np.float32)
    g = glyph[..., None]
    lower = np.roll(glyph, 2, axis=0)[..., None]
    upper = np.roll(glyph, -2, axis=0)[..., None]
    rim_light = np.clip(lower - g, 0, 1) * 0.15
    rim_dark = np.clip(upper - g, 0, 1) * 0.10
    res = gold * (1 - g * (1 - LETTER_RATIO))
    res = res * (1 + rim_light) * (1 - rim_dark)
    return np.clip(res, 0, 255).astype(np.uint8)


def medal_pixels(img):
    """Pixels that look like the medal (gold or its brown letters)."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    m = (h >= 8) & (h <= 30) & (s >= 55) & (v >= 55)
    m = m.astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    return cv2.GaussianBlur(m, (5, 5), 0).astype(np.float32) / 255


# The caption box: semi-transparent dark grey over the picture.
BOX_ALPHA = 0.78
BOX_COLOR = np.array([24.0, 24.0, 26.0])


def caption_box(img):
    """(top, bottom, left, right) of the caption box, or None."""
    g = img.max(axis=2)
    band = g[1480:1720, 100:980] < 80
    rows = np.nonzero(band.mean(axis=1) > 0.45)[0]
    if len(rows) < 30:
        return None
    t, b = rows[0] + 1480, rows[-1] + 1480
    cols = np.nonzero((g[t + 6 : b - 6] < 80).mean(axis=0) > 0.45)[0]
    if len(cols) < 50:
        return None
    return t, b + 1, cols[0], cols[-1] + 1


def caption_text(crop):
    """Caption text inside the box: white letters, green words, emoji."""
    c = crop.astype(int)
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    white = c.min(axis=2) > 120
    green = (c[..., 1] > 120) & (c[..., 1] > c[..., 2] + 30)
    bright = (hsv[..., 2] > 110) & (hsv[..., 1] > 90)  # emoji
    m = (white | green | bright).astype(np.uint8)
    return cv2.dilate(m, np.ones((5, 5), np.uint8))


def track(frames):
    """Homography reference → frame for every frame of the scene."""
    sift = cv2.SIFT_create(nfeatures=6000)
    bf = cv2.BFMatcher()

    def feats(img):
        g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        m = np.zeros(g.shape, np.uint8)
        m[400:1540] = 255
        m[:300, 850:] = 0  # corner logo
        return sift.detectAndCompute(g, m)

    kr, dr = feats(frames[REF])
    hs, quality = {}, {}
    for n, img in frames.items():
        k, d = feats(img)
        if d is None:
            continue
        good = [a for a, b in bf.knnMatch(dr, d, k=2) if a.distance < 0.75 * b.distance]
        if len(good) < 8:
            continue
        src = np.float32([kr[a.queryIdx].pt for a in good])
        dst = np.float32([k[a.trainIdx].pt for a in good])
        h, inl = cv2.findHomography(src, dst, cv2.RANSAC, 4.0)
        if h is not None:
            hs[n], quality[n] = h, int(inl.sum())
    good = [n for n in sorted(hs) if quality[n] >= 80]
    tracked = {n: hs[n] for n in good}
    # In the crossfades the medal is faint and matches the reference
    # poorly; chain frame to frame from the nearest well-tracked frame
    # instead, and stop where even that fails (the medal is barely there).
    def chain(order):
        prev = None
        for n in order:
            if n in tracked:
                prev = n
                continue
            if prev is None:
                continue
            kp, dp = feats(frames[prev])
            kn, dn = feats(frames[n])
            if dp is None or dn is None:
                break
            m = [a for a, b in bf.knnMatch(dp, dn, k=2) if a.distance < 0.75 * b.distance]
            if len(m) < 25:
                break
            src = np.float32([kp[a.queryIdx].pt for a in m])
            dst = np.float32([kn[a.trainIdx].pt for a in m])
            step, inl = cv2.findHomography(src, dst, cv2.RANSAC, 3.0)
            if step is None or inl.sum() < 25:
                break
            tracked[n] = step @ tracked[prev]
            prev = n

    chain(range(good[0], SCENE[0] - 1, -1))
    chain(range(good[-1], SCENE[1]))
    hs = tracked
    return hs, quality


def main():
    probe = json.loads(
        subprocess.check_output(
            ["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries",
             "stream=width,height,r_frame_rate", "-of", "json", SRC]
        )
    )["streams"][0]
    W, H = probe["width"], probe["height"]

    cap = cv2.VideoCapture(SRC)
    frames, n = {}, 0
    while True:
        ok, img = cap.read()
        if not ok:
            break
        if SCENE[0] <= n < SCENE[1]:
            frames[n] = img
        n += 1
    total = n
    hs, quality = track(frames)
    print("fixing frames", min(hs), "to", max(hs), "; min inliers mid-scene",
          min(quality.get(k, 0) for k in range(FADE_IN[1], FADE_OUT[0])))

    glyph = glyph_mask()
    ref_pts = strip_to_ref().astype(np.float32).reshape(-1, 1, 2)

    def unwrap(img, h):
        p = cv2.perspectiveTransform(ref_pts, h).reshape(SH, SW, 2)
        strip = cv2.remap(img, p[..., 0], p[..., 1], cv2.INTER_CUBIC,
                          borderMode=cv2.BORDER_REFLECT)
        return strip, p

    # Where the old letters are: the caption hides a different part of the
    # rim in each frame, so vote across the whole scene.
    votes = np.zeros((SH, SW), np.float32)
    seen = np.zeros((SH, SW), np.float32)
    for n in range(FADE_IN[1], FADE_OUT[0]):
        strip, _ = unwrap(frames[n], hs[n])
        visible = medal_pixels(strip) > 0.5
        votes += letters(strip) * visible
        seen += visible
    old = ((votes / np.maximum(seen, 1)) > 0.2).astype(np.uint8)
    old = cv2.morphologyEx(old, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    old = cv2.dilate(old, np.ones((9, 9), np.uint8))
    new_area = cv2.dilate((glyph > 0.03).astype(np.uint8), np.ones((5, 5), np.uint8))
    # Everything the old or new letters can touch, with the gaps between
    # them, so no half-erased stroke is left at the edge.
    span = np.zeros_like(old)
    span[8:94, TEXT_COLS[0] : TEXT_COLS[1]] = 1
    footprint = cv2.morphologyEx(np.maximum(old, new_area), cv2.MORPH_CLOSE,
                                 np.ones((15, 15), np.uint8)) * span
    footprint = cv2.GaussianBlur(footprint.astype(np.float32), (0, 0), 1.5)
    rows, cols = np.nonzero(footprint > 0.01)

    def patch(img, h):
        box = caption_box(img)
        if box is None:
            return patch_medal(img, h)
        t, b, l, r = box
        # See through the caption box: estimate the medal behind it.
        under = img.astype(np.float32)
        inside = under[t:b, l:r]
        text = caption_text(img[t:b, l:r])
        medal = (inside - BOX_ALPHA * BOX_COLOR) / (1 - BOX_ALPHA)
        medal = np.clip(medal, 0, 255).astype(np.uint8)
        medal = cv2.inpaint(medal, text, 5, cv2.INPAINT_TELEA)
        clean = img.copy()
        clean[t:b, l:r] = medal
        fixed = patch_medal(clean, h).astype(np.float32)
        # Lay the box back over the fixed medal; keep the caption text as is.
        boxed = BOX_ALPHA * BOX_COLOR + (1 - BOX_ALPHA) * fixed[t:b, l:r]
        delta = boxed - (BOX_ALPHA * BOX_COLOR + (1 - BOX_ALPHA) * medal.astype(np.float32))
        region = inside + delta * (1 - text[..., None])
        out = fixed.copy()
        out[t:b, l:r] = region
        return np.clip(out, 0, 255).astype(np.uint8)

    def patch_medal(img, h):
        strip, p = unwrap(img, h)
        # This frame's own view of the old letters, on top of the vote.
        here = cv2.dilate(letters(strip), np.ones((9, 9), np.uint8))
        new = engrave(strip, glyph, np.maximum(old, here) * span)
        # Wrap back onto the frame, only over the old and new letters.
        pts = p[rows, cols]
        x0, y0 = np.floor(pts.min(0)).astype(int) - 3
        x1, y1 = np.ceil(pts.max(0)).astype(int) + 3
        x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, W), min(y1, H)
        if x1 <= x0 or y1 <= y0:
            return img
        gx, gy = np.meshgrid(np.arange(x0, x1, dtype=np.float32),
                             np.arange(y0, y1, dtype=np.float32))
        ref = cv2.perspectiveTransform(
            np.stack([gx, gy], -1).reshape(-1, 1, 2), np.linalg.inv(h)
        ).reshape(gx.shape + (2,))
        sx, sy = ref_to_strip(ref)
        sx, sy = sx.astype(np.float32), sy.astype(np.float32)
        warped = cv2.remap(new, sx, sy, cv2.INTER_LINEAR)
        foot = cv2.remap(footprint, sx, sy, cv2.INTER_LINEAR, borderValue=0)
        crop = img[y0:y1, x0:x1]
        # Caption, fingers and coins stay on top: only medal-coloured pixels.
        wgt = (foot * medal_pixels(crop))[..., None]
        out = img.copy()
        out[y0:y1, x0:x1] = (crop * (1 - wgt) + warped * wgt).astype(np.uint8)
        return out

    if len(sys.argv) > 3:  # --preview: write a few frames as PNGs
        for n in map(int, sys.argv[3].split(",")):
            cv2.imwrite(f"{OUT}-{n}.png", patch(frames[n], hs[n]))
            cv2.imwrite(f"{OUT}-{n}-strip.png", engrave(unwrap(frames[n], hs[n])[0], glyph, old))
            cv2.imwrite(f"{OUT}-{n}-orig.png", unwrap(frames[n], hs[n])[0])
        cv2.imwrite(f"{OUT}-old.png", old * 255)
        return

    enc = subprocess.Popen(
        ["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
         "-s", f"{W}x{H}", "-r", probe["r_frame_rate"], "-i", "-", "-i", SRC,
         "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "18",
         "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "copy", OUT],
        stdin=subprocess.PIPE,
    )
    cap = cv2.VideoCapture(SRC)
    for n in range(total):
        ok, img = cap.read()
        if not ok:
            break
        if n in hs:
            fixed = patch(img, hs[n])
            # Fade the fix with the scene's crossfades, where the medal is
            # only partly visible and tracking is held.
            a = 1.0
            if n < FADE_IN[1]:
                a = (n - FADE_IN[0]) / (FADE_IN[1] - FADE_IN[0])
            elif n >= FADE_OUT[0]:
                a = 1 - (n - FADE_OUT[0]) / (FADE_OUT[1] - FADE_OUT[0])
            img = (img * (1 - a) + fixed * a).astype(np.uint8)
        enc.stdin.write(img.tobytes())
    enc.stdin.close()
    enc.wait()
    print("wrote", OUT)


if __name__ == "__main__":
    main()
