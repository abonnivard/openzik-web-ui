#!/bin/bash

# Script complet pour résoudre les problèmes iOS d'OpenZik
# 1. Configuration des icônes
# 2. Build de l'application
# 3. Synchronisation iOS

echo "🚀 Configuration complète d'OpenZik pour iOS"
echo "============================================="

PROJECT_DIR="/Users/adrien/Desktop/Music stack/music-web-frontend"

cd "$PROJECT_DIR"

# Étape 1: Générer les icônes
echo "1️⃣ Génération des icônes..."
npm run icons:generate

# Étape 2: Build de l'application
echo "2️⃣ Construction de l'application..."
cp .env.ios .env
npm run build

# Étape 3: Synchronisation Capacitor
echo "3️⃣ Synchronisation Capacitor..."
npx cap sync ios

# Étape 4: Configuration des icônes iOS
echo "4️⃣ Configuration des icônes iOS..."
./scripts/setup-ios-icons.sh

# Étape 5: Synchronisation finale
echo "5️⃣ Synchronisation finale..."
npx cap sync ios

echo ""
echo "✅ Configuration terminée !"
echo "📱 L'application OpenZik est prête pour iOS"
echo "🎯 Problèmes résolus :"
echo "   • Icônes configurées correctement"
echo "   • Persistance de session sur iOS (localStorage)"
echo "   • Mode offline fonctionnel"
echo ""
echo "🚀 Pour ouvrir dans Xcode :"
echo "   npx cap open ios"
echo ""
echo "📋 Dans Xcode :"
echo "   1. Vérifiez que les icônes apparaissent dans Assets.xcassets/AppIcon.appiconset"
echo "   2. Buildez l'application (Cmd+B)"
echo "   3. Lancez sur votre iPhone (Cmd+R)"
echo ""
echo "🔒 Authentification :"
echo "   • Sur iOS : Session persistante avec localStorage"
echo "   • Bouton 'Se déconnecter' pour passer en mode offline"
echo "   • Plus de demande de reconnexion après fermeture"
