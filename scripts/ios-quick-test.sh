#!/bin/bash

# Script de test rapide pour iOS
echo "🧪 Test rapide d'OpenZik iOS"
echo "============================"

cd "/Users/adrien/Desktop/Music stack/music-web-frontend"

# Build rapide
echo "1️⃣ Build de l'application..."
npm run build

# Sync rapide
echo "2️⃣ Synchronisation iOS..."
npx cap sync ios

echo "✅ Prêt pour le test!"
echo "🚀 Ouvrir dans Xcode : npx cap open ios"
echo ""
echo "📋 Tests à effectuer :"
echo "   ✓ Logo visible sur l'écran d'accueil"
echo "   ✓ Connexion persistante après fermeture"
echo "   ✓ Mode offline fonctionnel"
echo "   ✓ Pas d'erreur 'loading offline content'"
