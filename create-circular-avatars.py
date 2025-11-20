#!/usr/bin/env python3
"""
Create circular avatars with solid colored backgrounds
"""

import os
from PIL import Image, ImageDraw
from pathlib import Path

OUTPUT_DIR = "public/avatars"

# Agent color schemes
AGENTS = {
    "aslan": "#FFD700",      # Gold
    "eagleton": "#20B2AA",   # Teal
    "athena": "#4B0082",     # Indigo
    "reynard": "#9370DB",    # Purple
    "ursus": "#2F4F4F",      # Dark slate
    "luna": "#8A2BE2",       # Blue violet
    "corvus": "#1a1a1a",     # Dark gray (not pure black for visibility)
}

def create_circular_avatar(image_path, bg_color, output_path):
    """
    Create circular avatar with solid background color
    """
    # Open image
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    
    # Create circular mask
    mask = Image.new('L', (width, height), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((0, 0, width, height), fill=255)
    
    # Create background with color
    background = Image.new('RGBA', (width, height), bg_color)
    
    # Composite: background + image with circular mask
    result = Image.new('RGBA', (width, height))
    result.paste(background, (0, 0))
    result.paste(img, (0, 0), mask=img.split()[3])  # Use image's alpha as mask
    
    # Apply circular mask to final result
    output = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    output.paste(result, (0, 0), mask=mask)
    
    return output

print("🎨 Creating circular avatars with colored backgrounds...")
print("=" * 60)

for agent, color in AGENTS.items():
    png_path = os.path.join(OUTPUT_DIR, f"{agent}.png")
    if os.path.exists(png_path):
        print(f"\n✓ Processing {agent} with color {color}...")
        
        # Create circular avatar
        circular = create_circular_avatar(png_path, color, png_path)
        circular.save(png_path, "PNG")
        
        size = os.path.getsize(png_path) / 1024
        print(f"  Saved {agent}.png ({size:.1f}KB)")

print("\n" + "=" * 60)
print("✨ All circular avatars created!")
print("🎮 Refresh your browser to see the new circular avatars!")
