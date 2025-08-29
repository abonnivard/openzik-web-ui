#!/bin/bash

# Script simplifié pour générer les icônes iOS
cd "/Users/adrien/Desktop/Music stack/music-web-frontend"

SOURCE_IMAGE="src/assets/openzik-ios2.png"
OUTPUT_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"

echo "🚀 Génération des icônes iOS depuis openzik-ios2.png..."

# Vérifier que l'image source existe
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "❌ Erreur: Image source non trouvée: $SOURCE_IMAGE"
    exit 1
fi

# Vérifier ImageMagick
if ! command -v magick &> /dev/null; then
    echo "❌ Erreur: ImageMagick non installé. Installez avec: brew install imagemagick"
    exit 1
fi

# Créer le répertoire de sortie
mkdir -p "$OUTPUT_DIR"

echo "📁 Répertoire de sortie: $OUTPUT_DIR"
echo "🖼️  Image source: $SOURCE_IMAGE"

# Fonction pour créer une icône
create_icon() {
    local size=$1
    local filename=$2
    echo "  Création: $filename (${size}x${size})"
    magick "$SOURCE_IMAGE" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "$OUTPUT_DIR/$filename"
}

# Générer toutes les tailles iOS requises
echo "🎨 Génération des icônes..."

create_icon 20 "icon-20.png"
create_icon 40 "icon-20@2x.png"
create_icon 60 "icon-20@3x.png"
create_icon 29 "icon-29.png"
create_icon 58 "icon-29@2x.png"
create_icon 87 "icon-29@3x.png"
create_icon 40 "icon-40.png"
create_icon 80 "icon-40@2x.png"
create_icon 120 "icon-40@3x.png"
create_icon 60 "icon-60.png"
create_icon 120 "icon-60@2x.png"
create_icon 180 "icon-60@3x.png"
create_icon 76 "icon-76.png"
create_icon 152 "icon-76@2x.png"
create_icon 167 "icon-83.5@2x.png"
create_icon 1024 "icon-1024.png"

# Créer le fichier Contents.json
echo "📝 Création du fichier Contents.json..."
cat > "$OUTPUT_DIR/Contents.json" << 'EOF'
{
  "images" : [
    {
      "filename" : "icon-20.png",
      "idiom" : "iphone",
      "scale" : "1x",
      "size" : "20x20"
    },
    {
      "filename" : "icon-20@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "icon-20@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "filename" : "icon-29.png",
      "idiom" : "iphone",
      "scale" : "1x",
      "size" : "29x29"
    },
    {
      "filename" : "icon-29@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "icon-29@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "filename" : "icon-40.png",
      "idiom" : "iphone",
      "scale" : "1x",
      "size" : "40x40"
    },
    {
      "filename" : "icon-40@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "icon-40@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "filename" : "icon-60@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "filename" : "icon-60@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "filename" : "icon-20.png",
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "20x20"
    },
    {
      "filename" : "icon-20@2x.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "icon-29.png",
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "29x29"
    },
    {
      "filename" : "icon-29@2x.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "icon-40.png",
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "40x40"
    },
    {
      "filename" : "icon-40@2x.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "icon-76.png",
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "76x76"
    },
    {
      "filename" : "icon-76@2x.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "76x76"
    },
    {
      "filename" : "icon-83.5@2x.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "83.5x83.5"
    },
    {
      "filename" : "icon-1024.png",
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

echo "✅ Génération terminée!"
echo "📂 Icônes créées dans: $OUTPUT_DIR"
echo "🔍 Vérification des fichiers créés:"
ls -la "$OUTPUT_DIR"/*.png | wc -l | xargs echo "   Nombre d'icônes:"
