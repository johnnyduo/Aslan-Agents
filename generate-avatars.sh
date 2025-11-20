#!/usr/bin/env bash

# Avatar Generator for Aslan's Pride
# Generates animated pixel art sprites with transparent backgrounds
# Requires: ImageMagick 7+ with support for animated GIFs

set -e

OUTPUT_DIR="public/avatars"
TEMP_DIR="/tmp/avatar-generation"

# Create directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

echo "🎨 Starting Aslan's Pride Avatar Generation..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Agent configurations (name|description|color1|color2)
AGENTS=(
    "aslan|Golden lion king with flowing mane and crown|#FFD700|#8B4513"
    "eagleton|Teal eagle scout with sharp eyes|#20B2AA|#4682B4"
    "athena|Indigo owl scholar with wise expression|#4B0082|#9370DB"
    "reynard|Purple fox trader with clever smile|#9370DB|#FF8C00"
    "ursus|Black bear guardian with strong stance|#2F4F4F|#8B4513"
    "luna|Violet wolf mystic with piercing gaze|#8A2BE2|#C0C0C0"
    "corvus|Black raven messenger with spread wings|#000000|#4B0082"
)

# Function to create a single frame of pixel art
create_frame() {
    local name=$1
    local frame=$2
    local color1=$3
    local color2=$4
    local output=$5
    
    # Create 64x64 pixel art with animation offset
    local offset=$((frame * 2))
    
    magick -size 64x64 xc:transparent \
        -fill "$color1" \
        -draw "rectangle 20,10 44,54" \
        -draw "circle 32,$((24+offset)) 32,$((20+offset))" \
        -draw "rectangle 24,$((16+offset)) 40,$((32+offset))" \
        -fill "$color2" \
        -draw "rectangle 26,18 38,30" \
        -draw "circle $((28+offset)),24 $((26+offset)),24" \
        -draw "circle $((36+offset)),24 $((38+offset)),24" \
        -draw "rectangle 28,$((40+offset)) 36,$((46+offset))" \
        -scale 256x256 \
        -colors 32 \
        "$output"
}

# Function to create advanced animated sprite
create_animated_sprite() {
    local name=$1
    local description=$2
    local color1=$3
    local color2=$4
    
    echo "  → Generating $name sprite..."
    
    local frames=()
    
    # Generate 8 frames for smooth animation (idle breathing/bobbing)
    for frame in {0..7}; do
        local frame_file="$TEMP_DIR/${name}_frame_${frame}.png"
        create_frame "$name" "$frame" "$color1" "$color2" "$frame_file"
        frames+=("$frame_file")
    done
    
    # Create animated GIF with transparency
    magick -dispose previous -delay 15 -loop 0 "${frames[@]}" \
        -coalesce -fuzz 20% -transparent white \
        "$OUTPUT_DIR/${name}.gif"
    
    # Also create static PNG (first frame with transparency)
    magick "${frames[0]}" \
        -fuzz 20% -transparent white \
        "$OUTPUT_DIR/${name}.png"
    
    # Optimize GIF size
    gifsicle -O3 --colors 32 "$OUTPUT_DIR/${name}.gif" -o "$OUTPUT_DIR/${name}.gif" 2>/dev/null || true
    
    echo "    ✓ Created ${name}.gif (animated) and ${name}.png (static)"
}

