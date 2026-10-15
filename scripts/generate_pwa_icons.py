import os
from PIL import Image, ImageOps

PUBLIC_DIR = r"C:\Users\Subhadeep\.gemini\antigravity\scratch\aamar-pujo\public"
ICONS_DIR = os.path.join(PUBLIC_DIR, "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

logo_path = os.path.join(PUBLIC_DIR, "logo.png")
if not os.path.exists(logo_path):
    print("Logo not found at", logo_path)
    exit(1)

img = Image.open(logo_path).convert("RGBA")

# 1. 192x192 Icon
icon192 = img.resize((192, 192), Image.Resampling.LANCZOS)
icon192.save(os.path.join(ICONS_DIR, "icon-192.png"), "PNG")
print("Saved icon-192.png")

# 2. 512x512 Icon
icon512 = img.resize((512, 512), Image.Resampling.LANCZOS)
icon512.save(os.path.join(ICONS_DIR, "icon-512.png"), "PNG")
print("Saved icon-512.png")

# 3. 512x512 Maskable Icon (safe area padding: logo occupies inner 80%, dark background)
maskable = Image.new("RGBA", (512, 512), (7, 5, 9, 255))
scaled_w = int(512 * 0.8)
scaled_h = int(512 * 0.8)
scaled_img = img.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)
offset_x = (512 - scaled_w) // 2
offset_y = (512 - scaled_h) // 2
maskable.paste(scaled_img, (offset_x, offset_y), scaled_img)
maskable.save(os.path.join(ICONS_DIR, "icon-maskable-512.png"), "PNG")
print("Saved icon-maskable-512.png")

# 4. Apple Touch Icon 180x180
apple_touch = img.resize((180, 180), Image.Resampling.LANCZOS)
apple_touch.save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), "PNG")
print("Saved apple-touch-icon.png")

print("PWA icon generation complete!")
