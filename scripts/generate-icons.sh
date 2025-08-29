#!/bin/bash

# Script to generate iOS app icons from openzik-ios.png
SOURCE_IMAGE="../src/assets/openzik-ios.png"
OUTPUT_DIR="../ios/App/App/Assets.xcassets/AppIcon.appiconset"

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image not found at $SOURCE_IMAGE"
    exit 1
fi

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick is not installed. Please install it first."
    echo "On macOS: brew install imagemagick"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "Generating iOS app icons from openzik-ios.png..."

# Define paths
LOGO_PATH="$SOURCE_IMAGE"
ICONS_DIR="$OUTPUT_DIR"

# Fonction pour créer une icône carrée avec fond transparent
create_square_icon() {
    local size=$1
    local output=$2
    
    # Créer une image carrée transparente et centrer le logo dessus
    magick "$LOGO_PATH" -background transparent -gravity center -extent ${size}x${size} "$output"
    echo "Created: $output (${size}x${size})"
}

# Icônes iOS (toutes les tailles requises) - DIMENSIONS EXACTES
create_square_icon 20 "$ICONS_DIR/icon-20.png"
create_square_icon 40 "$ICONS_DIR/icon-20@2x.png"
create_square_icon 60 "$ICONS_DIR/icon-20@3x.png"
create_square_icon 29 "$ICONS_DIR/icon-29.png"
create_square_icon 58 "$ICONS_DIR/icon-29@2x.png"
create_square_icon 87 "$ICONS_DIR/icon-29@3x.png"
create_square_icon 40 "$ICONS_DIR/icon-40.png"
create_square_icon 80 "$ICONS_DIR/icon-40@2x.png"
create_square_icon 120 "$ICONS_DIR/icon-40@3x.png"
create_square_icon 60 "$ICONS_DIR/icon-60.png"
create_square_icon 120 "$ICONS_DIR/icon-60@2x.png"
create_square_icon 180 "$ICONS_DIR/icon-60@3x.png"
create_square_icon 76 "$ICONS_DIR/icon-76.png"
create_square_icon 152 "$ICONS_DIR/icon-76@2x.png"
create_square_icon 167 "$ICONS_DIR/icon-83.5@2x.png"
create_square_icon 1024 "$ICONS_DIR/icon-1024.png"

echo "iOS app icons generation completed!"
echo "Icons saved to: $OUTPUT_DIR"

# Icônes PWA/Web
create_square_icon 192 "$ICONS_DIR/icon-192.png"
create_square_icon 512 "$ICONS_DIR/icon-512.png"

# Favicon
create_square_icon 32 "$ICONS_DIR/favicon-32.png"
create_square_icon 16 "$ICONS_DIR/favicon-16.png"

echo "✅ Toutes les icônes ont été générées dans $ICONS_DIR"
echo "📱 Icônes iOS créées avec dimensions exactes"
echo "🌐 Icônes PWA et favicon également générées"

# Vérifier les dimensions des icônes générées
echo ""
echo "🔍 Vérification des dimensions:"
for icon in "$ICONS_DIR"/*.png; do
    if [[ -f "$icon" ]]; then
        dimensions=$(magick identify -format "%wx%h" "$icon")
        filename=$(basename "$icon")
        echo "  $filename: $dimensions"
    fi
done
