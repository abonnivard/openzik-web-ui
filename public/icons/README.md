# Configuration des Icônes OpenZik

Ce dossier contient toutes les icônes générées automatiquement à partir du logo OpenZik pour l'application iOS et PWA.

## Structure des icônes

### Icônes iOS (App Store)
- `icon-20.png` (20x20) - Notifications iOS 7-15
- `icon-20@2x.png` (40x40) - Notifications iOS 7-15 @2x
- `icon-20@3x.png` (60x60) - Notifications iOS 7-15 @3x
- `icon-29.png` (29x29) - Settings iOS 5-15
- `icon-29@2x.png` (58x58) - Settings iOS 5-15 @2x
- `icon-29@3x.png` (87x87) - Settings iOS 5-15 @3x
- `icon-40.png` (40x40) - Spotlight iOS 7-15
- `icon-40@2x.png` (80x80) - Spotlight iOS 7-15 @2x
- `icon-40@3x.png` (120x120) - Spotlight iOS 7-15 @3x
- `icon-60@2x.png` (120x120) - iPhone App iOS 7-15 @2x
- `icon-60@3x.png` (180x180) - iPhone App iOS 7-15 @3x
- `icon-76.png` (76x76) - iPad App iOS 7-15
- `icon-76@2x.png` (152x152) - iPad App iOS 7-15 @2x
- `icon-83.5@2x.png` (167x167) - iPad Pro App iOS 9-15 @2x
- `icon-1024.png` (1024x1024) - App Store Connect

### Icônes PWA/Web
- `icon-192.png` (192x192) - PWA/Web App
- `icon-512.png` (512x512) - PWA/Web App

### Favicon
- `favicon-16.png` (16x16) - Favicon
- `favicon-32.png` (32x32) - Favicon

## Scripts de génération

### Générer toutes les icônes
```bash
npm run icons:generate
```

### Configurer les icônes iOS
```bash
npm run icons:setup-ios
```

### Setup complet iOS avec icônes
```bash
npm run ios:setup
```

## Utilisation

1. **Génération automatique** : Exécutez `npm run icons:generate` pour créer toutes les icônes à partir du logo principal
2. **Configuration iOS** : Après avoir synchronisé Capacitor, exécutez `npm run icons:setup-ios` pour configurer les icônes dans Xcode
3. **Build iOS complet** : Utilisez `npm run ios:setup` pour faire tout en une fois

## Fichiers source

- Logo principal : `src/assets/OpenZik-logo.png`
- Icônes générées : `public/icons/`
- Configuration PWA : `public/manifest.json`
- Configuration HTML : `public/index.html`

## Notes

- Les icônes sont générées automatiquement avec ImageMagick
- La configuration iOS est automatiquement appliquée au projet Xcode
- Le manifest.json est configuré pour les PWA
- Les balises meta appropriées sont ajoutées à index.html
