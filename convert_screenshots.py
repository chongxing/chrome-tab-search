#!/usr/bin/env python3
"""Convert screenshots to Chrome Web Store format"""
from PIL import Image
import sys

def convert_for_chrome_web_store(input_path, output_path, target_size=(1280, 800)):
    """Convert image to Chrome Web Store screenshot format"""
    # Open image
    img = Image.open(input_path)
    
    # Convert RGBA to RGB (remove alpha channel)
    if img.mode == 'RGBA':
        # Create white background
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Calculate resize to fill target size (cover mode)
    target_w, target_h = target_size
    img_w, img_h = img.size
    
    # Calculate scaling factor to cover the target size
    scale_w = target_w / img_w
    scale_h = target_h / img_h
    scale = max(scale_w, scale_h)  # Use larger scale to cover
    
    # Resize
    new_w = int(img_w * scale)
    new_h = int(img_h * scale)
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Crop to center to get exact target size
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    right = left + target_w
    bottom = top + target_h
    img = img.crop((left, top, right, bottom))
    
    # Save as JPEG with high quality
    img.save(output_path, 'JPEG', quality=95, optimize=True)
    print(f"✓ Converted: {input_path} → {output_path} ({target_w}x{target_h})")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python3 convert_screenshots.py <input> <output>")
        sys.exit(1)
    
    convert_for_chrome_web_store(sys.argv[1], sys.argv[2])
