#!/usr/bin/env python3
"""
Re-process existing avatars with improved background removal
"""

import os
from PIL import Image
from pathlib import Path

OUTPUT_DIR = "public/avatars"

def remove_background_improved(image_path):
    """
    Improved background removal for existing images
    """
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Sample entire border for background detection
    sample_positions = []
    # Top and bottom rows
    for x in range(0, width, max(1, width//20)):
        sample_positions.append((x, 0))
        sample_positions.append((x, height-1))
    # Left and right columns  
    for y in range(0, height, max(1, height//20)):
        sample_positions.append((0, y))
        sample_positions.append((width-1, y))
    
    # Calculate average background color
    bg_colors = [pixels[x, y][:3] for x, y in sample_positions]
    avg_r = sum(c[0] for c in bg_colors) // len(bg_colors)
    avg_g = sum(c[1] for c in bg_colors) // len(bg_colors)
    avg_b = sum(c[2] for c in bg_colors) // len(bg_colors)
    
    print(f"    Background: RGB({avg_r}, {avg_g}, {avg_b})")
    
    # Process each pixel
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Color distance from background
            distance = ((r - avg_r) ** 2 + (g - avg_g) ** 2 + (b - avg_b) ** 2) ** 0.5
            brightness = (r + g + b) / 3
            
            # Aggressive removal for backgrounds
            if distance < 50 and brightness > 200:
                pixels[x, y] = (r, g, b, 0)
            elif distance < 35:
                pixels[x, y] = (r, g, b, 0)
            elif distance < 60:
                alpha = int(((distance - 35) / 25) * 255)
                pixels[x, y] = (r, g, b, alpha)
    
    return img

print("🎨 Re-processing existing avatars...")
print("=" * 60)

agents = ["aslan", "eagleton", "athena", "reynard", "ursus", "luna", "corvus"]

for agent in agents:
    png_path = os.path.join(OUTPUT_DIR, f"{agent}.png")
    if os.path.exists(png_path):
        print(f"\n✓ Processing {agent}...")
        improved = remove_background_improved(png_path)
        improved.save(png_path, "PNG")
        size = os.path.getsize(png_path) / 1024
        print(f"  Saved {agent}.png ({size:.1f}KB)")

print("\n" + "=" * 60)
print("✨ All avatars re-processed with improved transparency!")
