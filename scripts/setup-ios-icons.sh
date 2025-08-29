#!/bin/bash

# Script pour configurer automatiquement les icônes iOS dans Xcode
# À exécuter après npx cap sync ios

PROJECT_DIR="/Users/adrien/Desktop/Music stack/music-web-frontend"
IOS_PROJECT="$PROJECT_DIR/ios/App"
ICONS_SOURCE="$PROJECT_DIR/public/icons"

echo "🔧 Configuration des icônes iOS pour OpenZik..."

# Vérifier que le projet iOS existe
if [ ! -d "$IOS_PROJECT" ]; then
    echo "❌ Le projet iOS n'existe pas. Exécutez d'abord: npx cap add ios"
    exit 1
fi

# Créer le dossier AppIcon.appiconset s'il n'existe pas
APPICON_DIR="$IOS_PROJECT/App/Assets.xcassets/AppIcon.appiconset"
mkdir -p "$APPICON_DIR"

echo "📁 Copie des icônes dans le projet iOS..."

# Copier les icônes avec les noms exacts attendus par Xcode
cp "$ICONS_SOURCE/icon-20.png" "$APPICON_DIR/Icon-App-20x20@1x.png"
cp "$ICONS_SOURCE/icon-20@2x.png" "$APPICON_DIR/Icon-App-20x20@2x.png"
cp "$ICONS_SOURCE/icon-20@3x.png" "$APPICON_DIR/Icon-App-20x20@3x.png"
cp "$ICONS_SOURCE/icon-29.png" "$APPICON_DIR/Icon-App-29x29@1x.png"
cp "$ICONS_SOURCE/icon-29@2x.png" "$APPICON_DIR/Icon-App-29x29@2x.png"
cp "$ICONS_SOURCE/icon-29@3x.png" "$APPICON_DIR/Icon-App-29x29@3x.png"
cp "$ICONS_SOURCE/icon-40.png" "$APPICON_DIR/Icon-App-40x40@1x.png"
cp "$ICONS_SOURCE/icon-40@2x.png" "$APPICON_DIR/Icon-App-40x40@2x.png"
cp "$ICONS_SOURCE/icon-40@3x.png" "$APPICON_DIR/Icon-App-40x40@3x.png"
cp "$ICONS_SOURCE/icon-60@2x.png" "$APPICON_DIR/Icon-App-60x60@2x.png"
cp "$ICONS_SOURCE/icon-60@3x.png" "$APPICON_DIR/Icon-App-60x60@3x.png"
cp "$ICONS_SOURCE/icon-76.png" "$APPICON_DIR/Icon-App-76x76@1x.png"
cp "$ICONS_SOURCE/icon-76@2x.png" "$APPICON_DIR/Icon-App-76x76@2x.png"
cp "$ICONS_SOURCE/icon-83.5@2x.png" "$APPICON_DIR/Icon-App-83.5x83.5@2x.png"
cp "$ICONS_SOURCE/icon-1024.png" "$APPICON_DIR/ItunesArtwork@2x.png"

# Créer le fichier Contents.json correct pour Xcode
cat > "$APPICON_DIR/Contents.json" << 'EOF'
{
  "images": [
    {
      "idiom": "iphone",
      "scale": "2x",
      "size": "20x20",
      "filename": "Icon-App-20x20@2x.png"
    },
    {
      "idiom": "iphone",
      "scale": "3x",
      "size": "20x20",
      "filename": "Icon-App-20x20@3x.png"
    },
    {
      "idiom": "iphone",
      "scale": "1x",
      "size": "29x29",
      "filename": "Icon-App-29x29@1x.png"
    },
    {
      "idiom": "iphone",
      "scale": "2x",
      "size": "29x29",
      "filename": "Icon-App-29x29@2x.png"
    },
    {
      "idiom": "iphone",
      "scale": "3x",
      "size": "29x29",
      "filename": "Icon-App-29x29@3x.png"
    },
    {
      "idiom": "iphone",
      "scale": "2x",
      "size": "40x40",
      "filename": "Icon-App-40x40@2x.png"
    },
    {
      "idiom": "iphone",
      "scale": "3x",
      "size": "40x40",
      "filename": "Icon-App-40x40@3x.png"
    },
    {
      "idiom": "iphone",
      "scale": "2x",
      "size": "60x60",
      "filename": "Icon-App-60x60@2x.png"
    },
    {
      "idiom": "iphone",
      "scale": "3x",
      "size": "60x60",
      "filename": "Icon-App-60x60@3x.png"
    },
    {
      "idiom": "ipad",
      "scale": "1x",
      "size": "20x20",
      "filename": "Icon-App-20x20@1x.png"
    },
    {
      "idiom": "ipad",
      "scale": "2x",
      "size": "20x20",
      "filename": "Icon-App-20x20@2x.png"
    },
    {
      "idiom": "ipad",
      "scale": "1x",
      "size": "29x29",
      "filename": "Icon-App-29x29@1x.png"
    },
    {
      "idiom": "ipad",
      "scale": "2x",
      "size": "29x29",
      "filename": "Icon-App-29x29@2x.png"
    },
    {
      "idiom": "ipad",
      "scale": "1x",
      "size": "40x40",
      "filename": "Icon-App-40x40@1x.png"
    },
    {
      "idiom": "ipad",
      "scale": "2x",
      "size": "40x40",
      "filename": "Icon-App-40x40@2x.png"
    },
    {
      "idiom": "ipad",
      "scale": "1x",
      "size": "76x76",
      "filename": "Icon-App-76x76@1x.png"
    },
    {
      "idiom": "ipad",
      "scale": "2x",
      "size": "76x76",
      "filename": "Icon-App-76x76@2x.png"
    },
    {
      "idiom": "ipad",
      "scale": "2x",
      "size": "83.5x83.5",
      "filename": "Icon-App-83.5x83.5@2x.png"
    },
    {
      "idiom": "ios-marketing",
      "scale": "1x",
      "size": "1024x1024",
      "filename": "ItunesArtwork@2x.png"
    }
  ],
  "info": {
    "author": "xcode",
    "version": 1
  }
}
EOF

echo "✅ Configuration des icônes iOS terminée!"
echo "📱 Les icônes OpenZik ont été configurées pour l'application iOS"
echo "🔄 N'oubliez pas d'exécuter: npx cap sync ios"
echo "🚀 Puis ouvrez le projet dans Xcode: npx cap open ios"
