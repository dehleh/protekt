"""Generate the geometric SHOMAR shield assets. Requires Pillow; run from any directory."""
from pathlib import Path
from PIL import Image, ImageDraw

out = Path(__file__).parent
def shield(size, background, color, filename, inset=0.22):
    canvas = Image.new('RGBA', (size * 3, size * 3), background)
    draw = ImageDraw.Draw(canvas)
    def points(values):
        return [(round(x * size * 3), round(y * size * 3)) for x, y in values]
    left, right = inset, 1 - inset
    shape = [(0.5, inset), (right, inset + .09), (right - .025, .57), (.69, .72), (.5, 1 - inset), (.31, .72), (left + .025, .57), (left, inset + .09)]
    draw.polygon(points(shape), fill=color)
    draw.line(points([(.365, .49), (.465, .59), (.65, .395)]), fill=background if background[3] else (0, 0, 0, 0), width=round(size * .044 * 3), joint='curve')
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(out / filename)

shield(1024, (17, 37, 65, 255), (255, 255, 255, 255), 'icon.png')
shield(1024, (0, 0, 0, 0), (255, 255, 255, 255), 'android-icon-foreground.png', .27)
shield(1024, (0, 0, 0, 0), (255, 255, 255, 255), 'android-icon-monochrome.png', .27)
shield(96, (0, 0, 0, 0), (255, 255, 255, 255), 'notification-icon.png', .16)
