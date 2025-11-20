#!/usr/bin/env python3
"""
High-Quality Avatar Generator using Hugging Face FLUX.1-schnell
Generates professional animated pixel art sprites with transparent backgrounds
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw
import requests
import io
import time

# Configuration
HF_TOKEN = "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"
OUTPUT_DIR = "public/avatars"
PRIMARY_MODEL = "stabilityai/stable-diffusion-2-1"  # Free alternative
FALLBACK_MODEL = "CompVis/stable-diffusion-v1-4"  # Another free option

# Agent configurations
AGENTS = [
    {
        "name": "aslan",
        "display_name": "Aslan the Great",
        "description": "anthropomorphic majestic golden lion king wearing ornate crown, flowing golden mane, noble expression, regal powerful stance",
        "color": "#FFD700"
    },
    {
        "name": "eagleton",
        "display_name": "Eagleton Skywatcher",
        "description": "anthropomorphic teal eagle scout with spread wings, keen analytical eyes, graceful flight pose",
        "color": "#20B2AA"
    },
    {
        "name": "athena",
        "display_name": "Athena Nightwing",
        "description": "anthropomorphic indigo owl scholar with large wise eyes, scholarly appearance, holding ancient scroll",
        "color": "#4B0082"
    },
    {
        "name": "reynard",
        "display_name": "Reynard Swift",
        "description": "anthropomorphic purple fox trader with clever smile, bushy tail, cunning expression, agile stance",
        "color": "#9370DB"
    },
    {
        "name": "ursus",
        "display_name": "Ursus Guardian",
        "description": "anthropomorphic black bear guardian with strong protective stance, powerful build, armor details",
        "color": "#2F4F4F"
    },
    {
        "name": "luna",
        "display_name": "Luna Mysticfang",
        "description": "anthropomorphic violet wolf mystic with piercing eyes, mystical aura, prophetic presence",
        "color": "#8A2BE2"
    },
    {
        "name": "corvus",
        "display_name": "Corvus Messenger",
        "description": "anthropomorphic black raven messenger with spread wings, alert posture, swift messenger appearance",
        "color": "#000000"
    }
]

def create_circular_with_color(image, bg_color):
    """
    Create circular avatar with solid colored background
    No background removal - preserve original quality
    """
    from PIL import ImageDraw
    
    img = image.convert("RGBA")
    width, height = img.size
    
    # Create circular mask
    mask = Image.new('L', (width, height), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((0, 0, width, height), fill=255)
    
    # Create background with theme color
    background = Image.new('RGBA', (width, height), bg_color)
    
    # Composite: background + image with circular mask
    result = Image.new('RGBA', (width, height))
    result.paste(background, (0, 0))
    result.paste(img, (0, 0))
    
    # Apply circular mask to final result
    output = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    output.paste(result, (0, 0), mask=mask)
    
    return output

def remove_background(image):
    """
    DEPRECATED - No longer used, circular avatars with solid colors instead
    Remove background from image using corner pixel sampling and edge detection
    Returns image with transparent background
    """
    img = image.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Sample entire border (top, bottom, left, right edges) for better background detection
    sample_positions = []
    # Top and bottom rows
    for x in range(0, width, max(1, width//20)):
        sample_positions.append((x, 0))
        sample_positions.append((x, height-1))
    # Left and right columns
    for y in range(0, height, max(1, height//20)):
        sample_positions.append((0, y))
        sample_positions.append((width-1, y))
    
    # Calculate average background color from border samples
    bg_colors = [pixels[x, y][:3] for x, y in sample_positions]
    avg_r = sum(c[0] for c in bg_colors) // len(bg_colors)
    avg_g = sum(c[1] for c in bg_colors) // len(bg_colors)
    avg_b = sum(c[2] for c in bg_colors) // len(bg_colors)
    
    print(f"    Detected background: RGB({avg_r}, {avg_g}, {avg_b})")
    
    # Process each pixel with flood-fill approach from edges
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Calculate color distance from detected background
            distance = ((r - avg_r) ** 2 + (g - avg_g) ** 2 + (b - avg_b) ** 2) ** 0.5
            
            # Calculate brightness (for white/light backgrounds)
            brightness = (r + g + b) / 3
            
            # More aggressive removal for uniform backgrounds
            if distance < 50 and brightness > 200:
                # Remove light backgrounds similar to detected color
                pixels[x, y] = (r, g, b, 0)
            elif distance < 35:
                # Remove pixels very close to background color
                pixels[x, y] = (r, g, b, 0)
            elif distance < 60:
                # Gradient transparency for smooth edges
                alpha = int(((distance - 35) / 25) * 255)
                pixels[x, y] = (r, g, b, alpha)
            else:
                # Keep character pixels with full opacity
                pixels[x, y] = (r, g, b, 255)
    
    return img

def generate_image(prompt, model=PRIMARY_MODEL):
    """
    Generate image using Hugging Face Inference API
    """
    API_URL = f"https://router.huggingface.co/hf-inference/models/{model}"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    
    # Adjust parameters based on model
    if "schnell" in model.lower():
        steps = 4  # Fast for FLUX schnell
    elif "dev" in model.lower():
        steps = 20  # FLUX.1-dev needs more steps for quality
    elif "xl" in model.lower():
        steps = 25  # SDXL needs more steps
    else:
        steps = 20
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "width": 256,
            "height": 256,
            "num_inference_steps": steps,
        }
    }
    
    print(f"  Calling {model}...")
    response = requests.post(API_URL, headers=headers, json=payload)
    
    if response.status_code == 200:
        return Image.open(io.BytesIO(response.content))
    else:
        print(f"  ⚠️  Error {response.status_code}: {response.text}")
        return None

def create_prompt(agent):
    """
    Create optimized prompt for pixel art character generation
    """
    return (
        f"professional character portrait, {agent['description']}, "
        f"clean white background, centered composition, isolated subject, "
        f"high quality digital art, detailed fur texture, "
        f"vibrant colors, fantasy art style, "
        f"professional game character design, full body visible, "
        f"no artifacts, clean edges, perfect lighting"
    )

def create_animation_frames(base_image, num_frames=8):
    """
    Create animation frames with idle bobbing motion
    """
    import math
    frames = []
    width, height = base_image.size
    
    for i in range(num_frames):
        # Calculate vertical offset using sine wave
        offset = int(2 * math.sin(i * math.pi / 4))
        
        # Create new frame with offset
        frame = Image.new('RGBA', (width, height + 10), (0, 0, 0, 0))
        frame.paste(base_image, (0, 5 + offset))
        # Crop to original size
        frame = frame.crop((0, 0, width, height))
        frames.append(frame)
    
    return frames

def generate_avatar(agent):
    """
    Generate animated avatar for an agent
    """
    print(f"\n🎨 Generating {agent['display_name']}...")
    
    # Create prompt
    prompt = create_prompt(agent)
    print(f"  Prompt: {prompt[:80]}...")
    
    # Try primary model
    image = generate_image(prompt, PRIMARY_MODEL)
    
    # Fallback to secondary model if primary fails
    if image is None:
        print(f"  Trying fallback model...")
        time.sleep(1)
        image = generate_image(prompt, FALLBACK_MODEL)
    
    if image is None:
        print(f"  ❌ Failed to generate {agent['name']}")
        return False
    
    print(f"  ✓ Image generated")
    
    # Save original image without background removal to avoid artifacts
    png_path = os.path.join(OUTPUT_DIR, f"{agent['name']}_original.png")
    image.save(png_path, "PNG")
    png_size = os.path.getsize(png_path) / 1024
    print(f"  ✓ Saved {agent['name']}_original.png ({png_size:.1f}KB)")
    
    # Apply circular mask with themed background color
    print(f"  Creating circular avatar with color {agent['color']}...")
    circular_image = create_circular_with_color(image, agent['color'])
    final_png_path = os.path.join(OUTPUT_DIR, f"{agent['name']}.png")
    circular_image.save(final_png_path, "PNG")
    final_size = os.path.getsize(final_png_path) / 1024
    print(f"  ✓ Saved {agent['name']}.png ({final_size:.1f}KB)")
    
    # Create animated frames from circular image
    print(f"  Creating animation frames...")
    frames = create_animation_frames(circular_image, num_frames=8)
    
    # Save animated GIF with transparency
    gif_path = os.path.join(OUTPUT_DIR, f"{agent['name']}.gif")
    frames[0].save(
        gif_path,
        save_all=True,
        append_images=frames[1:],
        duration=120,  # 120ms per frame
        loop=0,
        disposal=2,  # Clear frame before rendering next
        optimize=False,  # Keep full transparency
        transparency=0,
        background=0
    )
    gif_size = os.path.getsize(gif_path) / 1024
    print(f"  ✓ Saved {agent['name']}.gif ({gif_size:.1f}KB)")
    
    return True

def create_preview(agents):
    """
    Create a preview composite of all avatars
    """
    print("\n📸 Creating preview composite...")
    
    images = []
    for agent in agents:
        png_path = os.path.join(OUTPUT_DIR, f"{agent['name']}.png")
        if os.path.exists(png_path):
            images.append(Image.open(png_path))
    
    if not images:
        return
    
    # Create 4x2 grid
    cols, rows = 4, 2
    img_width, img_height = 256, 256
    margin = 10
    
    preview_width = cols * img_width + (cols + 1) * margin
    preview_height = rows * img_height + (rows + 1) * margin
    
    preview = Image.new('RGBA', (preview_width, preview_height), (0, 0, 0, 0))
    
    for idx, img in enumerate(images):
        row = idx // cols
        col = idx % cols
        x = margin + col * (img_width + margin)
        y = margin + row * (img_height + margin)
        preview.paste(img, (x, y))
    
    preview_path = os.path.join(OUTPUT_DIR, "preview.png")
    preview.save(preview_path, "PNG")
    preview_size = os.path.getsize(preview_path) / 1024
    print(f"  ✓ Saved preview.png ({preview_size:.1f}KB)")

def main():
    """
    Main generation function
    """
    print("=" * 60)
    print("🎨 Aslan's Pride Avatar Generator (Hugging Face FLUX)")
    print("=" * 60)
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Check for PIL
    try:
        import PIL
        print(f"✓ PIL version: {PIL.__version__}")
    except ImportError:
        print("❌ Pillow not found. Install with: pip install Pillow")
        sys.exit(1)
    
    # Check for requests
    try:
        import requests
        print(f"✓ requests library available")
    except ImportError:
        print("❌ requests not found. Install with: pip install requests")
        sys.exit(1)
    
    print(f"✓ Output directory: {OUTPUT_DIR}")
    print(f"✓ Primary model: {PRIMARY_MODEL}")
    print(f"✓ Fallback model: {FALLBACK_MODEL}")
    print(f"✓ HF Token: {HF_TOKEN[:20]}...")
    
    # Generate all avatars
    success_count = 0
    for agent in AGENTS:
        if generate_avatar(agent):
            success_count += 1
        time.sleep(1)  # Rate limiting
    
    # Create preview
    if success_count > 0:
        create_preview(AGENTS)
    
    print("\n" + "=" * 60)
    print(f"✨ Generation complete! {success_count}/{len(AGENTS)} avatars created")
    print("=" * 60)
    print(f"\nGenerated files in {OUTPUT_DIR}/:")
    
    for agent in AGENTS:
        gif_path = os.path.join(OUTPUT_DIR, f"{agent['name']}.gif")
        png_path = os.path.join(OUTPUT_DIR, f"{agent['name']}.png")
        if os.path.exists(gif_path) and os.path.exists(png_path):
            gif_size = os.path.getsize(gif_path) / 1024
            png_size = os.path.getsize(png_path) / 1024
            print(f"  • {agent['name']}.gif ({gif_size:.1f}KB), {agent['name']}.png ({png_size:.1f}KB)")
    
    print("\n🎮 Avatars ready to use in frontend!")

if __name__ == "__main__":
    main()
