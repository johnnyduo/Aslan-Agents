#!/usr/bin/env python3
"""
Download avatar images and remove white background outside circular area
Makes everything outside the circle transparent
"""

from PIL import Image, ImageDraw
import os
import urllib.request

INPUT_DIR = "public/avatars"
OUTPUT_DIR = "public/avatars"

# Images to process (local files) - all 7 agents with black backgrounds
IMAGES = [
    {
        "name": "aslan",
        "path": "public/avatars/ee94d57d-5298-4eb9-a886-a38c29635411.png"
    },
    {
        "name": "eagleton",
        "path": "public/avatars/43b35481-0d6f-422f-b5d2-61a7b86d02ba.png"
    },
    {
        "name": "athena",
        "path": "public/avatars/758d8212-cba0-41de-82ad-48055f1944a3.png"
    },
    {
        "name": "reynard",
        "path": "public/avatars/5a16e927-8bf9-4838-b0fa-b9880837a690.png"
    },
    {
        "name": "ursus",
        "path": "public/avatars/7132ed89-cabe-4365-80b7-8e8011515c3d.png"
    },
    {
        "name": "luna",
        "path": "public/avatars/8f1e3805-50d8-4a51-8ba8-ead19aab2cb0.png"
    },
    {
        "name": "corvus",
        "path": "public/avatars/9bd746d1-bb49-44e2-8000-cde3663c9c03.png"
    }
]

def remove_white_outside_circle(image_path, output_path, target_size=512):
    """
    Resize image, keep everything as-is inside circle
    Only make area outside the circle transparent
    """
    # Open image
    img = Image.open(image_path).convert("RGBA")
    
    # Resize to target size (much smaller for web use)
    img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)
    width, height = img.size
    
    # Create a circular mask
    mask = Image.new('L', (width, height), 0)
    mask_draw = ImageDraw.Draw(mask)
    
    # Draw filled circle (white = keep, black = remove)
    mask_draw.ellipse((0, 0, width, height), fill=255)
    
    # Apply mask to make outside transparent
    result = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    result.paste(img, (0, 0))
    
    result_pixels = result.load()
    mask_pixels = mask.load()
    
    for y in range(height):
        for x in range(width):
            if mask_pixels[x, y] == 0:  # Outside circle
                result_pixels[x, y] = (0, 0, 0, 0)  # Make transparent
    
    # Save with optimization
    result.save(output_path, "PNG", optimize=True)
    file_size = os.path.getsize(output_path) / 1024
    return file_size

def main():
    print("\n" + "="*60)
    print("🎨 Processing avatars - removing white background...")
    print("="*60)
    
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    for img_data in IMAGES:
        name = img_data["name"]
        input_path = img_data["path"]
        
        if not os.path.exists(input_path):
            print(f"❌ {name}: File not found at {input_path}")
            continue
        
        print(f"\n🎨 Processing {name}...")
        output_path = os.path.join(OUTPUT_DIR, f"{name}.png")
        
        file_size = remove_white_outside_circle(input_path, output_path)
        print(f"✓ Saved {name}.png ({file_size:.1f}KB)")
    
    print("\n" + "="*60)
    print("✨ All avatars processed!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
