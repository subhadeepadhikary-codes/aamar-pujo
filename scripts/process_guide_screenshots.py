import os
from PIL import Image, ImageDraw, ImageFont

USER_UPLOAD_DIR = r"C:\Users\Subhadeep\.gemini\antigravity\brain\0973f8a7-fa0f-446a-8016-65e6da5914b1\.user_uploaded"
OUTPUT_DIR = r"C:\Users\Subhadeep\.gemini\antigravity\scratch\aamar-pujo\public\screenshots"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Use prominent, large bold font for maximum readability on mobile screens
badge_font = None
for font_name in ["segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf", "calibrib.ttf"]:
    try:
        badge_font = ImageFont.truetype(font_name, 21)
        break
    except Exception:
        continue

if badge_font is None:
    badge_font = ImageFont.load_default()

AMBER = (245, 158, 11)        # #F59E0B
CYAN = (6, 182, 212)          # #06B6D4
ROSE = (244, 63, 94)          # #F43F5E
EMERALD = (16, 185, 129)      # #10B981

def draw_callout(img, bbox, color, badge_num, badge_pos="top_left", with_badge=True):
    """Draws a crisp callout ring with an enlarged, high-contrast, perfectly-centered badge."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    x0, y0, x1, y1 = bbox
    
    # Outer glow ring
    for r in range(5, 0, -1):
        alpha = int(55 / r)
        draw.rounded_rectangle([x0 - r, y0 - r, x1 + r, y1 + r], radius=10 + r, outline=(*color, alpha), width=1)
    
    # Sharp high-contrast ring
    draw.rounded_rectangle([x0, y0, x1, y1], radius=10, outline=(*color, 255), width=3)
    
    if with_badge:
        # Enlarged badge (36x36 px) for instant readability on mobile screens
        bw = 36
        bh = 36
        if badge_pos == "top_left":
            bx, by = x0 - 4, y0 - 18
        elif badge_pos == "top_right":
            bx, by = x1 - bw + 4, y0 - 18
        elif badge_pos == "bottom_left":
            bx, by = x0 - 4, y1 - bh + 18
        elif badge_pos == "bottom_right":
            bx, by = x1 - bw + 4, y1 - bh + 18
        else:
            bx, by = badge_pos
            
        # Badge outer drop-shadow
        for br in range(4, 0, -1):
            draw.ellipse([bx - br, by - br, bx + bw + br, by + bh + br], fill=(0, 0, 0, 90))
            
        # Badge solid high-contrast background with thick colored border
        draw.ellipse([bx, by, bx + bw, by + bh], fill=(10, 8, 16, 255), outline=(*color, 255), width=3)
        
        # Center number mathematically using bounding box
        txt = str(badge_num)
        tb = draw.textbbox((0, 0), txt, font=badge_font)
        tw = tb[2] - tb[0]
        th = tb[3] - tb[1]
        tx = bx + (bw - tw) / 2
        ty = by + (bh - th) / 2 - 2
        
        draw.text((tx, ty), txt, fill=(255, 255, 255, 255), font=badge_font)
    
    img_rgba = img.convert("RGBA")
    img_rgba = Image.alpha_composite(img_rgba, overlay)
    return img_rgba.convert("RGB")

def process_all():
    print("Regenerating all 7 screenshots with enlarged 36px badges, high readability & 100% reading-order alignment...")
    
    # -------------------------------------------------------------
    # 1. Home Screenshot (media_1792043319020_e4249ca3.jpg)
    # -------------------------------------------------------------
    p1 = os.path.join(USER_UPLOAD_DIR, "media_1792043319020_e4249ca3.jpg")
    im1 = Image.open(p1).crop((0, 110, 460, 960))
    # ① Hero Spotlight Carousel (encloses full carousel card)
    im1 = draw_callout(im1, (12, 120, 448, 510), AMBER, 1, badge_pos="top_left")
    # ② Universal Search Bar
    im1 = draw_callout(im1, (15, 570, 445, 620), CYAN, 2, badge_pos="top_left")
    # ③ 1-Tap Quick Filters (GPS, Metro, Zones)
    im1 = draw_callout(im1, (15, 626, 445, 680), AMBER, 3, badge_pos="top_right")
    # ④ 4 Core Categories (Pandals, Flow, Map, About)
    im1 = draw_callout(im1, (15, 690, 445, 780), EMERALD, 4, badge_pos="top_left")
    im1.save(os.path.join(OUTPUT_DIR, "guide_step_1.webp"), "WEBP", quality=92)
    print("Saved guide_step_1.webp")

    # -------------------------------------------------------------
    # 2A. Map View Screenshot (media_1792043298554_a87f5fe0.jpg)
    # -------------------------------------------------------------
    p2_map = os.path.join(USER_UPLOAD_DIR, "media_1792043298554_a87f5fe0.jpg")
    im2_map = Image.open(p2_map).crop((0, 110, 460, 960))
    # ① Food Layer Toggle ON (228) on Toolbar
    im2_map = draw_callout(im2_map, (218, 172, 302, 204), AMBER, 1, badge_pos="top_right")
    # Also highlight sample cutlery pin cluster with a clean secondary ring
    im2_map = draw_callout(im2_map, (180, 415, 270, 495), AMBER, 1, badge_pos="bottom_left", with_badge=False)
    # ② Focus Route (24) Button
    im2_map = draw_callout(im2_map, (135, 172, 215, 204), CYAN, 2, badge_pos="top_left")
    # ③ Zone & District Filter Pills
    im2_map = draw_callout(im2_map, (135, 204, 455, 230), EMERALD, 3, badge_pos="top_right")
    # ④ District Legend Overlay Box
    im2_map = draw_callout(im2_map, (16, 455, 108, 542), ROSE, 4, badge_pos="top_left")
    im2_map.save(os.path.join(OUTPUT_DIR, "guide_step_2_map.webp"), "WEBP", quality=92)
    print("Saved guide_step_2_map.webp")

    # -------------------------------------------------------------
    # 2B. Directory Hub Screenshot (media_1792043298551_8fb790d0.jpg)
    # Top-to-Bottom order: Tabs -> Radius Slider -> Metro Chips -> Cards
    # -------------------------------------------------------------
    p2_dir = os.path.join(USER_UPLOAD_DIR, "media_1792043298551_8fb790d0.jpg")
    im2_dir = Image.open(p2_dir).crop((0, 110, 460, 960))
    # ① 541+ Pandals vs 228+ Eateries Directory Tabs (Top)
    im2_dir = draw_callout(im2_dir, (10, 146, 450, 184), AMBER, 1, badge_pos="top_left")
    # ② Near Me GPS & Radius Proximity Slider (Below Tabs)
    im2_dir = draw_callout(im2_dir, (10, 190, 450, 230), ROSE, 2, badge_pos="top_left")
    # ③ Metro & Locality Filter Chips (Middle)
    im2_dir = draw_callout(im2_dir, (10, 268, 450, 324), CYAN, 3, badge_pos="top_right")
    # ④ Pandal & Food Action Cards (Bottom)
    im2_dir = draw_callout(im2_dir, (10, 385, 450, 605), EMERALD, 4, badge_pos="top_left")
    im2_dir.save(os.path.join(OUTPUT_DIR, "guide_step_2_directory.webp"), "WEBP", quality=92)
    print("Saved guide_step_2_directory.webp")

    # -------------------------------------------------------------
    # 3. Multi-Modal Travel Modes (media_1792043298548_0f3953e9.jpg)
    # -------------------------------------------------------------
    p3 = os.path.join(USER_UPLOAD_DIR, "media_1792043298548_0f3953e9.jpg")
    im3 = Image.open(p3).crop((0, 110, 460, 960))
    # ① Foot (Walking)
    im3 = draw_callout(im3, (16, 318, 444, 400), AMBER, 1, badge_pos="top_left")
    # ② Road (Vehicular)
    im3 = draw_callout(im3, (16, 412, 444, 498), AMBER, 2, badge_pos="top_left")
    # ③ Metro (Rail)
    im3 = draw_callout(im3, (16, 508, 444, 594), CYAN, 3, badge_pos="top_left")
    # ④ Smart (AI Mode)
    im3 = draw_callout(im3, (16, 604, 444, 692), EMERALD, 4, badge_pos="top_left")
    im3.save(os.path.join(OUTPUT_DIR, "guide_step_3_modes.webp"), "WEBP", quality=92)
    print("Saved guide_step_3_modes.webp")

    # -------------------------------------------------------------
    # 4. Pujo by Metro 24 Stations (media_1792044428308_0d82c58b.jpg)
    # Top-to-Bottom order: Tabs -> Grid -> Walking Distance & Counts
    # -------------------------------------------------------------
    p4 = os.path.join(USER_UPLOAD_DIR, "media_1792044428308_0d82c58b.jpg")
    im4 = Image.open(p4).crop((0, 110, 460, 960))
    # ① Metro Line Selector Tabs (All 24, Blue Line, Green Line)
    im4 = draw_callout(im4, (108, 320, 348, 350), CYAN, 1, badge_pos="top_left")
    # ② 24 Station Grid (Dum Dum, Shyambazar, Girish Park...)
    im4 = draw_callout(im4, (108, 355, 348, 500), AMBER, 2, badge_pos="top_right")
    # ③ 1-Tap Filter by Metro Walking Proximity & Pandals Count
    im4 = draw_callout(im4, (108, 505, 348, 650), EMERALD, 3, badge_pos="bottom_right")
    im4.save(os.path.join(OUTPUT_DIR, "guide_step_4_metro.webp"), "WEBP", quality=92)
    print("Saved guide_step_4_metro.webp")

    # -------------------------------------------------------------
    # 5. Route Planner & AI Optimizer (media_1792043298545_af7110ab.jpg)
    # -------------------------------------------------------------
    p5 = os.path.join(USER_UPLOAD_DIR, "media_1792043298545_af7110ab.jpg")
    im5 = Image.open(p5).crop((0, 110, 460, 960))
    # ① Route Anchor Endpoints (Start & End Destination)
    im5 = draw_callout(im5, (18, 145, 442, 220), CYAN, 1, badge_pos="top_left")
    # ② Time & Lighting vs Shortest Hop
    im5 = draw_callout(im5, (18, 226, 260, 258), AMBER, 2, badge_pos="top_left")
    # ③ 25-Step Undo Button
    im5 = draw_callout(im5, (385, 226, 445, 258), ROSE, 3, badge_pos="top_right")
    # ④ Hop-by-Hop Itinerary & Travel Mode Badges
    im5 = draw_callout(im5, (18, 470, 442, 735), EMERALD, 4, badge_pos="top_left")
    im5.save(os.path.join(OUTPUT_DIR, "guide_step_5_optimizer.webp"), "WEBP", quality=92)
    print("Saved guide_step_5_optimizer.webp")

    # -------------------------------------------------------------
    # 6. Live Kolkata Buses on Google Maps (media_1792044792401_99c67a8b.jpg)
    # Top-to-Bottom order: Corridor Map (top) -> Google Transit (mid) -> Bus Numbers -> Stops
    # -------------------------------------------------------------
    p6 = os.path.join(USER_UPLOAD_DIR, "media_1792044792401_99c67a8b.jpg")
    im6 = Image.open(p6).crop((0, 110, 480, 960))
    # ① Live Transit Map Corridor Line (Top)
    im6 = draw_callout(im6, (70, 35, 410, 265), ROSE, 1, badge_pos="top_right")
    # ② Google Transit Public Transport Mode (Middle)
    im6 = draw_callout(im6, (10, 270, 470, 490), EMERALD, 2, badge_pos="top_left")
    # ③ Real-time Bus Badges (78/1, 219, 234/1, 240, 30B)
    im6 = draw_callout(im6, (40, 505, 450, 560), AMBER, 3, badge_pos="top_left")
    # ④ Scheduled Departures & Bus Stops (Hedua More, Karbala)
    im6 = draw_callout(im6, (10, 565, 450, 650), CYAN, 4, badge_pos="top_left")
    im6.save(os.path.join(OUTPUT_DIR, "guide_step_6_transit.webp"), "WEBP", quality=92)
    print("Saved guide_step_6_transit.webp")

    print("All 7 screenshots processed with enhanced legibility and 100% precision!")

if __name__ == "__main__":
    process_all()