# Function to create artistic pixel sprite (more advanced)
create_artistic_sprite() {
    local name=$1
    local description=$2
    local color1=$3
    local color2=$4
    
    echo "  → Generating artistic $name sprite..."
    
    # Create base canvas
    local base="$TEMP_DIR/${name}_base.png"
    
    # Generate artistic pixel art based on animal type
    case $name in
        aslan)
            # Lion with crown and flowing mane
            magick -size 48x48 xc:transparent \
                -fill "$color1" -stroke "$color2" -strokewidth 1 \
                -draw "circle 24,20 24,8" \
                -draw "ellipse 24,28 14,16 0,360" \
                -draw "rectangle 18,42 30,46" \
                -draw "rectangle 16,44 20,48" -draw "rectangle 28,44 32,48" \
                -fill "$color2" \
                -draw "circle 20,18 20,16" -draw "circle 28,18 28,16" \
                -draw "rectangle 22,22 26,24" \
                -draw "line 10,14 18,16" -draw "line 38,14 30,16" \
                -draw "line 10,18 18,20" -draw "line 38,18 30,20" \
                -draw "line 10,22 18,24" -draw "line 38,22 30,24" \
                -fill "#FFD700" \
                -draw "polygon 20,6 24,2 28,6 24,8" \
                "$base"
            ;;
        eagleton)
            # Eagle with wings
            magick -size 48x48 xc:transparent \
                -fill "$color1" -stroke "$color2" -strokewidth 1 \
                -draw "circle 24,18 24,10" \
                -draw "ellipse 24,26 10,12 0,360" \
                -draw "polygon 8,24 14,20 14,28" \
                -draw "polygon 40,24 34,20 34,28" \
                -draw "rectangle 20,36 28,44" \
                -fill "$color2" \
                -draw "circle 20,16 20,15" -draw "circle 28,16 28,15" \
                -draw "polygon 24,20 22,22 26,22" \
                -draw "line 4,26 12,22" -draw "line 4,28 12,26" \
                -draw "line 44,26 36,22" -draw "line 44,28 36,26" \
                "$base"
            ;;
        athena)
            # Owl with wise eyes
            magick -size 48x48 xc:transparent \
                -fill "$color1" -stroke "$color2" -strokewidth 1 \
                -draw "circle 24,22 24,8" \
                -draw "ellipse 24,30 12,14 0,360" \
                -draw "rectangle 20,42 28,48" \
                -fill "#FFFFFF" \
                -draw "circle 20,20 20,14" -draw "circle 28,20 28,14" \
                -fill "$color2" \
                -draw "circle 20,20 20,18" -draw "circle 28,20 28,18" \
                -draw "polygon 24,24 22,26 26,26" \
                -draw "line 10,16 16,18" -draw "line 38,16 32,18" \
                "$base"
            ;;
        reynard)
            # Fox with bushy tail
            magick -size 48x48 xc:transparent \
                -fill "$color1" -stroke "$color2" -strokewidth 1 \
                -draw "circle 24,18 24,10" \
                -draw "polygon 18,10 24,6 30,10" \
                -draw "ellipse 24,28 10,12 0,360" \
                -draw "rectangle 20,38 28,44" \
                -draw "ellipse 38,38 8,12 30,90" \
                -fill "#FFFFFF" \
                -draw "ellipse 24,30 6,8 0,360" \
                -fill "$color2" \
                -draw "circle 20,16 20,15" -draw "circle 28,16 28,15" \
                -draw "polygon 24,20 22,22 26,22" \
                "$base"
            ;;
        ursus)
            # Bear with strong build
            magick -size 48x48 xc:transparent \
                -fill "$color1" -stroke "$color2" -strokewidth 1 \
                -draw "circle 16,14 16,10" -draw "circle 32,14 32,10" \
                -draw "circle 24,20 24,10" \
                -draw "ellipse 24,32 14,16 0,360" \
                -draw "rectangle 18,44 30,48" \
                -fill "$color2" \
                -draw "circle 20,18 20,16" -draw "circle 28,18 28,16" \
                -draw "ellipse 24,22 3,4 0,360" \
                -draw "rectangle 22,24 26,26" \
                "$base"
            ;;
        luna)
            # Wolf with mystical aura
            magick -size 48x48 xc:transparent \
                -fill "$color1" -stroke "$color2" -strokewidth 1 \
                -draw "polygon 20,12 24,6 28,12" \
                -draw "polygon 16,14 20,10 24,14" \
                -draw "polygon 32,14 28,10 24,14" \
                -draw "circle 24,20 24,12" \
                -draw "ellipse 24,30 12,14 0,360" \
                -draw "rectangle 18,42 30,48" \
                -fill "#FFFFFF" \
                -draw "circle 20,18 20,16" -draw "circle 28,18 28,16" \
                -fill "$color2" \
                -draw "circle 20,18 20,17" -draw "circle 28,18 28,17" \
                -draw "polygon 24,22 22,24 26,24" \
                -draw "arc 16,8 32,16 0,180" \
                "$base"
            ;;
        corvus)
            # Raven with spread wings
            magick -size 48x48 xc:transparent \
                -fill "$color1" -stroke "$color2" -strokewidth 1 \
                -draw "circle 24,18 24,12" \
                -draw "ellipse 24,28 10,12 0,360" \
                -draw "polygon 6,22 12,18 12,26 8,28" \
                -draw "polygon 42,22 36,18 36,26 40,28" \
                -draw "rectangle 20,38 28,44" \
                -fill "#4B0082" \
                -draw "circle 20,16 20,15" -draw "circle 28,16 28,15" \
                -draw "polygon 24,20 20,22 24,23" \
                "$base"
            ;;
    esac
    
    # Create animation frames (idle bobbing + subtle effects)
    local frames=()
    for frame in {0..7}; do
        local y_offset=$(echo "scale=0; 2 * s($frame * 3.14159 / 4)" | bc -l | xargs printf "%.0f")
        local frame_file="$TEMP_DIR/${name}_frame_${frame}.png"
        
        magick "$base" \
            -background transparent \
            -splice 0x$((8 + y_offset)) \
            -chop 0x8 \
            -scale 256x256 \
            -colors 32 \
            "$frame_file"
        
        frames+=("$frame_file")
    done
    
    # Create animated GIF
    magick -dispose previous -delay 12 -loop 0 "${frames[@]}" \
        -coalesce -fuzz 15% -transparent white \
        "$OUTPUT_DIR/${name}.gif"
    
    # Create static PNG
    magick "$base" -scale 256x256 -colors 32 \
        -fuzz 15% -transparent white \
        "$OUTPUT_DIR/${name}.png"
    
    # Optimize
    gifsicle -O3 --colors 32 "$OUTPUT_DIR/${name}.gif" -o "$OUTPUT_DIR/${name}.gif" 2>/dev/null || true
    
    echo "    ✓ Created ${name}.gif (animated) and ${name}.png (static)"
}

# Generate all avatars
for agent_data in "${AGENTS[@]}"; do
    IFS='|' read -r agent_name description color1 color2 <<< "$agent_data"
    create_artistic_sprite "$agent_name" "$description" "$color1" "$color2"
done

# Create a composite preview
echo ""
echo "  → Creating preview composite..."
montage "$OUTPUT_DIR"/*.png -geometry 256x256+10+10 -background transparent \
    -tile 4x2 "$OUTPUT_DIR/preview.png" 2>/dev/null || true

# Clean up
rm -rf "$TEMP_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Avatar generation complete!"
echo ""
echo "Generated files:"
ls -lh "$OUTPUT_DIR"/*.{gif,png} 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
echo ""
echo "🎮 Avatars ready to use in frontend!"
echo "   - Animated: /avatars/{name}.gif"
echo "   - Static: /avatars/{name}.png"
