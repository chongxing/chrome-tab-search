#!/usr/bin/env python3
"""
Chrome Tab Search Extension Icons Generator
Generates icon set in 16x16, 32x32, 48x48, 128x128
Design: Google-style flat icon with magnifying glass + tab symbol
"""

from PIL import Image, ImageDraw
import os

# Output directory
OUTPUT_DIR = "/Users/xuchong/.openclaw/workspace/chrome-tab-search/icons"

# Color scheme - Google Blue
BACKGROUND_COLOR = "#4285F4"  # Google Blue
FOREGROUND_COLOR = "#FFFFFF"  # White

# Icon sizes
SIZES = [16, 32, 48, 128]

def create_icon(size):
    """Create a single icon with magnifying glass + tab symbol"""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background with rounded corners
    margin = max(1, size // 16)
    
    if size >= 32:
        # Rounded rectangle for larger sizes
        corner_radius = size // 6
        draw.rounded_rectangle(
            [margin, margin, size - margin - 1, size - margin - 1],
            radius=corner_radius,
            fill=BACKGROUND_COLOR
        )
    else:
        # For 16x16, use filled rectangle
        draw.rectangle(
            [0, 0, size - 1, size - 1],
            fill=BACKGROUND_COLOR
        )
    
    # Icon scaling - take up 60-70% of canvas
    padding = int(size * 0.2)
    icon_size = size - 2 * padding
    
    if size == 16:
        # Simplified design for 16x16
        # Small tab rectangle
        tab_x, tab_y = 4, 4
        tab_w, tab_h = 7, 8
        draw.rectangle([tab_x, tab_y, tab_x + tab_w, tab_y + tab_h], fill=FOREGROUND_COLOR)
        
        # Mini magnifying glass handle
        draw.line([(9, 10), (12, 13)], fill=FOREGROUND_COLOR, width=2)
        
    elif size == 32:
        # Tab symbol
        tab_x, tab_y = 8, 7
        tab_w, tab_h = 14, 17
        
        # Tab body
        draw.rectangle([tab_x, tab_y, tab_x + tab_w, tab_y + tab_h], fill=FOREGROUND_COLOR)
        
        # Folded corner
        fold = 5
        draw.polygon([
            (tab_x + tab_w - fold, tab_y),
            (tab_x + tab_w, tab_y),
            (tab_x + tab_w, tab_y + fold)
        ], fill=BACKGROUND_COLOR)
        
        # Magnifying glass lens (circle overlay)
        lens_r = 5
        lens_x = tab_x + 5
        lens_y = tab_y + 6
        draw.ellipse([lens_x - lens_r, lens_y - lens_r, 
                      lens_x + lens_r, lens_y + lens_r], 
                     outline=BACKGROUND_COLOR, width=2)
        
        # Handle
        draw.line([(tab_x + tab_w - 2, tab_y + tab_h - 2), (tab_x + tab_w + 3, tab_y + tab_h + 3)], 
                  fill=FOREGROUND_COLOR, width=3)
        
    else:
        # Larger sizes (48, 128)
        scale = size / 48
        
        # Tab symbol dimensions
        tab_w = int(20 * scale)
        tab_h = int(26 * scale)
        tab_x = (size - tab_w) // 2
        tab_y = int(10 * scale)
        
        # Tab body
        draw.rectangle([tab_x, tab_y, tab_x + tab_w, tab_y + tab_h], fill=FOREGROUND_COLOR)
        
        # Folded corner (triangle cut-out effect)
        fold = int(7 * scale)
        draw.polygon([
            (tab_x + tab_w - fold, tab_y),
            (tab_x + tab_w, tab_y),
            (tab_x + tab_w, tab_y + fold)
        ], fill=BACKGROUND_COLOR)
        
        # Draw fold line
        line_width = max(1, int(1.5 * scale))
        draw.line([(tab_x + tab_w - fold, tab_y), (tab_x + tab_w, tab_y + fold)],
                  fill=FOREGROUND_COLOR, width=line_width)
        
        # Magnifying glass lens (positioned over the tab)
        lens_r = int(7 * scale)
        lens_x = tab_x + int(8 * scale)
        lens_y = tab_y + int(10 * scale)
        lens_width = max(2, int(2.5 * scale))
        draw.ellipse([lens_x - lens_r, lens_y - lens_r,
                      lens_x + lens_r, lens_y + lens_r],
                     outline=FOREGROUND_COLOR, width=lens_width)
        
        # Handle (diagonal from bottom-right of lens)
        handle_start_x = tab_x + tab_w - int(3 * scale)
        handle_start_y = tab_y + tab_h - int(3 * scale)
        handle_end_x = handle_start_x + int(8 * scale)
        handle_end_y = handle_start_y + int(8 * scale)
        handle_width = max(2, int(3 * scale))
        
        draw.line([(handle_start_x, handle_start_y), (handle_end_x, handle_end_y)],
                  fill=FOREGROUND_COLOR, width=handle_width)
    
    return img

def main():
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print(f"Generating Chrome Tab Search icons...")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Background color: {BACKGROUND_COLOR}")
    print(f"Foreground color: {FOREGROUND_COLOR}")
    
    for size in SIZES:
        icon = create_icon(size)
        filename = f"icon-{size}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        icon.save(filepath, "PNG")
        print(f"  ✓ Generated {filename} ({size}x{size})")
    
    print("\nAll icons generated successfully!")
    
    # List generated files
    print("\nGenerated files:")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        if f.startswith('icon-') and f.endswith('.png'):
            filepath = os.path.join(OUTPUT_DIR, f)
            filesize = os.path.getsize(filepath)
            print(f"  {f} ({filesize} bytes)")

if __name__ == "__main__":
    main()
