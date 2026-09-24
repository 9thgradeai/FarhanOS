"""Generates public/og-image.png (1200x630) — the social link preview card.

No new dependencies: Pillow only, fonts resolved from system paths with
graceful fallback. Re-run after brand/text changes:
    python3 scripts/generate-og-image.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'og-image.png')

FONT_CANDIDATES = [
    '/System/Library/Fonts/Helvetica.ttc',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
]


def load_font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def lerp(a: int, b: int, t: float) -> int:
    return round(a + (b - a) * t)


img = Image.new('RGB', (W, H))
px = img.load()

# Vertical gradient: deep space navy -> near black, with indigo lift left.
top = (13, 15, 30)
bottom = (5, 6, 12)
for y in range(H):
    t = y / (H - 1)
    for x in range(W):
        lift = max(0.0, 1.0 - x / (W * 0.7)) * 0.16 * (1.0 - t * 0.5)
        r = lerp(top[0], bottom[0], t) + int(40 * lift)
        g = lerp(top[1], bottom[1], t) + int(50 * lift)
        b = lerp(top[2], bottom[2], t) + int(130 * lift)
        px[x, y] = (min(r, 255), min(g, 255), min(b, 255))

d = ImageDraw.Draw(img, 'RGBA')

# Orbit rings motif (right side).
cx, cy = 975, 315
for r, w, alpha in ((150, 2, 60), (200, 1, 40), (255, 1, 26)):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(99, 102, 241, alpha), width=w)
d.ellipse([cx - 46, cy - 46, cx + 46, cy + 46], fill=(79, 70, 229, 255))
d.ellipse([cx - 46, cy - 46, cx + 46, cy + 46], outline=(165, 180, 252, 200), width=2)

# Accent hairline top.
d.rectangle([0, 0, W, 4], fill=(99, 102, 241, 255))
d.rectangle([0, 4, W, 6], fill=(34, 211, 238, 160))

f_name = load_font(104)
f_sub = load_font(34, bold=False)
f_site = load_font(30, bold=False)
f_chip = load_font(24, bold=False)

# Status chip.
chip_text = '●  SYS.ONLINE — farhankabir.tech'
d.rounded_rectangle([80, 84, 80 + 560, 84 + 56], radius=28,
                    outline=(52, 211, 153, 220), width=2)
d.text((112, 96), chip_text, font=f_chip, fill=(110, 231, 183, 255))

d.text((80, 190), 'FARHAN', font=f_name, fill=(255, 255, 255, 255))
d.text((80, 300), 'KABIR', font=f_name, fill=(165, 180, 252, 255))
d.text((84, 440), 'Clinical NLP Researcher · Full-Stack & AI/ML Engineer',
       font=f_sub, fill=(161, 161, 170, 255))
d.text((84, 500), 'IEEE-published · 12+ production builds · Interactive portfolio OS',
       font=f_site, fill=(113, 113, 122, 255))

img.save(OUT, 'PNG')
print(f'wrote {OUT} ({W}x{H})')
